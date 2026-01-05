import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, Calendar, Loader2 } from "lucide-react";

interface Passenger {
  user_id: string;
  profile?: {
    full_name: string;
    phone: string;
    created_at: string;
  };
  ridesCount: number;
}

const AdminPassengers = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassengers = async () => {
      const { data: passengerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "passenger");

      const passengersWithInfo = await Promise.all(
        (passengerRoles || []).map(async (role) => {
          const [profileRes, ridesRes] = await Promise.all([
            supabase.from("profiles").select("full_name, phone, created_at").eq("user_id", role.user_id).maybeSingle(),
            supabase.from("rides").select("*", { count: "exact", head: true }).eq("passenger_id", role.user_id),
          ]);

          return {
            user_id: role.user_id,
            profile: profileRes.data,
            ridesCount: ridesRes.count || 0,
          };
        })
      );

      setPassengers(passengersWithInfo);
      setLoading(false);
    };

    fetchPassengers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
          <h1 className="text-2xl font-display font-bold text-foreground">إدارة الركاب</h1>
          <p className="text-muted-foreground mt-1">{passengers.length} راكب</p>
        </div>

        {passengers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">لا يوجد ركاب</h3>
              <p className="text-muted-foreground">لم يسجل أي راكب بعد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {passengers.map((passenger) => (
              <Card key={passenger.user_id} variant="feature">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-secondary" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-bold">{passenger.profile?.full_name || "راكب"}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {passenger.profile?.phone || "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {passenger.ridesCount} رحلة
                        </span>
                      </div>
                    </div>

                    <div className="text-left text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {passenger.profile?.created_at ? formatDate(passenger.profile.created_at) : "-"}
                      </div>
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

export default AdminPassengers;
