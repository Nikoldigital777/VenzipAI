
-- Add policy templates table
CREATE TABLE IF NOT EXISTS "policy_templates" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "framework_id" varchar NOT NULL,
  "template_name" varchar NOT NULL,
  "template_type" varchar NOT NULL,
  "category" varchar NOT NULL,
  "title" varchar NOT NULL,
  "description" text,
  "template_content" text NOT NULL,
  "requirement_ids" jsonb,
  "priority" varchar NOT NULL DEFAULT 'medium',
  "version" varchar NOT NULL DEFAULT '1.0',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add generated policies table
CREATE TABLE IF NOT EXISTS "generated_policies" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL,
  "template_id" varchar NOT NULL,
  "user_id" varchar NOT NULL,
  "title" varchar NOT NULL,
  "policy_type" varchar NOT NULL,
  "category" varchar NOT NULL,
  "content" text NOT NULL,
  "variables" jsonb,
  "status" varchar NOT NULL DEFAULT 'draft',
  "version" varchar NOT NULL DEFAULT '1.0',
  "approved_by" varchar,
  "approved_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Foreign key constraints will be added by migration 008_fix_policy_templates.sql
-- which recreates the tables with the correct structure and constraints
