
-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT TRUE;

-- First, check if companies table exists and what type the id column is
DO $$
BEGIN
  -- Check if companies table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies') THEN
    -- Create companies table with UUID id
    CREATE TABLE companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  ELSE
    -- Companies table exists, check if id is VARCHAR and convert to UUID if needed
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND column_name = 'id' 
      AND data_type = 'character varying'
    ) THEN
      -- Drop foreign key constraints only if the tables exist
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'frameworks_companies') THEN
        ALTER TABLE frameworks_companies DROP CONSTRAINT IF EXISTS frameworks_companies_company_id_fkey;
      END IF;
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_company_id_fkey;
      END IF;
      
      -- Convert companies.id from VARCHAR to UUID
      ALTER TABLE companies ALTER COLUMN id TYPE UUID USING id::UUID;
    END IF;
    
    -- Add missing columns to companies table
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS legal_entity VARCHAR(255);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS region VARCHAR(100);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS size VARCHAR(50);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_role VARCHAR(100);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS user_id UUID;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    
    -- Add user_id foreign key if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'companies_user_id_fkey'
    ) THEN
      ALTER TABLE companies ADD CONSTRAINT companies_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Handle frameworks_companies table
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'frameworks_companies') THEN
    -- Create frameworks_companies table with UUID company_id
    CREATE TABLE frameworks_companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      framework_id VARCHAR(100) NOT NULL,
      company_id UUID,
      created_at TIMESTAMP DEFAULT NOW()
    );
  ELSE
    -- Table exists, ensure company_id is UUID type
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'frameworks_companies' 
      AND column_name = 'company_id' 
      AND data_type = 'character varying'
    ) THEN
      -- Convert company_id from VARCHAR to UUID
      ALTER TABLE frameworks_companies ALTER COLUMN company_id TYPE UUID USING company_id::UUID;
    END IF;
  END IF;
  
  -- Add foreign key constraint for frameworks_companies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'frameworks_companies_company_id_fkey'
  ) THEN
    ALTER TABLE frameworks_companies 
    ADD CONSTRAINT frameworks_companies_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add company_id to tasks table and ensure it's UUID
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add foreign key constraint for tasks.company_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_company_id_fkey'
  ) THEN
    ALTER TABLE tasks 
    ADD CONSTRAINT tasks_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_companies_company_id ON frameworks_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_companies_framework_id ON frameworks_companies(framework_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
