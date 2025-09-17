import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  BarChart3, 
  Shield, 
  Loader2, 
  ArrowRight,
  Target,
  Users
} from "lucide-react";

export default function Home() {
  const { user } = useAuth() as { user: User | undefined, isLoading: boolean, isAuthenticated: boolean };
  const [location, setLocation] = useLocation();

  // Check if user has company profile
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/company"],
    retry: 1,
  });

  // Show loading state while checking company status
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-venzip-primary" />
          <p className="text-gray-600">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  const hasCompany = company && !company.error;
  const hasSelectedFrameworks = hasCompany && company.selectedFrameworks && company.selectedFrameworks.length > 0;

  return (
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
            {hasSelectedFrameworks 
              ? "Your compliance workspace is ready!" 
              : "Let's get your compliance program set up"}
          </p>

          {/* Setup progress indicators */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${hasCompany ? 'bg-green-50' : 'bg-white/50'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                hasCompany ? 'bg-green-100' : 'bg-venzip-primary/20'
              }`}>
                <Users className={`h-6 w-6 ${hasCompany ? 'text-green-600' : 'text-venzip-primary'}`} />
              </div>
              <h3 className="font-semibold mb-2">Company Profile</h3>
              <p className="text-sm text-gray-600">
                {hasCompany ? "✓ Complete" : "Set up your organization"}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${hasSelectedFrameworks ? 'bg-green-50' : 'bg-white/50'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                hasSelectedFrameworks ? 'bg-green-100' : 'bg-venzip-accent/20'
              }`}>
                <Target className={`h-6 w-6 ${hasSelectedFrameworks ? 'text-green-600' : 'text-venzip-accent'}`} />
              </div>
              <h3 className="font-semibold mb-2">Choose Frameworks</h3>
              <p className="text-sm text-gray-600">
                {hasSelectedFrameworks ? "✓ Complete" : "Select compliance standards"}
              </p>
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
            {hasSelectedFrameworks ? (
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-xl flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setLocation("/onboarding")}
                  className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-xl flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {hasCompany ? "Complete Setup" : "Start Setup"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button 
                  onClick={() => setLocation("/dashboard")}
                  variant="outline"
                  className="hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold px-8 py-3 rounded-xl flex items-center"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}