// client/src/pages/tasks.tsx
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// import Navigation from "@/components/navigation"; // Removed import
import AIChat from "@/components/ai-chat";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import TaskDetails from "@/components/tasks/TaskDetails";

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

export default function TasksPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateTask = () => {
    setShowCreateForm(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditForm(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedTask(null);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedTask(null);
  };

  const handleDetailsClose = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  return (
    <>
      {/* <Navigation /> */} {/* Removed Navigation component */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="container mx-auto">
          <TaskList
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onViewTask={handleViewTask}
          />

          {/* Create Task Dialog */}
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <TaskForm
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedTask && (
                <TaskForm
                  task={{
                    ...selectedTask,
                    frameworkId: selectedTask.framework.id,
                    assignedTo: selectedTask.assignedTo?.email || undefined
                  }}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Task Details Dialog */}
          <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedTask && (
                <TaskDetails
                  task={selectedTask}
                  onClose={handleDetailsClose}
                  onEdit={handleEditTask}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <AIChat />
    </>
  );
}