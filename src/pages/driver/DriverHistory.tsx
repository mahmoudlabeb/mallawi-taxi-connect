import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Star, Loader2 } from "lucide-react";

interface Ride {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  fare: number;
  distance_km: number;
  created_at: string;
  completed_at: string | null;
}

const DriverHistory = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchRides = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .eq("driver_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (!error && data) {
        setRides(data);
        setTotalEarnings(data.reduce((sum, ride) => sum + (ride.fare || 0), 0));
      }
      setLoading(false);
    };

    fetchRides();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
          <h1 className="text-2xl font-display font-bold text-foreground">سجل الرحلات</h1>
          <p className="text-muted-foreground mt-1">{rides.length} رحلة مكتملة</p>
        </div>

        {/* Total Earnings Card */}
        <Card variant="elevated" className="gradient-gold">
          <CardContent className="p-6 text-center">
            <p className="text-secondary/80 mb-1">إجمالي الأرباح</p>
            <p className="text-4xl font-display font-bold text-secondary">{totalEarnings} جنيه</p>
          </CardContent>
        </Card>

        {rides.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">لا توجد رحلات مكتملة</h3>
              <p className="text-muted-foreground">
                ستظهر هنا رحلاتك المكتملة
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} variant="feature">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(ride.completed_at || ride.created_at)}
                    </div>
                    <span className="font-bold text-primary">{ride.fare} جنيه</span>
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

                  <div className="flex items-center justify-between pt-3 border-t border-border text-sm text-muted-foreground">
                    <span>{ride.distance_km} كم</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span>5.0</span>
                    </div>
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

export default DriverHistory;
