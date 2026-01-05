import { Car, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center shadow-gold">
                <Car className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">تاكسي ملوي</h3>
                <p className="text-xs text-secondary-foreground/60">Mallawi Taxi</p>
              </div>
            </div>
            <p className="text-secondary-foreground/70 max-w-md leading-relaxed">
              خدمة تاكسي موثوقة في مدينة ملوي بمحافظة المنيا. نقدم خدمات توصيل آمنة وسريعة بأسعار عادلة على مدار الساعة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-secondary-foreground/70 hover:text-primary transition-colors">الخدمات</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-secondary-foreground/70 hover:text-primary transition-colors">كيف نعمل</a>
              </li>
              <li>
                <a href="#drivers" className="text-secondary-foreground/70 hover:text-primary transition-colors">السائقين</a>
              </li>
              <li>
                <a href="#contact" className="text-secondary-foreground/70 hover:text-primary transition-colors">اتصل بنا</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-secondary-foreground/70">
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/70">
                <Mail className="w-4 h-4 text-primary" />
                <span>info@mallawi-taxi.com</span>
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/70">
                <MapPin className="w-4 h-4 text-primary" />
                <span>ملوي، المنيا، مصر</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary-foreground/10 text-center">
          <p className="text-secondary-foreground/50 text-sm">
            © 2025 تاكسي ملوي. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
