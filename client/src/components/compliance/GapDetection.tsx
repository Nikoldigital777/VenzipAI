import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Clock, Target, RefreshCw, TrendingUp } from 'lucide-react';

interface FrameworkGap {
  frameworkId: string;
  frameworkName: string;
  displayName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  missingRequirements: string[];
  criticalGaps: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
}

interface GapDetectionData {
  frameworks: FrameworkGap[];
  overallCompletion: number;
  totalGaps: number;
  criticalGaps: number;
  summary: string;
}

export function GapDetection() {
  const { data: gapData, isLoading, error, refetch } = useQuery<GapDetectionData>({
    queryKey: ['/api/compliance/gap-analysis'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'good': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'needs_attention': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'needs_attention': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'from-green-500 to-green-600';
    if (percentage >= 70) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                <div className="h-2 bg-gray-100 rounded animate-pulse"></div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Unable to load gap analysis. Please try again.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="glass-card group hover-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                <Target className="h-6 w-6 text-venzip-primary group-hover:animate-bounce" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Compliance Gap Analysis</CardTitle>
                <p className="text-sm text-gray-600">Framework completion overview and missing requirements</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-venzip-primary/30 hover:bg-venzip-primary/10"
              data-testid="button-refresh-gaps"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        {gapData && (
          <CardContent className="relative z-10">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Overall Completion</span>
                </div>
                <p className="text-2xl font-bold text-blue-600" data-testid="overall-completion">
                  {gapData.overallCompletion}%
                </p>
              </div>

              <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Total Gaps</span>
                </div>
                <p className="text-2xl font-bold text-purple-600" data-testid="total-gaps">
                  {gapData.totalGaps}
                </p>
              </div>

              <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600">Critical Gaps</span>
                </div>
                <p className="text-2xl font-bold text-red-600" data-testid="critical-gaps">
                  {gapData.criticalGaps}
                </p>
              </div>

              <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Frameworks</span>
                </div>
                <p className="text-2xl font-bold text-green-600" data-testid="frameworks-count">
                  {gapData.frameworks.length}
                </p>
              </div>
            </div>

            {/* AI Summary */}
            {gapData.summary && (
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl p-4 mb-6 border border-blue-200/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🎯</span>
                  </div>
                  <h4 className="font-semibold text-blue-700 text-sm">Gap Analysis Summary</h4>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed" data-testid="gap-summary">
                  {gapData.summary}
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Framework Details */}
      {gapData && gapData.frameworks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Framework Compliance Status</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gapData.frameworks.map((framework, index) => (
              <Card
                key={framework.frameworkId}
                className="glass-card group hover-lift"
                data-testid={`framework-gap-${index}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <CardHeader className="relative z-10 pb-4">
                  {/* Framework Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                        style={{ backgroundColor: framework.status === 'excellent' ? '#10B981' :
                                                   framework.status === 'good' ? '#3B82F6' :
                                                   framework.status === 'needs_attention' ? '#F59E0B' : '#EF4444' }}
                      >
                        {framework.displayName?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{framework.displayName}</h3>
                        <p className="text-sm text-gray-600">
                          {framework.frameworkName} • {framework.totalTasks} total tasks
                        </p>
                      </div>
                    </div>

                    <Badge className={`${getStatusColor(framework.status)} font-medium`} variant="outline">
                      {getStatusIcon(framework.status)}
                      <span className="ml-1 capitalize">{framework.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                      <span className="text-lg font-bold text-gray-900" data-testid={`framework-completion-${index}`}>
                        {framework.completionPercentage}%
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getProgressColor(framework.completionPercentage)} rounded-full transition-all duration-1000 ease-out relative`}
                          style={{ width: `${framework.completionPercentage}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missing Requirements */}
                  {framework.missingRequirements.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">Missing Requirements</h5>
                        <Badge variant="outline" className="text-xs">
                          {framework.missingRequirements.length} gaps
                        </Badge>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {framework.missingRequirements.slice(0, 5).map((requirement, reqIndex) => (
                          <div
                            key={reqIndex}
                            className="bg-orange-50/80 border border-orange-200/50 rounded-lg p-3"
                            data-testid={`missing-requirement-${index}-${reqIndex}`}
                          >
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-orange-800 leading-relaxed">
                                {requirement}
                              </p>
                            </div>
                          </div>
                        ))}

                        {framework.missingRequirements.length > 5 && (
                          <div className="text-center">
                            <Badge variant="outline" className="text-xs text-gray-600">
                              +{framework.missingRequirements.length - 5} more requirements
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Gaps */}
                  {framework.missingRequirements.length === 0 && framework.completionPercentage === 100 && (
                    <div className="bg-green-50/80 border border-green-200/50 rounded-lg p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700">Complete!</p>
                      <p className="text-sm text-green-600">All requirements satisfied</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {gapData && gapData.frameworks.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Framework Data</h3>
            <p className="text-gray-600 mb-4">
              Add some tasks and frameworks to see compliance gap analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}