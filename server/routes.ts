import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
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
import crypto from 'crypto';
import { format } from 'date-fns';

// Import modular route handlers
import taskRoutes from './routes/tasks';
import policyRoutes from './routes/policies'; // Corrected import based on usage
import onboardingRoutes from "./routes/onboarding"; // Added onboarding routes import
import auditPackageRoutes from "./routes/auditPackages"; // Added audit package routes import


// Helper function to generate initial compliance tasks
function getInitialTasksForFramework(framework: string, industry: string, size: string) {
  const baseDate = new Date();
  const addDays = (days: number) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  // Adjust timeline based on company size
  const sizeMultiplier = size?.includes('1-10') ? 0.8 : 
                       size?.includes('11-50') ? 1.0 : 
                       size?.includes('51-200') ? 1.2 : 1.5;

  const adjustedDays = (days: number) => Math.round(days * sizeMultiplier);

  const tasks = {
    "soc2": [
      {
        title: "Establish Information Security Policy",
        description: "Create and document comprehensive information security policies covering data protection, access controls, and security procedures",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(30))
      },
      {
        title: "Implement Access Control System",
        description: "Set up user access management with role-based permissions and multi-factor authentication",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(45))
      },
      {
        title: "Conduct Security Risk Assessment",
        description: "Identify and document security risks across all systems and processes",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(60))
      },
      {
        title: "Setup System Monitoring & Logging",
        description: "Implement comprehensive logging and monitoring for all critical systems",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(75))
      },
      {
        title: "Develop Incident Response Plan",
        description: "Create detailed procedures for handling security incidents and breaches",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(90))
      }
    ],
    "SOC 2": [
      {
        title: "Establish Information Security Policy",
        description: "Create and document comprehensive information security policies covering data protection, access controls, and security procedures",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(30))
      },
      {
        title: "Implement Access Control System",
        description: "Set up user access management with role-based permissions and multi-factor authentication",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(45))
      },
      {
        title: "Conduct Security Risk Assessment",
        description: "Identify and document security risks across all systems and processes",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(60))
      },
      {
        title: "Setup System Monitoring & Logging",
        description: "Implement comprehensive logging and monitoring for all critical systems",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(75))
      },
      {
        title: "Develop Incident Response Plan",
        description: "Create detailed procedures for handling security incidents and breaches",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(90))
      }
    ],
    "iso27001": [
      {
        title: "Define Information Security Management System (ISMS)",
        description: "Establish the scope and boundaries of your ISMS according to ISO 27001 requirements",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(30))
      },
      {
        title: "Conduct Initial Risk Assessment",
        description: "Perform comprehensive risk assessment to identify information security risks",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(45))
      },
      {
        title: "Create Statement of Applicability (SoA)",
        description: "Document which ISO 27001 controls apply to your organization and implementation status",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(60))
      },
      {
        title: "Implement Security Controls",
        description: "Begin implementation of selected controls from Annex A of ISO 27001",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(90))
      },
      {
        title: "Establish Management Review Process",
        description: "Set up regular management review meetings for the ISMS",
        priority: "low" as const,
        dueDate: addDays(adjustedDays(120))
      }
    ],
    "ISO 27001": [
      {
        title: "Define Information Security Management System (ISMS)",
        description: "Establish the scope and boundaries of your ISMS according to ISO 27001 requirements",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(30))
      },
      {
        title: "Conduct Initial Risk Assessment",
        description: "Perform comprehensive risk assessment to identify information security risks",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(45))
      },
      {
        title: "Create Statement of Applicability (SoA)",
        description: "Document which ISO 27001 controls apply to your organization and implementation status",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(60))
      },
      {
        title: "Implement Security Controls",
        description: "Begin implementation of selected controls from Annex A of ISO 27001",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(90))
      },
      {
        title: "Establish Management Review Process",
        description: "Set up regular management review meetings for the ISMS",
        priority: "low" as const,
        dueDate: addDays(adjustedDays(120))
      }
    ],
    "hipaa": [
      {
        title: "Conduct HIPAA Security Risk Assessment",
        description: "Perform comprehensive assessment of potential risks to ePHI",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(30))
      },
      {
        title: "Implement Administrative Safeguards",
        description: "Establish security officer role, workforce training, and access management procedures",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(45))
      },
      {
        title: "Deploy Physical Safeguards",
        description: "Secure facilities, workstations, and media containing ePHI",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(60))
      },
      {
        title: "Configure Technical Safeguards",
        description: "Implement access controls, encryption, and audit controls for ePHI systems",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(75))
      },
      {
        title: "Establish Business Associate Agreements",
        description: "Create and execute BAAs with all vendors who handle ePHI",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(90))
      }
    ],
    "HIPAA": [
      {
        title: "Conduct HIPAA Security Risk Assessment",
        description: "Perform comprehensive assessment of potential risks to ePHI",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(30))
      },
      {
        title: "Implement Administrative Safeguards",
        description: "Establish security officer role, workforce training, and access management procedures",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(45))
      },
      {
        title: "Deploy Physical Safeguards",
        description: "Secure facilities, workstations, and media containing ePHI",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(60))
      },
      {
        title: "Configure Technical Safeguards",
        description: "Implement access controls, encryption, and audit controls for ePHI systems",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(75))
      },
      {
        title: "Establish Business Associate Agreements",
        description: "Create and execute BAAs with all vendors who handle ePHI",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(90))
      }
    ],
    "scf": [
      {
        title: "Establish SCF Governance Framework",
        description: "Set up governance structure for SCF implementation and oversight",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(30))
      },
      {
        title: "Conduct SCF Control Assessment",
        description: "Assess current state against SCF controls and identify gaps",
        priority: "high" as const,
        dueDate: addDays(adjustedDays(45))
      },
      {
        title: "Implement Priority SCF Controls",
        description: "Begin implementation of highest priority SCF security controls",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(75))
      },
      {
        title: "Establish SCF Monitoring Program",
        description: "Set up continuous monitoring for SCF control effectiveness",
        priority: "medium" as const,
        dueDate: addDays(adjustedDays(90))
      }
    ]
  };

  // Return framework-specific tasks or empty array if framework not found
  const frameworkTasks = tasks[framework as keyof typeof tasks] || 
                        tasks[framework.toLowerCase() as keyof typeof tasks] || 
                        [];

  console.log(`Generated ${frameworkTasks.length} tasks for framework: ${framework}`);
  return frameworkTasks;
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




