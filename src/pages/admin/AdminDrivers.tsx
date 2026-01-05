import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Car, Check, X, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  user_id: string;
  is_approved: boolean;
  status: string;
  rating: number;
  total_rides: number;
  profile?: {
    full_name: string;
    phone: string;
  };
  vehicle?: {
    car_model: string;
    car_color: string;
    plate_number: string;
  };
}

const AdminDrivers = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDrivers = async () => {
    const { data: driverProfiles } = await supabase
      .from("driver_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const driversWithInfo = await Promise.all(
      (driverProfiles || []).map(async (driver) => {
        const [profileRes, vehicleRes] = await Promise.all([
          supabase.from("profiles").select("full_name, phone").eq("user_id", driver.user_id).maybeSingle(),
          supabase.from("vehicles").select("car_model, car_color, plate_number").eq("driver_id", driver.user_id).maybeSingle(),
        ]);

        return {
          ...driver,
          profile: profileRes.data,
          vehicle: vehicleRes.data,
        };
      })
    );

    setDrivers(driversWithInfo);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const approveDriver = async (userId: string) => {
    setActionLoading(userId);
    await supabase
      .from("driver_profiles")
      .update({ is_approved: true })
      .eq("user_id", userId);

    toast({ title: "تمت الموافقة", description: "تم تفعيل حساب السائق" });
    fetchDrivers();
    setActionLoading(null);
  };

  const suspendDriver = async (userId: string) => {
    setActionLoading(userId);
    await supabase
      .from("driver_profiles")
      .update({ is_approved: false })
      .eq("user_id", userId);

    toast({ title: "تم الإيقاف", description: "تم إيقاف حساب السائق" });
    fetchDrivers();
    setActionLoading(null);
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

  const pendingDrivers = drivers.filter((d) => !d.is_approved);
  const activeDrivers = drivers.filter((d) => d.is_approved);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">إدارة السائقين</h1>
          <p className="text-muted-foreground mt-1">{drivers.length} سائق</p>
        </div>

        {/* Pending Approvals */}
        {pendingDrivers.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-amber-600">طلبات انتظار الموافقة ({pendingDrivers.length})</h2>
            <div className="space-y-4">
              {pendingDrivers.map((driver) => (
                <Card key={driver.user_id} variant="feature" className="border-amber-200 bg-amber-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-bold">{driver.profile?.full_name || "سائق جديد"}</p>
                            <p className="text-sm text-muted-foreground">{driver.profile?.phone}</p>
                          </div>
                        </div>

                        {driver.vehicle && (
                          <div className="flex items-center gap-2 text-sm bg-background/80 rounded-lg p-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span>{driver.vehicle.car_model}</span>
                            <span>•</span>
                            <span>{driver.vehicle.car_color}</span>
                            <span>•</span>
                            <span dir="ltr">{driver.vehicle.plate_number}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => approveDriver(driver.user_id)}
                          disabled={actionLoading === driver.user_id}
                        >
                          {actionLoading === driver.user_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Check className="w-4 h-4" /> موافقة</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Drivers */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-green-600">السائقين النشطين ({activeDrivers.length})</h2>
          <div className="space-y-4">
            {activeDrivers.map((driver) => (
              <Card key={driver.user_id} variant="feature">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <p className="font-bold">{driver.profile?.full_name || "سائق"}</p>
                          <p className="text-sm text-muted-foreground">{driver.profile?.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span>{driver.rating || 5.0}</span>
                        </div>
                        <span className="text-muted-foreground">{driver.total_rides} رحلة</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          driver.status === "online" ? "bg-green-100 text-green-700" :
                          driver.status === "busy" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {driver.status === "online" ? "متاح" :
                           driver.status === "busy" ? "مشغول" : "غير متاح"}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => suspendDriver(driver.user_id)}
                      disabled={actionLoading === driver.user_id}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      {actionLoading === driver.user_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><X className="w-4 h-4" /> إيقاف</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {drivers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">لا يوجد سائقين</h3>
              <p className="text-muted-foreground">لم يسجل أي سائق بعد</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDrivers;
