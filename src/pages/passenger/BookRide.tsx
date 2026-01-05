import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Car, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const bookingSchema = z.object({
  pickup: z.string().trim().min(3, { message: "يرجى إدخال موقع الانطلاق" }),
  dropoff: z.string().trim().min(3, { message: "يرجى إدخال الوجهة" }),
});

const BookRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const estimateFare = () => {
    // Simple fare estimation (in real app, this would use distance API)
    const baseFare = 10;
    const estimatedKm = Math.floor(Math.random() * 10) + 3;
    const perKmRate = 3;
    return {
      fare: baseFare + (estimatedKm * perKmRate),
      distance: estimatedKm,
    };
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = bookingSchema.safeParse({ pickup, dropoff });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      toast({
        title: "خطأ",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { fare, distance } = estimateFare();

    const { error } = await supabase.from("rides").insert({
      passenger_id: user.id,
      pickup_location: pickup.trim(),
      dropoff_location: dropoff.trim(),
      fare,
      distance_km: distance,
      status: "pending",
    });

    if (error) {
      toast({
        title: "خطأ في الحجز",
        description: "حدث خطأ أثناء حجز الرحلة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } else {
      setSuccess(true);
      toast({
        title: "تم الحجز بنجاح",
        description: "سيتم إرسال سائق قريباً",
      });
      setTimeout(() => navigate("/passenger"), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 gradient-gold rounded-full flex items-center justify-center shadow-gold mb-6 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">تم الحجز بنجاح!</h1>
          <p className="text-muted-foreground mb-4">جاري البحث عن سائق قريب منك...</p>
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>انتظر قليلاً</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">حجز رحلة</h1>
          <p className="text-muted-foreground mt-1">أدخل تفاصيل رحلتك</p>
        </div>

        <Card variant="elevated">
          <CardContent className="p-6">
            <form onSubmit={handleBooking} className="space-y-5">
              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium mb-2">موقع الانطلاق</label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500" />
                  <Input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="مثال: شارع الجمهورية، ملوي"
                    className="pr-8 bg-background"
                  />
                </div>
                {errors.pickup && <p className="text-destructive text-sm mt-1">{errors.pickup}</p>}
              </div>

              {/* Dropoff Location */}
              <div>
                <label className="block text-sm font-medium mb-2">الوجهة</label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500" />
                  <Input
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="مثال: محطة القطار، المنيا"
                    className="pr-8 bg-background"
                  />
                </div>
                {errors.dropoff && <p className="text-destructive text-sm mt-1">{errors.dropoff}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات إضافية (اختياري)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: أمام البنك الأهلي"
                  rows={2}
                  className="bg-background resize-none"
                />
              </div>

              {/* Fare Estimate */}
              {pickup && dropoff && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">التكلفة التقديرية</span>
                    <span className="text-2xl font-display font-bold text-primary">
                      {estimateFare().fare} جنيه
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    * السعر قد يختلف حسب المسافة الفعلية
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحجز...
                  </>
                ) : (
                  <>
                    <Car className="w-5 h-5" />
                    تأكيد الحجز
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">نصائح للحجز:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• أدخل عنوان واضح ومحدد للوصول بسرعة</li>
              <li>• تأكد من رقم هاتفك في الملف الشخصي</li>
              <li>• انتظر في مكان واضح ليجدك السائق</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookRide;
