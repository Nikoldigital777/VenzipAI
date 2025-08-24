import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  BarChart3, 
  CheckSquare, 
  FileText, 
  AlertTriangle, 
  Shield, 
  Bot, 
  Bell, 
  User, 
  LogOut 
} from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/onboarding", label: "Onboarding", icon: Rocket },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/tasks", label: "Tasks", icon: CheckSquare },
    { path: "/documents", label: "Evidence", icon: FileText },
    { path: "/risks", label: "Risks", icon: AlertTriangle },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="fixed top-0 w-full z-50 glass-morphism border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-4" data-testid="logo">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg animate-float">
              <Shield className="text-white text-lg h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Venzip</h1>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-item px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                    isActive(item.path)
                      ? "bg-venzip-primary/10 text-venzip-primary"
                      : "text-gray-600 hover:text-venzip-primary hover:bg-venzip-primary/5"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* AI Chat Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.dispatchEvent(new Event("toggle-ai-chat"))}
              className="rounded-xl px-3 py-1.5 text-sm hover:bg-venzip-primary/10 hover:text-venzip-primary transition-colors flex items-center"
              aria-label="Toggle AI Chat"
              title="Toggle AI Chat"
              data-testid="button-ai-chat"
            >
              <Bot className="h-4 w-4 mr-2" />
              Ask Claude
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" data-testid="notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-danger rounded-full animate-pulse"></span>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Sarah Chen</span>
            </div>

            {/* Logout */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="hidden sm:flex items-center"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
