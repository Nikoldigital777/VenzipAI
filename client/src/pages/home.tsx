import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth() as { user: User | undefined, isLoading: boolean, isAuthenticated: boolean };
  const [, setLocation] = useLocation();

  // Check if user has company profile
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/company"],
  });

  // Redirect to onboarding if no company profile
  useEffect(() => {
    if (!companyLoading && !company) {
      setLocation("/onboarding");
    }
  }, [company, companyLoading, setLocation]);

  // Redirect to dashboard if company exists
  useEffect(() => {
    if (!companyLoading && company) {
      setLocation("/dashboard");
    }
  }, [company, companyLoading, setLocation]);

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="w-8 h-8 border-4 border-venzip-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your compliance profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto p-6">
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-primary rounded-full flex items-center justify-center animate-float shadow-xl">
                <i className="fas fa-user text-white text-2xl"></i>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {user?.firstName || user?.email || 'User'}!
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Ready to continue your compliance journey?
              </p>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => setLocation("/onboarding")}
                  className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-xl"
                  data-testid="button-setup"
                >
                  <i className="fas fa-cog mr-2"></i>
                  Setup Profile
                </Button>
                
                <Button 
                  onClick={() => setLocation("/dashboard")}
                  variant="outline"
                  className="border-venzip-primary text-venzip-primary hover:bg-venzip-primary/10 px-6 py-3 rounded-xl"
                  data-testid="button-dashboard"
                >
                  <i className="fas fa-chart-bar mr-2"></i>
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AIChat />
    </>
  );
}
