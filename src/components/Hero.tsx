import { Button } from "@/components/ui/button";
import { MapPin, Phone, ArrowLeft } from "lucide-react";
import heroImage from "@/assets/hero-taxi.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Taxi on Egyptian desert road" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">ملوي، محافظة المنيا</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            خدمة تاكسي موثوقة في{" "}
            <span className="text-gradient">ملوي</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            توصيل آمن وسريع في جميع أنحاء مدينة ملوي والمنيا. سائقون محترفون، أسعار عادلة، وخدمة على مدار الساعة.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" className="group">
              احجز رحلتك الآن
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="tel:+201234567890" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                اتصل بنا
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center sm:text-right">
              <div className="text-3xl sm:text-4xl font-display font-bold text-primary">+500</div>
              <div className="text-sm text-muted-foreground">رحلة يومياً</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl sm:text-4xl font-display font-bold text-primary">+50</div>
              <div className="text-sm text-muted-foreground">سائق محترف</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl sm:text-4xl font-display font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">خدمة متواصلة</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
