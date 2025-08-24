// client/src/pages/dashboard.tsx
import { useSummary } from "@/hooks/useSummary";
import ProgressRing from "@/components/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import { 
  Upload, 
  MessageSquare, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  Clock,
  Activity,
  RefreshCw,
  CheckCircle
} from "lucide-react";

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

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
          {/* Loading background effects */}
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
          
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="grid gap-8">
              <Card className="glass-card">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-xl font-medium text-gray-700">Loading your compliance dashboard...</div>
                  <div className="text-sm text-gray-500 mt-2">Analyzing your compliance data</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <AIChat />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <Navigation />
        <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-danger-coral/5 relative overflow-hidden">
          {/* Error background effects */}
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-danger-coral/10 to-transparent rounded-full blur-3xl animate-float"></div>
          
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <Card className="glass-card border-danger-coral/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
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
                >
                  <RefreshCw className="h-4 w-4 mr-2 group-hover:animate-spin" />
                  Retry Loading
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
        <AIChat />
      </>
    );
  }

  const { compliancePercent, gaps, stats, recentActivity } = data;

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-venzip-secondary/8 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          {/* Header Section */}
          <div className="mb-12 text-center animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Compliance <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Monitor your compliance progress and track key metrics in real-time
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Compliance Score Card */}
            <Card className="lg:col-span-1 glass-card group hover-lift relative overflow-hidden animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-gray-900 group-hover:text-venzip-primary transition-colors duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg animate-glow-pulse">
                    <TrendingUp className="h-6 w-6 text-venzip-primary group-hover:animate-bounce" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Overall Compliance</div>
                    <div className="text-sm text-gray-500 font-normal">Current progress status</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12 relative z-10">
                <ProgressRing 
                  percentage={compliancePercent} 
                  size={140}
                  strokeWidth={12}
                  showGlow={true}
                  label="Complete"
                />
              </CardContent>
            </Card>

            {/* Enhanced Stats Grid */}
            <Card className="lg:col-span-2 glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 bg-gradient-to-br from-info-blue/20 to-info-blue/10 rounded-2xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-info-blue" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Key Metrics</div>
                    <div className="text-sm text-gray-500 font-normal">Real-time compliance statistics</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-info-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 group-hover:text-info-blue transition-colors duration-300">Evidence Uploads</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-info-blue/20 to-info-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <Upload className="h-5 w-5 text-info-blue group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-info-blue transition-colors duration-300">{stats.uploads}</div>
                    <div className="text-xs text-gray-500 mt-1">Documents processed</div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 group-hover:text-success-green transition-colors duration-300">AI Conversations</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <MessageSquare className="h-5 w-5 text-success-green group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-success-green transition-colors duration-300">{stats.conversations}</div>
                    <div className="text-xs text-gray-500 mt-1">Expert consultations</div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 group-hover:text-warning-orange transition-colors duration-300">Priority Tasks</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg animate-glow-pulse">
                        <Target className="h-5 w-5 text-warning-orange group-hover:animate-bounce" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-warning-orange transition-colors duration-300">{stats.tasksOpenHigh || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">High priority items</div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-danger-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-600 group-hover:text-danger-coral transition-colors duration-300">Critical Risks</div>
                      <div className="w-10 h-10 bg-gradient-to-br from-danger-coral/20 to-danger-coral/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <AlertTriangle className="h-5 w-5 text-danger-coral group-hover:animate-pulse" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-danger-coral transition-colors duration-300">{stats.risksHigh || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Requires attention</div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Enhanced Gaps Section */}
            <Card className="lg:col-span-2 glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-warning-orange group-hover:animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Compliance Gaps</div>
                    <div className="text-sm text-gray-500 font-normal">Areas requiring immediate attention</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gaps.length === 0 ? (
                  <Card className="glass-card border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-success-green" />
                      </div>
                      <div className="text-lg font-medium text-gray-900 mb-2">No Gaps Detected</div>
                      <div className="text-sm text-gray-600">Your compliance framework is on track!</div>
                    </CardContent>
                  </Card>
                ) : (
                  <ul className="space-y-4">
                    {gaps.map((g: Gap, index) => (
                      <li key={g.id} className="animate-fadeInUp" style={{animationDelay: `${0.1 * index}s`}}>
                        <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg">
                          <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                          <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="font-semibold text-gray-900 group-hover:text-warning-orange transition-colors duration-300">
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
                              >
                                {g.severity}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Recent Activity */}
            <Card className="lg:col-span-1 glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-secondary/20 to-venzip-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg animate-glow-pulse">
                    <Activity className="h-6 w-6 text-venzip-secondary group-hover:animate-bounce" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Recent Activity</div>
                    <div className="text-sm text-gray-500 font-normal">Latest system updates</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <li>
                      <Card className="glass-card border-0 shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Clock className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500 font-medium">No activity yet</div>
                          <div className="text-xs text-gray-400 mt-1">Start using the platform to see updates</div>
                        </CardContent>
                      </Card>
                    </li>
                  ) : recentActivity.map((a: Activity, index) => (
                    <li key={a.id} className="animate-fadeInUp" style={{animationDelay: `${0.1 * index}s`}}>
                      <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg">
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
        </div>
      </div>
      <AIChat />
    </>
  );
}