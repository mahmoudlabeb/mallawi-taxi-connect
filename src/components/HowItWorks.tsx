import { Phone, MapPin, MessageCircle, Smile } from "lucide-react";

const steps = [
  {
    icon: Phone,
    step: "١",
    title: "اتصل بنا",
    description: "اتصل على رقمنا أو احجز عبر الموقع",
  },
  {
    icon: MapPin,
    step: "٢",
    title: "حدد موقعك",
    description: "أخبرنا بموقعك ووجهتك المطلوبة",
  },
  {
    icon: MessageCircle,
    step: "٣",
    title: "تأكيد الحجز",
    description: "سنرسل لك تفاصيل السائق والسيارة",
  },
  {
    icon: Smile,
    step: "٤",
    title: "استمتع برحلتك",
    description: "سائقنا في الطريق إليك في دقائق",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-secondary">سهل وبسيط</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            كيف تحجز رحلتك؟
          </h2>
          <p className="text-muted-foreground text-lg">
            حجز تاكسي في ملوي أصبح أسهل من أي وقت مضى - فقط 4 خطوات بسيطة
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div 
              key={index} 
              className="relative text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-0 w-full h-0.5 bg-gradient-to-l from-primary/20 to-primary/5 translate-x-1/2" />
              )}
              
              {/* Step Number */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 gradient-gold rounded-2xl shadow-gold mb-6">
                <span className="text-3xl font-display font-bold text-secondary">{item.step}</span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 mx-auto bg-muted rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
