import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface VelocityData {
  currentVelocity: number;
  averageVelocity: number;
  velocityTrend: 'improving' | 'declining' | 'stable';
  remainingTasks: number;
  weeksToCompletion: number | null;
  estimatedCompletionDate: string | null;
  weeklyProgress: {
    thisWeek: number;
    lastWeek: number;
    fourWeekAverage: number;
  };
}

export function ProgressTracking() {
  const { data: velocityData, isLoading, error } = useQuery<VelocityData>({
    queryKey: ['/api/progress/velocity'],
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-700 bg-green-50 border-green-200';
      case 'declining': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
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
            <Activity className="h-5 w-5" />
            <p className="text-sm">Unable to load progress tracking data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card group hover-lift">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
            <Activity className="h-6 w-6 text-blue-600 group-hover:animate-bounce" />
          </div>
          <div>
            <div className="text-xl font-bold">Progress Tracking</div>
            <div className="text-sm text-gray-500 font-normal">Velocity and completion projections</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      {velocityData && (
        <CardContent className="relative z-10 space-y-6">
          {/* Velocity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">This Week</span>
              </div>
              <p className="text-2xl font-bold text-blue-600" data-testid="current-velocity">
                {velocityData.currentVelocity}
              </p>
              <p className="text-xs text-gray-500">tasks completed</p>
            </div>
            
            <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Avg Velocity</span>
              </div>
              <p className="text-2xl font-bold text-purple-600" data-testid="average-velocity">
                {velocityData.averageVelocity}
              </p>
              <p className="text-xs text-gray-500">tasks/week</p>
            </div>
            
            <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Remaining</span>
              </div>
              <p className="text-2xl font-bold text-orange-600" data-testid="remaining-tasks">
                {velocityData.remainingTasks}
              </p>
              <p className="text-xs text-gray-500">tasks left</p>
            </div>
            
            <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">ETA</span>
              </div>
              <p className="text-lg font-bold text-green-600" data-testid="weeks-to-completion">
                {velocityData.weeksToCompletion ? `${velocityData.weeksToCompletion}w` : 'TBD'}
              </p>
              <p className="text-xs text-gray-500">to completion</p>
            </div>
          </div>

          {/* Velocity Trend */}
          <div className="bg-gradient-to-r from-gray-50/80 to-white/80 rounded-xl p-4 border border-gray-200/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Velocity Trend</h4>
              <Badge className={`${getTrendColor(velocityData.velocityTrend)} font-medium`} variant="outline">
                {getTrendIcon(velocityData.velocityTrend)}
                <span className="ml-1 capitalize">{velocityData.velocityTrend}</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600" data-testid="this-week-progress">
                  {velocityData.weeklyProgress.thisWeek}
                </p>
                <p className="text-xs text-gray-600">This Week</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600" data-testid="last-week-progress">
                  {velocityData.weeklyProgress.lastWeek}
                </p>
                <p className="text-xs text-gray-600">Last Week</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600" data-testid="four-week-average">
                  {velocityData.weeklyProgress.fourWeekAverage}
                </p>
                <p className="text-xs text-gray-600">4-Week Avg</p>
              </div>
            </div>
          </div>

          {/* Completion Projections */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Completion Projections</h4>
            
            {velocityData.estimatedCompletionDate && (
              <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-xl p-4 border border-green-200/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h5 className="font-medium text-green-800">Estimated Completion</h5>
                </div>
                <p className="text-lg font-bold text-green-700" data-testid="estimated-completion-date">
                  {format(new Date(velocityData.estimatedCompletionDate), 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  At current pace of {velocityData.averageVelocity} tasks per week
                </p>
              </div>
            )}

            {!velocityData.estimatedCompletionDate && velocityData.averageVelocity === 0 && (
              <div className="bg-gradient-to-r from-orange-50/80 to-yellow-50/80 rounded-xl p-4 border border-orange-200/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <h5 className="font-medium text-orange-800">No Progress Data</h5>
                </div>
                <p className="text-sm text-orange-700">
                  Complete some tasks to see progress projections and velocity trends.
                </p>
              </div>
            )}

            {/* Gap Trend Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
                <h5 className="font-medium text-gray-900 mb-2">Progress Status</h5>
                {velocityData.velocityTrend === 'improving' && (
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Gaps are closing - great momentum!</span>
                  </div>
                )}
                {velocityData.velocityTrend === 'declining' && (
                  <div className="flex items-center gap-2 text-red-700">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">Gaps growing - need to increase pace</span>
                  </div>
                )}
                {velocityData.velocityTrend === 'stable' && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Minus className="h-4 w-4" />
                    <span className="text-sm">Steady progress - maintain current pace</span>
                  </div>
                )}
              </div>
              
              <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
                <h5 className="font-medium text-gray-900 mb-2">Recommendation</h5>
                {velocityData.weeksToCompletion && velocityData.weeksToCompletion > 12 && (
                  <p className="text-sm text-orange-700">
                    🎯 Consider increasing task completion rate to meet compliance goals faster
                  </p>
                )}
                {velocityData.weeksToCompletion && velocityData.weeksToCompletion <= 8 && (
                  <p className="text-sm text-green-700">
                    ✅ Excellent progress! You're on track for timely compliance
                  </p>
                )}
                {velocityData.weeksToCompletion && velocityData.weeksToCompletion > 8 && velocityData.weeksToCompletion <= 12 && (
                  <p className="text-sm text-blue-700">
                    ⚡ Good pace! Stay consistent to reach compliance on schedule
                  </p>
                )}
                {!velocityData.weeksToCompletion && (
                  <p className="text-sm text-gray-700">
                    📊 Start completing tasks to see timeline projections
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}