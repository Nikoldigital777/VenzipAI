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
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Allow onboarding access during auth flow */}
      <Route path="/onboarding" component={Onboarding} />
      
      {!isAuthenticated && !isLoading ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/audit-calendar" component={AuditCalendar} />
          <Route path="/documents" component={Documents} />
          <Route path="/risks" component={Risks} />
          <Route path="/evidence" component={Evidence} />
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