import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Home, 
  User, 
  LogOut, 
  MapPin, 
  History, 
  Settings,
  Users,
  BarChart3,
  CheckCircle,
  Clock
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { role, signOut, user } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    switch (role) {
      case "admin":
        return [
          { path: "/admin", label: "لوحة التحكم", icon: BarChart3 },
          { path: "/admin/drivers", label: "السائقين", icon: Car },
          { path: "/admin/passengers", label: "الركاب", icon: Users },
          { path: "/admin/rides", label: "الرحلات", icon: MapPin },
        ];
      case "driver":
        return [
          { path: "/driver", label: "الرئيسية", icon: Home },
          { path: "/driver/rides", label: "طلبات الرحلات", icon: MapPin },
          { path: "/driver/history", label: "سجل الرحلات", icon: History },
          { path: "/driver/profile", label: "ملفي الشخصي", icon: User },
        ];
      case "passenger":
        return [
          { path: "/passenger", label: "الرئيسية", icon: Home },
          { path: "/passenger/book", label: "حجز رحلة", icon: MapPin },
          { path: "/passenger/history", label: "سجل الرحلات", icon: History },
          { path: "/passenger/profile", label: "ملفي الشخصي", icon: User },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (role) {
      case "admin": return "مدير النظام";
      case "driver": return "سائق";
      case "passenger": return "راكب";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary text-secondary-foreground h-16 shadow-elevated">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center shadow-gold">
              <Car className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-display font-bold">تاكسي ملوي</h1>
              <p className="text-xs text-secondary-foreground/60">{getRoleLabel()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary-foreground/70 hidden sm:block">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline mr-2">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 pb-20 md:pb-0 md:pr-64">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:block fixed right-0 top-16 bottom-0 w-64 bg-card border-l border-border p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-gold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Link to="/">
              <Button variant="outline" className="w-full gap-2">
                <Home className="w-4 h-4" />
                الصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="p-4 md:p-8">
          {children}
        </main>

        {/* Bottom Nav for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around px-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
