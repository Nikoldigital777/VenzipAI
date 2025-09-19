
-- Drop existing table if it exists with wrong structure
DROP TABLE IF EXISTS "policy_templates" CASCADE;
DROP TABLE IF EXISTS "generated_policies" CASCADE;

-- Add policy templates table with correct structure
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

-- Add foreign key constraints
ALTER TABLE "policy_templates" ADD CONSTRAINT "policy_templates_framework_id_frameworks_id_fk" 
  FOREIGN KEY ("framework_id") REFERENCES "frameworks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "generated_policies" ADD CONSTRAINT "generated_policies_company_id_companies_id_fk" 
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "generated_policies" ADD CONSTRAINT "generated_policies_template_id_policy_templates_id_fk" 
  FOREIGN KEY ("template_id") REFERENCES "policy_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "generated_policies" ADD CONSTRAINT "generated_policies_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "generated_policies" ADD CONSTRAINT "generated_policies_approved_by_users_id_fk" 
  FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
