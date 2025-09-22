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
// Import the new AuditPackage component
import AuditPackage from "@/pages/audit-package";
// Import the new AuditPackages component
import AuditPackages from "@/pages/audit-packages";
// Import ErrorBoundary component
import { ErrorBoundary } from "./components/ErrorBoundary";

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

// Protected route component to avoid conditional hook calls
function ProtectedRoute({ children, title }: { children: React.ReactNode; title?: string }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (title) {
    return (
      <AuthenticatedLayout title={title}>
        {children}
      </AuthenticatedLayout>
    );
  }
  
  return children;
}

function Router() {
  const { isAuthenticated, isLoading, hasCompletedOnboarding, error } = useAuth();
  const [location, navigate] = useLocation();

  // CRITICAL: useEffect MUST be called before any conditional returns to avoid hooks order violations
  React.useEffect(() => {
    // Only run navigation logic if not loading or error
    if (isLoading || error) return;
    
    // Handle unauthenticated users - only redirect if not already on public pages
    if (!isAuthenticated && !['/landing', '/', '/login'].includes(location)) {
      navigate('/landing');
      return;
    }

    // For authenticated users, handle onboarding flow
    if (isAuthenticated) {
      // If user has completed onboarding but is on onboarding page, redirect to dashboard
      if (hasCompletedOnboarding && location === '/onboarding') {
        navigate('/dashboard');
        return;
      }

      // If user hasn't completed onboarding and is trying to access protected routes, redirect to onboarding
      if (!hasCompletedOnboarding && !['/onboarding', '/landing', '/'].includes(location)) {
        navigate('/onboarding');
        return;
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, location, navigate, isLoading, error]);

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

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      
      {/* Onboarding - accessible during auth flow */}
      <Route path="/onboarding" component={Onboarding} />

      {/* Home route - simplified, no complex redirect logic */}
      <Route path="/home">
        <ProtectedRoute title="Home">
          <Home />
        </ProtectedRoute>
      </Route>

      {/* Main app routes with sidebar */}
      <Route path="/dashboard">
        <ProtectedRoute title="Dashboard">
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/tasks">
        <ProtectedRoute title="Tasks">
          <Tasks />
        </ProtectedRoute>
      </Route>

      <Route path="/evidence">
        <ProtectedRoute title="Evidence">
          <Evidence />
        </ProtectedRoute>
      </Route>

      <Route path="/compliance-insights">
        <ProtectedRoute title="Frameworks">
          <ComplianceInsights />
        </ProtectedRoute>
      </Route>

      <Route path="/risks">
        <ProtectedRoute title="Risks">
          <Risks />
        </ProtectedRoute>
      </Route>

      <Route path="/documents">
        <ProtectedRoute title="Documents">
          <Documents />
        </ProtectedRoute>
      </Route>

      <Route path="/audit-calendar">
        <ProtectedRoute title="Audit Calendar">
          <AuditCalendar />
        </ProtectedRoute>
      </Route>

      <Route path="/learning-hub">
        <ProtectedRoute title="Learning Hub">
          <LearningHub />
        </ProtectedRoute>
      </Route>

      <Route path="/company-profile">
        <ProtectedRoute title="Company Profile">
          <CompanyProfile />
        </ProtectedRoute>
      </Route>

      <Route path="/test-notifications">
        <ProtectedRoute>
          <TestNotifications />
        </ProtectedRoute>
      </Route>
      
      <Route path="/test-documents">
        <ProtectedRoute>
          <TestDocuments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/audit-package">
        <ProtectedRoute>
          <AuditPackage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/audit-packages">
        <ProtectedRoute title="Audit Packages">
          <AuditPackages />
        </ProtectedRoute>
      </Route>

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
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
            <TourGuide />
            <TourInitializer />
          </TooltipProvider>
        </TourProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;