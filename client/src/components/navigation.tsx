import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  BarChart3, 
  CheckSquare, 
  FileText, 
  AlertTriangle, 
  Bot, 
  Bell,
  User, 
  LogOut,
  Menu,
  X,
  MapPin,
  Calendar
} from "lucide-react";
import venzipLogo from "@assets/PNG Venzip Logo _edited_1756043677282.png";
import NotificationButton from "./notification-button";

export default function Navigation() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/onboarding", label: "Onboarding", icon: Rocket },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/tasks", label: "Tasks", icon: CheckSquare },
    { path: "/audit-calendar", label: "Audit Calendar", icon: Calendar },
    { path: "/documents", label: "Evidence", icon: FileText },
    { path: "/risks", label: "Risks", icon: AlertTriangle },
    { path: "/evidence", label: "Evidence Mapping", icon: MapPin },
    { path: "/test-notifications", label: "Test Notifications", icon: Bell },
  ];

  const isActive = (path: string) => location === path;

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'glass-morphism-enhanced shadow-xl border-b border-white/30' 
        : 'glass-morphism border-b border-white/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14' : 'h-16'
        }`}>
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center" data-testid="logo">
            <img 
              src={venzipLogo} 
              alt="Venzip Logo" 
              className={`shadow-lg transition-all duration-300 ${
                scrolled ? 'h-10' : 'h-12'
              }`}
              style={{ width: 'auto' }}
            />
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-item px-3 py-2 rounded-xl transition-all duration-300 flex items-center group hover:scale-105 hover:-translate-y-0.5 ${
                    isActive(item.path)
                      ? "bg-venzip-primary/15 text-venzip-primary shadow-lg scale-105"
                      : "text-gray-600 hover:text-venzip-primary hover:bg-venzip-primary/8"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <IconComponent className={`transition-all duration-300 mr-2 ${
                    isActive(item.path) ? 'h-4 w-4' : 'h-4 w-4 group-hover:rotate-12'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* AI Chat Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.dispatchEvent(new Event("toggle-ai-chat"))}
              className="rounded-xl px-3 py-2 text-sm hover:bg-venzip-primary/10 hover:text-venzip-primary transition-all duration-300 flex items-center group hover:scale-105"
              aria-label="Toggle AI Chat"
              title="Toggle AI Chat"
              data-testid="button-ai-chat"
            >
              <Bot className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium">Ask Claude</span>
            </Button>

            {/* Notifications */}
            <NotificationButton />

            {/* User Profile */}
            <div className="flex items-center space-x-2 group cursor-pointer glass-card px-3 py-2 rounded-xl border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-venzip-primary transition-colors duration-300">Sarah Chen</span>
            </div>

            {/* Logout */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="flex items-center hover:scale-105 transition-all duration-300 glass-card border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 group"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-xl transition-all duration-300 ${
        mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
      }`}>
        <div className="px-4 py-6 space-y-4">
          {/* Mobile Navigation Items */}
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`mobile-nav-item flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-venzip-primary/15 text-venzip-primary"
                    : "text-gray-600 hover:text-venzip-primary hover:bg-venzip-primary/8"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
              href="/company-profile"
              className="mobile-nav-item flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-gray-600 hover:text-venzip-primary hover:bg-venzip-primary/8"
              data-testid="mobile-nav-profile"
            >
              <User className="h-5 w-5 mr-3" />
              <span className="font-medium">Profile</span>
            </Link>

          {/* Mobile Actions */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.dispatchEvent(new Event("toggle-ai-chat"))}
              className="w-full justify-start rounded-xl px-4 py-3 hover:bg-venzip-primary/10 hover:text-venzip-primary transition-colors flex items-center"
              data-testid="mobile-ai-chat"
            >
              <Bot className="h-5 w-5 mr-3" />
              Ask Claude
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="w-full justify-start rounded-xl px-4 py-3"
              data-testid="mobile-logout"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}