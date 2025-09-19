
-- Add suggested evidence field to compliance requirements
ALTER TABLE compliance_requirements ADD COLUMN suggested_evidence JSONB;