export async function registerRoutes(app: Express) {
  // Health check endpoint for deployment monitoring
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      console.log(`Fetching user data for: ${userId}`);

      let user = await storage.getUser(userId);

      // If user doesn't exist in database, create them
      if (!user) {
        console.log(`User ${userId} not found in database, creating...`);
        const userData = {
          id: userId,
          email: req.user.email || `${userId}@example.com`,
          fullName: req.user.name || req.user.fullName || 'Unknown User',
          profilePicture: req.user.profilePicture || null,
          onboardingCompleted: false,
          aiEnabled: true,
        };
        user = await storage.upsertUser(userData);
        console.log(`Created user: ${user.id}`);
      }

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

  // Register enhanced task routes
  app.use('/api/tasks', taskRoutes);
  app.use('/api/policies', policyRoutes);
  app.use("/api/onboarding", onboardingRoutes); // Register onboarding routes
  app.use("/api/audit-packages", auditPackageRoutes); // Register audit package routes

  // Enhanced Dashboard progress endpoint with validation
  app.get('/api/dashboard/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      console.log(`Fetching dashboard progress for user: ${userId}`);

      // Validate user ID
      if (!userId) {
        console.warn('No user ID provided for progress calculation');
        return res.status(200).json({ 
          percentComplete: 0, 
          totalTasks: 0, 
          completedTasks: 0, 
          hasData: false,
          error: 'User not authenticated',
          message: 'Please sign in to view progress'
        });
      }

      // Get all user tasks with timeout protection
      let tasks;
      try {
        tasks = await Promise.race([
          storage.getTasksByUserId(userId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 8000))
        ]) as any[];
      } catch (dbError) {
        console.error('Database error fetching tasks:', dbError);
        return res.status(200).json({ 
          percentComplete: 0, 
          totalTasks: 0, 
          completedTasks: 0,
          hasData: false,
          error: 'Database error',
          message: 'Unable to fetch task data'
        });
      }

      console.log(`Found ${tasks?.length || 0} tasks for progress calculation`);

      // Ensure tasks is an array
      if (!Array.isArray(tasks)) {
        console.warn('Tasks data is not an array:', typeof tasks);
        tasks = [];
      }

      if (tasks.length === 0) {
        console.log('No tasks found, returning zero progress');
        return res.status(200).json({ 
          percentComplete: 0, 
          totalTasks: 0, 
          completedTasks: 0,
          hasData: false,
          message: 'No tasks created yet. Complete onboarding to generate tasks.'
        });
      }

      // Calculate completion percentage with validation
      const validTasks = tasks.filter(task => task && typeof task === 'object');
      const completedTasks = validTasks.filter(task => 
        task.status === 'completed'
      ).length;
      const totalTasks = validTasks.length;
      const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const progressData = {
        percentComplete: Math.max(0, Math.min(100, percentComplete)),
        totalTasks,
        completedTasks,
        hasData: true,
        lastUpdated: new Date().toISOString()
      };

      console.log('Progress data:', progressData);
      res.status(200).json(progressData);
    } catch (error) {
      console.error("Error fetching dashboard progress:", error);
      // Return comprehensive fallback data with proper status
      res.status(200).json({ 
        percentComplete: 0, 
        totalTasks: 0, 
        completedTasks: 0,
        hasData: false,
        error: 'Failed to load progress data',
        message: 'Please try refreshing the page'
      });
    }
  });

  // Enhanced Dashboard recent tasks endpoint
  app.get('/api/dashboard/recent-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      console.log(`Fetching recent tasks for user: ${userId}`);

      // Validate user ID
      if (!userId) {
        console.warn('No user ID provided for recent tasks');
        return res.status(200).json({ 
          tasks: [], 
          hasData: false, 
          error: 'User not authenticated',
          message: 'Please sign in to view tasks',
          totalTasks: 0
        });
      }

      // Get all user tasks with timeout protection
      let allTasks;
      try {
        allTasks = await Promise.race([
          storage.getTasksByUserId(userId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 8000))
        ]) as any[];
      } catch (dbError) {
        console.error('Database error fetching tasks:', dbError);
        return res.status(200).json({ 
          tasks: [], 
          hasData: false, 
          error: 'Database error',
          message: 'Unable to fetch task data',
          totalTasks: 0
        });
      }

      console.log(`Found ${allTasks?.length || 0} total tasks`);

      // Ensure allTasks is an array
      if (!Array.isArray(allTasks)) {
        console.warn('Tasks data is not an array:', typeof allTasks);
        allTasks = [];
      }

      if (allTasks.length === 0) {
        console.log('No tasks found, returning empty state');
        return res.status(200).json({ 
          tasks: [], 
          hasData: false, 
          message: 'No tasks created yet. Complete onboarding to generate tasks.',
          totalTasks: 0
        });
      }

      // Sort by creation date and take the 5 most recent with validation
      const validTasks = allTasks.filter(task => 
        task && 
        typeof task === 'object' && 
        task.id && 
        task.title
      );

      const recentTasks = validTasks
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || new Date()).getTime();
          const dateB = new Date(b.createdAt || b.updatedAt || new Date()).getTime();
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(task => {
          const now = new Date();
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          const isOverdue = dueDate && dueDate < now && task.status !== 'completed';
          
          return {
            id: task.id,
            title: task.title || 'Untitled Task',
            status: task.status || 'not_started',
            priority: task.priority || 'medium',
            frameworkId: task.frameworkId || null,
            dueDate: task.dueDate || null,
            createdAt: task.createdAt || task.updatedAt || new Date().toISOString(),
            progressPercentage: task.status === 'completed' ? 100 : 
                                task.status === 'in_progress' ? 50 :
                                task.status === 'under_review' ? 75 : 0,
            isOverdue: isOverdue || false
          };
        });

      console.log(`Returning ${recentTasks.length} recent tasks`);
      res.status(200).json({ 
        tasks: recentTasks, 
        hasData: true, 
        totalTasks: allTasks.length,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
      // Return structured error response
      res.status(200).json({ 
        tasks: [], 
        hasData: false, 
        error: 'Failed to load recent tasks',
        message: 'Please try refreshing the page',
        totalTasks: 0
      });
    }
  });

  // --- Enhanced Dashboard summary with robust error handling ---
  app.get('/api/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      console.log(`Fetching summary for user: ${userId}`);

      // Validate user ID
      if (!userId) {
        console.error('No user ID provided for summary');
        return res.status(401).json({
          compliancePercent: 0,
          gaps: [],
          stats: { uploads: 0, conversations: 0, tasksOpenHigh: 0, risksHigh: 0 },
          recentActivity: [],
          error: 'User not authenticated'
        });
      }

      // Get real data counts using storage layer with comprehensive error handling and timeouts
      let documents = [];
      let chatMessagesData = [];
      let tasksData = [];
      let risksData = [];
      let company = null;
      let generatedPolicies = [];

      // Fetch data with timeout protection
      const fetchWithTimeout = async (fetchFn: Function, name: string, timeout = 8000) => {
        try {
          return await Promise.race([
            fetchFn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} timeout`)), timeout))
          ]);
        } catch (error) {
          console.error(`Error fetching ${name}:`, error);
          return [];
        }
      };

      // Parallel data fetching with error isolation
      const [documentsResult, chatResult, tasksResult, risksResult, companyResult] = await Promise.allSettled([
        fetchWithTimeout(() => storage.getDocumentsByUserId(userId), 'documents'),
        fetchWithTimeout(() => storage.getChatMessagesByUserId(userId, 1000), 'chat messages'),
        fetchWithTimeout(() => storage.getTasksByUserId(userId), 'tasks'),
        fetchWithTimeout(() => storage.getRisksByUserId(userId), 'risks'),
        fetchWithTimeout(() => storage.getCompanyByUserId(userId), 'company')
      ]);

      // Extract results safely
      documents = documentsResult.status === 'fulfilled' ? documentsResult.value || [] : [];
      chatMessagesData = chatResult.status === 'fulfilled' ? chatResult.value || [] : [];
      tasksData = tasksResult.status === 'fulfilled' ? tasksResult.value || [] : [];
      risksData = risksResult.status === 'fulfilled' ? risksResult.value || [] : [];
      company = companyResult.status === 'fulfilled' ? companyResult.value : null;

      if (company) {
        generatedPolicies = await fetchWithTimeout(() => storage.getGeneratedPolicies(company.id), 'generated policies');
      }

      console.log(`Data fetched - Documents: ${documents.length}, Chat: ${chatMessagesData.length}, Tasks: ${tasksData.length}, Risks: ${risksData.length}, Policies: ${generatedPolicies.length}, Company: ${company ? 'found' : 'not found'}`);

      // Validate data arrays
      documents = Array.isArray(documents) ? documents : [];
      chatMessagesData = Array.isArray(chatMessagesData) ? chatMessagesData : [];
      tasksData = Array.isArray(tasksData) ? tasksData : [];
      risksData = Array.isArray(risksData) ? risksData : [];
      generatedPolicies = Array.isArray(generatedPolicies) ? generatedPolicies : [];

      // --- gaps = open high/critical tasks + high/critical risks
      // Tasks: not completed AND priority in ('high','critical')
      const highPriorityTasks = tasksData.filter(task => 
        task.status !== 'completed' && 
        (task.priority === 'high' || task.priority === 'critical')
      ).slice(0, 10);

      // Risks: impact in ('high') - adapting since we don't have 'critical' in existing schema
      const highRisks = risksData.filter(risk => 
        risk.impact === 'high'
      ).slice(0, 10);

      // Normalize both into one "gaps" list for the UI
      const gaps = [
        ...highPriorityTasks.map((t) => ({
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
      const totalEvidence = documents.length + generatedPolicies.length;
      const bonus = Math.min(35, totalEvidence * 2 + Math.floor(chatMessagesData.length / 3));

      const highTaskCount = highPriorityTasks.filter((t) => t.priority === "high").length;
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
          resourceType: "Document",
          fileName: d.fileName,
          createdAt: d.uploadedAt?.toISOString() || new Date().toISOString(),
        })),
        ...generatedPolicies.slice(0, 4).map(p => ({
          id: p.id,
          action: "generate",
          resourceType: "Policy Document",
          fileName: p.title,
          createdAt: p.createdAt || new Date().toISOString(),
        }))
      ].sort((a, b) => {
        const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : (a.createdAt || new Date());
        const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : (b.createdAt || new Date());
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 6);

      const summaryResponse = {
        compliancePercent: Math.max(0, Math.min(100, compliancePercent)),
        gaps: gaps || [], // array of { id, kind: 'task'|'risk', title, severity, meta: {...} }
        stats: {
          uploads: documents.length,
          policies: generatedPolicies.length,
          totalEvidence: documents.length + generatedPolicies.length,
          conversations: Math.floor((chatMessagesData.length || 0) / 2),
          tasksOpenHigh: (highTaskCount || 0) + (critTaskCount || 0),
          risksHigh: (highRiskCount || 0) + (critRiskCount || 0),
        },
        recentActivity: recentActivity || [],
      };

      console.log(`Summary response for user ${userId}:`, JSON.stringify(summaryResponse, null, 2));
      res.json(summaryResponse);
    } catch (error) {
      console.error("Error fetching summary:", error);
      // Return safe fallback instead of error
      res.json({
        compliancePercent: 0,
        gaps: [],
        stats: {
          uploads: 0,
          conversations: 0,
          tasksOpenHigh: 0,
          risksHigh: 0,
        },
        recentActivity: [],
      });
    }
  });

  // Database schema fix endpoint
  app.post('/api/fix-schema', isAuthenticated, async (req: any, res) => {
    try {
      // Fix tasks table column name
      await db.execute(sql`
        ALTER TABLE tasks 
        ADD COLUMN IF NOT EXISTS framework_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255),
        ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES users(id)
      `);

      // Migrate data from framework to framework_id if framework column exists
      try {
        await db.execute(sql`
          UPDATE tasks SET framework_id = framework WHERE framework IS NOT NULL AND framework_id IS NULL
        `);
      } catch (e) {
        // Framework column might not exist, that's okay
      }

      // Fix companies table
      await db.execute(sql`
        ALTER TABLE companies 
        ADD COLUMN IF NOT EXISTS legal_entity VARCHAR(255),
        ADD COLUMN IF NOT EXISTS selected_frameworks TEXT[]
      `);

      res.json({ message: "Schema fixed successfully" });
    } catch (error) {
      console.error("Error fixing schema:", error);
      res.status(500).json({ message: "Failed to fix schema" });
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
          industry: company?.industry || undefined,
          size: company?.size || undefined,
          frameworks: [] // Will be populated from frameworksCompanies table
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
          industry: company?.industry || undefined,
          size: company?.size || undefined,
          frameworks: [] // Will be populated from frameworksCompanies table
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
          const initialTasks = getInitialTasksForFramework(framework.name, companyData.industry || '', companyData.size || '');

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
      console.log(`📊 Returning ${frameworks.length} frameworks to client`);

      // Ensure we have frameworks, if not seed them
      if (frameworks.length === 0) {
        console.log('⚠️ No frameworks found, attempting to seed...');
        const { seedFrameworks } = await import('./seedData');
        await seedFrameworks();
        const newFrameworks = await storage.getAllFrameworks();
        res.json(newFrameworks);
      } else {
        res.json(frameworks);
      }
    } catch (error) {
      console.error("Error fetching frameworks:", error);
      res.status(500).json({ message: "Failed to fetch frameworks" });
    }
  });

  // Framework progress route
  app.get("/api/framework-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Get user's company to know selected frameworks
      const company = await storage.getCompanyByUserId(userId);
      // TODO: Get frameworks from frameworksCompanies table
      const selectedFrameworks: string[] = company?.selectedFrameworks || [];

      // Get all frameworks
      const allFrameworks = await storage.getAllFrameworks();

      // Get all user tasks
      const allTasks = await storage.getTasksByUserId(userId);

      // Calculate progress for each selected framework
      const progressWithDetails = [];

      for (const frameworkName of selectedFrameworks) {
        const framework = allFrameworks.find(f => f.name === frameworkName || f.id === frameworkName);

        if (framework) {
          // Get tasks for this framework
          const frameworkTasks = allTasks.filter(task => task.frameworkId === framework.id);
          const completedTasks = frameworkTasks.filter(task => task.status === 'completed');

          const totalTasks = frameworkTasks.length;
          const completedTasksCount = completedTasks.length;
          const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

          // Determine status based on completion
          let status: 'excellent' | 'good' | 'needs_attention' | 'critical';
          if (completionPercentage >= 90) status = 'excellent';
          else if (completionPercentage >= 70) status = 'good';
          else if (completionPercentage >= 50) status = 'needs_attention';
          else status = 'critical';

          progressWithDetails.push({
            frameworkId: framework.id,
            frameworkName: framework.name,
            displayName: framework.displayName,
            completionPercentage,
            totalTasks,
            completedTasks: completedTasksCount,
            status,
            color: framework.color || '#4ECDC4',
            icon: framework.icon || '📋'
          });

          // Update framework progress in database
          try {
            await storage.upsertFrameworkProgress({
              userId,
              frameworkId: framework.id,
              completedControls: completedTasksCount,
              totalControls: totalTasks,
              progressPercentage: completionPercentage.toString()
            });
          } catch (progressError) {
            console.error("Error updating framework progress:", progressError);
          }
        }
      }

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

      // Get all user documents with their control mappings
      let documents = await storage.getDocumentsWithMappingsByUserId(userId);

      // Apply filters
      if (filters.frameworkId) {
        documents = documents.filter(doc => doc.frameworkId === filters.frameworkId);
      }

      if (filters.status) {
        documents = documents.filter(doc => doc.status === filters.status);
      }

      if (filters.documentType) {
        documents = documents.filter(doc => doc.fileType === filters.documentType);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        documents = documents.filter(doc => 
          doc.fileName.toLowerCase().includes(searchLower) ||
          doc.fileType.toLowerCase().includes(searchLower) ||
          (doc.mapping?.control?.title && doc.mapping.control.title.toLowerCase().includes(searchLower)) ||
          (doc.mapping?.control?.category && doc.mapping.control.category.toLowerCase().includes(searchLower))
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
      const { frameworkId, extractedText, category, tags, description, requirementId } = req.body;

      // Get user's company information
      const company = await storage.getCompanyByUserId(userId);
      const companyId = company?.id || null;

      // Compute SHA256 hash of the uploaded file
      const fileBuffer = fs.readFileSync(req.file.path);
      const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Check for existing document with same hash (versioning support)
      const existingDocuments = await storage.getDocumentsByUserId(userId);
      const existingDoc = existingDocuments.find(doc => doc.sha256Hash === sha256Hash);
      const version = existingDoc ? existingDoc.version + 1 : 1;

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
        companyId,
        requirementId: requirementId || null,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
        sha256Hash,
        version,
        uploaderUserId: userId,
        analysisResult,
        status: analysisResult ? 'verified' : 'pending',
        extractedText: documentContent || null
      });

      const document = await storage.createDocument(documentData);

      // If requirementId is provided, create evidence mapping and get control information
      let mappingInfo = null;
      if (requirementId) {
        try {
          // Create evidence mapping
          const mapping = await storage.createEvidenceMapping({
            userId,
            documentId: document.id,
            requirementId,
            mappingConfidence: (analysisResult?.completeness_score || 0.8).toString(),
            qualityScore: (analysisResult?.completeness_score || 0.7).toString(),
            mappingType: 'direct',
            evidenceSnippets: analysisResult?.key_findings || null,
            aiAnalysis: analysisResult || null,
            validationStatus: 'pending'
          });

          // Get the control information
          const requirements = await storage.getComplianceRequirements();
          const control = requirements.find(req => req.id === requirementId);

          mappingInfo = {
            mappingId: mapping.id,
            control: control ? {
              id: control.id,
              requirementId: control.requirementId,
              title: control.title,
              description: control.description,
              category: control.category,
              priority: control.priority,
              frameworkId: control.frameworkId
            } : null,
            mappingType: mapping.mappingType,
            confidence: mapping.mappingConfidence,
            status: mapping.validationStatus
          };
        } catch (mappingError) {
          console.error("Error creating evidence mapping:", mappingError);
          // Continue without mapping if it fails
        }
      }

      // Create audit log for the upload
      await storage.createAuditLog({
        userId,
        action: 'create',
        entityType: 'document',
        entityId: document.id,
        description: `Document uploaded: ${document.fileName}`,
        metadata: {
          sha256Hash,
          version,
          fileSize: document.fileSize,
          companyId,
          requirementId: requirementId || null,
          mappingCreated: !!mappingInfo
        },
        success: true
      });

      // Enhanced response with control information
      const response = {
        ...document,
        ...(mappingInfo && { mapping: mappingInfo })
      };

      res.json(response);
    } catch (error) {
      console.error("Error uploading document:", error);

      // Create audit log for failed upload
      try {
        await storage.createAuditLog({
          userId: req.user?.sub,
          action: 'create',
          entityType: 'document',
          description: `Failed document upload: ${req.file?.originalname || 'unknown'}`,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (auditError) {
        console.error("Error creating audit log:", auditError);
      }

      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Document viewing endpoints
  app.get('/api/documents/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const document = await storage.getDocumentById(id);
      if (!document || document.userId !== userId) {
        return res.status(404).json({ message: "Document not found" });
      }

      const filePath = document.filePath;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      // Set appropriate content type
      res.setHeader('Content-Type', document.fileType);
      res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error viewing document:", error);
      res.status(500).json({ message: "Failed to view document" });
    }
  });

  app.get('/api/documents/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const document = await storage.getDocumentById(id);
      if (!document || document.userId !== userId) {
        return res.status(404).json({ message: "Document not found" });
      }

      const filePath = document.filePath;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      // Set headers for download
      res.setHeader('Content-Type', document.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
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
      const statusAnalysis = await detectComplianceGaps(
        {
          frameworks: [], // TODO: Get frameworks from frameworksCompanies table
          completedTasks,
          totalTasks,
          openRisks: risks.filter(r => r.status === 'open').length,
          uploadedDocuments: documents.length
        }, company.industry || '', company.size || '');

      // Generate prioritized action plan
      const actionPlan = await generateComplianceRecommendations(
        [], // TODO: Get frameworks from frameworksCompanies table
        company.size || '',
        company.industry || '',
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
          frameworksInProgress: [], // TODO: Get frameworks from frameworksCompanies table
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

  // Simple dashboard health check (no auth required for debugging)
  app.get('/api/dashboard/health-simple', async (req, res) => {
    try {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
          progress: '/api/dashboard/progress',
          recentTasks: '/api/dashboard/recent-tasks'
        },
        message: 'Dashboard API endpoints are available'
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Dashboard health check and test endpoint
  app.get('/api/dashboard/health', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const healthCheck = {
        timestamp: new Date().toISOString(),
        userId: userId ? 'present' : 'missing',
        tests: {} as Record<string, any>
      };

      // Test summary endpoint
      try {
        const summaryResponse = await fetch(`${req.protocol}://${req.get('host')}/api/summary`, {
          headers: { 'Authorization': req.headers.authorization || '' }
        });
        healthCheck.tests.summary = {
          status: summaryResponse.ok ? 'pass' : 'fail',
          responseCode: summaryResponse.status
        };
      } catch (error) {
        healthCheck.tests.summary = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test progress endpoint  
      try {
        const progressResponse = await fetch(`${req.protocol}://${req.get('host')}/api/dashboard/progress`, {
          headers: { 'Authorization': req.headers.authorization || '' }
        });
        healthCheck.tests.progress = {
          status: progressResponse.ok ? 'pass' : 'fail',
          responseCode: progressResponse.status
        };
      } catch (error) {
        healthCheck.tests.progress = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test recent tasks endpoint
      try {
        const tasksResponse = await fetch(`${req.protocol}://${req.get('host')}/api/dashboard/recent-tasks`, {
          headers: { 'Authorization': req.headers.authorization || '' }
        });
        healthCheck.tests.recentTasks = {
          status: tasksResponse.ok ? 'pass' : 'fail',
          responseCode: tasksResponse.status
        };
      } catch (error) {
        healthCheck.tests.recentTasks = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test AI capability
      const aiConfigured = !!process.env.ANTHROPIC_API_KEY;
      healthCheck.tests.aiIntegration = {
        status: aiConfigured ? 'pass' : 'warn',
        configured: aiConfigured,
        message: aiConfigured ? 'Claude API key found' : 'Claude API key missing'
      };

      // Test database connections
      try {
        const tasks = await storage.getTasksByUserId(userId);
        healthCheck.tests.database = {
          status: 'pass',
          taskCount: tasks.length
        };
      } catch (error) {
        healthCheck.tests.database = { status: 'fail', error: error instanceof Error ? error.message : 'Unknown error' };
      }

      const allPassed = Object.values(healthCheck.tests).every((test: any) => 
        test.status === 'pass' || test.status === 'warn'
      );

      res.json({
        ...healthCheck,
        overallHealth: allPassed ? 'healthy' : 'degraded',
        recommendations: !aiConfigured ? ['Configure ANTHROPIC_API_KEY for AI features'] : []
      });
    } catch (error) {
      console.error('Dashboard health check failed:', error);
      res.status(500).json({
        overallHealth: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

    // The following closing brace was removed as it was causing a syntax error.
    // } // Removed this extra closing brace
  // }); // Removed this extra closing brace and semicolon

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

      // Get compliance requirements for citation context
      const allFrameworks = await storage.getAllFrameworks();
      const complianceRequirements: any[] = [];

      // TODO: Get frameworks from frameworksCompanies table
      // For now, we'll use an empty array since selectedFrameworks doesn't exist in schema

      // Build comprehensive context for Claude
      const userProfile = company ? {
        frameworks: [], // TODO: Get frameworks from frameworksCompanies table
        industry: company.industry || '',
        companySize: company.size || '',
        currentProgress: context?.summary?.compliancePercent || 0
      } : undefined;

      const complianceContext = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        openRisks: risks.filter(r => r.status === 'open').length,
        documentsUploaded: documents.length,
        recentGaps: context?.summary?.gaps?.slice(0, 3) || [],
        availableRequirements: complianceRequirements.slice(0, 20) // Include top 20 for context
      };

      // Get enhanced Claude response with full context including citations
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
        [], // TODO: Get frameworks from frameworksCompanies table
        company.size || '',
        company.industry || '',
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
      const { category, impact, likelihood, q, frameworkId } = req.query as Record<string, string | undefined>;
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
      if (frameworkId) {
        risks = risks.filter(risk => risk.frameworkId === frameworkId);
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
        frameworks: [], // TODO: Get frameworks from frameworksCompanies table
        industry: company.industry || '',
        size: company.size || ''
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
          frameworks: [], // TODO: Get frameworks from frameworksCompanies table
          completedTasks,
          totalTasks: tasks.length,
          openRisks,
          uploadedDocuments: documents.length
        },
        company.industry || '',
        company.size || ''
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
      const document = await storage.getDocumentById(documentId);
      if (!document || document.userId !== userId) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Use extracted text if available, otherwise try to read file
      let fileContent = document.extractedText || '';

      if (!fileContent) {
        const filePath = document.filePath;
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: "File not found" });
        }

        try {
          if (document.fileType.startsWith('text/') || 
              document.fileType === 'application/json' ||
              document.fileType.includes('xml')) {
            fileContent = fs.readFileSync(filePath, 'utf8');
          } else {
            fileContent = `Document: ${document.fileName}\nType: ${document.fileType}\nSize: ${document.fileSize} bytes`;
          }
        } catch (error) {
          console.error("Error reading file:", error);
          fileContent = `Document: ${document.fileName} (content extraction failed)`;
        }
      }

      const existingDocs = await storage.getDocumentsByUserId(userId);
      const existingDocNames = existingDocs.map(d => d.fileName);

      const analysis = await analyzeDocumentAdvanced(
        fileContent,
        document.fileName,
        framework,
        existingDocNames
      );

      res.json(analysis);
    } catch (error) {
      console.error("Error in advanced document analysis:", error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  // Test AI analysis endpoint
  app.post('/api/test/ai-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { text, framework, filename } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Text content required for analysis" });
      }

      console.log("Testing AI analysis with:", { 
        textLength: text.length, 
        framework: framework || 'general',
        filename: filename || 'test.txt'
      });

      const analysis = await analyzeDocument(
        text, 
        framework || undefined, 
        filename || 'test.txt'
      );

      res.json({
        success: true,
        analysis,
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
      });
    } catch (error) {
      console.error("AI analysis test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
      });
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

      const { framework, status, documentId, requirementId } = req.query;
      const mappings = await storage.getEvidenceMappings({
        userId,
        documentId,
        requirementId,
        validationStatus: status
      });

      // Include framework filtering if requested
      const filteredMappings = framework 
        ? mappings.filter(m => m.frameworkId === framework)
        : mappings;

      res.json(filteredMappings);
    } catch (error) {
      console.error("Error fetching evidence mappings:", error);
      res.status(500).json({ message: "Failed to fetch evidence mappings" });
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

  // Test AI analysis endpoint
  app.post('/api/test/ai-analysis', async (req, res) => {
    try {
      const { text, framework, filename } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Text content required for analysis" });
      }

      console.log("Testing AI analysis with:", { 
        textLength: text.length, 
        framework: framework || 'general',
        filename: filename || 'test.txt'
      });

      const analysis = await analyzeDocument(
        text, 
        framework || undefined, 
        filename || 'test.txt'
      );

      res.json({
        success: true,
        analysis,
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
      });
    } catch (error) {
      console.error("AI analysis test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
      });
    }
  });

  // Test evidence mapping functionality
  app.post("/api/test/evidence-mapping", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { documentId, frameworkId } = req.body;

      if (!documentId) {
        return res.status(400).json({ error: "Document ID is required" });
      }

      console.log("Testing evidence mapping for:", { userId, documentId, frameworkId });

      // Import and use evidence mapping service
      const { evidenceMappingService } = await import('./evidenceMapping');
      const mappings = await evidenceMappingService.analyzeDocumentForCompliance(
        documentId,
        userId,
        frameworkId
      );

      res.json({
        success: true,
        mappingsCreated: mappings.length,
        mappings: mappings.map(m => ({
          id: m.id,
          confidence: m.mappingConfidence,
          qualityScore: m.qualityScore,
          mappingType: m.mappingType,
          validationStatus: m.validationStatus
        }))
      });
    } catch (error) {
      console.error("Evidence mapping test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test progress tracking functionality
  app.get("/api/test/progress-tracking", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;

      // Get framework progress
      const frameworkProgress = await fetch(`http://localhost:5000/api/framework-progress`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      }).then(r => r.json()).catch(() => []);

      // Get velocity data
      const velocityData = await fetch(`http://localhost:5000/api/progress/velocity`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      }).then(r => r.json()).catch(() => null);

      // Get gap analysis
      const gapAnalysis = await fetch(`http://localhost:5000/api/compliance/gap-analysis`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      }).then(r => r.json()).catch(() => null);

      res.json({
        success: true,
        data: {
          frameworkProgress: frameworkProgress.length || 0,
          velocity: velocityData?.currentVelocity || 0,
          gapsFound: gapAnalysis?.frameworks?.length || 0,
          overallCompletion: gapAnalysis?.overallCompletion || 0
        },
        details: {
          frameworks: frameworkProgress,
          velocity: velocityData,
          gaps: gapAnalysis
        }
      });
    } catch (error) {
      console.error("Progress tracking test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
        // actionUrl: notification.actionUrl, // This field doesn't exist in the schema
        // relatedEntityType: notification.relatedEntityType, // This field doesn't exist in the schema
        // relatedEntityId: notification.relatedEntityId, // This field doesn't exist in the schema
        // expiresAt: notification.expiresAt // This field doesn't exist in the schema
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

      console.log("Starting onboarding completion for user:", userId);
      console.log("Company data:", company);
      console.log("Selected frameworks:", frameworks);

      // Validate required data
      if (!company || !company.name || !company.contactEmail) {
        return res.status(400).json({ 
          error: "Company name and contact email are required",
          details: "Please complete your company profile before continuing."
        });
      }

      if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
        return res.status(400).json({ 
          error: "At least one framework must be selected",
          details: "Please select at least one compliance framework."
        });
      }

      // Insert company data with selected frameworks and completion flag
      const companyData = insertCompanySchema.parse({ 
        ...company, 
        userId,
        selectedFrameworks: frameworks,
        onboardingCompleted: true // Mark onboarding as completed
      });
      const savedCompany = await storage.upsertCompany(companyData);
      console.log("Company record created/updated:", savedCompany.id);

      const selectedFrameworksData = [];
      let totalTasks = 0;
      let successfulFrameworks = 0;

      // Get all available frameworks first
      const allFrameworks = await storage.getAllFrameworks();
      console.log("Available frameworks:", allFrameworks.map(f => ({ id: f.id, name: f.name })));

      // Insert selected frameworks and generate initial tasks
      for (const frameworkId of frameworks) {
        // Find the framework by id or name
        const framework = allFrameworks.find(f => f.id === frameworkId || f.name === frameworkId);

        if (framework) {
          console.log("Processing framework:", framework.name);

          selectedFrameworksData.push({
            id: framework.id,
            name: framework.name,
            displayName: framework.displayName
          });

          try {
            // Initialize framework progress with error handling
            await storage.upsertFrameworkProgress({
              userId,
              frameworkId: framework.id,
              completedControls: 0,
              totalControls: framework.totalControls || 0,
              progressPercentage: '0.00'
            });
            console.log("Framework progress initialized for:", framework.name);
          } catch (progressError) {
            console.error("Error initializing framework progress for", framework.name, ":", progressError);
            // Continue with other frameworks - this is not critical for onboarding completion
          }

          // Generate initial compliance tasks for each framework
          const initialTasks = getInitialTasksForFramework(framework.name, companyData.industry || '', companyData.size || '');
          let frameworkTasksCreated = 0;

          console.log(`Generating ${initialTasks.length} tasks for ${framework.name}`);

          for (const taskData of initialTasks) {
            try {
              const task = await storage.createTask({
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
              frameworkTasksCreated++;
              console.log(`Created task: ${task.title}`);
            } catch (taskError) {
              console.error("Error creating task:", taskError);
              // Continue with other tasks if one fails
            }
          }

          totalTasks += frameworkTasksCreated;
          successfulFrameworks++;
          console.log(`Successfully created ${frameworkTasksCreated} tasks for ${framework.name}`);
        } else {
          console.warn("Framework not found:", frameworkId);
        }
      }

      // Generate baseline policies for selected frameworks
      let generatedPolicies = 0;
      try {
        const { policyGenerator } = await import('./services/policyGenerator');

        for (const frameworkId of frameworks) {
          try {
            // Get available templates for this framework
            const templates = await policyGenerator.getTemplatesForFramework(frameworkId);

            for (const template of templates) {
              // Generate policy from template
              await policyGenerator.generatePolicy(
                template.id,
                userId,
                savedCompany.id,
                {} // Use default variables for now
              );
              generatedPolicies++;
              console.log(`Generated policy: ${template.title} for framework: ${frameworkId}`);
            }
          } catch (policyError) {
            console.error(`Error generating policies for framework ${frameworkId}:`, policyError);
          }
        }

        console.log(`Generated ${generatedPolicies} baseline policies`);
      } catch (policyGenError) {
        console.error("Policy generation failed:", policyGenError);
        // Don't fail onboarding if policy generation fails
      }

      // Update user to mark onboarding as completed
      try {
        await storage.updateUser(userId, {
          aiEnabled: aiEnabled !== undefined ? aiEnabled : true,
          onboardingCompleted: true,
        });
        console.log("User onboarding marked as completed");
      } catch (userError) {
        console.error("Error updating user onboarding status:", userError);
        // Don't fail the entire process if user update fails, but log it prominently
        console.warn("⚠️ User onboarding completion flag not set - user may need to redo onboarding");
      }

      console.log(`Onboarding completed successfully - processed ${successfulFrameworks}/${frameworks.length} frameworks, created ${totalTasks} tasks, generated ${generatedPolicies} policies`);

      res.json({
        success: true,
        message: "Company profile and tasks created successfully",
        company: savedCompany,
        totalTasks,
        generatedPolicies,
        successfulFrameworks,
        failedFrameworks: frameworks.length - successfulFrameworks
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ 
        error: "Failed to complete onboarding",
        details: error instanceof Error ? error.message : "Unknown error"
      });
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
        try {
          // Get controls for this framework
          const fwControls = await storage.getComplianceRequirements(fwId);

          // Take first 3-5 controls as preview
          const previewControls = fwControls.slice(0, 4);

          for (const control of previewControls) {
            tasks.push({
              id: `${fwId}-${control.requirementId}`,
              frameworkId: fwId,
              requirementId: control.requirementId,
              title: control.title,
              description: control.description,
              category: control.category,
              priority: control.priority
            });
          }
        } catch (error) {
          console.error(`Error getting controls for framework ${fwId}:`, error);
          // Add sample tasks if framework data is missing
          for (let i = 1; i <= 3; i++) {
            tasks.push({
              id: `${fwId}-sample-${i}`,
              frameworkId: fwId,
              requirementId: `${fwId.toUpperCase()}-${i.toString().padStart(3, '0')}`,
              title: `Sample ${fwId.toUpperCase()} Control ${i}`,
              description: `This is a sample compliance control for ${fwId} framework.`,
              category: 'Security',
              priority: i === 1 ? 'high' : 'medium'
            });
          }
        }
      }

      res.json({ tasks });
    } catch (error) {
      console.error('Error in preview-tasks:', error);
      res.status(500).json({ error: 'Failed to generate preview tasks' });
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

      // Get compliance requirements for citation context
      const allFrameworks = await storage.getAllFrameworks();
      const complianceRequirements: any[] = [];

      // TODO: Get frameworks from frameworksCompanies table
      // For now, we'll use an empty array since selectedFrameworks doesn't exist in schema

      // Build comprehensive context for Claude
      const userProfile = company ? {
        frameworks: [], // TODO: Get frameworks from frameworksCompanies table
        industry: company.industry || '',
        companySize: company.size || '',
        currentProgress: context?.summary?.compliancePercent || 0
      } : undefined;

      const complianceContext = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        openRisks: risks.filter(r => r.status === 'open').length,
        documentsUploaded: documents.length,
        recentGaps: context?.summary?.gaps?.slice(0, 3) || [],
        availableRequirements: complianceRequirements.slice(0, 20) // Include top 20 for context
      };

      // Get enhanced Claude response with full context including citations
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

  // Compliance Requirements Endpoint
  app.get('/api/compliance/requirements', isAuthenticated, async (req: any, res) => {
    try {
      const { frameworkId } = req.query;

      const requirements = await storage.getComplianceRequirements(frameworkId);

      // Format response for dropdown selection
      const formattedRequirements = requirements.map(req => ({
        id: req.id,
        requirementId: req.requirementId,
        title: req.title,
        description: req.description,
        category: req.category,
        priority: req.priority,
        frameworkId: req.frameworkId
      }));

      res.json({ requirements: formattedRequirements });
    } catch (error) {
      console.error("Error fetching compliance requirements:", error);
      res.status(500).json({ message: "Failed to fetch compliance requirements" });
    }
  });

  // Evidence Status Endpoint
  app.get('/api/evidence/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const { frameworkId } = req.query;

      const evidenceStatus = await storage.getEvidenceStatus(userId, frameworkId);

      res.json({ controls: evidenceStatus });
    } catch (error) {
      console.error("Error fetching evidence status:", error);
      res.status(500).json({ message: "Failed to fetch evidence status" });
    }
  });

  return httpServer;
}