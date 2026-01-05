import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User, Calendar, Car, Loader2 } from "lucide-react";

interface Ride {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  fare: number;
  created_at: string;
  completed_at: string | null;
  passenger?: { full_name: string };
  driver?: { full_name: string };
}

const AdminRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      const { data: ridesData } = await supabase
        .from("rides")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const ridesWithUsers = await Promise.all(
        (ridesData || []).map(async (ride) => {
          const [passengerRes, driverRes] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("user_id", ride.passenger_id).maybeSingle(),
            ride.driver_id ? supabase.from("profiles").select("full_name").eq("user_id", ride.driver_id).maybeSingle() : { data: null },
          ]);

          return {
            ...ride,
            passenger: passengerRes.data,
            driver: driverRes.data,
          };
        })
      );

      setRides(ridesWithUsers);
      setLoading(false);
    };

    fetchRides();
  }, []);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "في الانتظار",
      accepted: "تم القبول",
      in_progress: "جارية",
      completed: "مكتملة",
      cancelled: "ملغاة",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      accepted: "bg-blue-100 text-blue-800",
      in_progress: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
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
          <h1 className="text-2xl font-display font-bold text-foreground">جميع الرحلات</h1>
          <p className="text-muted-foreground mt-1">{rides.length} رحلة</p>
        </div>

        {rides.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">لا توجد رحلات</h3>
              <p className="text-muted-foreground">لم تتم أي رحلة بعد</p>
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
                      {formatDate(ride.created_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                        {getStatusLabel(ride.status)}
                      </span>
                      <span className="font-bold text-primary">{ride.fare} جنيه</span>
                    </div>
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

                  <div className="flex items-center gap-6 pt-3 border-t border-border text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{ride.passenger?.full_name || "راكب"}</span>
                    </div>
                    {ride.driver && (
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span>{ride.driver.full_name}</span>
                      </div>
                    )}
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

export default AdminRides;
