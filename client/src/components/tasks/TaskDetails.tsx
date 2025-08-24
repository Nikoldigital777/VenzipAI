// client/src/components/tasks/TaskDetails.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  MessageSquare, 
  Paperclip,
  Edit,
  CheckCircle 
} from "lucide-react";
import { format, isAfter, differenceInDays } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  comments?: Comment[];
  attachments?: Attachment[];
}

interface Comment {
  id: string;
  comment: string;
  userId: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Attachment {
  id: string;
  document: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
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

export default function TaskDetails({ task, onClose, onEdit }: TaskDetailsProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'completed';
  const daysUntilDue = task.dueDate ? differenceInDays(new Date(task.dueDate), new Date()) : null;

  // Fetch detailed task data including comments and attachments
  const { data: detailedTask, isLoading } = useQuery({
    queryKey: ['/api/tasks', task.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${task.id}`);
      if (!response.ok) throw new Error('Failed to fetch task details');
      return response.json();
    },
    initialData: task
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment })
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', task.id] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' })
      });
      if (!response.ok) throw new Error('Failed to complete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task completed",
        description: "Task has been marked as completed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleCompleteTask = () => {
    completeTaskMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid={`task-details-${task.id}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="task-details-title">
              {detailedTask.title}
            </h2>
            {isOverdue && <AlertCircle className="h-5 w-5 text-red-500" />}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={priorityColors[detailedTask.priority]} variant="secondary">
              {detailedTask.priority}
            </Badge>
            <Badge className={statusColors[detailedTask.status]} variant="secondary">
              {detailedTask.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">
              {detailedTask.framework.displayName}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(detailedTask)} data-testid="button-edit-task">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {detailedTask.status !== 'completed' && (
            <Button 
              onClick={handleCompleteTask}
              disabled={completeTaskMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-complete-task"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {detailedTask.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700" data-testid="task-details-description">
              {detailedTask.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress and Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress */}
        {detailedTask.progressPercentage > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span data-testid="task-progress-percentage">{detailedTask.progressPercentage}%</span>
                </div>
                <Progress value={detailedTask.progressPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detailedTask.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Due: {format(new Date(detailedTask.dueDate), 'MMM dd, yyyy')}</span>
                {daysUntilDue !== null && (
                  <span className={`ml-auto ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                     daysUntilDue === 0 ? 'Due today' : 
                     `${daysUntilDue} days left`}
                  </span>
                )}
              </div>
            )}
            
            {detailedTask.assignedTo && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>Assigned to: {detailedTask.assignedTo.firstName} {detailedTask.assignedTo.lastName}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Category:</span>
              <span className="capitalize">{detailedTask.category.replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {detailedTask.tags && detailedTask.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {detailedTask.tags.map((tag, index) => (
                <Badge key={index} variant="outline" data-testid={`task-tag-${index}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({detailedTask.comments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="textarea-new-comment"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
                size="sm"
                data-testid="button-add-comment"
              >
                Add Comment
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments List */}
          {detailedTask.comments && detailedTask.comments.length > 0 ? (
            <div className="space-y-4">
              {detailedTask.comments.map((comment, index) => (
                <div key={comment.id} className="border-l-2 border-gray-200 pl-4" data-testid={`comment-${index}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to add one!</p>
          )}
        </CardContent>
      </Card>

      {/* Attachments Section */}
      {detailedTask.attachments && detailedTask.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments ({detailedTask.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {detailedTask.attachments.map((attachment, index) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 border rounded" data-testid={`attachment-${index}`}>
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{attachment.document.fileName}</span>
                    <Badge variant="outline" className="text-xs">
                      {attachment.document.fileType}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(attachment.document.fileSize / 1024)} KB
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}