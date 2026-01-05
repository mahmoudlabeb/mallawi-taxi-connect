import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const drivers = [
  {
    name: "أحمد محمد",
    experience: "خبرة 10 سنوات",
    rating: 4.9,
    trips: "2000+ رحلة",
  },
  {
    name: "محمود عبدالله",
    experience: "خبرة 8 سنوات",
    rating: 4.8,
    trips: "1500+ رحلة",
  },
  {
    name: "إبراهيم حسن",
    experience: "خبرة 12 سنة",
    rating: 5.0,
    trips: "3000+ رحلة",
  },
];

const testimonials = [
  {
    quote: "خدمة ممتازة وسائقين محترمين. أنصح الجميع بتجربتهم.",
    author: "سارة أحمد",
    role: "عميلة دائمة",
  },
  {
    quote: "أفضل خدمة تاكسي في ملوي. دائماً في الموعد وأسعار معقولة.",
    author: "محمد علي",
    role: "رجل أعمال",
  },
];

const Drivers = () => {
  return (
    <section id="drivers" className="py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary">فريقنا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            سائقون محترفون
          </h2>
          <p className="text-secondary-foreground/70 text-lg">
            فريق من أفضل السائقين في ملوي، مدربين على أعلى مستوى من الخدمة والأمان
          </p>
        </div>

        {/* Drivers Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {drivers.map((driver, index) => (
            <Card 
              key={index} 
              className="bg-secondary-foreground/10 border-secondary-foreground/20 backdrop-blur-sm animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                {/* Avatar Placeholder */}
                <div className="w-20 h-20 mx-auto gradient-gold rounded-full flex items-center justify-center shadow-gold mb-4">
                  <span className="text-2xl font-display font-bold text-secondary">
                    {driver.name.charAt(0)}
                  </span>
                </div>
                
                <h3 className="text-xl font-display font-bold mb-1">{driver.name}</h3>
                <p className="text-secondary-foreground/70 text-sm mb-3">{driver.experience}</p>
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(driver.rating) ? 'text-primary fill-primary' : 'text-secondary-foreground/30'}`} 
                    />
                  ))}
                  <span className="text-sm font-medium mr-1">{driver.rating}</span>
                </div>
                
                <p className="text-sm text-secondary-foreground/60">{driver.trips}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-secondary-foreground/5 border-secondary-foreground/10 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary mb-4" />
                <p className="text-lg mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-secondary-foreground/60">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Drivers;
