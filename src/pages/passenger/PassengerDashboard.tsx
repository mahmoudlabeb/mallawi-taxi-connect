import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, History, Star, Clock, ArrowLeft } from "lucide-react";

const PassengerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalRides: 0, activeRide: null as any, lastRide: null as any });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // Get total rides
      const { count } = await supabase
        .from("rides")
        .select("*", { count: "exact", head: true })
        .eq("passenger_id", user.id);

      // Get active ride
      const { data: activeRide } = await supabase
        .from("rides")
        .select("*")
        .eq("passenger_id", user.id)
        .in("status", ["pending", "accepted", "in_progress"])
        .maybeSingle();

      // Get last completed ride
      const { data: lastRide } = await supabase
        .from("rides")
        .select("*")
        .eq("passenger_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setStats({
        totalRides: count || 0,
        activeRide,
        lastRide,
      });
      setLoading(false);
    };

    fetchStats();

    // Subscribe to ride updates
    const channel = supabase
      .channel("passenger-rides")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
          filter: `passenger_id=eq.${user?.id}`,
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "في انتظار السائق",
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            مرحباً بك! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            إلى أين تريد الذهاب اليوم؟
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/passenger/book">
            <Card variant="feature" className="h-full hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center shadow-gold mb-4">
                  <MapPin className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-bold text-foreground">حجز رحلة</h3>
                <p className="text-sm text-muted-foreground mt-1">احجز تاكسي الآن</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/passenger/history">
            <Card variant="feature" className="h-full hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-4">
                  <History className="w-7 h-7 text-secondary-foreground" />
                </div>
                <h3 className="font-bold text-foreground">سجل الرحلات</h3>
                <p className="text-sm text-muted-foreground mt-1">{stats.totalRides} رحلة</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Active Ride */}
        {stats.activeRide && (
          <Card variant="elevated" className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                رحلة جارية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">من</p>
                    <p className="font-medium">{stats.activeRide.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">إلى</p>
                    <p className="font-medium">{stats.activeRide.dropoff_location}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats.activeRide.status)}`}>
                    {getStatusLabel(stats.activeRide.status)}
                  </span>
                  {stats.activeRide.fare && (
                    <span className="font-bold text-primary">{stats.activeRide.fare} جنيه</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Ride */}
        {stats.lastRide && (
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">آخر رحلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{stats.lastRide.dropoff_location}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(stats.lastRide.completed_at).toLocaleDateString("ar-EG")}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">{stats.lastRide.fare} جنيه</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">5.0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Rides Yet */}
        {!loading && stats.totalRides === 0 && !stats.activeRide && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">لم تقم بأي رحلة بعد</h3>
              <p className="text-muted-foreground mb-6">
                احجز رحلتك الأولى الآن واستمتع بخدمة تاكسي ملوي
              </p>
              <Link to="/passenger/book">
                <Button variant="hero" size="lg">
                  احجز رحلة الآن
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PassengerDashboard;
