-- Teams Integration Tables Migration
-- Created: 2025-05-28
-- Purpose: Create tables for Microsoft Teams integration

-- Teams Connections Table
CREATE TABLE IF NOT EXISTS public.teams_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    description TEXT,
    webhook_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
    connection_token VARCHAR(500),
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ
);

-- Teams Notifications Table
CREATE TABLE IF NOT EXISTS public.teams_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID REFERENCES public.teams_connections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'deployment', 'pipeline')),
    channel_name VARCHAR(100),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    teams_message_id VARCHAR(255),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Approvals Table
CREATE TABLE IF NOT EXISTS public.teams_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID REFERENCES public.teams_connections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'deployment', 'access', 'configuration', 'emergency')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    requested_by VARCHAR(255),
    approver VARCHAR(255),
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    teams_card_id VARCHAR(255),
    adaptive_card JSONB,
    approval_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_connections_status ON public.teams_connections(status);
CREATE INDEX IF NOT EXISTS idx_teams_connections_organization ON public.teams_connections(organization_name);
CREATE INDEX IF NOT EXISTS idx_teams_notifications_connection_id ON public.teams_notifications(connection_id);
CREATE INDEX IF NOT EXISTS idx_teams_notifications_type ON public.teams_notifications(type);
CREATE INDEX IF NOT EXISTS idx_teams_notifications_sent_at ON public.teams_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_teams_approvals_connection_id ON public.teams_approvals(connection_id);
CREATE INDEX IF NOT EXISTS idx_teams_approvals_status ON public.teams_approvals(status);
CREATE INDEX IF NOT EXISTS idx_teams_approvals_created_at ON public.teams_approvals(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.teams_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams_approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for now)
CREATE POLICY "Enable read access for all users" ON public.teams_connections FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.teams_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.teams_connections FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.teams_notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.teams_notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.teams_approvals FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.teams_approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.teams_approvals FOR UPDATE USING (true);

-- Insert sample data for testing
INSERT INTO public.teams_connections (organization_name, admin_email, description, status, webhook_url) VALUES
('Acme Corporation', 'admin@acme.com', 'Primary Teams workspace for Acme Corp', 'active', 'https://outlook.office.com/webhook/xxx'),
('TechStart Inc', 'it@techstart.com', 'Development team Teams integration', 'pending', NULL),
('Global Solutions', 'teams@globalsol.com', 'Enterprise Teams setup', 'approved', 'https://outlook.office.com/webhook/yyy');

-- Insert sample notifications
INSERT INTO public.teams_notifications (connection_id, title, message, type, channel_name, status) 
SELECT 
    id,
    'Pipeline Success',
    'Deployment to production completed successfully',
    'success',
    'devops-alerts',
    'sent'
FROM public.teams_connections LIMIT 1;

-- Insert sample approvals
INSERT INTO public.teams_approvals (connection_id, title, description, type, requested_by, status)
SELECT 
    id,
    'Production Deployment Approval',
    'Approve deployment of v2.1.0 to production environment',
    'deployment',
    'DevOps Team',
    'pending'
FROM public.teams_connections LIMIT 1;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_teams_connections_updated_at
    BEFORE UPDATE ON public.teams_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_approvals_updated_at
    BEFORE UPDATE ON public.teams_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.teams_notifications 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.teams_connections TO anon, authenticated;
GRANT ALL ON TABLE public.teams_notifications TO anon, authenticated;
GRANT ALL ON TABLE public.teams_approvals TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 