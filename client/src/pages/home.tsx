
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  BarChart3, 
  Shield, 
  Loader2, 
  CheckCircle, 
  ArrowRight,
  Target,
  FileText,
  Users
} from "lucide-react";

export default function Home() {
  const { user } = useAuth() as { user: User | undefined, isLoading: boolean, isAuthenticated: boolean };
  const [location, setLocation] = useLocation();
  const hasRedirected = useRef(false);

  // Check if user has company profile
  const { data: company, isLoading: companyLoading, isError: companyError } = useQuery({
    queryKey: ["/api/company"],
    retry: 1,
  });

  // Smart routing based on user's setup status - with redirect guards
  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current || companyLoading) return;
    
    // Don't redirect if we're already on the target route
    if (location === "/dashboard" || location === "/onboarding") return;

    // Handle different scenarios
    if (companyError || (!companyLoading && !company)) {
      // No company profile exists - redirect to onboarding
      console.log("No company profile found, redirecting to onboarding");
      hasRedirected.current = true;
      setLocation("/onboarding");
      return;
    }

    if (company) {
      // Company exists - check if onboarding is complete
      const hasSelectedFrameworks = company.selectedFrameworks && company.selectedFrameworks.length > 0;
      
      if (!hasSelectedFrameworks) {
        // Company exists but onboarding incomplete
        console.log("Company profile incomplete, continuing onboarding");
        hasRedirected.current = true;
        setLocation("/onboarding");
      } else {
        // Fully set up - go to dashboard
        console.log("Company profile complete, redirecting to dashboard");
        hasRedirected.current = true;
        setLocation("/dashboard");
      }
    }
  }, [companyLoading, company, companyError, location, setLocation]);

  // Reset redirect flag when location changes (for back navigation)
  useEffect(() => {
    if (location !== "/home") {
      hasRedirected.current = false;
    }
  }, [location]);

  // Show loading state while checking company status
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-venzip-primary" />
          <p className="text-gray-600">Setting up your compliance workspace...</p>
        </div>
      </div>
    );
  }

  // Show error state if company query failed
  if (companyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
          <p className="text-gray-600 mb-4">We need to set up your company profile first.</p>
          <Button 
            onClick={() => {
              hasRedirected.current = true;
              setLocation("/onboarding");
            }}
            className="bg-gradient-primary text-white"
          >
            Start Setup <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Fallback UI (should rarely be seen due to redirects, but prevents blank screen)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-primary rounded-full flex items-center justify-center animate-float shadow-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Venzip, {user?.firstName || user?.email || 'User'}!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Let's get your compliance program set up properly
            </p>

            {/* Quick setup flow */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-white/50 rounded-xl">
                <div className="w-12 h-12 bg-venzip-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-venzip-primary" />
                </div>
                <h3 className="font-semibold mb-2">Company Profile</h3>
                <p className="text-sm text-gray-600">Set up your organization details</p>
              </div>

              <div className="p-6 bg-white/50 rounded-xl">
                <div className="w-12 h-12 bg-venzip-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-venzip-accent" />
                </div>
                <h3 className="font-semibold mb-2">Choose Frameworks</h3>
                <p className="text-sm text-gray-600">Select compliance standards</p>
              </div>

              <div className="p-6 bg-white/50 rounded-xl">
                <div className="w-12 h-12 bg-success-green/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-success-green" />
                </div>
                <h3 className="font-semibold mb-2">Start Tracking</h3>
                <p className="text-sm text-gray-600">Monitor compliance progress</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => {
                  hasRedirected.current = true;
                  setLocation("/onboarding");
                }}
                className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-xl flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Start Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                onClick={() => {
                  hasRedirected.current = true;
                  setLocation("/dashboard");
                }}
                variant="outline"
                className="hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold px-8 py-3 rounded-xl flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
