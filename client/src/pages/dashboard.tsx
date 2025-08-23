import { useQuery } from "@tanstack/react-query";
import type { FrameworkProgress, Task, Document, Risk } from "@shared/schema";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import ProgressRing from "@/components/progress-ring";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  overallProgress: number;
  activeTasks: number;
  riskLevel: string;
  documentsCount: number;
}

export default function Dashboard() {
  // Fetch framework progress
  const { data: frameworkProgress = [] } = useQuery<FrameworkProgress[]>({
    queryKey: ["/api/framework-progress"],
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch documents
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch risks
  const { data: risks = [] } = useQuery<Risk[]>({
    queryKey: ["/api/risks"],
  });

  // Calculate dashboard stats
  const stats: DashboardStats = {
    overallProgress: frameworkProgress.length > 0 
      ? Math.round(frameworkProgress.reduce((sum, fp) => sum + parseFloat(fp.progressPercentage), 0) / frameworkProgress.length)
      : 0,
    activeTasks: tasks.filter((task) => task.status !== 'completed').length,
    riskLevel: risks.filter((risk) => risk.impact === 'high').length > 0 ? 'High' : 
               risks.filter((risk) => risk.impact === 'medium').length > 0 ? 'Medium' : 'Low',
    documentsCount: documents.length
  };

  const activeTasks = tasks.filter((task) => task.status !== 'completed');
  const dueSoonTasks = activeTasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return dueDate <= weekFromNow;
  }).length;

  const pendingDocuments = documents.filter((doc) => doc.status === 'pending').length;
  const highRisks = risks.filter((risk) => risk.impact === 'high').length;

  // Recent activity (mock data for demonstration)
  const recentActivity = [
    { type: 'success', message: 'Access control policy updated', time: '2 hours ago' },
    { type: 'info', message: 'Employee training completed', time: '5 hours ago' },
    { type: 'warning', message: 'Risk assessment due soon', time: '1 day ago' },
    { type: 'danger', message: 'Incident response test failed', time: '2 days ago' }
  ];

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Dashboard Header */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
                  <p className="text-gray-600">Track your compliance progress across all frameworks</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Last updated</div>
                  <div className="text-lg font-semibold text-gray-900">Just now</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Compliance */}
            <Card className="glass-card hover-lift" data-testid="stat-overall-progress">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-pie text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.overallProgress}%</div>
                    <div className="text-sm text-gray-500">Overall</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.overallProgress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card className="glass-card hover-lift" data-testid="stat-active-tasks">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-warning rounded-full flex items-center justify-center">
                    <i className="fas fa-tasks text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.activeTasks}</div>
                    <div className="text-sm text-gray-500">Active Tasks</div>
                  </div>
                </div>
                <div className="text-sm text-warning-orange">
                  {dueSoonTasks} due this week
                </div>
              </CardContent>
            </Card>

            {/* Risk Score */}
            <Card className="glass-card hover-lift" data-testid="stat-risk-level">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-danger rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.riskLevel}</div>
                    <div className="text-sm text-gray-500">Risk Level</div>
                  </div>
                </div>
                <div className="text-sm text-danger-coral">
                  {highRisks} high-priority risks
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="glass-card hover-lift" data-testid="stat-documents">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center">
                    <i className="fas fa-file-alt text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.documentsCount}</div>
                    <div className="text-sm text-gray-500">Documents</div>
                  </div>
                </div>
                <div className="text-sm text-success-green">
                  {pendingDocuments} pending review
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Framework Progress */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Framework Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {frameworkProgress.map((progress) => (
                  <div key={progress.id} className="text-center" data-testid={`progress-${progress.frameworkId}`}>
                    <ProgressRing 
                      percentage={parseFloat(progress.progressPercentage)}
                      size={96}
                      strokeWidth={8}
                    />
                    <h3 className="font-semibold text-gray-900 mt-4">Framework</h3>
                    <p className="text-sm text-gray-500">
                      {progress.completedControls}/{progress.totalControls} controls
                    </p>
                  </div>
                ))}
                
                {frameworkProgress.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-chart-bar text-gray-400 text-xl"></i>
                    </div>
                    <p className="text-gray-500">No framework progress to display</p>
                    <p className="text-sm text-gray-400">Complete the onboarding process to see your progress</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Heatmap & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Risk Heatmap */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Heatmap</h2>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="h-16 bg-success-green/20 rounded-lg flex items-center justify-center text-sm font-medium text-success-green">Data Backup</div>
                  <div className="h-16 bg-warning-orange/20 rounded-lg flex items-center justify-center text-sm font-medium text-warning-orange">Access Control</div>
                  <div className="h-16 bg-danger-coral/20 rounded-lg flex items-center justify-center text-sm font-medium text-danger-coral">Incident Response</div>
                  <div className="h-16 bg-success-green/20 rounded-lg flex items-center justify-center text-sm font-medium text-success-green">Encryption</div>
                  <div className="h-16 bg-venzip-primary/20 rounded-lg flex items-center justify-center text-sm font-medium text-venzip-primary">Training</div>
                  <div className="h-16 bg-warning-orange/20 rounded-lg flex items-center justify-center text-sm font-medium text-warning-orange">Vendor Mgmt</div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low Risk</span>
                  <span>Medium Risk</span>
                  <span>High Risk</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3" data-testid={`activity-${index}`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-success-green' :
                        activity.type === 'info' ? 'bg-venzip-primary' :
                        activity.type === 'warning' ? 'bg-warning-orange' :
                        'bg-danger-coral'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AIChat />
    </>
  );
}
