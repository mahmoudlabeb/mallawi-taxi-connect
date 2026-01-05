import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Car, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

type UserRole = "passenger" | "driver";

const authSchema = z.object({
  email: z.string().trim().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

const signupSchema = authSchema.extend({
  fullName: z.string().trim().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
  phone: z.string().trim().min(10, { message: "رقم الهاتف غير صالح" }),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("passenger");
  const [carModel, setCarModel] = useState("");
  const [carColor, setCarColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role: userRole } = useAuth();

  useEffect(() => {
    if (user && userRole) {
      redirectBasedOnRole(userRole);
    }
  }, [user, userRole]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "driver":
        navigate("/driver");
        break;
      case "passenger":
        navigate("/passenger");
        break;
      default:
        navigate("/");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message === "Invalid login credentials" 
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك مجدداً!",
      });
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = signupSchema.safeParse({ email, password, fullName, phone });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (role === "driver" && (!carModel || !carColor || !plateNumber)) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال جميع بيانات السيارة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: role,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "المستخدم موجود",
          description: "هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في التسجيل",
          description: error.message,
          variant: "destructive",
        });
      }
    } else if (data.user) {
      // If driver, add vehicle
      if (role === "driver") {
        await supabase.from("vehicles").insert({
          driver_id: data.user.id,
          car_model: carModel.trim(),
          car_color: carColor.trim(),
          plate_number: plateNumber.trim(),
        });
      }

      toast({
        title: "تم التسجيل بنجاح",
        description: role === "driver" 
          ? "حسابك قيد المراجعة، سيتم إعلامك عند الموافقة"
          : "مرحباً بك في تاكسي ملوي!",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </Button>

        <Card variant="elevated" className="bg-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto gradient-gold rounded-2xl flex items-center justify-center shadow-gold mb-4">
              <Car className="w-8 h-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "أدخل بياناتك للدخول إلى حسابك"
                : "سجل الآن للاستفادة من خدماتنا"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <Button
                      type="button"
                      variant={role === "passenger" ? "hero" : "outline"}
                      onClick={() => setRole("passenger")}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <User className="w-6 h-6" />
                      <span>راكب</span>
                    </Button>
                    <Button
                      type="button"
                      variant={role === "driver" ? "hero" : "outline"}
                      onClick={() => setRole("driver")}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <Car className="w-6 h-6" />
                      <span>سائق</span>
                    </Button>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        className="pr-10 bg-background"
                      />
                    </div>
                    {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="pr-10 bg-background"
                        dir="ltr"
                      />
                    </div>
                    {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="pr-10 bg-background"
                    dir="ltr"
                  />
                </div>
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 bg-background"
                  />
                </div>
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Driver Vehicle Info */}
              {!isLogin && role === "driver" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-bold text-foreground">بيانات السيارة</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">موديل السيارة</label>
                      <Input
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="مثال: تويوتا كورولا"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">لون السيارة</label>
                      <Input
                        value={carColor}
                        onChange={(e) => setCarColor(e.target.value)}
                        placeholder="مثال: أبيض"
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم اللوحة</label>
                    <Input
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="مثال: أ ب ج 1234"
                      className="bg-background"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "جاري التحميل..." : (isLogin ? "تسجيل الدخول" : "إنشاء الحساب")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin 
                  ? "ليس لديك حساب؟ سجل الآن"
                  : "لديك حساب بالفعل؟ سجل دخولك"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
