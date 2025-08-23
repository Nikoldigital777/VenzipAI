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

  const httpServer = createServer(app);
  return httpServer;
}
