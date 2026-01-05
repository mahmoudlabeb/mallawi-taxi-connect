import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    title: "الهاتف",
    value: "+20 123 456 7890",
    link: "tel:+201234567890",
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    value: "info@mallawi-taxi.com",
    link: "mailto:info@mallawi-taxi.com",
  },
  {
    icon: MapPin,
    title: "العنوان",
    value: "شارع الجمهورية، ملوي، المنيا",
    link: "#",
  },
  {
    icon: Clock,
    title: "ساعات العمل",
    value: "24 ساعة / 7 أيام",
    link: "#",
  },
];

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary">تواصل معنا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            نحن هنا لمساعدتك
          </h2>
          <p className="text-muted-foreground text-lg">
            لديك سؤال أو تريد حجز رحلة؟ تواصل معنا وسنرد عليك في أسرع وقت
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-6">معلومات التواصل</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {contactInfo.map((item, index) => (
                <a 
                  key={index} 
                  href={item.link}
                  className="block"
                >
                  <Card variant="feature" className="bg-card h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center shadow-gold mb-4">
                        <item.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm" dir="ltr">{item.value}</p>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            {/* Map Placeholder */}
            <Card variant="feature" className="overflow-hidden">
              <div className="h-48 bg-sand flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">ملوي، محافظة المنيا</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card variant="elevated" className="bg-card">
              <CardContent className="p-8">
                <h3 className="text-2xl font-display font-bold text-foreground mb-6">أرسل رسالة</h3>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">الاسم</label>
                      <Input placeholder="اسمك الكريم" className="bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">الهاتف</label>
                      <Input placeholder="رقم الهاتف" type="tel" dir="ltr" className="bg-background" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">البريد الإلكتروني</label>
                    <Input placeholder="email@example.com" type="email" dir="ltr" className="bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">الرسالة</label>
                    <Textarea 
                      placeholder="اكتب رسالتك هنا..." 
                      rows={4} 
                      className="bg-background resize-none"
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full">
                    <Send className="w-5 h-5" />
                    إرسال الرسالة
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
