import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, MapPin, TrendingUp, Clock, CheckCircle } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalPassengers: 0,
    totalRides: 0,
    completedRides: 0,
    pendingApprovals: 0,
    todayRides: 0,
    todayEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Count drivers
      const { count: driversCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "driver");

      // Count passengers
      const { count: passengersCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "passenger");

      // Count rides
      const { count: ridesCount } = await supabase
        .from("rides")
        .select("*", { count: "exact", head: true });

      // Count completed rides
      const { count: completedCount } = await supabase
        .from("rides")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      // Count pending driver approvals
      const { count: pendingCount } = await supabase
        .from("driver_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);

      // Today's rides
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayRides } = await supabase
        .from("rides")
        .select("fare")
        .eq("status", "completed")
        .gte("completed_at", today.toISOString());

      const todayEarnings = todayRides?.reduce((sum, ride) => sum + (ride.fare || 0), 0) || 0;

      setStats({
        totalDrivers: driversCount || 0,
        totalPassengers: passengersCount || 0,
        totalRides: ridesCount || 0,
        completedRides: completedCount || 0,
        pendingApprovals: pendingCount || 0,
        todayRides: todayRides?.length || 0,
        todayEarnings,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "إجمالي السائقين",
      value: stats.totalDrivers,
      icon: Car,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "إجمالي الركاب",
      value: stats.totalPassengers,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "إجمالي الرحلات",
      value: stats.totalRides,
      icon: MapPin,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "رحلات مكتملة",
      value: stats.completedRides,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "طلبات انتظار الموافقة",
      value: stats.pendingApprovals,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "رحلات اليوم",
      value: stats.todayRides,
      icon: TrendingUp,
      color: "bg-cyan-100 text-cyan-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على نظام تاكسي ملوي</p>
        </div>

        {/* Today's Earnings */}
        <Card variant="elevated" className="gradient-gold">
          <CardContent className="p-6 text-center">
            <p className="text-secondary/80 mb-1">أرباح اليوم</p>
            <p className="text-4xl font-display font-bold text-secondary">{stats.todayEarnings} جنيه</p>
            <p className="text-sm text-secondary/60 mt-2">{stats.todayRides} رحلة</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} variant="feature">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
