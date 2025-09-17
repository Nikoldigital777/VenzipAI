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
          <Route path="/dashboard">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <Dashboard />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/tasks">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Tasks</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <Tasks />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/audit-calendar">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Audit Calendar</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <AuditCalendar />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/documents">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Documents</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <Documents />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/risks">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Risks</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <Risks />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/evidence">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Evidence</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <Evidence />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/learning-hub">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Learning Hub</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <LearningHub />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/compliance-insights">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Frameworks</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <ComplianceInsights />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/company-profile">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Company Profile</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <CompanyProfile />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
          <Route path="/test-notifications">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Test Notifications</h1>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <TestNotifications />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Route>
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