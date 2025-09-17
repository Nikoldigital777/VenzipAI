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
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Framework,
  type FrameworkProgress,
  type InsertFrameworkProgress,
  type Task,
  type InsertTask,
  type TaskComment,
  type InsertTaskComment,
  type TaskAttachment,
  type InsertTaskAttachment,
  type Document,
  type InsertDocument,
  type Risk,
  type InsertRisk,
  type ChatMessage,
  type InsertChatMessage,
  type VendorAssessment,
  type InsertVendorAssessment,
  type Notification,
  type InsertNotification,
  type RiskScoreHistory,
  type InsertRiskScoreHistory,
  type AuditLog,
  type InsertAuditLog,
  type ComplianceRequirement,
  type InsertComplianceRequirement,
  type EvidenceMapping,
  type InsertEvidenceMapping,
  type EvidenceGap,
  type InsertEvidenceGap,
  type CrossFrameworkMapping,
  type InsertCrossFrameworkMapping,
  type LearningResource,
  type InsertLearningResource,
  type LearningProgress,
  type InsertLearningProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
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
    const [progress] = await db
      .insert(frameworkProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [frameworkProgress.userId, frameworkProgress.frameworkId],
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
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

  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [newAuditLog] = await db.insert(auditLogs).values(auditLog).returning();
    return newAuditLog;
  }

  // Evidence mapping operations
  async createEvidenceMapping(mapping: InsertEvidenceMapping): Promise<EvidenceMapping> {
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

    return await db.select().from(evidenceMappings).where(and(...conditions));
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
    const [result] = await db.insert(complianceRequirements).values(requirement).returning();
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
      conditions.push(eq(learningResources.resourceType, params.resourceType));
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
      query = query.where(and(...conditions));
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
}

export const storage = new DatabaseStorage();