// client/src/components/tasks/TaskCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { format, isAfter, differenceInDays } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'under_review' | 'completed' | 'blocked';
  dueDate?: string;
  progressPercentage: number;
  framework: {
    id: string;
    name: string;
    displayName: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
  suggestedEvidence?: string[]; // Added for suggested evidence

  // AI-powered insights
  aiPriorityScore?: number;
  aiReasoning?: string;
  aiNextAction?: string;
  aiAnalyzedAt?: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onView: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-success-green/15 text-success-green border border-success-green/20 shadow-sm',
  medium: 'bg-warning-orange/15 text-warning-orange border border-warning-orange/20 shadow-sm',
  high: 'bg-danger-coral/15 text-danger-coral border border-danger-coral/20 shadow-sm',
  critical: 'bg-gradient-to-r from-danger-coral/20 to-danger-coral/15 text-danger-coral border border-danger-coral/30 shadow-md animate-pulse'
};

const statusColors = {
  not_started: 'bg-gray-100/80 dark:bg-surface-secondary text-gray-700 dark:text-text-secondary border border-gray-200/50 dark:border-gray-600/30',
  in_progress: 'bg-venzip-primary/15 dark:bg-venzip-primary/20 text-venzip-primary border border-venzip-primary/20 shadow-sm',
  under_review: 'bg-venzip-secondary/15 dark:bg-venzip-secondary/20 text-venzip-secondary border border-venzip-secondary/20 shadow-sm',
  completed: 'bg-success-green/15 dark:bg-success-green/20 text-success-green border border-success-green/20 shadow-sm',
  blocked: 'bg-danger-coral/15 dark:bg-danger-coral/20 text-danger-coral border border-danger-coral/20 shadow-sm'
};

const categoryIcons = {
  policy: '📋',
  procedure: '📝',
  training: '🎓',
  audit: '🔍',
  risk_assessment: '⚠️',
  documentation: '📄',
  technical: '⚙️',
  other: '📌'
};

