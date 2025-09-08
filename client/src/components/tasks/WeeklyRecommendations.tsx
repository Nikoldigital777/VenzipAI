import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, Target, Brain, RefreshCw } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyRecommendation {
  taskId: string;
  taskTitle: string;
  framework: string;
  priority: string;
  recommendationReason: string;
  urgencyScore: number;
  impactScore: number;
  estimatedHours: number;
}

interface WeeklyRecommendationsData {
  weekStart: string;
  weekEnd: string;
  totalRecommendedHours: number;
  recommendations: WeeklyRecommendation[];
  summary: string;
  focusAreas: string[];
}

export function WeeklyRecommendations() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: recommendations, isLoading, error, refetch } = useQuery<WeeklyRecommendationsData>({
    queryKey: ['/api/tasks/ai-recommendations/weekly'],
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const currentWeek = {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
            </div>
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
            <Brain className="h-5 w-5" />
            <p className="text-sm">Unable to load AI recommendations. Please try again later.</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card group hover-lift">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <Brain className="h-6 w-6 text-purple-600 group-hover:animate-bounce" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Weekly AI Focus
                <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200/50">
                  🎯 AI Powered
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                {format(currentWeek.start, 'MMM dd')} - {format(currentWeek.end, 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-purple-200 hover:bg-purple-50"
            data-testid="button-refresh-recommendations"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        {recommendations && (
          <>
            {/* Weekly Summary */}
            {recommendations.summary && (
              <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 rounded-xl p-4 border border-purple-200/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-purple-700 text-sm">This Week's Focus</h4>
                </div>
                <p className="text-sm text-purple-800 leading-relaxed" data-testid="weekly-summary">
                  {recommendations.summary}
                </p>
                
                {recommendations.focusAreas.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-purple-600 font-medium mb-2">Key Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {recommendations.focusAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Workload Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 rounded-lg p-3 border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Recommended Tasks</span>
                </div>
                <p className="text-lg font-bold text-gray-900" data-testid="recommended-task-count">
                  {recommendations.recommendations.length}
                </p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3 border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-600">Estimated Hours</span>
                </div>
                <p className="text-lg font-bold text-gray-900" data-testid="total-estimated-hours">
                  {recommendations.totalRecommendedHours}h
                </p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3 border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-600">Avg Impact</span>
                </div>
                <p className="text-lg font-bold text-gray-900" data-testid="average-impact">
                  {recommendations.recommendations.length > 0 ? 
                    Math.round(recommendations.recommendations.reduce((sum, rec) => sum + rec.impactScore, 0) / recommendations.recommendations.length) 
                    : 0}/100
                </p>
              </div>
            </div>

            {/* Recommended Tasks */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <span>🎯</span> Recommended Tasks
              </h4>
              
              {recommendations.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recommendations available yet.</p>
                  <p className="text-sm text-gray-400">Tasks need AI analysis first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendations.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white/80 rounded-lg p-4 border border-gray-200/50 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200"
                      data-testid={`recommendation-${index}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1" data-testid={`recommendation-title-${index}`}>
                            {rec.taskTitle}
                          </h5>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {rec.framework}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${
                              rec.priority === 'critical' ? 'border-red-500 text-red-700' :
                              rec.priority === 'high' ? 'border-orange-500 text-orange-700' :
                              rec.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                              'border-gray-500 text-gray-700'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Impact Score</div>
                          <div className="text-lg font-bold text-purple-600" data-testid={`recommendation-impact-${index}`}>
                            {rec.impactScore}/100
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed" data-testid={`recommendation-reason-${index}`}>
                        {rec.recommendationReason}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Urgency: {rec.urgencyScore}/100</span>
                        <span>Est. {rec.estimatedHours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}