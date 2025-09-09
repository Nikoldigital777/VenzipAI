import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Target, 
  Brain,
  AlertTriangle,
  Shield,
  RefreshCw,
  Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

type RiskScoreHistory = {
  id: string;
  userId: string;
  frameworkId: string | null;
  overallRiskScore: string;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  mitigatedRisks: number;
  totalTasks: number;
  completedTasks: number;
  calculationFactors: {
    taskCompletion: number;
    riskMitigation: number;
    timelyCompletion: number;
    overallHealth: number;
  };
  triggeredBy: string;
  createdAt: string;
};

type DynamicRiskScore = {
  overallRiskScore: number;
  riskTrend: 'improving' | 'declining' | 'stable';
  factors: {
    taskCompletion: number;
    riskMitigation: number;
    timelyCompletion: number;
    overallHealth: number;
  };
  recommendations: string[];
  alerts: string[];
  nextActions: string[];
};

export default function DynamicRiskDashboard() {
  const { toast } = useToast();
  const [selectedFramework, setSelectedFramework] = useState<string | undefined>();
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [scoreImpact, setScoreImpact] = useState<{
    before: number;
    after: number;
    change: number;
    trigger: string;
    visible: boolean;
  } | null>(null);

  // Fetch risk score history for trend analysis with auto-refresh
  const { data: riskHistory, isLoading: historyLoading } = useQuery<RiskScoreHistory[]>({
    queryKey: ["/api/risks/score-history", selectedFramework],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFramework) params.set("frameworkId", selectedFramework);
      const res = await apiRequest("GET", `/api/risks/score-history?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load risk history");
      return res.json();
    },
    // Auto-refresh every 30 seconds to catch risk score updates
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  // Fetch latest risk score with auto-refresh
  const { data: latestScore, isRefetching: scoreRefetching } = useQuery<RiskScoreHistory | null>({
    queryKey: ["/api/risks/latest-score", selectedFramework],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFramework) params.set("frameworkId", selectedFramework);
      const res = await apiRequest("GET", `/api/risks/latest-score?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load latest score");
      return res.json();
    },
    // Auto-refresh every 30 seconds to catch new scores
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  // Calculate new risk score mutation
  const calculateScoreMutation = useMutation({
    mutationFn: async (frameworkId?: string) => {
      const res = await apiRequest("POST", "/api/risks/calculate-score", { frameworkId });
      if (!res.ok) throw new Error("Failed to calculate risk score");
      return res.json();
    },
    onSuccess: (data: DynamicRiskScore) => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks/score-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risks/latest-score"] });
      setLastUpdateTime(new Date());
      toast({
        title: "Risk Score Updated",
        description: `New risk score: ${data.overallRiskScore.toFixed(1)}/100`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate risk score",
        variant: "destructive",
      });
    },
  });

  // Prepare chart data
  const chartData = riskHistory?.slice(0, 30).reverse().map((entry, index) => ({
    date: format(new Date(entry.createdAt), 'MMM dd'),
    riskScore: parseFloat(entry.overallRiskScore),
    taskCompletion: entry.calculationFactors?.taskCompletion || 0,
    riskMitigation: entry.calculationFactors?.riskMitigation || 0,
    timelyCompletion: entry.calculationFactors?.timelyCompletion || 0,
    overallHealth: entry.calculationFactors?.overallHealth || 0,
  })) || [];

  // Auto-detect task completion and refresh dashboard
  useEffect(() => {
    // Listen for task updates in the query cache
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === '/api/tasks' && event.type === 'updated') {
        // Capture current score before refresh
        const currentScore = latestScore ? parseFloat(latestScore.overallRiskScore) : 0;
        
        // Task data changed, might be a completion - refresh risk scores
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/risks/score-history"] });
          queryClient.invalidateQueries({ queryKey: ["/api/risks/latest-score"] });
          setIsAutoUpdating(true);
          
          // Show impact after refresh
          setTimeout(() => {
            setIsAutoUpdating(false);
            showScoreImpact(currentScore, 'task_completion');
          }, 3000);
        }, 1000); // Small delay to allow backend processing
      }
    });
    
    return unsubscribe;
  }, [latestScore]);

  // Show score impact comparison
  const showScoreImpact = (beforeScore: number, trigger: string) => {
    setTimeout(() => {
      const afterScore = latestScore ? parseFloat(latestScore.overallRiskScore) : 0;
      if (Math.abs(afterScore - beforeScore) > 0.1) { // Only show if meaningful change
        setScoreImpact({
          before: beforeScore,
          after: afterScore,
          change: afterScore - beforeScore,
          trigger,
          visible: true
        });
        
        // Hide after 5 seconds
        setTimeout(() => {
          setScoreImpact(prev => prev ? { ...prev, visible: false } : null);
        }, 5000);
      }
    }, 500); // Wait for data to update
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    const currentScore = latestScore ? parseFloat(latestScore.overallRiskScore) : 0;
    setIsAutoUpdating(true);
    queryClient.invalidateQueries({ queryKey: ["/api/risks/score-history"] });
    queryClient.invalidateQueries({ queryKey: ["/api/risks/latest-score"] });
    setLastUpdateTime(new Date());
    setTimeout(() => {
      setIsAutoUpdating(false);
      showScoreImpact(currentScore, 'manual_refresh');
    }, 2000);
  };

  // Risk distribution data for pie chart
  const riskDistributionData = latestScore ? [
    { name: 'High Risk', value: latestScore.highRisks, color: '#ef4444' },
    { name: 'Medium Risk', value: latestScore.mediumRisks, color: '#f97316' },
    { name: 'Low Risk', value: latestScore.lowRisks, color: '#22c55e' },
    { name: 'Mitigated', value: latestScore.mitigatedRisks, color: '#06b6d4' }
  ].filter(item => item.value > 0) : [];

  // Task completion data
  const taskData = latestScore ? [
    { name: 'Completed', value: latestScore.completedTasks, color: '#22c55e' },
    { name: 'Pending', value: latestScore.totalTasks - latestScore.completedTasks, color: '#94a3b8' }
  ] : [];

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskTrendIcon = (history: RiskScoreHistory[]) => {
    if (history.length < 2) return <Activity className="h-4 w-4" />;
    
    const latest = parseFloat(history[0].overallRiskScore);
    const previous = parseFloat(history[1].overallRiskScore);
    
    if (latest < previous) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (latest > previous) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Score Impact Notification */}
      {scoreImpact?.visible && (
        <Card className={`border-2 transition-all duration-500 ${
          scoreImpact.change < 0 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : scoreImpact.change > 0 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  scoreImpact.change < 0 
                    ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300' 
                    : scoreImpact.change > 0 
                      ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                }`}>
                  {scoreImpact.change < 0 ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : scoreImpact.change > 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <Activity className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Risk Score {scoreImpact.change < 0 ? 'Improved' : scoreImpact.change > 0 ? 'Increased' : 'Updated'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {scoreImpact.trigger === 'task_completion' && 'Task completion triggered automatic recalculation'}
                    {scoreImpact.trigger === 'manual_refresh' && 'Manual refresh completed'}
                    {scoreImpact.trigger === 'ai_calculation' && 'AI recalculation completed'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Before</div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {scoreImpact.before.toFixed(1)}
                  </div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">After</div>
                  <div className={`text-lg font-bold ${
                    scoreImpact.change < 0 ? 'text-green-600' : scoreImpact.change > 0 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {scoreImpact.after.toFixed(1)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Change</div>
                  <div className={`text-lg font-bold ${
                    scoreImpact.change < 0 ? 'text-green-600' : scoreImpact.change > 0 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {scoreImpact.change > 0 ? '+' : ''}{scoreImpact.change.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dynamic Risk Scoring Dashboard</h2>
            {(isAutoUpdating || scoreRefetching) && (
              <Badge variant="outline" className="text-xs animate-pulse">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Auto-updating
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>AI-powered risk analysis with real-time updates</span>
            {lastUpdateTime && (
              <span className="text-xs">
                • Last updated: {format(lastUpdateTime, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleManualRefresh}
            disabled={isAutoUpdating || scoreRefetching}
            variant="outline"
            size="sm"
          >
            {isAutoUpdating || scoreRefetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            onClick={() => calculateScoreMutation.mutate(selectedFramework)}
            disabled={calculateScoreMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {calculateScoreMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Recalculate Score
          </Button>
        </div>
      </div>

      {/* Current Risk Score Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 min-h-[120px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Current Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className={`text-2xl lg:text-3xl font-bold ${getRiskScoreColor(parseFloat(latestScore?.overallRiskScore || '0'))}`}>
                  {latestScore ? parseFloat(latestScore.overallRiskScore).toFixed(1) : '--'}
                </div>
                <div className="text-xs text-gray-500 mt-1">out of 100</div>
              </div>
              <div className="flex items-center ml-2 flex-shrink-0">
                {riskHistory && getRiskTrendIcon(riskHistory)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 min-h-[120px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 truncate">Task Completion</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl lg:text-2xl font-bold text-green-800 dark:text-green-200">
              {latestScore ? Math.round((latestScore.completedTasks / Math.max(latestScore.totalTasks, 1)) * 100) : 0}%
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {latestScore?.completedTasks || 0} of {latestScore?.totalTasks || 0} tasks
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 min-h-[120px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">Risk Mitigation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl lg:text-2xl font-bold text-blue-800 dark:text-blue-200">
              {latestScore?.calculationFactors?.riskMitigation?.toFixed(1) || '--'}%
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {latestScore?.mitigatedRisks || 0} risks mitigated
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 min-h-[120px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 truncate">Overall Health</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl lg:text-2xl font-bold text-purple-800 dark:text-purple-200">
              {latestScore?.calculationFactors?.overallHealth?.toFixed(1) || '--'}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Compliance health score
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Risk Score Trend
            </CardTitle>
            <CardDescription>Historical risk score changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {historyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}`, 'Risk Score']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Risk Factors Breakdown
            </CardTitle>
            <CardDescription>Current performance across key factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Task Completion', value: latestScore?.calculationFactors?.taskCompletion || 0 },
                  { name: 'Risk Mitigation', value: latestScore?.calculationFactors?.riskMitigation || 0 },
                  { name: 'Timely Completion', value: latestScore?.calculationFactors?.timelyCompletion || 0 },
                  { name: 'Overall Health', value: latestScore?.calculationFactors?.overallHealth || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution and Task Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
            <CardDescription>Current risk levels across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Task Progress
            </CardTitle>
            <CardDescription>Completion status of compliance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Calculation Info */}
      {latestScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Latest Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Triggered by: <span className="font-medium">{latestScore.triggeredBy.replace('_', ' ')}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Date: <span className="font-medium">{format(new Date(latestScore.createdAt), 'PPp')}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Framework: <span className="font-medium">{latestScore.frameworkId || 'All frameworks'}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}