export default function TaskCard({ task, onEdit, onComplete, onView }: TaskCardProps) {
  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'completed';
  const daysUntilDue = task.dueDate ? differenceInDays(new Date(task.dueDate), new Date()) : null;

  return (
    <Card className={`glass-card group saas-interactive cursor-pointer relative overflow-hidden transition-all duration-300 ${isOverdue ? 'border-danger-coral/30 shadow-danger-coral/20 dark:border-danger-coral/40' : 'hover:shadow-xl hover:shadow-venzip-primary/10 dark:hover:shadow-venzip-primary/20'}`} data-testid={`task-card-${task.id}`}>
      {/* Gradient overlay for hover effect - enhanced for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-venzip-primary/10 dark:to-transparent"></div>

      {/* Overdue warning overlay */}
      {isOverdue && (
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-danger-coral via-warning-orange to-danger-coral animate-gradient-x"></div>
      )}
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-sm">
                <span className="text-lg group-hover:animate-bounce">{categoryIcons[task.category as keyof typeof categoryIcons] || '📌'}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-foreground leading-tight group-hover:text-venzip-primary dark:group-hover:text-venzip-primary transition-colors duration-300 text-lg"
                    onClick={() => onView(task)}
                    data-testid={`task-title-${task.id}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {isOverdue && (
                    <div className="flex items-center gap-1 text-danger-coral animate-pulse">
                      <AlertCircle className="h-3 w-3" data-testid={`task-overdue-${task.id}`} />
                      <span className="text-xs font-medium">Overdue</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 dark:text-text-secondary line-clamp-2 mb-3 group-hover:text-gray-800 dark:group-hover:text-text-primary transition-colors duration-300" data-testid={`task-description-${task.id}`}>{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`${priorityColors[task.priority]} font-medium group-hover:scale-105 transition-transform duration-300`} variant="secondary" data-testid={`task-priority-${task.id}`}>
                {task.priority.toUpperCase()}
              </Badge>
              {task.aiPriorityScore && (
                <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200/50 font-medium group-hover:scale-105 transition-transform duration-300" variant="secondary" data-testid={`task-ai-score-${task.id}`}>
                  🤖 AI Score: {task.aiPriorityScore}/100
                </Badge>
              )}
              <Badge className={`${statusColors[task.status]} font-medium group-hover:scale-105 transition-transform duration-300`} variant="secondary" data-testid={`task-status-${task.id}`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs font-medium border-venzip-primary/30 text-venzip-primary group-hover:bg-venzip-primary/10 group-hover:scale-105 transition-all duration-300" data-testid={`task-framework-${task.id}`}>
                {task.framework.displayName}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative z-10">
        {/* Enhanced Progress Section */}
        {task.progressPercentage > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-text-secondary group-hover:text-venzip-primary transition-colors duration-300">Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-text-primary group-hover:text-venzip-primary transition-colors duration-300" data-testid={`task-progress-${task.id}`}>
                  {task.progressPercentage}%
                </span>
                <div className="w-6 h-6 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-venzip-primary">
                    {task.progressPercentage >= 75 ? '🎯' : task.progressPercentage >= 50 ? '⚡' : task.progressPercentage >= 25 ? '🔄' : '🚀'}
                  </span>
                </div>
              </div>
            </div>
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="h-3 bg-gray-100 dark:bg-surface-secondary rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-primary rounded-full transition-all duration-1000 ease-out relative group-hover:shadow-lg group-hover:shadow-venzip-primary/25"
                  style={{ width: `${task.progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              {/* Progress milestones */}
              <div className="flex justify-between mt-1">
                {[25, 50, 75, 100].map((milestone) => (
                  <div
                    key={milestone}
                    className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                      task.progressPercentage >= milestone ? 'bg-venzip-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Task metadata */}
        <div className="space-y-2 mb-4">
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-text-secondary">
              <Calendar className="h-4 w-4" />
              <span data-testid={`task-due-date-${task.id}`}>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
              {daysUntilDue !== null && (
                <span className={`ml-auto ${daysUntilDue < 0 ? 'text-red-600 dark:text-red-400' : daysUntilDue <= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-text-subdued'}`}
                      data-testid={`task-days-until-due-${task.id}`}>
                  {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                   daysUntilDue === 0 ? 'Due today' :
                   `${daysUntilDue} days left`}
                </span>
              )}
            </div>
          )}

          {task.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-text-secondary">
              <User className="h-4 w-4" />
              <span data-testid={`task-assigned-to-${task.id}`}>Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        {(task.aiReasoning || task.aiNextAction) && (
          <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-4 mb-4 border border-purple-200/30 dark:border-purple-600/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">🤖</span>
              </div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 text-sm">AI Intelligence</h4>
              {task.aiAnalyzedAt && (
                <span className="text-xs text-purple-600 dark:text-purple-400 ml-auto">
                  Analyzed {format(new Date(task.aiAnalyzedAt), 'MMM dd')}
                </span>
              )}
            </div>

            {task.aiReasoning && (
              <div className="mb-3">
                <p className="text-sm text-purple-800 dark:text-purple-200 font-medium mb-1">Priority Reasoning:</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed" data-testid={`task-ai-reasoning-${task.id}`}>
                  {task.aiReasoning}
                </p>
              </div>
            )}

            {task.aiNextAction && (
              <div className="bg-white/60 dark:bg-surface-secondary/60 rounded-lg p-3 border border-purple-200/40 dark:border-purple-600/40">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1 flex items-center gap-1">
                  <span>🎯</span> Suggested Next Action:
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed" data-testid={`task-ai-next-action-${task.id}`}>
                  {task.aiNextAction}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tags and Evidence Suggestions */}
        <div className="flex flex-col gap-4">
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs" data-testid={`task-tag-${task.id}-${index}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Evidence Suggestions */}
          {task.suggestedEvidence && task.suggestedEvidence.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-medium text-blue-700">📋 Suggested Evidence:</span>
              </div>
              <ul className="text-xs text-blue-600 space-y-0.5">
                {task.suggestedEvidence.slice(0, 2).map((evidence, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="line-clamp-1">{evidence}</span>
                  </li>
                ))}
                {task.suggestedEvidence.length > 2 && (
                  <li className="text-blue-500 font-medium ml-2">
                    +{task.suggestedEvidence.length - 2} more suggestions
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-between items-center gap-3 mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              className="border-venzip-primary/30 text-venzip-primary hover:bg-venzip-primary/10 hover:border-venzip-primary/50 hover:scale-105 transition-all duration-300 font-medium"
              data-testid={`button-edit-${task.id}`}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(task)}
              className="text-gray-600 dark:text-text-secondary hover:text-venzip-secondary hover:bg-venzip-secondary/10 hover:scale-105 transition-all duration-300 font-medium"
              data-testid={`button-view-${task.id}`}
            >
              View Details
            </Button>
          </div>

          {task.status !== 'completed' && (
            <Button
              size="sm"
              onClick={() => onComplete(task.id)}
              className="bg-gradient-success text-white hover:shadow-lg hover:shadow-success-green/25 hover:-translate-y-0.5 hover:scale-105 transform transition-all duration-300 font-medium"
              data-testid={`button-complete-${task.id}`}
            >
              ✓ Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}