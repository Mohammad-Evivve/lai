-- Migration: Create email_ops_log table for observability
CREATE TABLE IF NOT EXISTS email_ops_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_type TEXT NOT NULL, -- internal_alert, participant_report, team_onboarding, resend_report
    recipient TEXT NOT NULL,
    report_id UUID,
    team_id TEXT, -- team IDs are strings in some contexts
    subject TEXT,
    generated_link TEXT,
    provider_message_id TEXT,
    provider_response JSONB,
    status TEXT NOT NULL, -- 'attempted', 'accepted_by_provider', 'failed_at_send', 'delivery_unknown'
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Index for traceability
CREATE INDEX IF NOT EXISTS idx_email_ops_recipient ON email_ops_log(recipient);
CREATE INDEX IF NOT EXISTS idx_email_ops_report ON email_ops_log(report_id);
