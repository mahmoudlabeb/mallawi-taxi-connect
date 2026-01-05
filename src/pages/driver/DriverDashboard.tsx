import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";

type DriverStatus = "online" | "offline" | "busy";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    todayRides: 0,
    todayEarnings: 0,
    totalRides: 0,
    rating: 5.0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch driver profile
      const { data: profile } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setDriverProfile(profile);

      // Fetch today's rides
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayRides } = await supabase
        .from("rides")
        .select("*")
        .eq("driver_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", today.toISOString());

      const todayEarnings = todayRides?.reduce((sum, ride) => sum + (ride.fare || 0), 0) || 0;

      setStats({
        todayRides: todayRides?.length || 0,
        todayEarnings,
        totalRides: profile?.total_rides || 0,
        rating: profile?.rating || 5.0,
      });

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const updateStatus = async (status: DriverStatus) => {
    if (!user) return;

    await supabase
      .from("driver_profiles")
      .update({ status })
      .eq("user_id", user.id);

    setDriverProfile((prev: any) => ({ ...prev, status }));
  };

  const getStatusIcon = (status: DriverStatus) => {
    switch (status) {
      case "online": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "busy": return <Clock className="w-5 h-5 text-amber-500" />;
      case "offline": return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: DriverStatus) => {
    switch (status) {
      case "online": return "متاح";
      case "busy": return "مشغول";
      case "offline": return "غير متاح";
    }
  };

  if (!driverProfile?.is_approved) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">حسابك قيد المراجعة</h1>
          <p className="text-muted-foreground max-w-md">
            شكراً لتسجيلك كسائق في تاكسي ملوي. حسابك قيد المراجعة من قبل الإدارة وسيتم إعلامك عند الموافقة.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Status Toggle */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(driverProfile?.status)}
                <div>
                  <p className="font-bold">حالتك الحالية</p>
                  <p className="text-sm text-muted-foreground">{getStatusLabel(driverProfile?.status)}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={driverProfile?.status === "online" ? "hero" : "outline"}
                onClick={() => updateStatus("online")}
                className="h-auto py-3"
              >
                <CheckCircle className="w-4 h-4" />
                متاح
              </Button>
              <Button
                variant={driverProfile?.status === "busy" ? "secondary" : "outline"}
                onClick={() => updateStatus("busy")}
                className="h-auto py-3"
              >
                <Clock className="w-4 h-4" />
                مشغول
              </Button>
              <Button
                variant={driverProfile?.status === "offline" ? "destructive" : "outline"}
                onClick={() => updateStatus("offline")}
                className="h-auto py-3"
              >
                <XCircle className="w-4 h-4" />
                غير متاح
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="feature">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-muted-foreground">أرباح اليوم</span>
              </div>
              <p className="text-2xl font-display font-bold text-primary">{stats.todayEarnings} جنيه</p>
            </CardContent>
          </Card>

          <Card variant="feature">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-muted-foreground">رحلات اليوم</span>
              </div>
              <p className="text-2xl font-display font-bold">{stats.todayRides}</p>
            </CardContent>
          </Card>

          <Card variant="feature">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm text-muted-foreground">التقييم</span>
              </div>
              <p className="text-2xl font-display font-bold">{stats.rating.toFixed(1)}</p>
            </CardContent>
          </Card>

          <Card variant="feature">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-muted-foreground">إجمالي الرحلات</span>
              </div>
              <p className="text-2xl font-display font-bold">{stats.totalRides}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tip */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm mb-1">نصيحة اليوم</p>
                <p className="text-sm text-muted-foreground">
                  حافظ على تقييمك العالي من خلال الالتزام بالمواعيد والتعامل الطيب مع الركاب.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
