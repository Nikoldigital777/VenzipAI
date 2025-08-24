import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCompanySchema, 
  insertTaskSchema, 
  insertDocumentSchema, 
  insertRiskSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { 
  analyzeDocument, 
  chatWithClaude, 
  generateComplianceRecommendations,
  assessRisk 
} from "./anthropic";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
  app.get('/api/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get real data counts
      const documents = await storage.getDocumentsByUserId(userId);
      const chatMessages = await storage.getChatMessagesByUserId(userId, 1000);
      const tasks = await storage.getTasksByUserId(userId);
      const risks = await storage.getRisksByUserId(userId);
      
      // Calculate compliance percentage based on real activity
      const baseline = 45;
      const uploadBonus = Math.min(25, documents.length * 3);
      const chatBonus = Math.min(20, Math.floor(chatMessages.length / 4));
      const taskBonus = Math.min(10, tasks.filter(t => t.status === 'completed').length * 2);
      const compliancePercent = Math.max(0, Math.min(98, baseline + uploadBonus + chatBonus + taskBonus));

      // Generate realistic gaps based on current state  
      const gaps = [
        { id: "gap-1", title: "Access Control Policy", severity: "high" },
        { id: "gap-2", title: "Vendor Risk Assessment", severity: "medium" },
        { id: "gap-3", title: "Incident Response Runbook", severity: "medium" },
      ].filter((_, i) => i < Math.max(1, 4 - Math.floor(documents.length / 2)));

      // Recent activity from chat and documents
      const recentActivity = [
        ...chatMessages.slice(0, 4).map(m => ({
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
        gaps,
        stats: {
          uploads: documents.length,
          conversations: Math.floor(chatMessages.length / 2), // Count back-and-forth as single conversations
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
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post('/api/company', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyData = insertCompanySchema.parse({ ...req.body, userId });
      const company = await storage.upsertCompany(companyData);
      
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

  app.get('/api/framework-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getFrameworkProgressByUserId(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching framework progress:", error);
      res.status(500).json({ message: "Failed to fetch framework progress" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(taskData);
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
      const task = await storage.updateTask(id, updates);
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

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getDocumentsByUserId(userId);
      res.json(documents);
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

      const userId = req.user.claims.sub;
      const { frameworkId } = req.body;
      
      // Read file content for analysis
      const filePath = req.file.path;
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Analyze document with Claude
      let analysisResult = null;
      try {
        analysisResult = await analyzeDocument(fileContent, frameworkId);
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

  // Risk routes
  app.get('/api/risks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const risks = await storage.getRisksByUserId(userId);
      res.json(risks);
    } catch (error) {
      console.error("Error fetching risks:", error);
      res.status(500).json({ message: "Failed to fetch risks" });
    }
  });

  app.post('/api/risks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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

  // Claude chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      // Save user message
      await storage.createChatMessage(
        insertChatMessageSchema.parse({
          userId,
          message,
          messageType: 'user'
        })
      );
      
      // Get Claude response
      const response = await chatWithClaude(message);
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
        status: body.status || "pending",
        assignedTo: body.assignedTo || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

      // Recalculate risk score if impact or likelihood changed
      if (body.impact !== undefined || body.likelihood !== undefined) {
        const currentRisk = await storage.getRisksByUserId(req.user.claims.sub);
        const risk = currentRisk.find(r => r.id === id);
        if (risk) {
          const impact = body.impact || risk.impact;
          const likelihood = body.likelihood || risk.likelihood;
          const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
          const likelihoodScore = likelihood === 'high' ? 3 : likelihood === 'medium' ? 2 : 1;
          updates.riskScore = (impactScore * likelihoodScore).toString();
        }
      }

      const risk = await storage.updateRisk(id, updates);
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

  const httpServer = createServer(app);
  return httpServer;
}
