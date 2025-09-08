import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company profile table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  name: varchar("name").notNull(),
  industry: varchar("industry").notNull(),
  size: varchar("size").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  selectedFrameworks: text("selected_frameworks").array().notNull().default(sql`'{}'::text[]`),
  description: text("description"),
  website: varchar("website"),
  address: text("address"),
  phone: varchar("phone"),
  complianceContact: varchar("compliance_contact"),
  securityContact: varchar("security_contact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance frameworks table
export const frameworks = pgTable("frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description").notNull(),
  complexity: varchar("complexity").notNull(), // 'low', 'medium', 'high'
  estimatedTimeMonths: integer("estimated_time_months").notNull(),
  totalControls: integer("total_controls").notNull(),
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User framework progress table
export const frameworkProgress = pgTable("framework_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  frameworkId: varchar("framework_id").notNull().references(() => frameworks.id),
  completedControls: integer("completed_controls").notNull().default(0),
  totalControls: integer("total_controls").notNull(),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task enums
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'critical']);
export const taskStatusEnum = pgEnum('task_status', ['not_started', 'in_progress', 'under_review', 'completed', 'blocked']);
export const taskCategoryEnum = pgEnum('task_category', ['policy', 'procedure', 'training', 'audit', 'risk_assessment', 'documentation', 'technical', 'other']);

