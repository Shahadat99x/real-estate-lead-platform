-- Add new columns for leads inbox features
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'NEW',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

-- Add checking constraint for status
ALTER TABLE leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('NEW', 'CONTACTED', 'CLOSED', 'ARCHIVED'));
