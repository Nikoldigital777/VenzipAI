import "./index.css";
import * as React from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TourProvider } from "@/components/tour/TourProvider";
import { TourGuide } from "@/components/tour/TourGuide";
import { TourButton } from "@/components/tour/TourButton";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
import { TourInitializer } from '@/components/tour/TourInitializer';

// Import the new TestDocuments component
import TestDocuments from "@/pages/test-documents";

// Component to wrap authenticated routes with sidebar
function AuthenticatedLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <TourButton />
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
  const { isAuthenticated, isLoading, hasCompletedOnboarding, error } = useAuth();
  const [location, navigate] = useLocation();

  // Show error state if auth check failed
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Authentication Error</h2>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-venzip-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users - only redirect if not already on public pages
  if (!isAuthenticated && !['/landing', '/', '/login'].includes(location)) {
    navigate('/landing');
    return null;
  }

  // For authenticated users, handle onboarding flow
  if (isAuthenticated) {
    // If user has completed onboarding but is on onboarding page, redirect to dashboard
    if (hasCompletedOnboarding && location === '/onboarding') {
      navigate('/dashboard');
      return null;
    }
    
    // If user hasn't completed onboarding and is trying to access protected routes, redirect to onboarding
    if (!hasCompletedOnboarding && !['/onboarding', '/landing', '/'].includes(location)) {
      navigate('/onboarding');
      return null;
    }
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />

      {/* Protected routes */}
      {isAuthenticated ? (
        <>
          {/* Onboarding - accessible during auth flow */}
          <Route path="/onboarding" component={Onboarding} />

          {/* Home route - simplified, no complex redirect logic */}
          <Route path="/home">
            <AuthenticatedLayout title="Home">
              <Home />
            </AuthenticatedLayout>
          </Route>

          {/* Main app routes with sidebar */}
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

          <Route path="/test-notifications" component={TestNotifications} />
            <Route path="/test-documents" component={TestDocuments} />
        </>
      ) : (
        /* Redirect unauthenticated users to landing */
        <Route path="*">
          {() => {
            navigate('/landing');
            return null;
          }}
        </Route>
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="venzip-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TourProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <TourGuide />
            <TourInitializer />
          </TooltipProvider>
        </TourProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;