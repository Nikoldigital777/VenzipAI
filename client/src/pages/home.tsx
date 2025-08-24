import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, BarChart3, Shield, Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth() as { user: User | undefined, isLoading: boolean, isAuthenticated: boolean };
  const [, setLocation] = useLocation();

  // Check if user has company profile
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/company"],
  });

  // Always redirect to onboarding first for streamlined user flow
  useEffect(() => {
    if (!companyLoading) {
      setLocation("/onboarding");
    }
  }, [companyLoading, setLocation]);

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-venzip-primary" />
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
                <Shield className="h-10 w-10 text-white" />
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
                  className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-xl flex items-center"
                  data-testid="button-setup"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Profile
                </Button>
                
                <Button 
                  onClick={() => setLocation("/dashboard")}
                  variant="outline"
                  className="border-venzip-primary text-venzip-primary hover:bg-venzip-primary/10 px-6 py-3 rounded-xl flex items-center"
                  data-testid="button-dashboard"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
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
