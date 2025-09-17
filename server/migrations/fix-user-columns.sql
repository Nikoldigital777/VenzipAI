
-- Fix user table column names to match schema
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Copy data if old columns exist
UPDATE users 
SET 
  full_name = COALESCE(full_name, ''),
  onboarding_completed = COALESCE(onboarding_completed, false),
  ai_enabled = COALESCE(ai_enabled, true),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());
