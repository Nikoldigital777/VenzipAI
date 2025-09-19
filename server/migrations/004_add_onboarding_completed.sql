
-- Add onboarding completion tracking
ALTER TABLE companies ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- Update existing companies that have frameworks selected as completed
UPDATE companies 
SET onboarding_completed = true 
WHERE selected_frameworks IS NOT NULL 
  AND json_array_length(selected_frameworks) > 0
  AND name IS NOT NULL 
  AND contact_email IS NOT NULL;
