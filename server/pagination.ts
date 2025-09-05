import { z } from "zod";

// Common pagination schema for consistency across endpoints
export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Extended pagination with search and filters
export const searchPaginationSchema = paginationSchema.extend({
  search: z.string().optional(),
});

// Risk filters with pagination
export const riskFilterSchema = searchPaginationSchema.extend({
  category: z.string().optional(),
  impact: z.enum(['low', 'medium', 'high']).optional(),
  likelihood: z.enum(['low', 'medium', 'high']).optional(),
  frameworkId: z.string().optional(),
});

// Document filters with pagination
export const documentFilterSchema = searchPaginationSchema.extend({
  frameworkId: z.string().optional(),
  documentType: z.string().optional(), // maps to fileType in schema
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
});

// Notification filters with pagination
export const notificationFilterSchema = paginationSchema.extend({
  filter: z.enum(['all', 'unread', 'high', 'urgent']).default('all'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

// Learning resource filters with pagination
export const learningResourceFilterSchema = searchPaginationSchema.extend({
  frameworkId: z.string().optional(),
  resourceType: z.enum(['pdf', 'video', 'article', 'course']).optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

// Generic pagination response type
export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  };
}

// Helper function to create pagination response
export function createPaginationResponse<T>(
  items: T[],
  total: number,
  limit: number,
  offset: number
): PaginationResponse<T> {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  return {
    items,
    pagination: {
      total,
      limit,
      offset,
      hasMore: total > offset + limit,
      page,
      totalPages,
    },
  };
}

// Helper function to apply pagination to any array
export function applyPagination<T>(
  items: T[],
  limit: number,
  offset: number
): { paginatedItems: T[]; total: number } {
  const total = items.length;
  const paginatedItems = items.slice(offset, offset + limit);
  return { paginatedItems, total };
}