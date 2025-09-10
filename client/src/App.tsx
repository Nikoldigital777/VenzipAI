import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import AuditCalendar from "@/pages/audit-calendar";
import Documents from "@/pages/documents";
import Risks from "@/pages/risks";
import Evidence from "@/pages/evidence";
import CompanyProfile from "@/pages/company-profile";
import TestNotifications from "@/pages/test-notifications";
import LearningHub from "@/pages/learning-hub";
import ComplianceInsights from "@/pages/compliance-insights";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-venzip-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Allow onboarding access during auth flow */}
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Landing page is always the root - accessible for everyone */}
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      
      {/* Protected routes - only show if authenticated */}
      {isAuthenticated && (
        <>
          <Route path="/home" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/audit-calendar" component={AuditCalendar} />
          <Route path="/documents" component={Documents} />
          <Route path="/risks" component={Risks} />
          <Route path="/evidence" component={Evidence} />
          <Route path="/learning-hub" component={LearningHub} />
          <Route path="/compliance-insights" component={ComplianceInsights} />
          <Route path="/company-profile" component={CompanyProfile} />
          <Route path="/test-notifications" component={TestNotifications} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;