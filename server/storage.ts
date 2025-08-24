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
  auditLogs,
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
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
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
}

export const storage = new DatabaseStorage();
