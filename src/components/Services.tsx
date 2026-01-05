import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, Briefcase, MapPin, Clock, Shield } from "lucide-react";

const services = [
  {
    icon: Car,
    title: "توصيل داخل المدينة",
    description: "خدمة توصيل سريعة وآمنة داخل حدود مدينة ملوي بأسعار ثابتة ومعقولة.",
  },
  {
    icon: MapPin,
    title: "رحلات بين المدن",
    description: "رحلات مريحة إلى المنيا والقاهرة والمدن المجاورة مع سائقين ذوي خبرة.",
  },
  {
    icon: Users,
    title: "خدمة عائلية",
    description: "سيارات عائلية واسعة ومريحة تناسب العائلات الكبيرة والمجموعات.",
  },
  {
    icon: Briefcase,
    title: "رحلات العمل",
    description: "خدمة VIP للشركات ورجال الأعمال مع مواعيد دقيقة وسيارات فاخرة.",
  },
  {
    icon: Clock,
    title: "خدمة 24 ساعة",
    description: "متاحون على مدار الساعة لخدمتكم في أي وقت من اليوم أو الليل.",
  },
  {
    icon: Shield,
    title: "أمان مضمون",
    description: "جميع سائقينا مرخصين وسياراتنا مؤمنة بالكامل لراحة بالكم.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary">خدماتنا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            خدمات تاكسي متكاملة
          </h2>
          <p className="text-muted-foreground text-lg">
            نقدم مجموعة واسعة من خدمات التوصيل لتلبية جميع احتياجاتكم في ملوي والمنطقة المحيطة
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              variant="feature" 
              className="bg-card p-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center shadow-gold mb-4">
                  <service.icon className="w-7 h-7 text-secondary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
