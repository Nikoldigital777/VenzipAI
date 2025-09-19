
-- Migration: Add policy templates table
CREATE TABLE IF NOT EXISTS "policy_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"framework_id" varchar(50) NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"content_sections" jsonb NOT NULL,
	"placeholders" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_policy_templates_framework" ON "policy_templates" ("framework_id");
CREATE INDEX IF NOT EXISTS "idx_policy_templates_category" ON "policy_templates" ("category");
