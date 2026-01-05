import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Drivers from "@/components/Drivers";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Drivers />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
