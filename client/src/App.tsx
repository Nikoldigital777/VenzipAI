import "./index.css";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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
import { useAuth } from "@/hooks/useAuth";

// Component to wrap authenticated routes with sidebar
function AuthenticatedLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

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
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />

      {/* Onboarding - accessible during auth flow */}
      <Route path="/onboarding" component={Onboarding} />

      {/* Protected routes - only show if authenticated */}
      {isAuthenticated && (
        <>
          {/* Home route redirects to dashboard */}
          <Route path="/home">
            <AuthenticatedLayout title="Home">
              <Home />
            </AuthenticatedLayout>
          </Route>

          {/* Main app routes with sidebar */}
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Route path="/dashboard">
                <AuthenticatedLayout title="Dashboard">
                  <Dashboard />
                </AuthenticatedLayout>
              </Route>

              <Route path="/tasks">
                <AuthenticatedLayout title="Tasks">
                  <Tasks />
                </AuthenticatedLayout>
              </Route>

              <Route path="/evidence">
                <AuthenticatedLayout title="Evidence">
                  <Evidence />
                </AuthenticatedLayout>
              </Route>

              <Route path="/compliance-insights">
                <AuthenticatedLayout title="Frameworks">
                  <ComplianceInsights />
                </AuthenticatedLayout>
              </Route>

              <Route path="/risks">
                <AuthenticatedLayout title="Risks">
                  <Risks />
                </AuthenticatedLayout>
              </Route>

              <Route path="/documents">
                <AuthenticatedLayout title="Documents">
                  <Documents />
                </AuthenticatedLayout>
              </Route>

              <Route path="/audit-calendar">
                <AuthenticatedLayout title="Audit Calendar">
                  <AuditCalendar />
                </AuthenticatedLayout>
              </Route>

              <Route path="/learning-hub">
                <AuthenticatedLayout title="Learning Hub">
                  <LearningHub />
                </AuthenticatedLayout>
              </Route>

              <Route path="/company-profile">
                <AuthenticatedLayout title="Company Profile">
                  <CompanyProfile />
                </AuthenticatedLayout>
              </Route>

              <Route path="/test-notifications">
                <AuthenticatedLayout title="Test Notifications">
                  <TestNotifications />
                </AuthenticatedLayout>
              </Route>
            </SidebarInset>
          </SidebarProvider>
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