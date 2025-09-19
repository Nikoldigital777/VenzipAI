import {
  users,
  companies,
  frameworks,
  frameworkProgress,
  tasks,
  taskComments,
  taskAttachments,
  documents,
  risks,
  chatMessages,
  vendorAssessments,
  notifications,
  riskScoreHistory,
  auditLogs,
  complianceRequirements,
  evidenceMappings,
  evidenceGaps,
  crossFrameworkMappings,
  learningResources,
  learningProgress,
  policyTemplates,
  generatedPolicies,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";

import type {
  UpsertUser,
  User,
  Company,
  InsertCompany,
  Framework,
  FrameworkProgress,
  InsertFrameworkProgress,
  Task,
  InsertTask,
  TaskComment,
  InsertTaskComment,
  TaskAttachment,
  InsertTaskAttachment,
  Document,
  InsertDocument,
  Risk,
  InsertRisk,
  ChatMessage,
  InsertChatMessage,
  VendorAssessment,
  InsertVendorAssessment,
  Notification,
  InsertNotification,
  RiskScoreHistory,
  InsertRiskScoreHistory,
  AuditLog,
  InsertAuditLog,
  ComplianceRequirement,
  InsertComplianceRequirement,
  EvidenceMapping,
  InsertEvidenceMapping,
  EvidenceGap,
  InsertEvidenceGap,
  CrossFrameworkMapping,
  InsertCrossFrameworkMapping,
  LearningResource,
  InsertLearningResource,
  LearningProgress,
  InsertLearningProgress,
  PolicyTemplate,
  InsertPolicyTemplate,
  GeneratedPolicy,
  InsertGeneratedPolicy,
} from '@shared/schema';

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User>;

  // Company operations
  getCompanyByUserId(userId: string): Promise<Company | undefined>;
  upsertCompany(company: InsertCompany): Promise<Company>;

  // Framework operations
  getAllFrameworks(): Promise<Framework[]>;
  getFrameworksByIds(ids: string[]): Promise<Framework[]>;

  // Framework progress operations
  getFrameworkProgressByUserId(userId: string): Promise<FrameworkProgress[]>;
  upsertFrameworkProgress(progress: InsertFrameworkProgress): Promise<FrameworkProgress>;

  // Task operations
  getTasksByUserId(userId: string): Promise<Task[]>;
  getTasksByUserIdAndFramework(userId: string, frameworkId?: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Task comment operations
  getTaskComments(taskId: string): Promise<TaskComment[]>;
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  deleteTaskComment(id: string): Promise<void>;

  // Task attachment operations
  getTaskAttachments(taskId: string): Promise<TaskAttachment[]>;
  createTaskAttachment(attachment: InsertTaskAttachment): Promise<TaskAttachment>;
  deleteTaskAttachment(id: string): Promise<void>;

  // Document operations
  getDocumentsByUserId(userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Risk operations
  getRisksByUserId(userId: string): Promise<Risk[]>;
  createRisk(risk: InsertRisk): Promise<Risk>;
  updateRisk(id: string, updates: Partial<InsertRisk>): Promise<Risk>;
  deleteRisk(id: string): Promise<void>;

  // Chat operations
  getChatMessagesByUserId(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Vendor assessment operations
  getVendorAssessmentsByUserId(userId: string): Promise<VendorAssessment[]>;
  createVendorAssessment(vendorAssessment: InsertVendorAssessment): Promise<VendorAssessment>;
  updateVendorAssessment(id: string, updates: Partial<InsertVendorAssessment>): Promise<VendorAssessment>;
  deleteVendorAssessment(id: string): Promise<void>;

  // Notification operations
  getNotificationsByUserId(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;
  deleteNotification(id: string): Promise<void>;

  // Audit log operations
  getAuditLogsByUserId(userId: string, limit?: number): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;

  // Learning resource operations
  getLearningResources(params?: { frameworkId?: string; resourceType?: string; category?: string; search?: string }): Promise<LearningResource[]>;
  createLearningResource(resource: InsertLearningResource): Promise<LearningResource>;
  updateLearningResource(id: string, updates: Partial<InsertLearningResource>): Promise<LearningResource>;
  deleteLearningResource(id: string): Promise<void>;

  // Learning progress operations
  getLearningProgress(userId: string, resourceId?: string): Promise<LearningProgress[]>;
  upsertLearningProgress(progress: InsertLearningProgress): Promise<LearningProgress>;
  getUserCompletedResources(userId: string): Promise<LearningProgress[]>;

  // Compliance requirements operations
  getComplianceRequirements(frameworkId?: string): Promise<ComplianceRequirement[]>;
  createComplianceRequirement(requirement: InsertComplianceRequirement): Promise<ComplianceRequirement>;
  getDocumentsByRequirementId(requirementId: string): Promise<Document[]>;

  // Evidence mapping operations
  createEvidenceMapping(mapping: InsertEvidenceMapping): Promise<EvidenceMapping>;
  getEvidenceMappings(params: {
    userId: string;
    documentId?: string;
    requirementId?: string;
    validationStatus?: string;
  }): Promise<EvidenceMapping[]>;
  updateEvidenceMapping(id: string, updates: Partial<EvidenceMapping>): Promise<EvidenceMapping>;
  getEvidenceStatus(userId: string, frameworkId?: string): Promise<any[]>;
  getDocumentsWithMappingsByUserId(userId: string): Promise<any[]>;

  // Policy template operations
  getPolicyTemplate(id: string): Promise<PolicyTemplate | null>;
  getPolicyTemplates(frameworkId?: string): Promise<PolicyTemplate[]>;
  getAllPolicyTemplates(): Promise<PolicyTemplate[]>;

  // Generated policy operations
  createGeneratedPolicy(data: InsertGeneratedPolicy): Promise<GeneratedPolicy>;
  getGeneratedPolicyById(id: string): Promise<GeneratedPolicy | null>;
  getGeneratedPolicies(companyId: string): Promise<GeneratedPolicy[]>;
  updateGeneratedPolicy(id: string, data: Partial<GeneratedPolicy>): Promise<GeneratedPolicy>;
}

export class DatabaseStorage implements IStorage {
  private db = db;

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        profilePicture: userData.profilePicture,
        onboardingCompleted: userData.onboardingCompleted,
        aiEnabled: userData.aiEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
          onboardingCompleted: userData.onboardingCompleted,
          aiEnabled: userData.aiEnabled,
          updatedAt: new Date(),
        }
      })
      .returning();

    return user;
  }

  async updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  // Company operations
  async getCompanyByUserId(userId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  async upsertCompany(companyData: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(companyData)
      .onConflictDoUpdate({
        target: companies.userId,
        set: {
          ...companyData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return company;
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  // Framework operations
  async getAllFrameworks(): Promise<Framework[]> {
    return await db.select().from(frameworks);
  }

  async getFrameworksByIds(ids: string[]): Promise<Framework[]> {
    return await db.select().from(frameworks).where(
      or(...ids.map(id => eq(frameworks.id, id)))
    );
  }

  // Framework progress operations
  async getFrameworkProgressByUserId(userId: string): Promise<FrameworkProgress[]> {
    return await db.select().from(frameworkProgress).where(eq(frameworkProgress.userId, userId));
  }

  async upsertFrameworkProgress(progressData: InsertFrameworkProgress): Promise<FrameworkProgress> {
    try {
      // First try to find existing record
      const existing = await db
        .select()
        .from(frameworkProgress)
        .where(
          and(
            eq(frameworkProgress.userId, progressData.userId),
            eq(frameworkProgress.frameworkId, progressData.frameworkId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        const [progress] = await db
          .update(frameworkProgress)
          .set({
            ...progressData,
            updatedAt: new Date(),
          })
          .where(eq(frameworkProgress.id, existing[0].id))
          .returning();
        return progress;
      } else {
        // Insert new record
        const [progress] = await db
          .insert(frameworkProgress)
          .values({
            ...progressData,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        return progress;
      }
    } catch (error) {
      console.error("Error upserting framework progress:", error);
      // If there's a conflict error, try to get the existing record
      const existing = await db
        .select()
        .from(frameworkProgress)
        .where(
          and(
            eq(frameworkProgress.userId, progressData.userId),
            eq(frameworkProgress.frameworkId, progressData.frameworkId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      } else {
        throw error;
      }
    }
  }

  // Task operations
  async getTasksByUserId(userId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByUserIdAndFramework(userId: string, frameworkId?: string): Promise<Task[]> {
    if (frameworkId) {
      return await db.select().from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.frameworkId, frameworkId)))
        .orderBy(desc(tasks.createdAt));
    }
    return this.getTasksByUserId(userId);
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const results = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return results[0];
  }

  // Task comment operations
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return await db.select().from(taskComments)
      .where(eq(taskComments.taskId, taskId))
      .orderBy(desc(taskComments.createdAt));
  }

  async createTaskComment(commentData: InsertTaskComment): Promise<TaskComment> {
    const [comment] = await db.insert(taskComments).values(commentData).returning();
    return comment;
  }

  async deleteTaskComment(id: string): Promise<void> {
    await db.delete(taskComments).where(eq(taskComments.id, id));
  }

  // Task attachment operations
  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    return await db.select().from(taskAttachments)
      .where(eq(taskAttachments.taskId, taskId))
      .orderBy(desc(taskAttachments.createdAt));
  }

  async createTaskAttachment(attachmentData: InsertTaskAttachment): Promise<TaskAttachment> {
    const [attachment] = await db.insert(taskAttachments).values(attachmentData).returning();
    return attachment;
  }

  async deleteTaskAttachment(id: string): Promise<void> {
    await db.delete(taskAttachments).where(eq(taskAttachments.id, id));
  }

  // Document operations
  async getDocumentsByUserId(userId: string): Promise<Document[]> {
    return await db.select().from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.uploadedAt));
  }

  async getDocumentsWithMappingsByUserId(userId: string): Promise<any[]> {
    // Get documents with their evidence mappings and associated compliance requirements
    const results = await db.select({
      // Document fields
      id: documents.id,
      fileName: documents.fileName,
      fileType: documents.fileType,
      fileSize: documents.fileSize,
      filePath: documents.filePath,
      status: documents.status,
      analysisResult: documents.analysisResult,
      uploadedAt: documents.uploadedAt,
      frameworkId: documents.frameworkId,
      requirementId: documents.requirementId,
      userId: documents.userId,
      // Evidence mapping fields
      mappingId: evidenceMappings.id,
      mappingType: evidenceMappings.mappingType,
      confidence: evidenceMappings.confidence,
      mappingStatus: evidenceMappings.validationStatus,
      // Compliance requirement fields
      controlId: complianceRequirements.id,
      controlRequirementId: complianceRequirements.requirementId,
      controlTitle: complianceRequirements.title,
      controlDescription: complianceRequirements.description,
      controlCategory: complianceRequirements.category,
      controlPriority: complianceRequirements.priority,
      controlFrameworkId: complianceRequirements.frameworkId,
    })
    .from(documents)
    .leftJoin(evidenceMappings, eq(documents.id, evidenceMappings.documentId))
    .leftJoin(complianceRequirements, eq(evidenceMappings.requirementId, complianceRequirements.id))
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.uploadedAt));

    // Transform the flat results into nested structure
    const documentsMap = new Map();

    results.forEach(row => {
      const docId = row.id;

      if (!documentsMap.has(docId)) {
        documentsMap.set(docId, {
          id: row.id,
          fileName: row.fileName,
          fileType: row.fileType,
          fileSize: row.fileSize,
          filePath: row.filePath,
          status: row.status,
          analysisResult: row.analysisResult,
          uploadedAt: row.uploadedAt,
          frameworkId: row.frameworkId,
          requirementId: row.requirementId,
          userId: row.userId,
          mapping: null,
        });
      }

      // Add mapping information if it exists
      if (row.mappingId) {
        const doc = documentsMap.get(docId);
        doc.mapping = {
          mappingId: row.mappingId,
          mappingType: row.mappingType,
          confidence: row.confidence,
          status: row.mappingStatus,
          control: {
            id: row.controlId,
            requirementId: row.controlRequirementId,
            title: row.controlTitle,
            description: row.controlDescription,
            category: row.controlCategory,
            priority: row.controlPriority,
            frameworkId: row.controlFrameworkId,
          }
        };
      }
    });

    return Array.from(documentsMap.values());
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const results = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return results[0];
  }

  // Risk operations
  async getRisksByUserId(userId: string): Promise<Risk[]> {
    return await db.select().from(risks)
      .where(eq(risks.userId, userId))
      .orderBy(desc(risks.riskScore), desc(risks.createdAt));
  }

  async createRisk(riskData: InsertRisk): Promise<Risk> {
    const [risk] = await db.insert(risks).values(riskData).returning();
    return risk;
  }

  async updateRisk(id: string, updates: Partial<InsertRisk>): Promise<Risk> {
    const [risk] = await db
      .update(risks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(risks.id, id))
      .returning();
    return risk;
  }

  async deleteRisk(id: string): Promise<void> {
    await db.delete(risks).where(eq(risks.id, id));
  }

  // Risk Score History Management
  async createRiskScoreHistory(historyData: InsertRiskScoreHistory): Promise<RiskScoreHistory> {
    const [history] = await db.insert(riskScoreHistory).values(historyData).returning();
    return history;
  }

  async getRiskScoreHistoryByUserId(userId: string, frameworkId?: string): Promise<RiskScoreHistory[]> {
    const conditions = frameworkId
      ? and(eq(riskScoreHistory.userId, userId), eq(riskScoreHistory.frameworkId, frameworkId))
      : eq(riskScoreHistory.userId, userId);

    return await db.select().from(riskScoreHistory)
      .where(conditions)
      .orderBy(desc(riskScoreHistory.createdAt));
  }

  async getLatestRiskScore(userId: string, frameworkId?: string): Promise<RiskScoreHistory | null> {
    const conditions = frameworkId
      ? and(eq(riskScoreHistory.userId, userId), eq(riskScoreHistory.frameworkId, frameworkId))
      : eq(riskScoreHistory.userId, userId);

    const results = await db.select().from(riskScoreHistory)
      .where(conditions)
      .orderBy(desc(riskScoreHistory.createdAt))
      .limit(1);

    return results[0] || null;
  }

  // Chat operations
  async getChatMessagesByUserId(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  // Vendor assessment operations
  async getVendorAssessmentsByUserId(userId: string): Promise<VendorAssessment[]> {
    return await db.select().from(vendorAssessments).where(eq(vendorAssessments.userId, userId)).orderBy(desc(vendorAssessments.createdAt));
  }

  async createVendorAssessment(vendorAssessment: InsertVendorAssessment): Promise<VendorAssessment> {
    const [newVendorAssessment] = await db.insert(vendorAssessments).values(vendorAssessment).returning();
    return newVendorAssessment;
  }

  async updateVendorAssessment(id: string, updates: Partial<InsertVendorAssessment>): Promise<VendorAssessment> {
    const [updatedVendorAssessment] = await db.update(vendorAssessments).set({ ...updates, updatedAt: new Date() }).where(eq(vendorAssessments.id, id)).returning();
    return updatedVendorAssessment;
  }

  async deleteVendorAssessment(id: string): Promise<void> {
    await db.delete(vendorAssessments).where(eq(vendorAssessments.id, id));
  }

  // Notification operations
  async getNotificationsByUserId(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const conditions = unreadOnly ? and(eq(notifications.userId, userId), eq(notifications.isRead, false)) : eq(notifications.userId, userId);
    return await db.select().from(notifications).where(conditions).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification> {
    const [updatedNotification] = await db.update(notifications).set(updates).where(eq(notifications.id, id)).returning();
    return updatedNotification;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [updatedNotification] = await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id)).returning();
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Audit log operations
  async getAuditLogsByUserId(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(data).returning();
    return result[0];
  }

  // Policy template methods
  async getPolicyTemplate(id: string): Promise<PolicyTemplate | null> {
    const result = await db.select().from(policyTemplates).where(eq(policyTemplates.id, id)).limit(1);
    return result[0] || null;
  }

  async getPolicyTemplates(frameworkId?: string): Promise<PolicyTemplate[]> {
    if (frameworkId) {
      return await db.select().from(policyTemplates).where(eq(policyTemplates.frameworkId, frameworkId));
    }
    return await db.select().from(policyTemplates);
  }

  async getAllPolicyTemplates(): Promise<PolicyTemplate[]> {
    return await db.select().from(policyTemplates);
  }

  // Generated policy methods
  async createGeneratedPolicy(data: InsertGeneratedPolicy): Promise<GeneratedPolicy> {
    const result = await db.insert(generatedPolicies).values(data).returning();
    return result[0];
  }

  async getGeneratedPolicyById(id: string): Promise<GeneratedPolicy | null> {
    const result = await db.select().from(generatedPolicies).where(eq(generatedPolicies.id, id)).limit(1);
    return result[0] || null;
  }

  async getGeneratedPolicies(companyId: string): Promise<GeneratedPolicy[]> {
    return await db.select().from(generatedPolicies).where(eq(generatedPolicies.companyId, companyId));
  }

  async updateGeneratedPolicy(id: string, data: Partial<GeneratedPolicy>): Promise<GeneratedPolicy> {
    const result = await db.update(generatedPolicies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(generatedPolicies.id, id))
      .returning();
    return result[0];
  }

  // Evidence mapping operations
  async createEvidenceMapping(mapping: InsertEvidenceMapping): Promise<EvidenceMapping> {
    // For MVP, handle case where requirementId doesn't exist
    if (mapping.requirementId === 'basic-requirement') {
      // Create a basic requirement if it doesn't exist
      try {
        const basicReq = await this.createComplianceRequirement({
          frameworkId: 'general',
          requirementId: 'BASIC-001',
          title: 'General Compliance Evidence',
          description: 'Basic compliance documentation and evidence',
          category: 'documentation',
          priority: 'medium'
        });
        mapping.requirementId = basicReq.id;
      } catch (error) {
        console.log('Basic requirement might already exist, continuing...');
        // Try to find existing basic requirement
        const requirements = await this.getComplianceRequirements('general');
        if (requirements.length > 0) {
          mapping.requirementId = requirements[0].id;
        } else {
          throw new Error('Unable to create or find basic requirement');
        }
      }
    }

    const [result] = await db.insert(evidenceMappings).values(mapping).returning();
    return result;
  }

  async getEvidenceMappings(params: {
    userId: string;
    documentId?: string;
    requirementId?: string;
    validationStatus?: string;
  }): Promise<EvidenceMapping[]> {
    const conditions = [eq(evidenceMappings.userId, params.userId)];

    if (params.documentId) {
      conditions.push(eq(evidenceMappings.documentId, params.documentId));
    }
    if (params.requirementId) {
      conditions.push(eq(evidenceMappings.requirementId, params.requirementId));
    }
    if (params.validationStatus) {
      conditions.push(eq(evidenceMappings.validationStatus, params.validationStatus));
    }

    // Get evidence mappings with document details including policy-generated documents
    const results = await db.select({
      id: evidenceMappings.id,
      userId: evidenceMappings.userId,
      documentId: evidenceMappings.documentId,
      requirementId: evidenceMappings.requirementId,
      mappingConfidence: evidenceMappings.mappingConfidence,
      qualityScore: evidenceMappings.qualityScore,
      mappingType: evidenceMappings.mappingType,
      evidenceSnippets: evidenceMappings.evidenceSnippets,
      aiAnalysis: evidenceMappings.aiAnalysis,
      validationStatus: evidenceMappings.validationStatus,
      createdAt: evidenceMappings.createdAt,
      updatedAt: evidenceMappings.updatedAt,
      validatedBy: evidenceMappings.validatedBy,
      validatedAt: evidenceMappings.validatedAt,
      // Document details
      documentName: documents.fileName,
      requirementTitle: complianceRequirements.title,
      frameworkId: complianceRequirements.frameworkId,
    })
    .from(evidenceMappings)
    .leftJoin(documents, eq(evidenceMappings.documentId, documents.id))
    .leftJoin(complianceRequirements, eq(evidenceMappings.requirementId, complianceRequirements.id))
    .where(and(...conditions));

    return results;
  }

  async updateEvidenceMapping(id: string, updates: Partial<EvidenceMapping>): Promise<EvidenceMapping> {
    const [result] = await db.update(evidenceMappings)
      .set(updates)
      .where(eq(evidenceMappings.id, id))
      .returning();
    return result;
  }

  // Compliance requirements operations
  async getComplianceRequirements(frameworkId?: string): Promise<ComplianceRequirement[]> {
    if (frameworkId) {
      return await db.select().from(complianceRequirements)
        .where(eq(complianceRequirements.frameworkId, frameworkId));
    }
    return await db.select().from(complianceRequirements);
  }

  async createComplianceRequirement(requirement: InsertComplianceRequirement): Promise<ComplianceRequirement> {
    const [result] = await db.insert(complianceRequirements).values([requirement]).returning();
    return result;
  }

  // Evidence gaps operations
  async createEvidenceGap(gap: InsertEvidenceGap): Promise<EvidenceGap> {
    const [result] = await db.insert(evidenceGaps).values(gap).returning();
    return result;
  }

  async getEvidenceGaps(params: {
    userId: string;
    status?: string;
    severity?: string;
  }): Promise<EvidenceGap[]> {
    const conditions = [eq(evidenceGaps.userId, params.userId)];

    if (params.status) {
      conditions.push(eq(evidenceGaps.status, params.status));
    }
    if (params.severity) {
      conditions.push(eq(evidenceGaps.severity, params.severity));
    }

    return await db.select().from(evidenceGaps).where(and(...conditions));
  }

  async updateEvidenceGap(id: string, updates: Partial<EvidenceGap>): Promise<EvidenceGap> {
    const [result] = await db.update(evidenceGaps)
      .set(updates)
      .where(eq(evidenceGaps.id, id))
      .returning();
    return result;
  }

  // Cross-framework mappings operations
  async getCrossFrameworkMappings(requirementId?: string): Promise<CrossFrameworkMapping[]> {
    if (requirementId) {
      return await db.select().from(crossFrameworkMappings)
        .where(or(
          eq(crossFrameworkMappings.primaryRequirementId, requirementId),
          eq(crossFrameworkMappings.relatedRequirementId, requirementId)
        ));
    }
    return await db.select().from(crossFrameworkMappings);
  }

  async createCrossFrameworkMapping(mapping: InsertCrossFrameworkMapping): Promise<CrossFrameworkMapping> {
    const [result] = await db.insert(crossFrameworkMappings).values(mapping).returning();
    return result;
  }

  // Learning resource operations
  async getLearningResources(params?: {
    frameworkId?: string;
    resourceType?: string;
    category?: string;
    search?: string
  }): Promise<LearningResource[]> {
    let query = db.select().from(learningResources);

    const conditions = [];

    if (params?.frameworkId) {
      conditions.push(eq(learningResources.frameworkId, params.frameworkId));
    }

    if (params?.resourceType) {
      conditions.push(eq(learningResources.resourceType, params.resourceType as any));
    }

    if (params?.category) {
      conditions.push(eq(learningResources.category, params.category));
    }

    if (params?.search) {
      conditions.push(
        or(
          like(learningResources.title, `%${params.search}%`),
          like(learningResources.description, `%${params.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(learningResources.sortOrder, learningResources.createdAt);
    }

    return await query.orderBy(learningResources.sortOrder, learningResources.createdAt);
  }

  async createLearningResource(resource: InsertLearningResource): Promise<LearningResource> {
    const [result] = await db.insert(learningResources).values(resource).returning();
    return result;
  }

  async updateLearningResource(id: string, updates: Partial<InsertLearningResource>): Promise<LearningResource> {
    const [result] = await db.update(learningResources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(learningResources.id, id))
      .returning();
    return result;
  }

  async deleteLearningResource(id: string): Promise<void> {
    await db.delete(learningResources).where(eq(learningResources.id, id));
  }

  // Learning progress operations
  async getLearningProgress(userId: string, resourceId?: string): Promise<LearningProgress[]> {
    const conditions = [eq(learningProgress.userId, userId)];

    if (resourceId) {
      conditions.push(eq(learningProgress.resourceId, resourceId));
    }

    return await db.select().from(learningProgress)
      .where(and(...conditions))
      .orderBy(desc(learningProgress.lastAccessedAt));
  }

  async upsertLearningProgress(progressData: InsertLearningProgress): Promise<LearningProgress> {
    const [result] = await db.insert(learningProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [learningProgress.userId, learningProgress.resourceId],
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getUserCompletedResources(userId: string): Promise<LearningProgress[]> {
    return await db.select().from(learningProgress)
      .where(
        and(
          eq(learningProgress.userId, userId),
          eq(learningProgress.progressPercentage, 100)
        )
      )
      .orderBy(desc(learningProgress.completedAt));
  }

  // Method to get documents by requirement ID
  async getDocumentsByRequirementId(requirementId: string): Promise<Document[]> {
    const mappings = await db.select().from(evidenceMappings)
      .where(eq(evidenceMappings.requirementId, requirementId));

    if (mappings.length === 0) {
      return [];
    }

    const documentIds = mappings.map(m => m.documentId);
    return await db.select().from(documents)
      .where(or(...documentIds.map(id => eq(documents.id, id))));
  }

  // Method to get evidence status for controls including policy evidence
  async getEvidenceStatus(userId: string, frameworkId?: string): Promise<any[]> {
    let requirements;

    if (frameworkId) {
      requirements = await db.select().from(complianceRequirements)
        .where(eq(complianceRequirements.frameworkId, frameworkId));
    } else {
      requirements = await db.select().from(complianceRequirements);
    }

    const statusPromises = requirements.map(async (requirement) => {
      const mappings = await db.select({
        id: evidenceMappings.id,
        validationStatus: evidenceMappings.validationStatus,
        documentName: documents.fileName,
        isPolicyGenerated: documents.filePath,
      })
      .from(evidenceMappings)
      .leftJoin(documents, eq(evidenceMappings.documentId, documents.id))
      .where(
        and(
          eq(evidenceMappings.requirementId, requirement.id),
          eq(evidenceMappings.userId, userId)
        )
      );

      const documentsCount = mappings.length;
      const validatedCount = mappings.filter(m => m.validationStatus === 'validated').length;
      const policyCount = mappings.filter(m => m.isPolicyGenerated?.includes('/generated-policies/')).length;

      return {
        id: requirement.id,
        requirementId: requirement.requirementId,
        title: requirement.title,
        description: requirement.description,
        category: requirement.category,
        priority: requirement.priority,
        frameworkId: requirement.frameworkId,
        evidenceCount: documentsCount,
        validatedCount: validatedCount,
        policyCount: policyCount,
        hasPolicy: policyCount > 0,
        status: documentsCount === 0 ? 'missing' :
               validatedCount === 0 ? 'pending' :
               validatedCount === documentsCount ? 'complete' : 'partial'
      };
    });

    return await Promise.all(statusPromises);
  }
}

export const storage = new DatabaseStorage();