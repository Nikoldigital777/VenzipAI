import { sql } from 'drizzle-orm';
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

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  title: varchar("title").notNull(),
  description: text("description"),
  priority: varchar("priority").notNull(), // 'low', 'medium', 'high'
  status: varchar("status").notNull().default('pending'), // 'pending', 'in_progress', 'completed'
  assignedTo: varchar("assigned_to"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Risk = typeof risks.$inferSelect;
export type InsertRisk = z.infer<typeof insertRiskSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// --- Enhanced Tasks and Risks ---
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "blocked", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "critical"]);

export const complianceTasks = pgTable("compliance_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  framework: varchar("framework", { length: 64 }).notNull(), // "SOC2" | "HIPAA" | ...
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  status: taskStatusEnum("status").default("todo").notNull(),
  dueDate: timestamp("due_date", { withTimezone: false }),
  assigneeId: varchar("assignee_id"), // reference users.id if you want a FK later
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
});

// --- Enhanced Risks (extending existing risks table) ---
export const riskSeverityEnum = pgEnum("risk_severity", ["low", "medium", "high", "critical"]);
export const riskProbabilityEnum = pgEnum("risk_probability", ["low", "medium", "high"]);
