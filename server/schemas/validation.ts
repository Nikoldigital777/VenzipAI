import { z } from 'zod';

// Common validation schemas
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).optional()
});

export const searchQuerySchema = paginationQuerySchema.extend({
  search: z.string().min(1).max(255).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['admin', 'user', 'viewer']).default('user')
});

export const updateUserSchema = createUserSchema.partial();

// Company validation schemas
export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  industry: z.string().min(1, 'Industry is required').max(100),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  contactEmail: z.string().email('Invalid email format'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  selectedFrameworks: z.array(z.string()).min(1, 'At least one framework must be selected')
});

export const updateCompanySchema = createCompanySchema.partial();

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().max(2000).optional(),
  category: z.string().min(1, 'Category is required').max(100),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['not_started', 'in_progress', 'under_review', 'completed', 'blocked']).default('not_started'),
  frameworkId: z.string().uuid('Invalid framework ID'),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().email().optional(),
  estimatedHours: z.number().int().min(1).max(1000).optional(),
  tags: z.array(z.string()).default([]),
  dependencies: z.array(z.string().uuid()).default([]),
  complianceRequirement: z.string().optional(),
  evidenceRequired: z.boolean().default(false)
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskFilterSchema = searchQuerySchema.extend({
  status: z.enum(['not_started', 'in_progress', 'under_review', 'completed', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  frameworkId: z.string().uuid().optional(),
  assignedTo: z.string().email().optional(),
  category: z.string().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional()
});

// Document validation schemas
export const documentUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB max
  frameworkId: z.string().uuid('Invalid framework ID').optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([])
});

export const documentFilterSchema = searchQuerySchema.extend({
  frameworkId: z.string().uuid().optional(),
  fileType: z.string().optional(),
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  uploadedFrom: z.string().datetime().optional(),
  uploadedTo: z.string().datetime().optional()
});

// Risk validation schemas
export const createRiskSchema = z.object({
  title: z.string().min(1, 'Risk title is required').max(255),
  description: z.string().min(1, 'Risk description is required').max(2000),
  category: z.string().min(1, 'Category is required').max(100),
  impact: z.enum(['low', 'medium', 'high']),
  likelihood: z.enum(['low', 'medium', 'high']),
  status: z.enum(['identified', 'assessing', 'mitigating', 'monitoring', 'closed']).default('identified'),
  frameworkId: z.string().uuid('Invalid framework ID').optional(),
  mitigation: z.string().max(2000).optional(),
  owner: z.string().email().optional(),
  dueDate: z.string().datetime().optional()
});

export const updateRiskSchema = createRiskSchema.partial();

export const riskFilterSchema = searchQuerySchema.extend({
  category: z.string().optional(),
  impact: z.enum(['low', 'medium', 'high']).optional(),
  likelihood: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['identified', 'assessing', 'mitigating', 'monitoring', 'closed']).optional(),
  frameworkId: z.string().uuid().optional(),
  owner: z.string().email().optional()
});

// Chat validation schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000),
  context: z.object({
    currentPage: z.string().optional(),
    frameworkId: z.string().uuid().optional(),
    taskId: z.string().uuid().optional(),
    documentId: z.string().uuid().optional()
  }).optional()
});

// Onboarding validation schemas
export const onboardingCompleteSchema = z.object({
  company: createCompanySchema,
  frameworks: z.array(z.string().uuid()).min(1, 'At least one framework must be selected'),
  aiEnabled: z.boolean().default(true)
});

export const frameworkPreviewSchema = z.object({
  frameworks: z.array(z.string().uuid()).min(1, 'At least one framework must be selected')
});

// Policy validation schemas
export const generatePolicySchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
  customVariables: z.record(z.string(), z.any()).optional()
});

export const updatePolicyStatusSchema = z.object({
  status: z.enum(['draft', 'review', 'approved', 'rejected'])
});

// Evidence mapping validation schemas
export const createEvidenceMappingSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  requirementId: z.string().uuid('Invalid requirement ID'),
  mappingType: z.enum(['direct', 'indirect', 'partial']).default('direct'),
  mappingConfidence: z.string().regex(/^0\.\d{2}$/, 'Confidence must be a decimal like 0.85'),
  qualityScore: z.string().regex(/^0\.\d{2}$/, 'Quality score must be a decimal like 0.90'),
  evidenceSnippets: z.object({
    snippets: z.array(z.string()).min(1, 'At least one evidence snippet required')
  }),
  aiAnalysis: z.object({
    summary: z.string().min(1, 'Analysis summary is required'),
    relevantSections: z.array(z.string()),
    gaps: z.array(z.string()),
    recommendations: z.array(z.string()),
    qualityFactors: z.object({
      completeness: z.number().min(0).max(1),
      clarity: z.number().min(0).max(1),
      relevance: z.number().min(0).max(1),
      specificity: z.number().min(0).max(1)
    })
  }).optional(),
  validationStatus: z.enum(['pending', 'validated', 'rejected']).default('pending')
});

// Learning resource validation schemas
export const learningResourceFilterSchema = searchQuerySchema.extend({
  frameworkId: z.string().uuid().optional(),
  resourceType: z.enum(['pdf', 'video', 'article', 'course']).optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional()
});

// Notification validation schemas
export const notificationFilterSchema = paginationQuerySchema.extend({
  filter: z.enum(['all', 'unread', 'high', 'urgent']).default('all'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.string().optional()
});

export const markNotificationSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID required'),
  action: z.enum(['read', 'unread', 'archive'])
});

// Type exports for use in route handlers
export type IdParams = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type CreateCompanyBody = z.infer<typeof createCompanySchema>;
export type UpdateCompanyBody = z.infer<typeof updateCompanySchema>;
export type CreateTaskBody = z.infer<typeof createTaskSchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;
export type TaskFilterQuery = z.infer<typeof taskFilterSchema>;
export type DocumentUploadBody = z.infer<typeof documentUploadSchema>;
export type DocumentFilterQuery = z.infer<typeof documentFilterSchema>;
export type CreateRiskBody = z.infer<typeof createRiskSchema>;
export type UpdateRiskBody = z.infer<typeof updateRiskSchema>;
export type RiskFilterQuery = z.infer<typeof riskFilterSchema>;
export type ChatMessageBody = z.infer<typeof chatMessageSchema>;
export type OnboardingCompleteBody = z.infer<typeof onboardingCompleteSchema>;
export type FrameworkPreviewBody = z.infer<typeof frameworkPreviewSchema>;
export type GeneratePolicyBody = z.infer<typeof generatePolicySchema>;
export type UpdatePolicyStatusBody = z.infer<typeof updatePolicyStatusSchema>;
export type CreateEvidenceMappingBody = z.infer<typeof createEvidenceMappingSchema>;
export type LearningResourceFilterQuery = z.infer<typeof learningResourceFilterSchema>;
export type NotificationFilterQuery = z.infer<typeof notificationFilterSchema>;
export type MarkNotificationBody = z.infer<typeof markNotificationSchema>;