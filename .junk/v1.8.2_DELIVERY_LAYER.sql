-- Delivery Layer Logging
-- Migration v1.8.2

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    recipient_email TEXT NOT NULL,
    template_name TEXT NOT NULL,
    delivery_status TEXT NOT NULL CHECK (delivery_status IN ('Stored', 'Enqueued', 'Sent', 'Failed')),
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for service_role" ON email_logs;
    CREATE POLICY "Enable all for service_role" ON email_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
END
$$;
