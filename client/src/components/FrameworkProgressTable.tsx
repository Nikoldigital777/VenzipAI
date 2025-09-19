
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface FrameworkProgress {
  frameworkId: string;
  frameworkName: string;
  displayName: string;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  color?: string;
  icon?: string;
}

export function FrameworkProgressTable() {
  const { data: frameworkProgress, isLoading, error } = useQuery<FrameworkProgress[]>({
    queryKey: ['/api/framework-progress'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getStatusBadge = (status: string, completionPercentage: number) => {
    const badgeProps = {
      excellent: { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
      good: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
      needs_attention: { variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      critical: { variant: 'default' as const, className: 'bg-red-100 text-red-800 border-red-200' }
    };

    const props = badgeProps[status as keyof typeof badgeProps] || badgeProps.critical;
    
    return (
      <Badge {...props}>
        {completionPercentage}% Complete
      </Badge>
    );
  };

  const getRiskLevel = (completionPercentage: number) => {
    if (completionPercentage >= 90) return { level: 'Low', color: 'text-green-600' };
    if (completionPercentage >= 70) return { level: 'Medium', color: 'text-yellow-600' };
    if (completionPercentage >= 50) return { level: 'High', color: 'text-orange-600' };
    return { level: 'Critical', color: 'text-red-600' };
  };

  const getNextAuditDate = (frameworkName: string) => {
    // Calculate estimated audit date based on framework completion
    const now = new Date();
    const months = frameworkName === 'soc2' ? 12 : frameworkName === 'iso27001' ? 18 : 6;
    const auditDate = new Date(now.getFullYear(), now.getMonth() + months, 1);
    return auditDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load framework progress</p>
      </div>
    );
  }

  if (!frameworkProgress || frameworkProgress.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No frameworks selected</p>
        <p className="text-sm text-gray-500">Complete your company profile to track framework progress</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Framework</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Tasks</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk Level</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Next Audit</th>
          </tr>
        </thead>
        <tbody>
          {frameworkProgress.map((framework) => {
            const risk = getRiskLevel(framework.completionPercentage);
            return (
              <tr key={framework.frameworkId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${framework.color}20`, color: framework.color }}
                    >
                      {framework.icon || '📋'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{framework.displayName}</div>
                      <div className="text-xs text-gray-500">{framework.frameworkName}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-2">
                    {getStatusBadge(framework.status, framework.completionPercentage)}
                    <Progress 
                      value={framework.completionPercentage} 
                      className="w-full h-2"
                    />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {framework.completedTasks}/{framework.totalTasks}
                    </div>
                    <div className="text-gray-500">tasks</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`font-medium ${risk.color}`}>
                    {risk.level}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {getNextAuditDate(framework.frameworkName)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="bg-blue-50/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Overall Progress</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(frameworkProgress.reduce((sum, f) => sum + f.completionPercentage, 0) / frameworkProgress.length)}%
          </div>
          <div className="text-xs text-blue-600">across all frameworks</div>
        </div>
        
        <div className="bg-green-50/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Completed Tasks</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {frameworkProgress.reduce((sum, f) => sum + f.completedTasks, 0)}
          </div>
          <div className="text-xs text-green-600">
            of {frameworkProgress.reduce((sum, f) => sum + f.totalTasks, 0)} total
          </div>
        </div>
        
        <div className="bg-purple-50/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Frameworks</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {frameworkProgress.length}
          </div>
          <div className="text-xs text-purple-600">in progress</div>
        </div>
      </div>
    </div>
  );
}
