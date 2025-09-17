
-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT TRUE;

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  legal_entity VARCHAR(255),
  industry VARCHAR(100),
  region VARCHAR(100),
  size VARCHAR(50),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_role VARCHAR(100),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create frameworks_companies junction table
CREATE TABLE IF NOT EXISTS frameworks_companies (
  id UUID PRIMARY KEY,
  framework_id VARCHAR(100) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add company_id to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_companies_company_id ON frameworks_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_companies_framework_id ON frameworks_companies(framework_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
