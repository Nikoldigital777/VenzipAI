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
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onView: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const statusColors = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  under_review: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800'
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
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`} data-testid={`task-card-${task.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{categoryIcons[task.category as keyof typeof categoryIcons] || '📌'}</span>
              <h3 className="font-semibold text-gray-900 leading-tight cursor-pointer hover:text-venzip-primary" 
                  onClick={() => onView(task)}
                  data-testid={`task-title-${task.id}`}>
                {task.title}
              </h3>
              {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" data-testid={`task-overdue-${task.id}`} />}
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3" data-testid={`task-description-${task.id}`}>{task.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={priorityColors[task.priority]} variant="secondary" data-testid={`task-priority-${task.id}`}>
                {task.priority}
              </Badge>
              <Badge className={statusColors[task.status]} variant="secondary" data-testid={`task-status-${task.id}`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs" data-testid={`task-framework-${task.id}`}>
                {task.framework.displayName}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Progress bar */}
        {task.progressPercentage > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span data-testid={`task-progress-${task.id}`}>{task.progressPercentage}%</span>
            </div>
            <Progress value={task.progressPercentage} className="h-2" />
          </div>
        )}
        
        {/* Task metadata */}
        <div className="space-y-2 mb-4">
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span data-testid={`task-due-date-${task.id}`}>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
              {daysUntilDue !== null && (
                <span className={`ml-auto ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-500'}`}
                      data-testid={`task-days-until-due-${task.id}`}>
                  {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                   daysUntilDue === 0 ? 'Due today' : 
                   `${daysUntilDue} days left`}
                </span>
              )}
            </div>
          )}
          
          {task.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span data-testid={`task-assigned-to-${task.id}`}>Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs" data-testid={`task-tag-${task.id}-${index}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(task)} data-testid={`button-edit-${task.id}`}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onView(task)} data-testid={`button-view-${task.id}`}>
              View Details
            </Button>
          </div>
          
          {task.status !== 'completed' && (
            <Button 
              size="sm"
              onClick={() => onComplete(task.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid={`button-complete-${task.id}`}
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}