// Enhanced tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),

  // Basic task info
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),

  // Task classification
  category: taskCategoryEnum("category").notNull().default('other'),
  priority: taskPriorityEnum("priority").notNull().default('medium'),
  status: taskStatusEnum("status").notNull().default('not_started'),

  // Assignment and ownership
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),

  // Legacy userId field for backward compatibility
  userId: varchar("user_id").notNull().references(() => users.id),

  // Dates and progress
  dueDate: timestamp("due_date"),
  startDate: timestamp("start_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  progressPercentage: integer("progress_percentage").default(0),

  // Compliance specific
  complianceRequirement: text("compliance_requirement"),
  evidenceRequired: boolean("evidence_required").default(false),
  blockedReason: text("blocked_reason"),

  // Legacy assignedTo field for backward compatibility
  assignedTo: varchar("assigned_to"),

  // Metadata
  tags: text("tags"), // JSON array as text
  dependencies: text("dependencies"), // JSON array of task IDs

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Task comments for collaboration
export const taskComments = pgTable("task_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Task attachments
export const taskAttachments = pgTable("task_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: varchar("file_path").notNull(),
  status: varchar("status").notNull().default('pending'), // 'pending', 'verified', 'rejected'
  analysisResult: jsonb("analysis_result"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  extractedText: text("extracted_text"),
});

// Risks table
export const risks = pgTable("risks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  impact: varchar("impact").notNull(), // 'low', 'medium', 'high'
  likelihood: varchar("likelihood").notNull(), // 'low', 'medium', 'high'
  riskScore: decimal("risk_score", { precision: 3, scale: 1 }).notNull(),
  mitigation: text("mitigation"),
  owner: varchar("owner"),
  dueDate: timestamp("due_date"),
  status: varchar("status").notNull().default('open'), // 'open', 'mitigated', 'closed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table for Claude interactions
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  messageType: varchar("message_type").notNull(), // 'user', 'assistant'
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor assessments table
export const vendorAssessments = pgTable("vendor_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  vendorName: varchar("vendor_name").notNull(),
  vendorDescription: text("vendor_description"),
  services: text("services").notNull(), // What services they provide
  dataProcessing: text("data_processing"), // What data they process
  riskLevel: varchar("risk_level").notNull(), // 'low', 'medium', 'high', 'critical'
  assessmentStatus: varchar("assessment_status").notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'approved', 'rejected'
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  assessmentNotes: text("assessment_notes"),
  complianceRequirements: text("compliance_requirements").array().default(sql`'{}'::text[]`),
  documentationStatus: varchar("documentation_status").default('incomplete'), // 'incomplete', 'pending_review', 'complete'
  assignedTo: varchar("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // 'info', 'warning', 'error', 'success', 'task_due', 'risk_alert', 'document_expiry'
  priority: varchar("priority").notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: varchar("action_url"), // URL to navigate to when clicked
  relatedEntityType: varchar("related_entity_type"), // 'task', 'risk', 'document', 'vendor'
  relatedEntityId: varchar("related_entity_id"),
  expiresAt: timestamp("expires_at"), // Auto-delete after this date
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Risk score history table for trend analysis
export const riskScoreHistory = pgTable("risk_score_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  overallRiskScore: decimal("overall_risk_score", { precision: 5, scale: 2 }).notNull(),
  highRisks: integer("high_risks").notNull().default(0),
  mediumRisks: integer("medium_risks").notNull().default(0),
  lowRisks: integer("low_risks").notNull().default(0),
  mitigatedRisks: integer("mitigated_risks").notNull().default(0),
  totalTasks: integer("total_tasks").notNull().default(0),
  completedTasks: integer("completed_tasks").notNull().default(0),
  calculationFactors: jsonb("calculation_factors"), // Store factors that influenced the score
  triggeredBy: varchar("triggered_by"), // 'task_completion', 'risk_update', 'manual_calculation'
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance requirements table for framework-specific requirements
export const complianceRequirements = pgTable("compliance_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkId: varchar("framework_id").notNull().references(() => frameworks.id),
  requirementId: varchar("requirement_id").notNull(), // e.g., "ISO27001-A.5.1.1"
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // e.g., "access_control", "data_protection"
  priority: varchar("priority").notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  evidenceTypes: text("evidence_types").array().default(sql`'{}'::text[]`), // Expected evidence types
  controlObjective: text("control_objective"),
  implementationGuidance: text("implementation_guidance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Evidence mappings table for linking documents to compliance requirements
export const evidenceMappings = pgTable("evidence_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  requirementId: varchar("requirement_id").notNull().references(() => complianceRequirements.id),
  mappingConfidence: decimal("mapping_confidence", { precision: 3, scale: 2 }).notNull(), // 0.0 to 1.0
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }).notNull(), // 0.0 to 1.0
  mappingType: varchar("mapping_type").notNull(), // 'direct', 'partial', 'supporting', 'cross_reference'
  evidenceSnippets: jsonb("evidence_snippets"), // Relevant text snippets from document
  aiAnalysis: jsonb("ai_analysis"), // AI analysis results
  validationStatus: varchar("validation_status").notNull().default('pending'), // 'pending', 'validated', 'rejected', 'needs_review'
  validatedBy: varchar("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Evidence gaps table for tracking compliance gaps
export const evidenceGaps = pgTable("evidence_gaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  requirementId: varchar("requirement_id").notNull().references(() => complianceRequirements.id),
  gapType: varchar("gap_type").notNull(), // 'missing_evidence', 'insufficient_evidence', 'outdated_evidence', 'poor_quality'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  description: text("description").notNull(),
  recommendedActions: text("recommended_actions").array().default(sql`'{}'::text[]`),
  estimatedEffort: varchar("estimated_effort"), // 'low', 'medium', 'high'
  dueDate: timestamp("due_date"),
  status: varchar("status").notNull().default('open'), // 'open', 'in_progress', 'resolved', 'accepted_risk'
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cross-framework mappings for requirements that apply across multiple frameworks
export const crossFrameworkMappings = pgTable("cross_framework_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primaryRequirementId: varchar("primary_requirement_id").notNull().references(() => complianceRequirements.id),
  relatedRequirementId: varchar("related_requirement_id").notNull().references(() => complianceRequirements.id),
  mappingType: varchar("mapping_type").notNull(), // 'equivalent', 'similar', 'related', 'supporting'
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(), // 0.0 to 1.0
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Can be null for system actions
  action: varchar("action").notNull(), // 'create', 'update', 'delete', 'login', 'logout', 'export', 'import'
  entityType: varchar("entity_type").notNull(), // 'company', 'task', 'risk', 'document', 'vendor', 'user'
  entityId: varchar("entity_id"), // ID of the affected entity
  changes: jsonb("changes"), // Store what changed (before/after values)
  metadata: jsonb("metadata"), // Additional context (IP address, user agent, etc.)
  description: text("description"), // Human-readable description of the action
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  success: boolean("success").notNull().default(true), // Whether the action succeeded
  errorMessage: text("error_message"), // If action failed, store error details
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFrameworkProgressSchema = createInsertSchema(frameworkProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertRiskSchema = createInsertSchema(risks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertVendorAssessmentSchema = createInsertSchema(vendorAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export const insertRiskScoreHistorySchema = createInsertSchema(riskScoreHistory).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceRequirementSchema = createInsertSchema(complianceRequirements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEvidenceMappingSchema = createInsertSchema(evidenceMappings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  validatedAt: true,
});

export const insertEvidenceGapSchema = createInsertSchema(evidenceGaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertCrossFrameworkMappingSchema = createInsertSchema(crossFrameworkMappings).omit({
  id: true,
  createdAt: true,
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
});

export const insertTaskAttachmentSchema = createInsertSchema(taskAttachments).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Framework = typeof frameworks.$inferSelect;
export type FrameworkProgress = typeof frameworkProgress.$inferSelect;
export type InsertFrameworkProgress = z.infer<typeof insertFrameworkProgressSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;
export type TaskAttachment = typeof taskAttachments.$inferSelect;
export type InsertTaskAttachment = z.infer<typeof insertTaskAttachmentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Risk = typeof risks.$inferSelect;
export type InsertRisk = z.infer<typeof insertRiskSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type VendorAssessment = typeof vendorAssessments.$inferSelect;
export type InsertVendorAssessment = z.infer<typeof insertVendorAssessmentSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type RiskScoreHistory = typeof riskScoreHistory.$inferSelect;
export type InsertRiskScoreHistory = z.infer<typeof insertRiskScoreHistorySchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type ComplianceRequirement = typeof complianceRequirements.$inferSelect;
export type InsertComplianceRequirement = z.infer<typeof insertComplianceRequirementSchema>;
export type EvidenceMapping = typeof evidenceMappings.$inferSelect;
export type InsertEvidenceMapping = z.infer<typeof insertEvidenceMappingSchema>;
export type EvidenceGap = typeof evidenceGaps.$inferSelect;
export type InsertEvidenceGap = z.infer<typeof insertEvidenceGapSchema>;
export type CrossFrameworkMapping = typeof crossFrameworkMappings.$inferSelect;
export type InsertCrossFrameworkMapping = z.infer<typeof insertCrossFrameworkMappingSchema>;

// --- Legacy compliance tasks (keeping for backward compatibility) ---
export const complianceTasks = pgTable("compliance_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  framework: varchar("framework", { length: 64 }).notNull(), // "SOC2" | "HIPAA" | ...
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: varchar("priority").default("medium").notNull(),
  status: varchar("status").default("todo").notNull(),
  dueDate: timestamp("due_date", { withTimezone: false }),
  assigneeId: varchar("assignee_id"), // reference users.id if you want a FK later
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
});

// --- Enhanced Risks (extending existing risks table) ---
export const riskSeverityEnum = pgEnum("risk_severity", ["low", "medium", "high", "critical"]);
export const riskProbabilityEnum = pgEnum("risk_probability", ["low", "medium", "high"]);

// Relations for enhanced task tables (using Drizzle relations for better type safety)

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id]
  }),
  framework: one(frameworks, {
    fields: [tasks.frameworkId],
    references: [frameworks.id]
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id]
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id]
  }),
  // Legacy user relation for backward compatibility
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  }),
  comments: many(taskComments),
  attachments: many(taskAttachments)
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id]
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id]
  })
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id]
  }),
  document: one(documents, {
    fields: [taskAttachments.documentId],
    references: [documents.id]
  })
}));

// Learning resources table for Self-Learning Hub
export const learningResourcesEnum = pgEnum('resource_type', ['pdf', 'video', 'article', 'course']);
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);

export const learningResources = pgTable("learning_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  resourceType: learningResourcesEnum("resource_type").notNull(),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  category: varchar("category").notNull(), // e.g., "access_control", "data_protection"
  difficulty: difficultyEnum("difficulty").notNull().default('beginner'),
  duration: integer("duration"), // duration in minutes
  resourceUrl: varchar("resource_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  isPublic: boolean("is_public").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking for learning resources
export const learningProgress = pgTable("learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  resourceId: varchar("resource_id").notNull().references(() => learningResources.id),
  progressPercentage: integer("progress_percentage").notNull().default(0),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  totalTimeSpent: integer("total_time_spent").default(0), // in minutes
  bookmarkPosition: integer("bookmark_position"), // for videos/courses
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for learning resources
export const insertLearningResourceSchema = createInsertSchema(learningResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningProgressSchema = createInsertSchema(learningProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Types for learning resources
export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;