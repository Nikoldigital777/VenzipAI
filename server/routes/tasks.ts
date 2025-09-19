// server/routes/tasks.ts
import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertTaskSchema, insertRiskScoreHistorySchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";
import { calculateDynamicRiskScore } from "../anthropic";

const router = Router();

// Helper function to trigger automatic risk recalculation
async function triggerRiskRecalculation(userId: string, frameworkId?: string | null, triggeredBy = 'task_completion') {
  try {
    // Get current data for calculation
    const [risks, userTasks] = await Promise.all([
      storage.getRisksByUserId(userId),
      storage.getTasksByUserId(userId)
    ]);

    // Filter by framework if specified
    const filteredRisks = frameworkId 
      ? risks.filter(risk => risk.frameworkId === frameworkId)
      : risks;
    const filteredTasks = frameworkId 
      ? userTasks.filter(task => task.frameworkId === frameworkId)
      : userTasks;

    // Add overdue task detection
    const now = new Date();
    const overdueTasks = filteredTasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'completed'
    );

    // Calculate metrics with overdue weighting
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
    const highRisks = filteredRisks.filter(risk => risk.impact === 'high').length;
    const mediumRisks = filteredRisks.filter(risk => risk.impact === 'medium').length;
    const lowRisks = filteredRisks.filter(risk => risk.impact === 'low').length;
    const mitigatedRisks = filteredRisks.filter(risk => risk.status === 'mitigated').length;

    // Add overdue context for AI analysis
    const recentChanges = [];
    if (overdueTasks.length > 0) {
      recentChanges.push(`${overdueTasks.length} tasks are overdue`);
    }
    recentChanges.push(`Task completion triggered recalculation`);

    // Call AI calculation with overdue context
    const scoreData = await calculateDynamicRiskScore(userId, frameworkId || undefined, {
      totalTasks,
      completedTasks,
      highRisks,
      mediumRisks,
      lowRisks,
      mitigatedRisks,
      recentChanges
    });

    // Save to history
    const historyData = insertRiskScoreHistorySchema.parse({
      userId,
      frameworkId: frameworkId || undefined,
      overallRiskScore: scoreData.overallRiskScore.toString(),
      highRisks,
      mediumRisks,
      lowRisks,
      mitigatedRisks,
      totalTasks,
      completedTasks,
      calculationFactors: scoreData.factors,
      triggeredBy
    });

    await storage.createRiskScoreHistory(historyData);

    // Check for critical threshold alerts (80%+)
    if (scoreData.overallRiskScore >= 80) {
      const alertNotification = insertNotificationSchema.parse({
        userId,
        type: 'risk_alert',
        title: 'Critical Risk Score Alert',
        message: `Your risk score has reached ${scoreData.overallRiskScore.toFixed(1)}/100, requiring immediate attention.`,
        severity: 'critical',
        metadata: {
          riskScore: scoreData.overallRiskScore,
          frameworkId: frameworkId || undefined,
          triggeredBy
        }
      });
      
      await storage.createNotification(alertNotification);
    }

    // Generate overdue task alerts
    if (overdueTasks.length > 0) {
      const overdueHighPriority = overdueTasks.filter(task => 
        task.priority === 'high' || task.priority === 'critical'
      );
      
      if (overdueHighPriority.length > 0) {
        const overdueNotification = insertNotificationSchema.parse({
          userId,
          type: 'task_alert',
          title: 'High Priority Tasks Overdue',
          message: `${overdueHighPriority.length} high-priority compliance tasks are overdue and affecting your risk score.`,
          severity: 'high',
          metadata: {
            overdueCount: overdueHighPriority.length,
            frameworkId: frameworkId || undefined
          }
        });
        
        await storage.createNotification(overdueNotification);
      }
    }

    return scoreData;
  } catch (error) {
    console.error('Error in automatic risk recalculation:', error);
    throw error;
  }
}

// Enhanced task filter schema
const taskFilterSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  frameworkId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

