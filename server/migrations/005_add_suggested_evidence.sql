
-- Add suggested evidence field to compliance requirements
ALTER TABLE compliance_requirements ADD COLUMN IF NOT EXISTS suggested_evidence JSONB;
