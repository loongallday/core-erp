-- Create system_config table for storing system-wide configuration

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);

-- Enable RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read system config
CREATE POLICY "System config viewable by authenticated users"
  ON system_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only users with system:configure permission can modify
CREATE POLICY "Only admins can modify system config"
  ON system_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
      AND p.code = 'system:configure'
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default system configuration
INSERT INTO system_config (key, value, description, category, is_system) VALUES
  ('SESSION_WARNING_THRESHOLDS', '[300000, 60000]'::jsonb, 'Session warning thresholds in ms', 'auth', true),
  ('ACTIVITY_DEBOUNCE_MS', '30000'::jsonb, 'Activity tracking debounce in ms', 'auth', true),
  ('SESSION_CHECK_INTERVAL_MS', '60000'::jsonb, 'Session check interval in ms', 'auth', true),
  ('MAX_AUTH_RETRIES', '3'::jsonb, 'Maximum authentication retry attempts', 'auth', true),
  ('AUTH_RETRY_BASE_DELAY_MS', '1000'::jsonb, 'Base delay for auth retries in ms', 'auth', true),
  ('AUTH_SYNC_CHANNEL', '"auth-sync"'::jsonb, 'Channel for auth synchronization', 'auth', true),
  ('RETURN_URL_KEY', '"auth_return_url"'::jsonb, 'Storage key for return URL', 'auth', true),
  ('ACTIVITY_EVENTS', '["mousemove","keydown","click","scroll","touchstart"]'::jsonb, 'Events to track for activity', 'auth', true)
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE system_config IS 'Stores system-wide configuration settings';

