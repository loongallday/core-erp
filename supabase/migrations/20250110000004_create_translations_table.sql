-- Create translations table for storing i18n translations in database

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale VARCHAR(10) NOT NULL,
  namespace VARCHAR(50) NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(locale, namespace, key)
);

-- Add indexes for performance
CREATE INDEX idx_translations_locale ON translations(locale);
CREATE INDEX idx_translations_namespace ON translations(namespace);
CREATE INDEX idx_translations_locale_namespace ON translations(locale, namespace);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read translations (public data)
CREATE POLICY "Translations are viewable by everyone"
  ON translations
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users with system:configure permission can insert/update
CREATE POLICY "Only admins can modify translations"
  ON translations
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT u.auth_user_id
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE p.code = 'system:configure'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER set_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_translations_updated_at();

-- Add comment
COMMENT ON TABLE translations IS 'Stores application translations for internationalization';

