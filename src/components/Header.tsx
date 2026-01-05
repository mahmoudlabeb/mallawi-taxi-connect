import { Phone, MapPin, Clock, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center shadow-gold">
              <Car className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">تاكسي ملوي</h1>
              <p className="text-xs text-muted-foreground">Mallawi Taxi</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              الخدمات
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              كيف نعمل
            </a>
            <a href="#drivers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              السائقين
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              اتصل بنا
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a href="tel:+201234567890" className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span dir="ltr">+20 123 456 7890</span>
            </a>
            <Button variant="hero" size="sm">
              احجز الآن
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
