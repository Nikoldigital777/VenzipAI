// client/src/pages/dashboard.tsx
import { useSummary } from "@/hooks/useSummary";
import ProgressRing from "@/components/progress-ring";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription // Import CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LazyAIChat from "@/components/LazyAIChat";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import {
  Upload,
  MessageSquare,
  AlertTriangle,
  Target,
  TrendingUp,
  Clock,
  Activity,
  RefreshCw,
  CheckCircle,
  BarChart3,
  Shield,
  Globe,
  ShieldAlert,
  FileText,
  CheckSquare, // Import CheckSquare
  Eye // Import Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { FrameworkProgressTable } from "@/components/FrameworkProgressTable";
import { Button } from "@/components/ui/button"; // Import Button

type Gap = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  kind: "task" | "risk";
  meta: {
    framework?: string;
    status?: string;
    dueDate?: string;
    category?: string;
    likelihood?: string;
  };
};
type Activity = { id: string; action: string; resourceType: string; createdAt: string };
type Summary = {
  compliancePercent: number;
  gaps: Gap[];
  stats: {
    uploads: number;
    conversations: number;
    tasksOpenHigh?: number;
    risksHigh?: number;
  };
  recentActivity: Activity[];
};

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useSummary();

  // Enhanced Dashboard progress data with better error handling
  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['/api/dashboard/progress'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/dashboard/progress', {
          credentials: 'include'
        });
        if (!response.ok) {
          console.warn('Progress API failed:', response.status);
          return { percentComplete: 0, totalTasks: 0, completedTasks: 0, hasData: false, error: `HTTP ${response.status}` };
        }
        const data = await response.json();
        return {
          percentComplete: data.percentComplete || 0,
          totalTasks: data.totalTasks || 0,
          completedTasks: data.completedTasks || 0,
          hasData: data.hasData !== false,
          message: data.message,
          error: data.error
        };
      } catch (error) {
        console.error('Progress fetch error:', error);
        return { percentComplete: 0, totalTasks: 0, completedTasks: 0, hasData: false, error: 'Network error' };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
    retry: 2,
    retryDelay: 1000
  });

  // Enhanced Recent tasks data with structured response handling
  const { data: recentTasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['/api/dashboard/recent-tasks'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/dashboard/recent-tasks', {
          credentials: 'include'
        });
        if (!response.ok) {
          console.warn('Recent tasks API failed:', response.status);
          return { tasks: [], hasData: false, error: `HTTP ${response.status}`, totalTasks: 0 };
        }
        const data = await response.json();

        // Handle both old and new response formats
        if (Array.isArray(data)) {
          return { tasks: data, hasData: data.length > 0, totalTasks: data.length };
        }

        return {
          tasks: data.tasks || [],
          hasData: data.hasData !== false,
          totalTasks: data.totalTasks || 0,
          message: data.message,
          error: data.error
        };
      } catch (error) {
        console.error('Recent tasks fetch error:', error);
        return { tasks: [], hasData: false, error: 'Network error', totalTasks: 0 };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
    retry: 2,
    retryDelay: 1000
  });

  // Extract recent tasks for backward compatibility
  const recentTasks = recentTasksData?.tasks || [];

  if (isLoading && !data) {
    return (
      <>
        <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 dark:from-surface-background dark:via-surface-primary/50 dark:to-venzip-primary/10 relative overflow-hidden">
          {/* Loading background effects */}
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>

          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="grid gap-8">
              <Card className="glass-card" data-testid="loading-card">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-xl font-medium text-gray-700 dark:text-text-primary">Loading your compliance dashboard...</div>
                  <div className="text-sm text-gray-500 dark:text-text-secondary mt-2">Analyzing your compliance data</div>
                  <div className="text-xs text-gray-400 dark:text-text-subdued mt-4">Note: Database is initializing - this may take a moment</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <LazyAIChat />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-danger-coral/5 relative overflow-hidden">
          {/* Error background effects */}
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-danger-coral/10 to-transparent rounded-full blur-3xl animate-float"></div>

          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <Card className="glass-card border-danger-coral/20" data-testid="error-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-text-primary">
                  <div className="w-10 h-10 bg-danger-coral/10 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-danger-coral" />
                  </div>
                  Dashboard Error
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-danger-coral/5 border border-danger-coral/20 rounded-xl">
                  <div className="text-danger-coral text-sm font-medium">
                    {(error as Error)?.message || "Failed to load summary."}
                  </div>
                </div>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300 font-medium group"
                  data-testid="retry-button"
                >
                  <RefreshCw className="h-4 w-4 mr-2 group-hover:animate-spin" />
                  Retry Loading
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
        <LazyAIChat />
      </>
    );
  }

  const { compliancePercent, gaps, stats, recentActivity } = data;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-venzip-secondary/8 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {/* Header Section */}
          <div className="mb-12 animate-fadeInUp">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  Compliance Overview
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Enterprise compliance monitoring and risk management dashboard
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</div>
                </div>
                <div className="h-2 w-2 bg-success-green rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Compliance Score Card */}
            <Card className="lg:col-span-1 glass-card group hover-lift relative overflow-hidden animate-fadeInUp" style={{animationDelay: '0.1s'}} data-testid="compliance-overview-card">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 group-hover:text-venzip-primary transition-colors duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg animate-glow-pulse">
                    <TrendingUp className="h-6 w-6 text-venzip-primary group-hover:animate-bounce" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Overall Compliance</div>
                    <div className="text-sm text-gray-500 dark:text-text-secondary font-normal">Current progress status</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12 relative z-10">
                <ProgressRing
                  percentage={progressData?.percentComplete || compliancePercent}
                  size={140}
                  strokeWidth={12}
                  showGlow={true}
                  label="Complete"
                />
                {progressData && (
                  <div className="absolute bottom-4 text-center text-xs text-gray-500 dark:text-text-subdued">
                    {progressData.completedTasks} of {progressData.totalTasks} tasks
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Stats Grid */}
            <Card className="lg:col-span-2 glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}} data-testid="key-metrics-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-text-primary">
                  <div className="w-10 h-10 bg-gradient-to-br from-info-blue/20 to-info-blue/10 rounded-2xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-info-blue" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Key Metrics</div>
                    <div className="text-sm text-gray-500 dark:text-text-secondary font-normal">Real-time compliance statistics</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg" data-testid="evidence-uploads-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-info-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-text-secondary group-hover:text-info-blue transition-colors duration-300">Evidence Uploads</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-info-blue/20 to-info-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <Upload className="h-5 w-5 text-info-blue group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2 group-hover:text-info-blue transition-colors duration-300">{stats.uploads}</div>
                    <div className="text-xs text-gray-500 dark:text-text-subdued">Documents uploaded</div>
                  </CardContent>
                </Card>

                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg" data-testid="ai-conversations-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-venzip-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-text-secondary group-hover:text-venzip-accent transition-colors duration-300">AI Conversations</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <MessageSquare className="h-5 w-5 text-venzip-accent group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2 group-hover:text-venzip-accent transition-colors duration-300">{stats.conversations}</div>
                    <div className="text-xs text-gray-500 dark:text-text-subdued">Claude interactions</div>
                  </CardContent>
                </Card>

                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg" data-testid="high-priority-tasks-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-text-secondary group-hover:text-warning-orange transition-colors duration-300">High Priority Tasks</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <Target className="h-5 w-5 text-warning-orange group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2 group-hover:text-warning-orange transition-colors duration-300">{stats.tasksOpenHigh || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-text-subdued">Tasks requiring attention</div>
                  </CardContent>
                </Card>

                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg" data-testid="high-risks-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-danger-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-text-secondary group-hover:text-danger-coral transition-colors duration-300">High Risks</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-danger-coral/20 to-danger-coral/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <ShieldAlert className="h-5 w-5 text-danger-coral group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2 group-hover:text-danger-coral transition-colors duration-300">{stats.risksHigh || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-text-subdued">Critical risks identified</div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Corporate Compliance Metrics Table */}
            <FrameworkProgressTable data-testid="framework-progress-table" />

            {/* Enhanced Gaps Section */}
            <Card className="lg:col-span-2 glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}} data-testid="compliance-gaps-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-text-primary">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-warning-orange group-hover:animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Compliance Gaps</div>
                    <div className="text-sm text-gray-500 dark:text-text-secondary font-normal">Areas requiring immediate attention</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gaps.length === 0 ? (
                  <Card className="glass-card border-0 shadow-lg" data-testid="no-gaps-detected-card">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-success-green" />
                      </div>
                      <div className="text-lg font-medium text-gray-900 dark:text-text-primary mb-2">No Gaps Detected</div>
                      <div className="text-sm text-gray-600 dark:text-text-secondary">Your compliance framework is on track!</div>
                    </CardContent>
                  </Card>
                ) : (
                  <ul className="space-y-4">
                    {gaps.map((g: Gap, index: number) => (
                      <li key={g.id} className="animate-fadeInUp" style={{animationDelay: `${0.1 * index}s`}}>
                        <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg" data-testid={`gap-item-${index}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                          <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-semibold text-gray-900 dark:text-text-primary group-hover:text-warning-orange transition-colors duration-300">
                                  {g.title}
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {g.kind === "task"
                                    ? `${g.meta?.framework?.toUpperCase() || "TASK"}`
                                    : `${g.meta?.category?.toUpperCase() || "RISK"}`
                                  }
                                </span>
                              </div>
                              {g.meta?.dueDate && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                  <Clock className="h-3 w-3" />
                                  <span>Due: {new Date(g.meta.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            <span
                              className={[
                                "px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-all duration-300 group-hover:scale-110",
                                g.severity === "critical" ? "bg-danger-coral/15 text-danger-coral border border-danger-coral/20" :
                                g.severity === "high" ? "bg-warning-orange/15 text-warning-orange border border-warning-orange/20" :
                                g.severity === "medium" ? "bg-venzip-primary/15 text-venzip-primary border border-venzip-primary/20" :
                                "bg-success-green/15 text-success-green border border-success-green/20"
                              ].join(" ")}
                              data-testid={`gap-severity-${g.severity}`}
                            >
                              {g.severity}
                            </span>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Recent Activity */}
            <Card className="lg:col-span-1 glass-card group hover:shadow-lg transition-shadow duration-300 animate-fadeInUp" style={{animationDelay: '0.4s'}} data-testid="audit-trail-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-text-primary">
                  <div className="w-10 h-10 bg-venzip-secondary/10 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-venzip-secondary" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Audit Trail</div>
                    <div className="text-sm text-gray-500 font-normal">Recent compliance activities</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <li>
                      <Card className="glass-card border-0 shadow-lg" data-testid="no-activity-yet-card">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Clock className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500 font-medium">No activity yet</div>
                          <div className="text-xs text-gray-400 mt-1">Start using the platform to see updates</div>
                        </CardContent>
                      </Card>
                    </li>
                  ) : recentActivity.map((a: Activity, index: number) => (
                    <li key={a.id} className="animate-fadeInUp" style={{animationDelay: `${0.1 * index}s`}}>
                      <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg" data-testid={`audit-trail-item-${index}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-venzip-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                        <CardContent className="p-4 relative z-10">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-venzip-secondary/20 to-venzip-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <Activity className="h-4 w-4 text-venzip-secondary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 group-hover:text-venzip-secondary transition-colors duration-300 text-sm leading-tight">
                                  {a.action}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 capitalize">
                                  {a.resourceType.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Generated Policies Section */}
          <Card className="lg:col-span-2 glass-card animate-fadeInUp" style={{animationDelay: '0.7s'}} data-testid="generated-policies-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Generated Policies</div>
                  <div className="text-sm text-gray-500 font-normal">Baseline compliance policies for your frameworks</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Information Security Policy', 'HIPAA Privacy Policy', 'Data Protection Policy'].map((policy, index) => (
                  <Card key={index} className="glass-card border-0 shadow-sm hover:shadow-md transition-shadow duration-200" data-testid={`policy-item-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{policy}</div>
                            <div className="text-xs text-gray-500">Auto-generated • Approved</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                          <Button variant="ghost" size="sm" data-testid={`view-policy-${policy.toLowerCase().replace(' ', '-')}`}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reports Section */}
          <Card className="lg:col-span-1 glass-card animate-fadeInUp" style={{animationDelay: '0.8s'}} data-testid="reports-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Reports</div>
                  <div className="text-sm text-gray-500 font-normal">Export compliance analytics</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReportGenerator />
            </CardContent>
          </Card>
        </div>
      </div>
      <LazyAIChat />
    </>
  );
}