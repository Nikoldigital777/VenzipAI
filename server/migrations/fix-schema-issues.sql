
-- Fix tasks table schema
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS framework_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS created_by_id UUID;

-- Add foreign key constraint for created_by_id
ALTER TABLE tasks 
ADD CONSTRAINT IF NOT EXISTS fk_tasks_created_by 
FOREIGN KEY (created_by_id) REFERENCES users(id);

-- Migrate data from framework to framework_id if framework column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='framework') THEN
    UPDATE tasks SET framework_id = framework WHERE framework IS NOT NULL AND framework_id IS NULL;
  END IF;
END $$;

-- Fix companies table schema
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS legal_entity VARCHAR(255),
ADD COLUMN IF NOT EXISTS selected_frameworks TEXT[];

-- Add missing columns to tasks if they don't exist
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS dependencies TEXT[],
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_priority_score DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS ai_next_action TEXT,
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP;
