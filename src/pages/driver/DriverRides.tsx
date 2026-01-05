import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, Phone, Check, X, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Ride {
  id: string;
  passenger_id: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  fare: number;
  distance_km: number;
  created_at: string;
}

interface RideWithPassenger extends Ride {
  passenger?: {
    full_name: string;
    phone: string;
  };
}

const DriverRides = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingRides, setPendingRides] = useState<RideWithPassenger[]>([]);
  const [activeRide, setActiveRide] = useState<RideWithPassenger | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRides = async () => {
    if (!user) return;

    // Fetch pending rides
    const { data: pending } = await supabase
      .from("rides")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    // Fetch active ride for this driver
    const { data: active } = await supabase
      .from("rides")
      .select("*")
      .eq("driver_id", user.id)
      .in("status", ["accepted", "in_progress"])
      .maybeSingle();

    // Get passenger info for rides
    const ridesWithPassengers = await Promise.all(
      (pending || []).map(async (ride) => {
        const { data: passenger } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("user_id", ride.passenger_id)
          .maybeSingle();
        return { ...ride, passenger };
      })
    );

    setPendingRides(ridesWithPassengers);

    if (active) {
      const { data: passenger } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", active.passenger_id)
        .maybeSingle();
      setActiveRide({ ...active, passenger });
    } else {
      setActiveRide(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRides();

    // Subscribe to ride updates
    const channel = supabase
      .channel("driver-rides")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rides" },
        () => fetchRides()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const acceptRide = async (rideId: string) => {
    if (!user) return;
    setActionLoading(rideId);

    const { error } = await supabase
      .from("rides")
      .update({ driver_id: user.id, status: "accepted" })
      .eq("id", rideId);

    if (error) {
      toast({
        title: "خطأ",
        description: "تم قبول هذه الرحلة من سائق آخر",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم قبول الرحلة",
        description: "توجه لموقع الراكب الآن",
      });
    }
    setActionLoading(null);
  };

  const startRide = async () => {
    if (!activeRide) return;
    setActionLoading("start");

    await supabase
      .from("rides")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", activeRide.id);

    toast({ title: "بدأت الرحلة", description: "حظاً موفقاً!" });
    setActionLoading(null);
  };

  const completeRide = async () => {
    if (!activeRide || !user) return;
    setActionLoading("complete");

    await supabase
      .from("rides")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", activeRide.id);

    // Update driver stats
    await supabase
      .from("driver_profiles")
      .update({ total_rides: (await supabase.from("driver_profiles").select("total_rides").eq("user_id", user.id).single()).data?.total_rides! + 1 })
      .eq("user_id", user.id);

    toast({ title: "تم إكمال الرحلة", description: "أحسنت!" });
    setActionLoading(null);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">طلبات الرحلات</h1>
          <p className="text-muted-foreground mt-1">
            {activeRide ? "لديك رحلة نشطة" : `${pendingRides.length} طلب متاح`}
          </p>
        </div>

        {/* Active Ride */}
        {activeRide && (
          <Card variant="elevated" className="border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold text-green-600">
                  {activeRide.status === "accepted" ? "في الطريق للراكب" : "رحلة جارية"}
                </span>
              </div>

              {/* Passenger Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{activeRide.passenger?.full_name || "راكب"}</p>
                  <a 
                    href={`tel:${activeRide.passenger?.phone}`}
                    className="text-sm text-primary flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {activeRide.passenger?.phone}
                  </a>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">من</p>
                    <p className="font-medium">{activeRide.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">إلى</p>
                    <p className="font-medium">{activeRide.dropoff_location}</p>
                  </div>
                </div>
              </div>

              {/* Fare */}
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg mb-4">
                <span className="text-muted-foreground">الأجرة</span>
                <span className="text-xl font-bold text-primary">{activeRide.fare} جنيه</span>
              </div>

              {/* Actions */}
              {activeRide.status === "accepted" ? (
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={startRide}
                  disabled={actionLoading === "start"}
                >
                  {actionLoading === "start" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "وصلت للراكب - بدء الرحلة"
                  )}
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={completeRide}
                  disabled={actionLoading === "complete"}
                >
                  {actionLoading === "complete" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><Check className="w-5 h-5" /> إكمال الرحلة</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Rides */}
        {!activeRide && pendingRides.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">لا توجد طلبات حالياً</h3>
              <p className="text-muted-foreground">
                انتظر قليلاً، ستصلك طلبات الركاب قريباً
              </p>
            </CardContent>
          </Card>
        )}

        {!activeRide && pendingRides.length > 0 && (
          <div className="space-y-4">
            {pendingRides.map((ride) => (
              <Card key={ride.id} variant="feature">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{ride.passenger?.full_name || "راكب"}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatTime(ride.created_at)}</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-sm">{ride.pickup_location}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5" />
                      <p className="text-sm">{ride.dropoff_location}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{ride.distance_km} كم</span>
                      <span className="font-bold text-primary">{ride.fare} جنيه</span>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => acceptRide(ride.id)}
                      disabled={actionLoading === ride.id}
                    >
                      {actionLoading === ride.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Check className="w-4 h-4" /> قبول</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverRides;
