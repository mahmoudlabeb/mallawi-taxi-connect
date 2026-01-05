import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, Mail, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PassengerProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الحفظ",
        description: "تم تحديث بياناتك بنجاح",
      });
    }
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
          <h1 className="text-2xl font-display font-bold text-foreground">الملف الشخصي</h1>
          <p className="text-muted-foreground mt-1">إدارة بياناتك الشخصية</p>
        </div>

        <Card variant="elevated">
          <CardHeader>
            <div className="w-20 h-20 mx-auto gradient-gold rounded-full flex items-center justify-center shadow-gold mb-2">
              <User className="w-10 h-10 text-secondary" />
            </div>
            <CardTitle className="text-center">{fullName || "مستخدم"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="اسمك الكامل"
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
                    placeholder="رقم هاتفك"
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
                <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني</p>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PassengerProfile;
