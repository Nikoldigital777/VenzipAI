import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Calendar, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';

interface DeadlineTask {
  id: string;
  title: string;
  priority: string;
  framework: string;
  dueDate: string;
  status: string;
  progressPercentage: number;
  daysOverdue?: number;
  daysUntilDue?: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface DeadlineIntelligenceData {
  overdueTasks: DeadlineTask[];
  upcomingDeadlines: DeadlineTask[];
  atRiskTasks: DeadlineTask[];
  summary: {
    totalOverdue: number;
    totalUpcoming: number;
    criticalTasks: number;
    averageProgressBehind: number;
  };
  aiRecommendations: string[];
}

export function DeadlineIntelligence() {
  const { data: deadlineData, isLoading, error } = useQuery<DeadlineIntelligenceData>({
    queryKey: ['/api/tasks/ai-analysis/deadlines'],
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-700';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      default: return 'border-blue-500 bg-blue-50 text-blue-700';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">Unable to load deadline intelligence. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-xl font-bold text-red-600" data-testid="overdue-count">
                  {deadlineData?.summary.totalOverdue || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-xl font-bold text-orange-600" data-testid="upcoming-count">
                  {deadlineData?.summary.totalUpcoming || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Risk</p>
                <p className="text-xl font-bold text-purple-600" data-testid="critical-count">
                  {deadlineData?.summary.criticalTasks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Behind</p>
                <p className="text-xl font-bold text-blue-600" data-testid="average-behind">
                  {deadlineData?.summary.averageProgressBehind || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {deadlineData?.aiRecommendations && deadlineData.aiRecommendations.length > 0 && (
        <Card className="glass-card group hover-lift">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              AI Deadline Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-2">
              {deadlineData.aiRecommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-lg p-3 border border-blue-200/30"
                  data-testid={`ai-recommendation-${index}`}
                >
                  <p className="text-sm text-blue-800 leading-relaxed">
                    💡 {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Tasks */}
      {deadlineData?.overdueTasks && deadlineData.overdueTasks.length > 0 && (
        <Card className="glass-card border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Overdue Tasks ({deadlineData.overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deadlineData.overdueTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-red-50/80 border border-red-200 rounded-lg p-4"
                  data-testid={`overdue-task-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 mb-1" data-testid={`overdue-task-title-${index}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                          {task.framework}
                        </Badge>
                        <Badge className={getRiskColor(task.riskLevel)} variant="outline">
                          {getRiskIcon(task.riskLevel)}
                          {task.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600" data-testid={`overdue-days-${index}`}>
                        {task.daysOverdue} days overdue
                      </div>
                      <div className="text-xs text-red-500">
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700">
                      Progress: {task.progressPercentage}%
                    </span>
                    <span className="text-red-600 font-medium">
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Deadlines */}
      {deadlineData?.upcomingDeadlines && deadlineData.upcomingDeadlines.length > 0 && (
        <Card className="glass-card border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-700">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines ({deadlineData.upcomingDeadlines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deadlineData.upcomingDeadlines.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-orange-50/80 border border-orange-200 rounded-lg p-4"
                  data-testid={`upcoming-task-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900 mb-1" data-testid={`upcoming-task-title-${index}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                          {task.framework}
                        </Badge>
                        <Badge className={getRiskColor(task.riskLevel)} variant="outline">
                          {getRiskIcon(task.riskLevel)}
                          {task.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-600" data-testid={`upcoming-days-${index}`}>
                        {task.daysUntilDue} days left
                      </div>
                      <div className="text-xs text-orange-500">
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-700">
                      Progress: {task.progressPercentage}%
                    </span>
                    <span className="text-orange-600 font-medium">
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* At Risk Tasks */}
      {deadlineData?.atRiskTasks && deadlineData.atRiskTasks.length > 0 && (
        <Card className="glass-card border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              At Risk Tasks ({deadlineData.atRiskTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deadlineData.atRiskTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-yellow-50/80 border border-yellow-200 rounded-lg p-4"
                  data-testid={`at-risk-task-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-900 mb-1" data-testid={`at-risk-task-title-${index}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                          {task.framework}
                        </Badge>
                        <Badge className={getRiskColor(task.riskLevel)} variant="outline">
                          {getRiskIcon(task.riskLevel)}
                          {task.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-600" data-testid={`at-risk-days-${index}`}>
                        {task.daysUntilDue} days left
                      </div>
                      <div className="text-xs text-yellow-500">
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700">
                      Progress: {task.progressPercentage}%
                    </span>
                    <span className="text-yellow-600 font-medium">
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No deadline issues */}
      {deadlineData && 
       deadlineData.overdueTasks.length === 0 && 
       deadlineData.upcomingDeadlines.length === 0 && 
       deadlineData.atRiskTasks.length === 0 && (
        <Card className="glass-card border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">All Caught Up!</h3>
            <p className="text-green-600">No urgent deadline issues at the moment. Great work!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}