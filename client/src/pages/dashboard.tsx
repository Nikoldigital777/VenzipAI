import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Upload, Shield, CheckCircle, AlertTriangle, Bot, BarChart3, Target, MessageSquare } from "lucide-react";
import ProgressRing from "@/components/progress-ring";
import DynamicRiskDashboard from "@/components/dynamic-risk-dashboard";

interface DashboardStats {
  uploads: number;
  conversations: number;
  tasksOpenHigh: number;
  risksHigh: number;
  frameworks: number;
  completedTasks: number;
  totalTasks: number;
  activeRisks: number;
}

interface SummaryData {
  compliancePercent: number;
  gaps: any[];
  stats: DashboardStats;
}

export default function Dashboard() {
  const { data: summaryData, isLoading } = useQuery<SummaryData>({
    queryKey: ["/api/summary"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-venzip-primary"></div>
      </div>
    );
  }

  const compliancePercent = summaryData?.compliancePercent || 0;
  const stats = summaryData?.stats || {
    uploads: 0,
    conversations: 0,
    tasksOpenHigh: 0,
    risksHigh: 0,
    frameworks: 0,
    completedTasks: 0,
    totalTasks: 0,
    activeRisks: 0,
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 via-transparent to-info-blue/5 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-venzip-primary to-venzip-primary-dark rounded-2xl flex items-center justify-center shadow-2xl shadow-venzip-primary/25 animate-glow-pulse">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-venzip-primary to-venzip-primary-dark bg-clip-text text-transparent">
                    Compliance Dashboard
                  </h1>
                  <p className="text-gray-600 text-lg">Monitor your organization's compliance health</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl px-6 py-4 shadow-lg">
                <div className="text-sm text-gray-600 font-medium">Overall Health</div>
                <div className="text-2xl font-bold text-venzip-primary">{compliancePercent}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="space-y-8">
        {/* Main Metrics Grid */}
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
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg min-h-[100px]">
                <div className="absolute inset-0 bg-gradient-to-br from-info-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600 group-hover:text-info-blue transition-colors duration-300">Evidence Uploads</div>
                    <div className="w-8 h-8 bg-gradient-to-br from-info-blue/20 to-info-blue/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Upload className="h-4 w-4 text-info-blue" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-xs text-gray-500">Documents uploaded</div>
                </CardContent>
              </Card>

              <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg min-h-[100px]">
                <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600 group-hover:text-success-green transition-colors duration-300">Tasks Complete</div>
                    <div className="w-8 h-8 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <CheckCircle className="h-4 w-4 text-success-green" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.completedTasks}</div>
                  <div className="text-xs text-gray-500">of {stats.totalTasks} total</div>
                </CardContent>
              </Card>

              <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg min-h-[100px]">
                <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600 group-hover:text-warning-orange transition-colors duration-300">Active Risks</div>
                    <div className="w-8 h-8 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <AlertTriangle className="h-4 w-4 text-warning-orange" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeRisks}</div>
                  <div className="text-xs text-gray-500">Require attention</div>
                </CardContent>
              </Card>

              <Card className="glass-card group hover-lift cursor-pointer relative overflow-hidden border-0 shadow-lg min-h-[100px]">
                <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600 group-hover:text-venzip-primary transition-colors duration-300">Frameworks</div>
                    <div className="w-8 h-8 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Shield className="h-4 w-4 text-venzip-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.frameworks}</div>
                  <div className="text-xs text-gray-500">Active standards</div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Corporate Compliance Metrics Table */}
        <Card className="glass-card animate-fadeInUp" style={{animationDelay: '0.5s'}}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-info-blue/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-info-blue" />
              </div>
              <div>
                <div className="text-lg font-semibold">Compliance Framework Status</div>
                <div className="text-sm text-gray-500 font-normal">Detailed progress across all frameworks</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Framework</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Controls</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Next Audit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-venzip-primary" />
                        <span className="font-medium">SOC 2 Type II</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-venzip-primary h-2 rounded-full" style={{width: `${compliancePercent}%`}}></div>
                        </div>
                        <span className="text-sm font-medium">{compliancePercent}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">64/75</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-success-green/10 text-success-green rounded-full text-xs font-medium">Low</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">Q3 2025</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-warning-orange/10 text-warning-orange rounded-full text-xs font-medium">In Progress</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-danger-coral" />
                        <span className="font-medium">HIPAA</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-danger-coral h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">28/36</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-success-green/10 text-success-green rounded-full text-xs font-medium">Low</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">Q2 2025</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-success-green/10 text-success-green rounded-full text-xs font-medium">Compliant</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Risk Dashboard */}
      <DynamicRiskDashboard />
    </div>
  );
}