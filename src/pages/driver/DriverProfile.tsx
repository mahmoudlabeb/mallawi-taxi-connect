import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, Mail, Car, Save, Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DriverProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carColor, setCarColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [profileRes, driverRes, vehicleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("driver_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("vehicles").select("*").eq("driver_id", user.id).maybeSingle(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setFullName(profileRes.data.full_name || "");
        setPhone(profileRes.data.phone || "");
      }

      if (driverRes.data) {
        setDriverProfile(driverRes.data);
      }

      if (vehicleRes.data) {
        setVehicle(vehicleRes.data);
        setCarModel(vehicleRes.data.car_model || "");
        setCarColor(vehicleRes.data.car_color || "");
        setPlateNumber(vehicleRes.data.plate_number || "");
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    // Update profile
    await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("user_id", user.id);

    // Update or insert vehicle
    if (vehicle) {
      await supabase
        .from("vehicles")
        .update({
          car_model: carModel.trim(),
          car_color: carColor.trim(),
          plate_number: plateNumber.trim(),
        })
        .eq("id", vehicle.id);
    } else {
      await supabase.from("vehicles").insert({
        driver_id: user.id,
        car_model: carModel.trim(),
        car_color: carColor.trim(),
        plate_number: plateNumber.trim(),
      });
    }

    toast({
      title: "تم الحفظ",
      description: "تم تحديث بياناتك بنجاح",
    });
    setSaving(false);
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
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">ملفي الشخصي</h1>
          <p className="text-muted-foreground mt-1">إدارة بياناتك وسيارتك</p>
        </div>

        {/* Driver Stats */}
        <Card variant="elevated" className="gradient-gold">
          <CardContent className="p-6">
            <div className="flex items-center justify-around text-secondary">
              <div className="text-center">
                <p className="text-3xl font-display font-bold">{driverProfile?.total_rides || 0}</p>
                <p className="text-sm opacity-80">رحلة</p>
              </div>
              <div className="w-px h-12 bg-secondary/30" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-6 h-6 fill-current" />
                  <p className="text-3xl font-display font-bold">{driverProfile?.rating || 5.0}</p>
                </div>
                <p className="text-sm opacity-80">تقييم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pr-10 bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-10 bg-background"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="pr-10 bg-muted"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                بيانات السيارة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">الموديل</label>
                  <Input
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="تويوتا كورولا"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">اللون</label>
                  <Input
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    placeholder="أبيض"
                    className="bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رقم اللوحة</label>
                <Input
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="أ ب ج 1234"
                  className="bg-background"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
            ) : (
              <><Save className="w-5 h-5" /> حفظ التغييرات</>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DriverProfile;
