import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/onboarding", label: "Onboarding", icon: "fas fa-rocket" },
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-chart-bar" },
    { path: "/tasks", label: "Tasks", icon: "fas fa-tasks" },
    { path: "/documents", label: "Evidence", icon: "fas fa-file-alt" },
    { path: "/risks", label: "Risks", icon: "fas fa-exclamation-triangle" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="fixed top-0 w-full z-50 glass-morphism border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-4" data-testid="logo">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg animate-float">
              <i className="fas fa-check text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Venzip</h1>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-venzip-primary/10 text-venzip-primary"
                    : "text-gray-600 hover:text-venzip-primary hover:bg-venzip-primary/5"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" data-testid="notifications">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-danger rounded-full animate-pulse"></span>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Sarah Chen</span>
            </div>

            {/* Logout */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="hidden sm:flex"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
