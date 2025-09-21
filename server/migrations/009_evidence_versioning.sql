
-- Evidence versioning and provenance tracking
CREATE TABLE IF NOT EXISTS "evidence_versions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "document_id" varchar NOT NULL,
  "version_number" integer NOT NULL,
  "previous_version_id" varchar,
  "change_type" varchar NOT NULL, -- 'create', 'update', 'replace', 'supersede'
  "change_reason" text,
  "changed_by" varchar NOT NULL,
  "change_timestamp" timestamp DEFAULT now(),
  "file_path" varchar NOT NULL,
  "file_hash" varchar NOT NULL,
  "file_size" bigint NOT NULL,
  "metadata_changes" jsonb,
  "is_current" boolean DEFAULT true,
  "retention_until" timestamp,
  "legal_hold" boolean DEFAULT false,
  FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE,
  FOREIGN KEY ("previous_version_id") REFERENCES "evidence_versions"("id"),
  FOREIGN KEY ("changed_by") REFERENCES "users"("id")
);

-- Evidence provenance chain
CREATE TABLE IF NOT EXISTS "evidence_provenance" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "document_id" varchar NOT NULL,
  "event_type" varchar NOT NULL, -- 'created', 'uploaded', 'analyzed', 'verified', 'superseded', 'expired'
  "event_timestamp" timestamp DEFAULT now(),
  "actor_id" varchar NOT NULL, -- user or system
  "actor_type" varchar NOT NULL DEFAULT 'user', -- 'user', 'system', 'ai'
  "event_data" jsonb NOT NULL,
  "source_system" varchar,
  "chain_hash" varchar NOT NULL, -- Hash of this event + previous chain hash
  "previous_chain_hash" varchar,
  FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE
);

-- Evidence freshness monitoring
CREATE TABLE IF NOT EXISTS "evidence_freshness_policies" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "framework_id" varchar NOT NULL,
  "requirement_category" varchar NOT NULL,
  "evidence_type" varchar NOT NULL,
  "freshness_period_months" integer NOT NULL,
  "warning_period_days" integer NOT NULL DEFAULT 30,
  "auto_expire" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  FOREIGN KEY ("framework_id") REFERENCES "frameworks"("id")
);

-- Evidence freshness status tracking
CREATE TABLE IF NOT EXISTS "evidence_freshness_status" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "document_id" varchar NOT NULL,
  "policy_id" varchar NOT NULL,
  "status" varchar NOT NULL, -- 'fresh', 'warning', 'expired', 'overdue'
  "valid_until" timestamp NOT NULL,
  "warning_issued_at" timestamp,
  "last_check_at" timestamp DEFAULT now(),
  "next_check_at" timestamp NOT NULL,
  "auto_notifications_enabled" boolean DEFAULT true,
  FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE,
  FOREIGN KEY ("policy_id") REFERENCES "evidence_freshness_policies"("id")
);

-- Evidence bundles for audit packages
CREATE TABLE IF NOT EXISTS "evidence_bundles" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "bundle_name" varchar NOT NULL,
  "bundle_type" varchar NOT NULL, -- 'audit_package', 'compliance_report', 'incident_response'
  "framework_ids" jsonb NOT NULL,
  "created_by" varchar NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "bundle_hash" varchar NOT NULL,
  "status" varchar DEFAULT 'draft', -- 'draft', 'sealed', 'submitted'
  "sealed_at" timestamp,
  "sealed_by" varchar,
  "retention_period_years" integer DEFAULT 7,
  "metadata" jsonb,
  FOREIGN KEY ("created_by") REFERENCES "users"("id"),
  FOREIGN KEY ("sealed_by") REFERENCES "users"("id")
);

-- Evidence bundle contents
CREATE TABLE IF NOT EXISTS "evidence_bundle_items" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "bundle_id" varchar NOT NULL,
  "document_id" varchar NOT NULL,
  "version_id" varchar NOT NULL,
  "inclusion_reason" varchar NOT NULL,
  "added_at" timestamp DEFAULT now(),
  "added_by" varchar NOT NULL,
  "item_hash" varchar NOT NULL,
  "file_path_in_bundle" varchar NOT NULL,
  FOREIGN KEY ("bundle_id") REFERENCES "evidence_bundles"("id") ON DELETE CASCADE,
  FOREIGN KEY ("document_id") REFERENCES "documents"("id"),
  FOREIGN KEY ("version_id") REFERENCES "evidence_versions"("id"),
  FOREIGN KEY ("added_by") REFERENCES "users"("id")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_evidence_versions_document" ON "evidence_versions" ("document_id", "version_number");
CREATE INDEX IF NOT EXISTS "idx_evidence_versions_current" ON "evidence_versions" ("document_id") WHERE "is_current" = true;
CREATE INDEX IF NOT EXISTS "idx_evidence_provenance_document" ON "evidence_provenance" ("document_id", "event_timestamp");
CREATE INDEX IF NOT EXISTS "idx_evidence_freshness_status_check" ON "evidence_freshness_status" ("next_check_at") WHERE "status" IN ('fresh', 'warning');
CREATE INDEX IF NOT EXISTS "idx_evidence_bundles_status" ON "evidence_bundles" ("status", "created_at");