// GET /api/tasks - Enhanced task listing with filters
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    
    const filters = taskFilterSchema.parse(req.query);
    
    // Get all user tasks with enhanced data
    let tasks = await storage.getTasksByUserId(userId);
    
    // Parse JSON fields and add computed fields
    tasks = tasks.map(task => ({
      ...task,
      tags: task.tags ? (typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags) : [],
      dependencies: task.dependencies ? (typeof task.dependencies === 'string' ? JSON.parse(task.dependencies) : task.dependencies) : [],
      progressPercentage: task.progressPercentage || 0,
      // Add framework info if available
      framework: {
        id: task.frameworkId || '',
        name: task.frameworkId || 'General',
        displayName: task.frameworkId || 'General Tasks'
      }
    }));
    
    // Apply filters
    if (filters.status && filters.status !== 'all') {
      tasks = tasks.filter(task => task.status === filters.status);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }
    
    if (filters.frameworkId && filters.frameworkId !== 'all') {
      tasks = tasks.filter(task => task.frameworkId === filters.frameworkId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        (task.tags && task.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'dueDate';
    const sortOrder = filters.sortOrder || 'asc';
    
    tasks.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          const statusOrder = { completed: 4, under_review: 3, in_progress: 2, not_started: 1, blocked: 0 };
          aVal = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bVal = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = 0;
          bVal = 0;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
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
    
    // Get user's company for companyId
    const company = await storage.getCompanyByUserId(userId);
    
    const taskData = insertTaskSchema.parse({
      ...req.body,
      userId,
      companyId: company?.id,
      createdById: userId,
      // Handle tags and dependencies as JSON strings
      tags: req.body.tags ? JSON.stringify(req.body.tags) : undefined,
      dependencies: req.body.dependencies ? JSON.stringify(req.body.dependencies) : undefined,
    });
    
    const newTask = await storage.createTask(taskData);
    res.status(201).json(newTask);

  } catch (error) {
    console.error("Error creating task:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
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
    
    // Auto-trigger risk recalculation if task was completed
    if (updates.status === 'completed' && existingTask.status !== 'completed') {
      try {
        await triggerRiskRecalculation(userId, existingTask.frameworkId, 'task_completion');
      } catch (error) {
        console.error('Error auto-calculating risk score:', error);
        // Don't fail the task update if risk calculation fails
      }
    }
    
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

// POST /api/tasks/ai-analysis/analyze - AI task analysis endpoint
router.post("/ai-analysis/analyze", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    
    // Get user's tasks
    const tasks = await storage.getTasksByUserId(userId);
    
    // Get company info for context
    let companyInfo = {};
    try {
      const company = await storage.getCompanyByUserId(userId);
      if (company) {
        companyInfo = {
          industry: company.industry,
          size: company.size,
          frameworks: [] // You might want to get this from frameworks_companies table
        };
      }
    } catch (error) {
      console.log("Company info not available for analysis");
    }
    
    // Import the AI analysis function
    const { analyzeTaskPriority } = require('../anthropic');
    
    // Analyze tasks with AI
    const analysis = await analyzeTaskPriority(tasks, companyInfo);
    
    // Update tasks with AI insights
    for (const analyzedTask of analysis.analyzedTasks) {
      try {
        await storage.updateTask(analyzedTask.id, {
          aiPriorityScore: analyzedTask.aiPriorityScore,
          aiReasoning: analyzedTask.aiReasoning,
          aiNextAction: analyzedTask.aiNextAction,
          aiAnalyzedAt: new Date()
        });
      } catch (updateError) {
        console.error("Error updating task with AI insights:", updateError);
      }
    }
    
    res.json({
      message: "Tasks analyzed successfully",
      analyzedCount: analysis.analyzedTasks.length,
      analysis: analysis
    });

  } catch (error) {
    console.error("Error analyzing tasks:", error);
    res.status(500).json({ message: "Failed to analyze tasks" });
  }
});

// GET /api/tasks/ai-recommendations/weekly - Weekly AI recommendations
router.get("/ai-recommendations/weekly", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    
    // Get user's incomplete tasks
    const allTasks = await storage.getTasksByUserId(userId);
    const incompleteTasks = allTasks.filter(task => task.status !== 'completed');
    
    // Sort by AI priority score if available
    const prioritizedTasks = incompleteTasks
      .filter(task => task.aiPriorityScore)
      .sort((a, b) => (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0))
      .slice(0, 5); // Top 5 recommendations
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const recommendations = prioritizedTasks.map(task => ({
      taskId: task.id,
      taskTitle: task.title,
      framework: task.frameworkId || 'General',
      priority: task.priority,
      recommendationReason: task.aiReasoning || 'High priority task requiring attention',
      urgencyScore: task.aiPriorityScore || 50,
      impactScore: task.aiPriorityScore || 50,
      estimatedHours: task.estimatedHours || 2
    }));
    
    const totalEstimatedHours = recommendations.reduce((sum, rec) => sum + rec.estimatedHours, 0);
    
    res.json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalRecommendedHours: totalEstimatedHours,
      recommendations,
      summary: `Focus on ${recommendations.length} high-priority tasks this week to maintain compliance momentum.`,
      focusAreas: [...new Set(recommendations.map(r => r.framework))]
    });

  } catch (error) {
    console.error("Error getting weekly recommendations:", error);
    res.status(500).json({ message: "Failed to get weekly recommendations" });
  }
});

