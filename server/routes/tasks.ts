// server/routes/tasks.ts
import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Enhanced task filter schema
const taskFilterSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  frameworkId: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

// GET /api/tasks - Enhanced task listing with filters
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    
    const filters = taskFilterSchema.parse(req.query);
    
    // Get all user tasks
    let tasks = await storage.getTasksByUserId(userId);
    
    // Apply filters
    if (filters.status) {
      tasks = tasks.filter(task => task.status === filters.status);
    }
    
    if (filters.priority) {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }
    
    if (filters.frameworkId) {
      tasks = tasks.filter(task => task.frameworkId === filters.frameworkId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply pagination
    const total = tasks.length;
    const paginatedTasks = tasks.slice(filters.offset, filters.offset + filters.limit);
    
    res.json({
      tasks: paginatedTasks,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: total > filters.offset + filters.limit
      }
    });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// POST /api/tasks - Enhanced task creation
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    
    const taskData = insertTaskSchema.parse({
      ...req.body,
      userId,
      createdById: userId
    });
    
    const newTask = await storage.createTask(taskData);
    res.status(201).json(newTask);

  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// GET /api/tasks/:id - Get specific task with enhanced details
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    const { id } = req.params;
    
    // Get user's tasks to verify ownership
    const userTasks = await storage.getTasksByUserId(userId);
    const task = userTasks.find(t => t.id === id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Get task comments and attachments
    const [comments, attachments] = await Promise.all([
      storage.getTaskComments(id),
      storage.getTaskAttachments(id)
    ]);
    
    // Parse JSON fields
    const enhancedTask = {
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : [],
      dependencies: task.dependencies ? JSON.parse(task.dependencies) : [],
      comments,
      attachments
    };
    
    res.json(enhancedTask);

  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

// PUT /api/tasks/:id - Enhanced task update
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    const { id } = req.params;
    
    // Verify task ownership
    const userTasks = await storage.getTasksByUserId(userId);
    const existingTask = userTasks.find(t => t.id === id);
    
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Handle completion status
    const updates = { ...req.body };
    if (updates.status === 'completed' && existingTask.status !== 'completed') {
      updates.completedAt = new Date();
      updates.progressPercentage = 100;
    }
    
    const updatedTask = await storage.updateTask(id, updates);
    res.json(updatedTask);

  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// POST /api/tasks/:id/comments - Add comment to task
router.post("/:id/comments", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment?.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }
    
    // Verify task ownership
    const userTasks = await storage.getTasksByUserId(userId);
    const task = userTasks.find(t => t.id === id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const newComment = await storage.createTaskComment({
      taskId: id,
      userId,
      comment: comment.trim()
    });
    
    res.status(201).json(newComment);

  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// POST /api/tasks/:id/attachments - Attach document to task
router.post("/:id/attachments", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    const { id } = req.params;
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ message: "Document ID is required" });
    }
    
    // Verify task ownership
    const userTasks = await storage.getTasksByUserId(userId);
    const task = userTasks.find(t => t.id === id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const newAttachment = await storage.createTaskAttachment({
      taskId: id,
      documentId
    });
    
    res.status(201).json(newAttachment);

  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).json({ message: "Failed to add attachment" });
  }
});

export default router;