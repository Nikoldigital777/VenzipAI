import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCompanySchema, 
  insertTaskSchema, 
  insertDocumentSchema, 
  insertRiskSchema,
  insertRiskScoreHistorySchema,
  insertChatMessageSchema,
  insertLearningResourceSchema,
  insertLearningProgressSchema,
  complianceTasks,
  risks as risksTable,
  riskScoreHistory,
  chatMessages,
  documents as evidenceDocuments,
  tasks
} from "@shared/schema";
import {
  riskFilterSchema,
  documentFilterSchema,
  notificationFilterSchema,
  learningResourceFilterSchema,
  createPaginationResponse,
  applyPagination
} from "./pagination";
import { and, ne, inArray, desc, eq, sql } from "drizzle-orm";
import { 
  analyzeDocument, 
  chatWithClaude, 
  generateComplianceRecommendations,
  assessRisk,
  calculateDynamicRiskScore,
  prioritizeTasks,
  detectComplianceGaps,
  analyzeDocumentAdvanced,
  generateComplianceChecklist,
  analyzeTaskPriority
} from "./anthropic";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';

// Import modular route handlers
import taskRoutes from './routes/tasks';

// Import necessary schemas and functions for onboarding
import { eq } from "drizzle-orm"; // Assuming eq is used in generateFrameworkTasks
// Assuming generateId, users, companies, frameworksCompanies, tasks are available
// and imported from a shared schema or utilities file.
// For the purpose of this example, let's assume they are accessible.
// import { generateId } from "./utils"; // Placeholder for generateId
// import { users, companies, frameworksCompanies, tasks } from "../shared/schema"; // Placeholder for schema imports


// Helper function to generate initial compliance tasks
function getInitialTasksForFramework(framework: string, industry: string, size: string) {
  const baseDate = new Date();
  const addDays = (days: number) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const tasks = {
    "SOC 2": [
      {
        title: "Establish Information Security Policy",
        description: "Create and document comprehensive information security policies covering data protection, access controls, and security procedures",
        priority: "high" as const,
        dueDate: addDays(30)
      },
      {
        title: "Implement Access Control System",
        description: "Set up user access management with role-based permissions and multi-factor authentication",
        priority: "high" as const,
        dueDate: addDays(45)
      },
      {
        title: "Conduct Security Risk Assessment",
        description: "Identify and document security risks across all systems and processes",
        priority: "medium" as const,
        dueDate: addDays(60)
      },
      {
        title: "Setup System Monitoring & Logging",
        description: "Implement comprehensive logging and monitoring for all critical systems",
        priority: "medium" as const,
        dueDate: addDays(75)
      },
      {
        title: "Develop Incident Response Plan",
        description: "Create detailed procedures for handling security incidents and breaches",
        priority: "medium" as const,
        dueDate: addDays(90)
      }
    ],
    "ISO 27001": [
      {
        title: "Define Information Security Management System (ISMS)",
        description: "Establish the scope and boundaries of your ISMS according to ISO 27001 requirements",
        priority: "high" as const,
        dueDate: addDays(30)
      },
      {
        title: "Conduct Initial Risk Assessment",
        description: "Perform comprehensive risk assessment to identify information security risks",
        priority: "high" as const,
        dueDate: addDays(45)
      },
      {
        title: "Create Statement of Applicability (SoA)",
        description: "Document which ISO 27001 controls apply to your organization and implementation status",
        priority: "medium" as const,
        dueDate: addDays(60)
      },
      {
        title: "Implement Security Controls",
        description: "Begin implementation of selected controls from Annex A of ISO 27001",
        priority: "medium" as const,
        dueDate: addDays(90)
      },
      {
        title: "Establish Management Review Process",
        description: "Set up regular management review meetings for the ISMS",
        priority: "low" as const,
        dueDate: addDays(120)
      }
    ],
    "GDPR": [
      {
        title: "Data Mapping and Inventory",
        description: "Create comprehensive inventory of all personal data processing activities",
        priority: "high" as const,
        dueDate: addDays(30)
      },
      {
        title: "Update Privacy Policy",
        description: "Ensure privacy policy meets GDPR transparency requirements",
        priority: "high" as const,
        dueDate: addDays(45)
      },
      {
        title: "Implement Data Subject Rights Procedures",
        description: "Establish processes for handling data subject requests (access, deletion, portability)",
        priority: "medium" as const,
        dueDate: addDays(60)
      },
      {
        title: "Conduct Data Protection Impact Assessment (DPIA)",
        description: "Perform DPIA for high-risk data processing activities",
        priority: "medium" as const,
        dueDate: addDays(75)
      },
      {
        title: "Establish Data Breach Response Procedures",
        description: "Create procedures for detecting, reporting, and responding to data breaches within 72 hours",
        priority: "medium" as const,
        dueDate: addDays(90)
      }
    ],
    "HIPAA": [
      {
        title: "Conduct HIPAA Security Risk Assessment",
        description: "Perform comprehensive assessment of potential risks to ePHI",
        priority: "high" as const,
        dueDate: addDays(30)
      },
      {
        title: "Implement Administrative Safeguards",
        description: "Establish security officer role, workforce training, and access management procedures",
        priority: "high" as const,
        dueDate: addDays(45)
      },
      {
        title: "Deploy Physical Safeguards",
        description: "Secure facilities, workstations, and media containing ePHI",
        priority: "medium" as const,
        dueDate: addDays(60)
      },
      {
        title: "Configure Technical Safeguards",
        description: "Implement access controls, encryption, and audit controls for ePHI systems",
        priority: "medium" as const,
        dueDate: addDays(75)
      },
      {
        title: "Establish Business Associate Agreements",
        description: "Create and execute BAAs with all vendors who handle ePHI",
        priority: "medium" as const,
        dueDate: addDays(90)
      }
    ]
  };

  // Return framework-specific tasks or empty array if framework not found
  return tasks[framework as keyof typeof tasks] || [];
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|png|jpg|jpeg|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents and images are allowed'));
    }
  }
});