// GET /api/tasks/ai-analysis/deadlines - Deadline intelligence
router.get("/ai-analysis/deadlines", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    
    const tasks = await storage.getTasksByUserId(userId);
    const now = new Date();
    
    // Overdue tasks
    const overdueTasks = tasks
      .filter(task => task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed')
      .map(task => {
        const daysOverdue = Math.ceil((now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: task.id,
          title: task.title,
          priority: task.priority,
          framework: task.frameworkId || 'General',
          dueDate: task.dueDate!,
          status: task.status,
          progressPercentage: task.progressPercentage || 0,
          daysOverdue,
          riskLevel: daysOverdue > 14 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium'
        };
      });
    
    // Upcoming deadlines (next 7 days)
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = tasks
      .filter(task => task.dueDate && new Date(task.dueDate) <= oneWeekFromNow && new Date(task.dueDate) >= now && task.status !== 'completed')
      .map(task => {
        const daysUntilDue = Math.ceil((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: task.id,
          title: task.title,
          priority: task.priority,
          framework: task.frameworkId || 'General',
          dueDate: task.dueDate!,
          status: task.status,
          progressPercentage: task.progressPercentage || 0,
          daysUntilDue,
          riskLevel: daysUntilDue <= 2 ? 'high' : daysUntilDue <= 5 ? 'medium' : 'low'
        };
      });
    
    // At risk tasks (low progress with approaching deadlines)
    const atRiskTasks = tasks
      .filter(task => task.dueDate && (task.progressPercentage || 0) < 50 && task.status !== 'completed')
      .map(task => {
        const daysUntilDue = Math.ceil((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: task.id,
          title: task.title,
          priority: task.priority,
          framework: task.frameworkId || 'General',
          dueDate: task.dueDate!,
          status: task.status,
          progressPercentage: task.progressPercentage || 0,
          daysUntilDue,
          riskLevel: (task.progressPercentage || 0) < 25 && daysUntilDue <= 7 ? 'critical' : 'medium'
        };
      })
      .filter(task => task.daysUntilDue > 0 && task.daysUntilDue <= 14);
    
    const criticalTasks = [...overdueTasks, ...upcomingDeadlines, ...atRiskTasks]
      .filter(task => task.riskLevel === 'critical').length;
    
    const avgProgressBehind = tasks
      .filter(task => task.dueDate && task.status !== 'completed')
      .reduce((sum, task, _, arr) => sum + (100 - (task.progressPercentage || 0)) / arr.length, 0);
    
    const aiRecommendations = [];
    if (overdueTasks.length > 0) {
      aiRecommendations.push(`Prioritize ${overdueTasks.length} overdue tasks immediately to avoid compliance penalties.`);
    }
    if (upcomingDeadlines.length > 0) {
      aiRecommendations.push(`Plan resources for ${upcomingDeadlines.length} tasks due this week.`);
    }
    if (atRiskTasks.length > 0) {
      aiRecommendations.push(`Monitor ${atRiskTasks.length} at-risk tasks that may miss deadlines.`);
    }
    
    res.json({
      overdueTasks,
      upcomingDeadlines,
      atRiskTasks,
      summary: {
        totalOverdue: overdueTasks.length,
        totalUpcoming: upcomingDeadlines.length,
        criticalTasks,
        averageProgressBehind: Math.round(avgProgressBehind)
      },
      aiRecommendations
    });

  } catch (error) {
    console.error("Error getting deadline intelligence:", error);
    res.status(500).json({ message: "Failed to get deadline intelligence" });
  }
});

export default router;