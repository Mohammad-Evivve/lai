-- Migration: Update email_ops_log for Signal Classification
ALTER TABLE email_ops_log 
ADD COLUMN IF NOT EXISTS event_category TEXT,
ADD COLUMN IF NOT EXISTS event_type TEXT;

-- Update existing rows to default category if possible (optional)
-- UPDATE email_ops_log SET event_category = 'tech' WHERE event_category IS NULL;

-- Ensure indexes for the new signal layer
CREATE INDEX IF NOT EXISTS idx_email_ops_category ON email_ops_log(event_category);
CREATE INDEX IF NOT EXISTS idx_email_ops_type ON email_ops_log(event_type);