export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat endpoints
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit ?? "20"), 10)));
      const messages = await storage.getChatMessagesByUserId(userId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        message,
        messageType: 'user'
      });

      // Get Claude response
      const response = await chatWithClaude(message);

      // Save assistant message
      const assistantMessage = await storage.createChatMessage({
        userId,
        message: response,
        messageType: 'assistant'
      });

      res.json({
        id: assistantMessage.id,
        message: assistantMessage.message,
        messageType: assistantMessage.messageType,
        createdAt: assistantMessage.createdAt,
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Dashboard summary endpoint
  // Register enhanced task routes
  app.use('/api/tasks', taskRoutes);

  // --- Dashboard summary (data-driven gaps from tasks + risks) ---
  app.get('/api/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Get real data counts using storage layer
      const documents = await storage.getDocumentsByUserId(userId);
      const chatMessagesData = await storage.getChatMessagesByUserId(userId, 1000);
      const tasksData = await storage.getTasksByUserId(userId);
      const risksData = await storage.getRisksByUserId(userId);

      // --- gaps = open high/critical tasks + high/critical risks
      // Tasks: not completed AND priority in ('high','critical')
      const highTasks = tasksData.filter(task => 
        task.status !== 'completed' && 
        (task.priority === 'high' || task.priority === 'critical')
      ).slice(0, 10);

      // Risks: impact in ('high') - adapting since we don't have 'critical' in existing schema
      const highRisks = risksData.filter(risk => 
        risk.impact === 'high'
      ).slice(0, 10);

      // Normalize both into one "gaps" list for the UI
      const gaps = [
        ...highTasks.map((t) => ({
          id: `task-${t.id}`,
          kind: "task" as const,
          title: t.title,
          severity: t.priority === "high" ? "high" : "medium",
          meta: {
            framework: t.frameworkId,
            status: t.status,
            dueDate: t.dueDate,
          },
        })),
        ...highRisks.map((r) => ({
          id: `risk-${r.id}`,
          kind: "risk" as const,
          title: r.title,
          severity: r.impact, // 'high' | 'medium' | 'low'
          meta: {
            category: r.category,
            likelihood: r.likelihood,
          },
        })),
      ];

      // --- simple, explainable compliance score
      // Start with baseline + "activity" bonus, then subtract weighted gap penalties
      const baseline = 45;
      const bonus = Math.min(35, documents.length * 2 + Math.floor(chatMessagesData.length / 3));

      const highTaskCount = highTasks.filter((t) => t.priority === "high").length;
      const critTaskCount = 0; // No critical in existing schema
      const highRiskCount = highRisks.filter((r) => r.impact === "high").length;
      const critRiskCount = 0; // No critical in existing schema

      // Penalty calculation
      const penalty =
        highTaskCount * 2 +
        critTaskCount * 4 +
        highRiskCount * 3 +
        critRiskCount * 6;

      const compliancePercent = Math.max(0, Math.min(98, baseline + bonus - penalty));

      // Recent activity from chat and documents
      const recentActivity = [
        ...chatMessagesData.slice(0, 4).map(m => ({
          id: m.id,
          action: "chat",
          resourceType: "AI conversation",
          createdAt: m.createdAt,
        })),
        ...documents.slice(0, 4).map(d => ({
          id: d.id,
          action: "upload", 
          resourceType: d.fileName,
          createdAt: d.uploadedAt?.toISOString() || new Date().toISOString(),
        }))
      ].sort((a, b) => {
        const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : (a.createdAt || new Date());
        const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : (b.createdAt || new Date());
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 6);

      res.json({
        compliancePercent,
        gaps, // array of { id, kind: 'task'|'risk', title, severity, meta: {...} }
        stats: {
          uploads: documents.length,
          conversations: Math.floor(chatMessagesData.length / 2),
          tasksOpenHigh: highTaskCount + critTaskCount,
          risksHigh: highRiskCount + critRiskCount,
        },
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching summary:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Initialize default frameworks
  app.post('/api/initialize', isAuthenticated, async (req: any, res) => {
    try {
      // Initialize default compliance frameworks
      const defaultFrameworks = [
        {
          id: 'soc2',
          name: 'soc2',
          displayName: 'SOC 2',
          description: 'Security and availability controls for service organizations',
          complexity: 'medium',
          estimatedTimeMonths: 5,
          totalControls: 26,
          icon: 'fas fa-shield-alt',
          color: '#4ECDC4'
        },
        {
          id: 'iso27001',
          name: 'iso27001',
          displayName: 'ISO 27001',
          description: 'International standard for information security management',
          complexity: 'high',
          estimatedTimeMonths: 9,
          totalControls: 114,
          icon: 'fas fa-globe',
          color: '#52E5A3'
        },
        {
          id: 'hipaa',
          name: 'hipaa',
          displayName: 'HIPAA',
          description: 'Healthcare data protection and privacy requirements',
          complexity: 'medium',
          estimatedTimeMonths: 3,
          totalControls: 18,
          icon: 'fas fa-heartbeat',
          color: '#FF6B6B'
        },
        {
          id: 'gdpr',
          name: 'gdpr',
          displayName: 'GDPR',
          description: 'EU data protection and privacy regulation',
          complexity: 'high',
          estimatedTimeMonths: 6,
          totalControls: 30,
          icon: 'fas fa-users',
          color: '#44D9E8'
        }
      ];

      // This would typically be handled by database migrations
      // For now, we'll return the frameworks as they would be stored
      res.json({ frameworks: defaultFrameworks });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Company profile routes
  app.get('/api/company', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const company = await storage.getCompanyByUserId(userId);
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // AI Checklist Generation Route
  app.post('/api/ai/generate-checklist', isAuthenticated, async (req: any, res) => {
    try {
      const { frameworks, industry, companySize } = req.body;

      if (!frameworks || frameworks.length === 0) {
        return res.status(400).json({ message: "Frameworks are required" });
      }

      if (!industry || !companySize) {
        return res.status(400).json({ message: "Industry and company size are required" });
      }

      // Generate AI-powered compliance checklist
      const checklist = await generateComplianceChecklist(frameworks, industry, companySize);

      res.json({ checklist });
    } catch (error) {
      console.error("Error generating AI checklist:", error);
      res.status(500).json({ message: "Failed to generate compliance checklist" });
    }
  });

  // AI Task Priority Analysis Route
  app.post('/api/ai/analyze-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Get user's tasks
      const tasks = await storage.getTasksByUserId(userId);

      // Get company info for context
      let companyInfo = {};
      try {
        const company = await storage.getCompanyByUserId(userId);
        companyInfo = {
          industry: company?.industry,
          size: company?.size,
          frameworks: company?.selectedFrameworks
        };
      } catch (error) {
        console.log("Company info not available for task analysis");
      }

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

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing tasks:", error);
      res.status(500).json({ message: "Failed to analyze tasks" });
    }
  });

  // AI Weekly Recommendations Route
  app.get('/api/ai/weekly-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Get user's tasks (only incomplete ones)
      const allTasks = await storage.getTasksByUserId(userId);
      const incompleteTasks = allTasks.filter(task => task.status !== 'completed');

      // Get company info
      let companyInfo = {};
      try {
        const company = await storage.getCompanyByUserId(userId);
        companyInfo = {
          industry: company?.industry,
          size: company?.size,
          frameworks: company?.selectedFrameworks
        };
      } catch (error) {
        console.log("Company info not available");
      }

      // Get AI analysis for current week recommendations
      const analysis = await analyzeTaskPriority(incompleteTasks, companyInfo);

      res.json({
        weeklyRecommendations: analysis.weeklyRecommendations,
        nextActionSuggestions: analysis.nextActionSuggestions,
        overdueTasks: analysis.overdueTasks,
        topPriorityTasks: analysis.analyzedTasks
          .sort((a, b) => b.aiPriorityScore - a.aiPriorityScore)
          .slice(0, 5)
      });
    } catch (error) {
      console.error("Error getting weekly recommendations:", error);
      res.status(500).json({ message: "Failed to get weekly recommendations" });
    }
  });

  // Deadline Intelligence Route
  app.get('/api/ai/deadline-intelligence', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const tasks = await storage.getTasksByUserId(userId);

      const now = new Date();

      // Overdue tasks
      const overdueTasks = tasks
        .filter(task => task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed')
        .map(task => {
          const daysOverdue = Math.ceil((now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
          return {
            ...task,
            daysOverdue,
            urgencyLevel: daysOverdue > 14 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium'
          };
        })
        .sort((a, b) => b.daysOverdue - a.daysOverdue);

      // Tasks due soon (within 7 days)
      const tasksDueSoon = tasks
        .filter(task => {
          if (!task.dueDate || task.status === 'completed') return false;
          const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue >= 0 && daysUntilDue <= 7;
        })
        .map(task => {
          const daysUntilDue = Math.ceil((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            ...task,
            daysUntilDue,
            urgencyLevel: daysUntilDue <= 2 ? 'high' : 'medium'
          };
        })
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

      // High-impact tasks without deadlines
      const highImpactTasks = tasks
        .filter(task => 
          task.status !== 'completed' && 
          !task.dueDate && 
          (task.priority === 'high' || task.priority === 'critical')
        )
        .slice(0, 5);

      res.json({
        overdueTasks,
        tasksDueSoon,
        highImpactTasks,
        deadlineAlerts: [
          ...overdueTasks.map(task => ({
            type: 'overdue',
            taskId: task.id,
            title: task.title,
            message: `${task.daysOverdue} days overdue`,
            severity: task.urgencyLevel
          })),
          ...tasksDueSoon.map(task => ({
            type: 'due_soon',
            taskId: task.id,
            title: task.title,
            message: task.daysUntilDue === 0 ? 'Due today' : `Due in ${task.daysUntilDue} day${task.daysUntilDue !== 1 ? 's' : ''}`,
            severity: task.urgencyLevel
          }))
        ]
      });
    } catch (error) {
      console.error("Error getting deadline intelligence:", error);
      res.status(500).json({ message: "Failed to get deadline intelligence" });
    }
  });

  app.put('/api/company', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const companyData = insertCompanySchema.parse({ ...req.body, userId });
      const company = await storage.upsertCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.post('/api/company', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const companyData = insertCompanySchema.parse({ ...req.body, userId });
      const company = await storage.upsertCompany(companyData);

      // Store user preferences if provided
      if (req.body.preferences) {
        // Create a notification for user preferences setup
        try {
          await storage.createNotification({
            userId,
            title: "Notification Preferences Set",
            message: `Your notification preferences have been configured: ${Object.entries(req.body.preferences).filter(([key, value]) => value).map(([key]) => key).join(', ')}`,
            type: 'success',
            priority: 'low'
          });
        } catch (notifError) {
          console.log("Failed to create notification:", notifError);
          // Continue even if notification creation fails
        }
      }

      // Initialize framework progress for selected frameworks
      if (req.body.selectedFrameworks && req.body.selectedFrameworks.length > 0) {
        const frameworks = await storage.getAllFrameworks();
        const selectedFrameworks = frameworks.filter(f => 
          req.body.selectedFrameworks.includes(f.name)
        );

        for (const framework of selectedFrameworks) {
          await storage.upsertFrameworkProgress({
            userId,
            frameworkId: framework.id,
            completedControls: 0,
            totalControls: framework.totalControls,
            progressPercentage: '0.00'
          });

          // Generate initial compliance tasks for each framework
          const initialTasks = getInitialTasksForFramework(framework.name, companyData.industry, companyData.size);

          for (const taskData of initialTasks) {
            await storage.createTask({
              userId,
              frameworkId: framework.id,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              status: 'not_started',
              assignedTo: null,
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
              createdById: userId
            });
          }
        }
      }

      res.json(company);
    } catch (error) {
      console.error("Error saving company:", error);
      res.status(500).json({ message: "Failed to save company" });
    }
  });

  // Framework routes
  app.get('/api/frameworks', isAuthenticated, async (req: any, res) => {
    try {
      const frameworks = await storage.getAllFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching frameworks:", error);
      res.status(500).json({ message: "Failed to fetch frameworks" });
    }
  });

  // Framework progress route
  app.get("/api/framework-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Get user's framework progress
      const frameworkProgress = await storage.getFrameworkProgressByUserId(userId);

      // Get all frameworks for display names
      const frameworks = await storage.getAllFrameworks();

      // Combine progress data with framework details
      const progressWithDetails = frameworkProgress.map(progress => {
        const framework = frameworks.find(f => f.id === progress.frameworkId);
        return {
          frameworkId: progress.frameworkId,
          frameworkName: framework?.name || 'Unknown',
          displayName: framework?.displayName || framework?.name || 'Unknown',
          completionPercentage: progress.progressPercentage ? parseFloat(progress.progressPercentage) : 0,
          totalTasks: progress.totalTasks || 0,
          completedTasks: progress.completedTasks || 0,
          status: progress.progressPercentage && parseFloat(progress.progressPercentage) >= 80 ? 'excellent' :
                  progress.progressPercentage && parseFloat(progress.progressPercentage) >= 60 ? 'good' :
                  progress.progressPercentage && parseFloat(progress.progressPercentage) >= 40 ? 'needs_attention' : 'critical',
        };
      });

      res.json(progressWithDetails);
    } catch (error) {
      console.error("Error fetching framework progress:", error);
      res.status(500).json({ message: "Failed to fetch framework progress" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const frameworkId = req.query.framework as string;
      const tasks = await storage.getTasksByUserIdAndFramework(userId, frameworkId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(taskData);

      // Create notification for new task
      if (task.priority === 'high' || task.priority === 'critical') {
        await createNotification(userId, {
          title: 'High Priority Task Created',
          message: `New ${task.priority} priority task: ${task.title}`,
          type: 'task_created',
          priority: task.priority === 'critical' ? 'urgent' : 'high',
          actionUrl: '/tasks',
          relatedEntityType: 'task',
          relatedEntityId: task.id
        });
      }

      // Create notification for due date if within 7 days
      if (task.dueDate) {
        const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          await createNotification(userId, {
            title: 'Task Due Soon',
            message: `Task "${task.title}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
            type: 'task_due_soon',
            priority: daysUntilDue <= 2 ? 'high' : 'medium',
            actionUrl: '/tasks',
            relatedEntityType: 'task',
            relatedEntityId: task.id
          });
        }
      }

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user.sub;

      // Get the task before update to check status change
      const currentTask = await storage.getTaskById(id);

      const task = await storage.updateTask(id, updates);

      // Create notification for task completion and trigger risk recalculation
      if (updates.status === 'completed' && currentTask?.status !== 'completed') {
        await createNotification(userId, {
          title: 'Task Completed',
          message: `Congratulations! You completed: ${task.title}`,
          type: 'task_completed',
          priority: 'medium',
          actionUrl: '/tasks',
          relatedEntityType: 'task',
          relatedEntityId: task.id
        });

        // Auto-trigger risk recalculation on task completion
        try {
          const allUserTasks = await storage.getTasksByUserId(userId);
          const allUserRisks = await storage.getRisksByUserId(userId);
          const company = await storage.getCompanyByUserId(userId);

          const totalTasks = allUserTasks.length;
          const completedTasks = allUserTasks.filter(t => t.status === 'completed').length;
          const highRisks = allUserRisks.filter(r => r.impact === 'high' && r.status === 'open').length;
          const mediumRisks = allUserRisks.filter(r => r.impact === 'medium' && r.status === 'open').length;
          const lowRisks = allUserRisks.filter(r => r.impact === 'low' && r.status === 'open').length;
          const mitigatedRisks = allUserRisks.filter(r => r.status === 'mitigated').length;

          const riskContext = {
            totalTasks,
            completedTasks,
            highRisks,
            mediumRisks,
            lowRisks,
            mitigatedRisks,
            recentChanges: [`Completed task: ${task.title}`]
          };

          // Calculate new risk score
          const riskScore = await calculateDynamicRiskScore(userId, task.frameworkId || undefined, riskContext);

          // Save risk score to history
          const historyData = insertRiskScoreHistorySchema.parse({
            userId,
            frameworkId: task.frameworkId || undefined,
            overallRiskScore: riskScore.overallRiskScore.toString(),
            totalTasks,
            completedTasks,
            highRisks,
            mediumRisks,
            lowRisks,
            mitigatedRisks,
            calculationFactors: riskScore.factors,
            triggeredBy: 'task_completion'
          });
          await storage.createRiskScoreHistory(historyData);

          // Create notification if risk improvement is significant
          if (riskScore.riskTrend === 'improving') {
            await createNotification(userId, {
              title: 'Risk Profile Improved',
              message: `Task completion improved your compliance risk score to ${riskScore.overallRiskScore}`,
              type: 'risk_improved',
              priority: 'medium',
              actionUrl: '/dashboard',
              relatedEntityType: 'risk',
              relatedEntityId: undefined
            });
          }

        } catch (riskError) {
          console.error("Error recalculating risk score on task completion:", riskError);
          // Don't fail the task update if risk calculation fails
        }
      }

      // Create notification if task becomes overdue
      if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed') {
        await createNotification(userId, {
          title: 'Task Overdue',
          message: `Task "${task.title}" is now overdue`,
          type: 'task_overdue',
          priority: 'high',
          actionUrl: '/tasks',
          relatedEntityType: 'task',
          relatedEntityId: task.id
        });
      }

      // Trigger automatic risk score calculation if task was completed
      if (updates.status === 'completed' && currentTask?.status !== 'completed') {
        try {
          // Get current data for calculation
          const [risks, userTasks] = await Promise.all([
            storage.getRisksByUserId(userId),
            storage.getTasksByUserId(userId)
          ]);

          // Filter by framework if task has one
          const frameworkId = task.frameworkId;
          const filteredRisks = frameworkId 
            ? risks.filter(risk => risk.frameworkId === frameworkId)
            : risks;
          const filteredTasks = frameworkId 
            ? userTasks.filter(task => task.frameworkId === frameworkId)
            : userTasks;

          // Calculate metrics
          const totalTasks = filteredTasks.length;
          const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
          const highRisks = filteredRisks.filter(risk => risk.impact === 'high').length;
          const mediumRisks = filteredRisks.filter(risk => risk.impact === 'medium').length;
          const lowRisks = filteredRisks.filter(risk => risk.impact === 'low').length;
          const mitigatedRisks = filteredRisks.filter(risk => risk.status === 'mitigated').length;

          // Call AI calculation
          const scoreData = await calculateDynamicRiskScore(userId, frameworkId || undefined, {
            totalTasks,
            completedTasks,
            highRisks,
            mediumRisks,
            lowRisks,
            mitigatedRisks,
            recentChanges: [`Task completed: ${task.title}`]
          });

          // Save to history
          const historyData = insertRiskScoreHistorySchema.parse({
            userId,
            frameworkId,
            overallRiskScore: scoreData.overallRiskScore.toString(),
            highRisks,
            mediumRisks,
            lowRisks,
            mitigatedRisks,
            totalTasks,
            completedTasks,
            calculationFactors: scoreData.factors,
            triggeredBy: 'task_completion'
          });

          await storage.createRiskScoreHistory(historyData);

          console.log(`Auto-calculated risk score after task completion: ${scoreData.overallRiskScore}`);
        } catch (error) {
          console.error("Error auto-calculating risk score:", error);
          // Don't fail the task update if risk calculation fails
        }
      }

      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Task comment routes
  app.get('/api/tasks/:taskId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const comments = await storage.getTaskComments(taskId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching task comments:", error);
      res.status(500).json({ message: "Failed to fetch task comments" });
    }
  });

  app.post('/api/tasks/:taskId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.sub;
      const commentData = {
        taskId,
        userId,
        comment: req.body.comment
      };
      const comment = await storage.createTaskComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating task comment:", error);
      res.status(500).json({ message: "Failed to create task comment" });
    }
  });

  app.delete('/api/tasks/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTaskComment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task comment:", error);
      res.status(500).json({ message: "Failed to delete task comment" });
    }
  });

  // Task attachment routes
  app.get('/api/tasks/:taskId/attachments', isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const attachments = await storage.getTaskAttachments(taskId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching task attachments:", error);
      res.status(500).json({ message: "Failed to fetch task attachments" });
    }
  });

  app.post('/api/tasks/:taskId/attachments', isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const { documentId } = req.body;
      const attachmentData = {
        taskId,
        documentId
      };
      const attachment = await storage.createTaskAttachment(attachmentData);
      res.json(attachment);
    } catch (error) {
      console.error("Error creating task attachment:", error);
      res.status(500).json({ message: "Failed to create task attachment" });
    }
  });

  app.delete('/api/tasks/attachments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTaskAttachment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task attachment:", error);
      res.status(500).json({ message: "Failed to delete task attachment" });
    }
  });

  // Document routes with pagination
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const filters = documentFilterSchema.parse(req.query);

      // Get all user documents
      let documents = await storage.getDocumentsByUserId(userId);

      // Apply filters
      if (filters.frameworkId) {
        documents = documents.filter(doc => doc.frameworkId === filters.frameworkId);
      }

      if (filters.documentType) {
        documents = documents.filter(doc => doc.fileType === filters.documentType);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        documents = documents.filter(doc => 
          doc.fileName.toLowerCase().includes(searchLower) ||
          doc.fileType.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const { paginatedItems, total } = applyPagination(documents, filters.limit, filters.offset);
      const response = createPaginationResponse(paginatedItems, total, filters.limit, filters.offset);

      res.json(response);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.sub;
      const { frameworkId, extractedText, category, tags, description } = req.body;

      // Get document content for analysis
      let documentContent = extractedText || '';

      // If no extracted text provided, try to extract based on file type
      if (!documentContent) {
        const filePath = req.file.path;

        try {
          if (req.file.mimetype === 'application/pdf') {
            // For PDFs, we should have extracted text on the frontend
            // If not available, we could implement server-side PDF extraction here
            documentContent = `PDF file: ${req.file.originalname}`;
          } else if (req.file.mimetype.startsWith('text/') || 
                     req.file.mimetype === 'application/json' ||
                     req.file.mimetype.includes('xml')) {
            // For text-based files, read directly
            documentContent = fs.readFileSync(filePath, 'utf8');
          } else {
            // For other file types, use filename and metadata for analysis
            documentContent = `Document: ${req.file.originalname}\nType: ${req.file.mimetype}\nSize: ${req.file.size} bytes`;
            if (category) documentContent += `\nCategory: ${category}`;
            if (description) documentContent += `\nDescription: ${description}`;
            if (tags) documentContent += `\nTags: ${tags}`;
          }
        } catch (error) {
          console.error("Error reading file content:", error);
          documentContent = `Document: ${req.file.originalname} (content extraction failed)`;
        }
      }

      // Analyze document with Claude
      let analysisResult = null;
      try {
        if (documentContent.trim().length > 10) { // Only analyze if we have meaningful content
          analysisResult = await analyzeDocument(
            documentContent, 
            frameworkId, 
            req.file.originalname
          );
        }
      } catch (error) {
        console.error("Error analyzing document:", error);
        // Continue without analysis if Claude fails
      }

      const documentData = insertDocumentSchema.parse({
        userId,
        frameworkId: frameworkId || null,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
        analysisResult,
        status: analysisResult ? 'verified' : 'pending'
      });

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Compliance status check - "What's left to be compliant?"
  app.post('/api/compliance/status-check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const company = await storage.getCompanyByUserId(userId);
      const tasks = await storage.getTasksByUserId(userId);
      const risks = await storage.getRisksByUserId(userId);
      const documents = await storage.getDocumentsByUserId(userId);

      if (!company) {
        return res.status(400).json({ message: "Company profile required for compliance check" });
      }

      // Analyze current compliance state
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const openHighRisks = risks.filter(r => r.status === 'open' && r.impact === 'high').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Get comprehensive compliance analysis
      const statusAnalysis = await detectComplianceGaps({
        frameworks: company.selectedFrameworks,
        completedTasks,
        totalTasks,
        openRisks: risks.filter(r => r.status === 'open').length,
        uploadedDocuments: documents.length
      }, company.industry, company.size);

      // Generate prioritized action plan
      const actionPlan = await generateComplianceRecommendations(
        company.selectedFrameworks,
        company.size,
        company.industry,
        tasks.map(t => ({ status: t.status, priority: t.priority })),
        {
          openRisks: risks.filter(r => r.status === 'open').length,
          criticalGaps: statusAnalysis.critical_gaps.filter(g => g.severity === 'critical').length,
          documentsUploaded: documents.length
        }
      );

      res.json({
        currentStatus: {
          completionRate: Math.round(completionRate),
          complianceScore: statusAnalysis.compliance_score,
          frameworksInProgress: company.selectedFrameworks,
          tasksRemaining: totalTasks - completedTasks,
          risksToAddress: openHighRisks
        },
        gaps: statusAnalysis.critical_gaps,
        actionPlan: actionPlan,
        nextSteps: statusAnalysis.next_steps,
        estimatedTimeToCompliance: actionPlan.timeline
      });
    } catch (error) {
      console.error("Error checking compliance status:", error);
      res.status(500).json({ message: "Failed to check compliance status" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Risk routes with pagination
  app.get('/api/risks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const filters = riskFilterSchema.parse(req.query);

      // Get all user risks
      let risks = await storage.getRisksByUserId(userId);

      // Apply filters
      if (filters.category) {
        risks = risks.filter(risk => risk.category === filters.category);
      }

      if (filters.impact) {
        risks = risks.filter(risk => risk.impact === filters.impact);
      }

      if (filters.likelihood) {
        risks = risks.filter(risk => risk.likelihood === filters.likelihood);
      }

      if (filters.frameworkId) {
        risks = risks.filter(risk => risk.frameworkId === filters.frameworkId);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        risks = risks.filter(risk => 
          risk.title.toLowerCase().includes(searchLower) ||
          (risk.description && risk.description.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const { paginatedItems, total } = applyPagination(risks, filters.limit, filters.offset);
      const response = createPaginationResponse(paginatedItems, total, filters.limit, filters.offset);

      res.json(response);
    } catch (error) {
      console.error("Error fetching risks:", error);
      res.status(500).json({ message: "Failed to fetch risks" });
    }
  });

  app.post('/api/risks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Use Claude to assess the risk if description is provided
      let riskData = { ...req.body, userId };

      if (req.body.description && req.body.frameworkId) {
        try {
          const assessment = await assessRisk(
            req.body.description,
            req.body.frameworkId,
            req.body.category
          );

          riskData = {
            ...riskData,
            impact: assessment.impact,
            likelihood: assessment.likelihood,
            riskScore: assessment.score.toString(),
            mitigation: assessment.mitigation_strategies.join('; ')
          };
        } catch (error) {
          console.error("Error assessing risk with Claude:", error);
          // Continue without AI assessment
        }
      }

      const validatedData = insertRiskSchema.parse(riskData);
      const risk = await storage.createRisk(validatedData);

      // Create notification for high-impact risks
      if (risk.impact === 'high') {
        await createNotification(userId, {
          title: 'High Impact Risk Identified',
          message: `New high-impact risk detected: ${risk.title}`,
          type: 'high_risk_alert',
          priority: 'high',
          actionUrl: '/risks',
          relatedEntityType: 'risk',
          relatedEntityId: risk.id
        });
      }

      // Create notification for high risk score
      const scoreValue = parseFloat(risk.riskScore);
      if (scoreValue >= 6) {
        await createNotification(userId, {
          title: 'Critical Risk Score',
          message: `Risk "${risk.title}" has a critical score of ${risk.riskScore}`,
          type: 'critical_risk_score',
          priority: 'urgent',
          actionUrl: '/risks',
          relatedEntityType: 'risk',
          relatedEntityId: risk.id
        });
      }

      res.json(risk);
    } catch (error) {
      console.error("Error creating risk:", error);
      res.status(500).json({ message: "Failed to create risk" });
    }
  });

  app.put('/api/risks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const risk = await storage.updateRisk(id, updates);
      res.json(risk);
    } catch (error) {
      console.error("Error updating risk:", error);
      res.status(500).json({ message: "Failed to update risk" });
    }
  });

  app.delete('/api/risks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRisk(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting risk:", error);
      res.status(500).json({ message: "Failed to delete risk" });
    }
  });

  // Dynamic Risk Scoring Engine APIs
  app.post('/api/risks/calculate-score', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { frameworkId } = req.body;

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

      // Calculate metrics
      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
      const highRisks = filteredRisks.filter(risk => risk.impact === 'high').length;
      const mediumRisks = filteredRisks.filter(risk => risk.impact === 'medium').length;
      const lowRisks = filteredRisks.filter(risk => risk.impact === 'low').length;
      const mitigatedRisks = filteredRisks.filter(risk => risk.status === 'mitigated').length;

      // Call AI calculation
      const scoreData = await calculateDynamicRiskScore(userId, frameworkId, {
        totalTasks,
        completedTasks,
        highRisks,
        mediumRisks,
        lowRisks,
        mitigatedRisks,
        recentChanges: [] // Could be enhanced to track recent changes
      });

      // Save to history
      const historyData = insertRiskScoreHistorySchema.parse({
        userId,
        frameworkId,
        overallRiskScore: scoreData.overallRiskScore.toString(),
        highRisks,
        mediumRisks,
        lowRisks,
        mitigatedRisks,
        totalTasks,
        completedTasks,
        calculationFactors: scoreData.factors,
        triggeredBy: 'manual_calculation'
      });

      await storage.createRiskScoreHistory(historyData);

      res.json(scoreData);
    } catch (error) {
      console.error("Error calculating dynamic risk score:", error);
      res.status(500).json({ message: "Failed to calculate risk score" });
    }
  });

  app.get('/api/risks/score-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { frameworkId } = req.query;

      const history = await storage.getRiskScoreHistoryByUserId(userId, frameworkId as string);
      res.json(history);
    } catch (error) {
      console.error("Error fetching risk score history:", error);
      res.status(500).json({ message: "Failed to fetch risk score history" });
    }
  });

  app.get('/api/risks/latest-score', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { frameworkId } = req.query;

      const latestScore = await storage.getLatestRiskScore(userId, frameworkId as string);
      res.json(latestScore);
    } catch (error) {
      console.error("Error fetching latest risk score:", error);
      res.status(500).json({ message: "Failed to fetch latest risk score" });
    }
  });

  // Claude chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessagesByUserId(userId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { message, context } = req.body;

      // Save user message
      await storage.createChatMessage(
        insertChatMessageSchema.parse({
          userId,
          message,
          messageType: 'user'
        })
      );

      // Get user context for enhanced Claude response
      const company = await storage.getCompanyByUserId(userId);
      const tasks = await storage.getTasksByUserId(userId);
      const risks = await storage.getRisksByUserId(userId);
      const documents = await storage.getDocumentsByUserId(userId);

      // Build comprehensive context for Claude
      const userProfile = company ? {
        frameworks: company.selectedFrameworks,
        industry: company.industry,
        companySize: company.size,
        currentProgress: context?.summary?.compliancePercent || 0
      } : undefined;

      const complianceContext = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        openRisks: risks.filter(r => r.status === 'open').length,
        documentsUploaded: documents.length,
        recentGaps: context?.summary?.gaps?.slice(0, 3) || []
      };

      // Get enhanced Claude response with full context
      const response = await chatWithClaude(message, JSON.stringify(complianceContext), userProfile);

      // Save Claude response
      const responseMessage = await storage.createChatMessage(
        insertChatMessageSchema.parse({
          userId,
          message: response,
          messageType: 'assistant'
        })
      );

      res.json({ response: responseMessage });
    } catch (error) {
      console.error("Error chatting with Claude:", error);
      res.status(500).json({ message: "Failed to get response from Claude" });
    }
  });

  // Compliance recommendations
  app.post('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const company = await storage.getCompanyByUserId(userId);
      const progress = await storage.getFrameworkProgressByUserId(userId);

      if (!company) {
        return res.status(400).json({ message: "Company profile not found" });
      }

      const recommendations = await generateComplianceRecommendations(
        company.selectedFrameworks,
        company.size,
        company.industry,
        progress
      );

      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // --- TASKS CRUD & FILTERS ---
  // GET /api/tasks?framework=&status=&priority=&q=&limit=&offset=
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { framework, status, priority, q } = req.query as Record<string, string | undefined>;
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "25"), 10)));
      const offset = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10));

      let tasks = await storage.getTasksByUserId(userId);

      // Apply filters
      if (framework) {
        tasks = tasks.filter(task => task.frameworkId?.includes(framework));
      }
      if (status) {
        tasks = tasks.filter(task => task.status === status);
      }
      if (priority) {
        tasks = tasks.filter(task => task.priority === priority);
      }
      if (q && q.trim()) {
        const needle = q.toLowerCase();
        tasks = tasks.filter(task =>
          task.title.toLowerCase().includes(needle) ||
          (task.description && task.description.toLowerCase().includes(needle))
        );
      }

      // Apply pagination
      const total = tasks.length;
      const paginatedTasks = tasks.slice(offset, offset + limit);

      res.json({ items: paginatedTasks, total });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // POST /api/tasks
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const body = req.body ?? {};

      if (!body.title) {
        return res.status(400).json({ error: "title is required" });
      }

      const task = await storage.createTask({
        userId,
        frameworkId: body.frameworkId || null,
        title: String(body.title),
        description: body.description || null,
        priority: body.priority || "medium",
        status: body.status || "not_started",
        assignedTo: body.assignedTo || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        createdById: userId
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // PUT /api/tasks/:id
  app.put('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = String(req.params.id);
      const body = req.body ?? {};

      const updates: any = {};
      if (body.title !== undefined) updates.title = String(body.title);
      if (body.description !== undefined) updates.description = body.description || null;
      if (body.frameworkId !== undefined) updates.frameworkId = body.frameworkId || null;
      if (body.priority !== undefined) updates.priority = body.priority;
      if (body.status !== undefined) {
        updates.status = body.status;
        if (body.status === 'completed') {
          updates.completedAt = new Date();
        } else {
          updates.completedAt = null;
        }
      }
      if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo || null;
      if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      if (body.completedAt !== undefined) updates.completedAt = body.completedAt ? new Date(body.completedAt) : null;

      const task = await storage.updateTask(id, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // DELETE /api/tasks/:id
  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = String(req.params.id);
      await storage.deleteTask(id);
      res.json({ ok: true, id });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // --- RISKS CRUD & FILTERS ---
  // GET /api/risks?category=&impact=&likelihood=&q=&limit=&offset=
  app.get('/api/risks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { category, impact, likelihood, q } = req.query as Record<string, string | undefined>;
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "25"), 10)));
      const offset = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10));

      let risks = await storage.getRisksByUserId(userId);

      // Apply filters
      if (category) {
        risks = risks.filter(risk => risk.category === category);
      }
      if (impact) {
        risks = risks.filter(risk => risk.impact === impact);
      }
      if (likelihood) {
        risks = risks.filter(risk => risk.likelihood === likelihood);
      }
      if (q && q.trim()) {
        const needle = q.toLowerCase();
        risks = risks.filter(risk =>
          risk.title.toLowerCase().includes(needle) ||
          risk.description.toLowerCase().includes(needle)
        );
      }

      // Apply pagination
      const total = risks.length;
      const paginatedRisks = risks.slice(offset, offset + limit);

      res.json({ items: paginatedRisks, total });
    } catch (error) {
      console.error("Error fetching risks:", error);
      res.status(500).json({ error: "Failed to fetch risks" });
    }
  });

  // POST /api/risks
  app.post('/api/risks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const body = req.body ?? {};

      if (!body.title || !body.description || !body.category) {
        return res.status(400).json({ error: "title, description, and category are required" });
      }

      // Calculate risk score
      const impactScore = body.impact === 'high' ? 3 : body.impact === 'medium' ? 2 : 1;
      const likelihoodScore = body.likelihood === 'high' ? 3 : body.likelihood === 'medium' ? 2 : 1;
      const riskScore = (impactScore * likelihoodScore).toString();

      const risk = await storage.createRisk({
        userId,
        frameworkId: body.frameworkId || null,
        title: String(body.title),
        description: String(body.description),
        category: String(body.category),
        impact: body.impact || "medium",
        likelihood: body.likelihood || "medium",
        riskScore,
        mitigation: body.mitigation || null,
        owner: body.owner || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || "open",
      });

      res.json(risk);
    } catch (error) {
      console.error("Error creating risk:", error);
      res.status(500).json({ error: "Failed to create risk" });
    }
  });

  // PUT /api/risks/:id
  app.put('/api/risks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = String(req.params.id);
      const body = req.body ?? {};

      const updates: any = {};
      if (body.title !== undefined) updates.title = String(body.title);
      if (body.description !== undefined) updates.description = String(body.description);
      if (body.category !== undefined) updates.category = String(body.category);
      if (body.frameworkId !== undefined) updates.frameworkId = body.frameworkId || null;
      if (body.impact !== undefined) updates.impact = body.impact;
      if (body.likelihood !== undefined) updates.likelihood = body.likelihood;
      if (body.mitigation !== undefined) updates.mitigation = body.mitigation || null;
      if (body.owner !== undefined) updates.owner = body.owner || null;
      if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      if (body.status !== undefined) updates.status = body.status;

      // Get the current risk before update to check status changes
      const currentRisks = await storage.getRisksByUserId(req.user.claims.sub);
      const currentRisk = currentRisks.find(r => r.id === id);

      // Recalculate risk score if impact or likelihood changed
      if (body.impact !== undefined || body.likelihood !== undefined) {
        if (currentRisk) {
          const impact = body.impact || currentRisk.impact;
          const likelihood = body.likelihood || currentRisk.likelihood;
          const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
          const likelihoodScore = likelihood === 'high' ? 3 : likelihood === 'medium' ? 2 : 1;
          updates.riskScore = (impactScore * likelihoodScore).toString();
        }
      }

      const risk = await storage.updateRisk(id, updates);

      // Create notification for risk mitigation
      if (updates.status === 'mitigated' && currentRisk?.status !== 'mitigated') {
        await createNotification(req.user.claims.sub, {
          title: 'Risk Mitigated',
          message: `Risk "${risk.title}" has been successfully mitigated`,
          type: 'risk_mitigated',
          priority: 'medium',
          actionUrl: '/risks',
          relatedEntityType: 'risk',
          relatedEntityId: risk.id
        });
      }

      // Create notification for risk escalation
      if (updates.impact === 'high' && currentRisk?.impact !== 'high') {
        await createNotification(req.user.claims.sub, {
          title: 'Risk Escalated',
          message: `Risk "${risk.title}" has been escalated to high impact`,
          type: 'risk_escalated',
          priority: 'high',
          actionUrl: '/risks',
          relatedEntityType: 'risk',
          relatedEntityId: risk.id
        });
      }
      res.json(risk);
    } catch (error) {
      console.error("Error updating risk:", error);
      res.status(500).json({ error: "Failed to update risk" });
    }
  });

  // DELETE /api/risks/:id
  app.delete('/api/risks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = String(req.params.id);
      await storage.deleteRisk(id);
      res.json({ ok: true, id });
    } catch (error) {
      console.error("Error deleting risk:", error);
      res.status(500).json({ error: "Failed to delete risk" });
    }
  });

  // Enhanced AI endpoints for intelligent compliance management

  // Intelligent task prioritization endpoint
  app.post('/api/tasks/prioritize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const company = await storage.getCompanyByUserId(userId);
      const tasks = await storage.getTasksByUserId(userId);

      if (!company) {
        return res.status(400).json({ message: "Company profile not found" });
      }

      const prioritization = await prioritizeTasks(tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        framework: task.frameworkId || undefined,
        priority: task.priority as "high" | "medium" | "low",
        status: task.status === "not_started" ? "pending" : task.status as "pending" | "completed" | "in_progress",
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined
      })), {
        frameworks: company.selectedFrameworks,
        industry: company.industry,
        size: company.size
      });

      res.json(prioritization);
    } catch (error) {
      console.error("Error prioritizing tasks:", error);
      res.status(500).json({ message: "Failed to prioritize tasks" });
    }
  });

  // Compliance gap detection endpoint
  app.post('/api/compliance/gaps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const company = await storage.getCompanyByUserId(userId);
      const tasks = await storage.getTasksByUserId(userId);
      const documents = await storage.getDocumentsByUserId(userId);
      const risks = await storage.getRisksByUserId(userId);

      if (!company) {
        return res.status(400).json({ message: "Company profile not found" });
      }

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const openRisks = risks.filter(r => r.status === 'open').length;

      const gapAnalysis = await detectComplianceGaps(
        {
          frameworks: company.selectedFrameworks,
          completedTasks,
          totalTasks: tasks.length,
          openRisks,
          uploadedDocuments: documents.length
        },
        company.industry,
        company.size
      );

      res.json(gapAnalysis);
    } catch (error) {
      console.error("Error detecting compliance gaps:", error);
      res.status(500).json({ message: "Failed to detect compliance gaps" });
    }
  });

  // Advanced document analysis endpoint
  app.post('/api/documents/:id/analyze-advanced', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const documentId = req.params.id;
      const { framework } = req.body;

      // Get document details
      const documents = await storage.getDocumentsByUserId(userId);
      const document = documents.find(d => d.id === documentId);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Read file content
      const filePath = path.join('uploads', document.filePath.split('/').pop() || '');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const existingDocs = documents.map(d => d.fileName);

      const analysis = await analyzeDocumentAdvanced(
        fileContent,
        document.fileName,
        framework,
        existingDocs
      );

      res.json(analysis);
    } catch (error) {
      console.error("Error in advanced document analysis:", error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  const httpServer = createServer(app);
  // Evidence mapping routes
  app.get("/api/evidence/mappings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { framework, status } = req.query;
      const mappings = await storage.getEvidenceMappings({
        userId,
        validationStatus: status as string
      });

      res.json(mappings);
    } catch (error) {
      console.error("Error fetching evidence mappings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/evidence/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { documentId, frameworkId } = req.body;

      // Import and use evidence mapping service
      const { evidenceMappingService } = await import('./evidenceMapping');
      const mappings = await evidenceMappingService.analyzeDocumentForCompliance(
        documentId,
        userId,
        frameworkId
      );

      res.json(mappings);
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/evidence/mappings/:id/validate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { id } = req.params;
      const { status } = req.body;

      const updatedMapping = await storage.updateEvidenceMapping(id, {
        validationStatus: status,
        validatedBy: userId,
        validatedAt: new Date()
      });

      res.json(updatedMapping);
    } catch (error) {
      console.error("Error validating mapping:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/evidence/gaps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { framework, status } = req.query;
      const gaps = await storage.getEvidenceGaps({
        userId,
        status: status as string
      });

      res.json(gaps);
    } catch (error) {
      console.error("Error fetching evidence gaps:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/evidence/identify-gaps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { frameworkId } = req.body;

      // Import and use evidence mapping service
      const { evidenceMappingService } = await import('./evidenceMapping');
      const gaps = await evidenceMappingService.identifyComplianceGaps(userId, frameworkId);

      res.json(gaps);
    } catch (error) {
      console.error("Error identifying gaps:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/evidence/cross-mappings/:requirementId", isAuthenticated, async (req, res) => {
    try {
      const { requirementId } = req.params;
      const crossMappings = await storage.getCrossFrameworkMappings(requirementId);
      res.json(crossMappings);
    } catch (error) {
      console.error("Error fetching cross-framework mappings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/evidence/create-cross-mappings", isAuthenticated, async (req, res) => {
    try {
      const { primaryRequirementId } = req.body;

      // Import and use evidence mapping service
      const { evidenceMappingService } = await import('./evidenceMapping');
      await evidenceMappingService.createCrossFrameworkMappings(primaryRequirementId);

      res.json({ success: true });
    } catch (error) {
      console.error("Error creating cross-framework mappings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/compliance/requirements", isAuthenticated, async (req, res) => {
    try {
      const { framework } = req.query;
      const requirements = await storage.getComplianceRequirements(framework as string);
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching compliance requirements:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notification API routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const filters = notificationFilterSchema.parse(req.query);

      // Get all user notifications
      let notifications = await storage.getNotificationsByUserId(userId);

      // Apply filters
      if (filters.filter === 'unread') {
        notifications = notifications.filter(n => !n.isRead);
      } else if (filters.filter === 'high' || filters.filter === 'urgent') {
        notifications = notifications.filter(n => n.priority === filters.filter);
      }

      if (filters.priority) {
        notifications = notifications.filter(n => n.priority === filters.priority);
      }

      // Apply pagination
      const { paginatedItems, total } = applyPagination(notifications, filters.limit, filters.offset);
      const response = createPaginationResponse(paginatedItems, total, filters.limit, filters.offset);

      res.json(response);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.get('/api/notifications/count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const notifications = await storage.getNotificationsByUserId(userId);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      res.json({ unreadCount, total: notifications.length });
    } catch (error) {
      console.error('Error fetching notification count:', error);
      res.status(500).json({ unreadCount: 0, total: 0 });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.sub;

      // Verify notification belongs to user
      const notifications = await storage.getNotificationsByUserId(userId);
      const notification = notifications.find(n => n.id === id);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      const updatedNotification = await storage.updateNotification(id, {
        isRead: true
      });

      res.json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  app.put('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const notifications = await storage.getNotificationsByUserId(userId);
      const unreadNotifications = notifications.filter(n => !n.isRead);

      for (const notification of unreadNotifications) {
        await storage.updateNotification(notification.id, {
          isRead: true
        });
      }

      res.json({ marked: unreadNotifications.length });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.sub;

      // Verify notification belongs to user
      const notifications = await storage.getNotificationsByUserId(userId);
      const notification = notifications.find(n => n.id === id);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await storage.deleteNotification(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // Gap Analysis Route - Simple framework comparison
  app.get('/api/compliance/gap-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Get all frameworks for the user's company
      const allFrameworks = await storage.getAllFrameworks();

      // Get all tasks for the user
      const allTasks = await storage.getTasksByUserId(userId);

      const frameworkGaps = [];
      let totalTasks = 0;
      let totalCompleted = 0;
      let totalCriticalGaps = 0;

      for (const framework of allFrameworks) {
        const frameworkTasks = allTasks.filter(task => task.frameworkId === framework.id);
        const completedTasks = frameworkTasks.filter(task => task.status === 'completed');
        const incompleteTasks = frameworkTasks.filter(task => task.status !== 'completed');

        const completionPercentage = frameworkTasks.length > 0 
          ? Math.round((completedTasks.length / frameworkTasks.length) * 100) 
          : 0;

        // Generate missing requirements in plain English
        const missingRequirements = incompleteTasks.map(task => {
          const priority = task.priority === 'critical' ? '🔴 Critical: ' : 
                          task.priority === 'high' ? '🟠 High: ' : 
                          task.priority === 'medium' ? '🟡 Medium: ' : 
                          '🟢 Low: ';

          let requirement = `${priority}${task.title}`;

          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilDue < 0) {
              requirement += ` (${Math.abs(daysUntilDue)} days overdue)`;
            } else if (daysUntilDue <= 7) {
              requirement += ` (due in ${daysUntilDue} days)`;
            }
          }

          if (task.description) {
            requirement += ` - ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}`;
          }

          return requirement;
        });

        // Determine status based on completion percentage
        let status: 'excellent' | 'good' | 'needs_attention' | 'critical';
        if (completionPercentage >= 90) status = 'excellent';
        else if (completionPercentage >= 70) status = 'good';
        else if (completionPercentage >= 50) status = 'needs_attention';
        else status = 'critical';

        const criticalGaps = incompleteTasks.filter(task => task.priority === 'critical').length;

        frameworkGaps.push({
          frameworkId: framework.id,
          frameworkName: framework.name,
          displayName: framework.displayName,
          totalTasks: frameworkTasks.length,
          completedTasks: completedTasks.length,
          completionPercentage,
          missingRequirements,
          criticalGaps,
          status
        });

        totalTasks += frameworkTasks.length;
        totalCompleted += completedTasks.length;
        totalCriticalGaps += criticalGaps;
      }

      const overallCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
      const totalGaps = totalTasks - totalCompleted;

      // Generate AI summary
      let summary = '';
      if (overallCompletion >= 90) {
        summary = 'Excellent compliance posture! Most requirements are satisfied across all frameworks.';
      } else if (overallCompletion >= 70) {
        summary = 'Good progress on compliance. Focus on completing remaining requirements to strengthen your security posture.';
      } else if (overallCompletion >= 50) {
        summary = 'Moderate compliance coverage. Prioritize critical and high-priority requirements to reduce compliance gaps.';
      } else {
        summary = 'Significant compliance gaps identified. Immediate attention required for critical requirements to meet regulatory standards.';
      }

      if (totalCriticalGaps > 0) {
        summary += ` ${totalCriticalGaps} critical requirements need immediate attention.`;
      }

      res.json({
        frameworks: frameworkGaps,
        overallCompletion,
        totalGaps,
        criticalGaps: totalCriticalGaps,
        summary
      });

    } catch (error) {
      console.error("Error getting gap analysis:", error);
      res.status(500).json({ message: "Failed to get gap analysis" });
    }
  });

  // Progress Tracking with Velocity Calculation
  app.get('/api/progress/velocity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const allTasks = await storage.getTasksByUserId(userId);

      // Calculate completion velocity (tasks completed per week)
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

      const tasksCompletedThisWeek = allTasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        new Date(task.completedAt) > oneWeekAgo
      ).length;

      const tasksCompletedLastWeek = allTasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        new Date(task.completedAt) > twoWeeksAgo && 
        new Date(task.completedAt) <= oneWeekAgo
      ).length;

      const tasksCompletedLast4Weeks = allTasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        new Date(task.completedAt) > fourWeeksAgo
      ).length;

      const averageWeeklyVelocity = tasksCompletedLast4Weeks / 4;
      const remainingTasks = allTasks.filter(task => task.status !== 'completed').length;

      // Basic timeline estimate
      const weeksToCompletion = averageWeeklyVelocity > 0 ? Math.ceil(remainingTasks / averageWeeklyVelocity) : null;
      const estimatedCompletionDate = weeksToCompletion ? 
        new Date(now.getTime() + weeksToCompletion * 7 * 24 * 60 * 60 * 1000) : null;

      // Gap trend calculation
      const velocityTrend = tasksCompletedThisWeek > tasksCompletedLastWeek ? 'improving' : 
                          tasksCompletedThisWeek < tasksCompletedLastWeek ? 'declining' : 'stable';

      res.json({
        currentVelocity: tasksCompletedThisWeek,
        averageVelocity: Math.round(averageWeeklyVelocity * 10) / 10,
        velocityTrend,
        remainingTasks,
        weeksToCompletion,
        estimatedCompletionDate: estimatedCompletionDate?.toISOString(),
        weeklyProgress: {
          thisWeek: tasksCompletedThisWeek,
          lastWeek: tasksCompletedLastWeek,
          fourWeekAverage: Math.round(averageWeeklyVelocity * 10) / 10
        }
      });

    } catch (error) {
      console.error("Error calculating velocity:", error);
      res.status(500).json({ message: "Failed to calculate progress velocity" });
    }
  });

  // PDF Report Generation Routes
  app.post('/api/reports/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { reportType } = req.body;

      if (!['compliance_summary', 'task_status', 'executive_summary', 'gap_analysis'].includes(reportType)) {
        return res.status(400).json({ message: "Invalid report type" });
      }

      // Gather all data needed for report
      const company = await storage.getCompanyByUserId(userId);
      const tasks = await storage.getTasksByUserId(userId);
      const risks = await storage.getRisksByUserId(userId);
      const documents = await storage.getDocumentsByUserId(userId);
      const allFrameworks = await storage.getAllFrameworks();

      // Get gap analysis data
      const frameworkGaps = [];
      let totalTasks = 0;
      let totalCompleted = 0;
      let totalCriticalGaps = 0;

      for (const framework of allFrameworks) {
        const frameworkTasks = tasks.filter(task => task.frameworkId === framework.id);
        const completedTasks = frameworkTasks.filter(task => task.status === 'completed');
        const incompleteTasks = frameworkTasks.filter(task => task.status !== 'completed');

        const completionPercentage = frameworkTasks.length > 0 
          ? Math.round((completedTasks.length / frameworkTasks.length) * 100) 
          : 0;

        const missingRequirements = incompleteTasks.map(task => {
          const priority = task.priority === 'critical' ? '🔴 Critical: ' : 
                          task.priority === 'high' ? '🟠 High: ' : 
                          task.priority === 'medium' ? '🟡 Medium: ' : 
                          '🟢 Low: ';

          let requirement = `${priority}${task.title}`;

          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilDue < 0) {
              requirement += ` (${Math.abs(daysUntilDue)} days overdue)`;
            } else if (daysUntilDue <= 7) {
              requirement += ` (due in ${daysUntilDue} days)`;
            }
          }

          return requirement;
        });

        let status: 'excellent' | 'good' | 'needs_attention' | 'critical';
        if (completionPercentage >= 90) status = 'excellent';
        else if (completionPercentage >= 70) status = 'good';
        else if (completionPercentage >= 50) status = 'needs_attention';
        else status = 'critical';

        const criticalGaps = incompleteTasks.filter(task => task.priority === 'critical').length;

        frameworkGaps.push({
          frameworkId: framework.id,
          frameworkName: framework.name,
          displayName: framework.displayName,
          totalTasks: frameworkTasks.length,
          completedTasks: completedTasks.length,
          completionPercentage,
          missingRequirements,
          criticalGaps,
          status
        });

        totalTasks += frameworkTasks.length;
        totalCompleted += completedTasks.length;
        totalCriticalGaps += criticalGaps;
      }

      const overallCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

      // Get velocity data
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

      const tasksCompletedThisWeek = tasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        new Date(task.completedAt) > oneWeekAgo
      ).length;

      const tasksCompletedLastWeek = tasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        new Date(task.completedAt) > twoWeeksAgo && 
        new Date(task.completedAt) <= oneWeekAgo
      ).length;

      const tasksCompletedLast4Weeks = tasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        new Date(task.completedAt) > fourWeeksAgo
      ).length;

      const averageWeeklyVelocity = tasksCompletedLast4Weeks / 4;
      const remainingTasks = tasks.filter(task => task.status !== 'completed').length;
      const weeksToCompletion = averageWeeklyVelocity > 0 ? Math.ceil(remainingTasks / averageWeeklyVelocity) : null;
      const velocityTrend = tasksCompletedThisWeek > tasksCompletedLastWeek ? 'improving' : 
                          tasksCompletedThisWeek < tasksCompletedLastWeek ? 'declining' : 'stable';

      // Import and generate report
      const { ReportGenerator } = await import('./reportGenerator');
      const reportGenerator = new ReportGenerator();

      const reportData = {
        company,
        frameworks: allFrameworks,
        tasks,
        risks,
        documents,
        gapAnalysis: {
          frameworks: frameworkGaps,
          overallCompletion,
          totalGaps: totalTasks - totalCompleted,
          criticalGaps: totalCriticalGaps
        },
        velocityData: {
          currentVelocity: tasksCompletedThisWeek,
          averageVelocity: averageWeeklyVelocity,
          velocityTrend,
          remainingTasks,
          weeksToCompletion
        }
      };

      const pdfBuffer = await reportGenerator.generateReport({
        type: reportType,
        data: reportData,
        generatedBy: req.user.name || req.user.email || 'System User'
      });

      // Set headers for PDF download
      const reportTypeNames = {
        'compliance_summary': 'Compliance Summary',
        'task_status': 'Task Status Report',
        'executive_summary': 'Executive Summary',
        'gap_analysis': 'Gap Analysis Report'
      };

      const filename = `${reportTypeNames[reportType as keyof typeof reportTypeNames]}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // User preferences endpoints
  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      // In a real implementation, you'd fetch from a user_preferences table
      // For now, return default preferences
      const defaultPreferences = {
        emailNotifications: true,
        taskReminders: true,
        riskAlerts: true,
        weeklyReports: true,
        reminderFrequency: 'daily',
        dashboardView: 'overview',
        autoSave: true,
        darkMode: false
      };
      res.json(defaultPreferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const preferences = req.body;

      // In a real implementation, you'd save to a user_preferences table
      // For now, just acknowledge the update
      console.log(`Updated preferences for user ${userId}:`, preferences);

      // Create notification for preferences update
      await createNotification(userId, {
        title: "Preferences Updated",
        message: "Your notification preferences have been successfully updated",
        type: 'preferences_updated',
        priority: 'low'
      });

      res.json({ success: true, preferences });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Learning Hub API Routes with pagination
  app.get('/api/learning-resources', async (req, res) => {
    try {
      const filters = learningResourceFilterSchema.parse(req.query);

      // Get learning resources with filters applied
      let resources = await storage.getLearningResources({
        frameworkId: filters.frameworkId,
        resourceType: filters.resourceType,
        category: filters.category,
        search: filters.search,
      });

      // Apply additional filters
      if (filters.difficulty) {
        resources = resources.filter(resource => resource.difficulty === filters.difficulty);
      }

      // Apply pagination
      const { paginatedItems, total } = applyPagination(resources, filters.limit, filters.offset);
      const response = createPaginationResponse(paginatedItems, total, filters.limit, filters.offset);

      res.json(response);
    } catch (error) {
      console.error("Error fetching learning resources:", error);
      res.status(500).json({ message: "Failed to fetch learning resources" });
    }
  });

  app.get('/api/learning-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { resourceId } = req.query;

      const progress = await storage.getLearningProgress(userId, resourceId as string);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      res.status(500).json({ message: "Failed to fetch learning progress" });
    }
  });

  app.post('/api/learning-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const progressData = insertLearningProgressSchema.parse({
        ...req.body,
        userId
      });

      const progress = await storage.upsertLearningProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating learning progress:", error);
      res.status(500).json({ message: "Failed to update learning progress" });
    }
  });

  app.get('/api/learning-completed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const completedResources = await storage.getUserCompletedResources(userId);
      res.json(completedResources);
    } catch (error) {
      console.error("Error fetching completed resources:", error);
      res.status(500).json({ message: "Failed to fetch completed resources" });
    }
  });

  // Helper function to create notifications
  async function createNotification(userId: string, notification: {
    title: string;
    message: string;
    type: string;
    priority?: string;
    actionUrl?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    expiresAt?: Date;
  }) {
    try {
      await storage.createNotification({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || 'medium',
        isRead: false,
        actionUrl: notification.actionUrl,
        relatedEntityType: notification.relatedEntityType,
        relatedEntityId: notification.relatedEntityId,
        expiresAt: notification.expiresAt
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Onboarding completion endpoint
  app.post("/api/onboarding/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { company, frameworks, aiEnabled } = req.body;
      const userId = req.user.sub;

      // Insert company data
      const companyData = insertCompanySchema.parse({ ...company, userId });
      const companyRecord = await storage.upsertCompany(companyData);

      const selectedFrameworksData = [];
      let totalTasks = 0;

      // Insert selected frameworks and generate initial tasks
      for (const frameworkId of frameworks) {
        // Find the framework
        const allFrameworks = await storage.getAllFrameworks();
        const framework = allFrameworks.find(f => f.id === frameworkId || f.name === frameworkId);

        if (framework) {
          selectedFrameworksData.push({
            id: framework.id,
            name: framework.name,
            displayName: framework.displayName
          });

          // Initialize framework progress
          await storage.upsertFrameworkProgress({
            userId,
            frameworkId: framework.id,
            completedControls: 0,
            totalControls: framework.totalControls,
            progressPercentage: '0.00'
          });

          // Generate initial compliance tasks for each framework
          const initialTasks = getInitialTasksForFramework(framework.name, companyData.industry, companyData.size);
          totalTasks += initialTasks.length;

          for (const taskData of initialTasks) {
            await storage.createTask({
              userId,
              companyId: companyRecord.id,
              frameworkId: framework.id,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              status: 'not_started',
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            });
          }
        }
      }

      // Update user preferences
      await storage.updateUser(userId, {
        aiEnabled,
        onboardingCompleted: true,
      });

      res.json({ 
        success: true, 
        company: {
          id: companyRecord.id,
          name: companyRecord.name,
          industry: companyRecord.industry,
          size: companyRecord.size
        },
        frameworks: selectedFrameworksData,
        totalTasks,
        aiEnabled,
        message: "Onboarding completed successfully" 
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  // Preview tasks for onboarding
  app.post('/api/onboarding/preview-tasks', async (req, res) => {
    try {
      const { frameworks } = req.body;

      if (!frameworks || !Array.isArray(frameworks)) {
        return res.status(400).json({ error: 'frameworks array is required' });
      }

      const tasks: any[] = [];

      for (const fwId of frameworks) {
        // Get controls for this framework
        const fwControls = await storage.getComplianceRequirements(fwId);

        // Shuffle and take 5 random samples
        const shuffled = fwControls.sort(() => 0.5 - Math.random());
        const sample = shuffled.slice(0, 5);
        tasks.push(...sample);
      }

      res.json({ tasks });
    } catch (error) {
      console.error('Error fetching preview tasks:', error);
      res.status(500).json({ error: 'Failed to fetch preview tasks' });
    }
  });

  // Chat with AI assistant
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { message, context } = req.body;

      // Save user message
      await storage.createChatMessage(
        insertChatMessageSchema.parse({
          userId,
          message,
          messageType: 'user'
        })
      );

      // Get user context for enhanced Claude response
      const company = await storage.getCompanyByUserId(userId);
      const tasks = await storage.getTasksByUserId(userId);
      const risks = await storage.getRisksByUserId(userId);
      const documents = await storage.getDocumentsByUserId(userId);

      // Build comprehensive context for Claude
      const userProfile = company ? {
        frameworks: company.selectedFrameworks,
        industry: company.industry,
        companySize: company.size,
        currentProgress: context?.summary?.compliancePercent || 0
      } : undefined;

      const complianceContext = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        openRisks: risks.filter(r => r.status === 'open').length,
        documentsUploaded: documents.length,
        recentGaps: context?.summary?.gaps?.slice(0, 3) || []
      };

      // Get enhanced Claude response with full context
      const response = await chatWithClaude(message, JSON.stringify(complianceContext), userProfile);

      // Save Claude response
      const responseMessage = await storage.createChatMessage(
        insertChatMessageSchema.parse({
          userId,
          message: response,
          messageType: 'assistant'
        })
      );

      res.json({ response: responseMessage });
    } catch (error) {
      console.error("Error chatting with Claude:", error);
      res.status(500).json({ message: "Failed to get response from Claude" });
    }
  });

  return httpServer;
}