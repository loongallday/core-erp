/**
 * Core ERP Plugin Template Generator - Database Templates
 * 
 * This module contains templates for database migrations and seed data.
 * SQL templates follow Core ERP patterns with RLS, indexes, and proper constraints.
 */

import { TemplateContext } from '../types.js'

/**
 * Generates database migration SQL
 * 
 * Creates a complete migration with:
 * - Table creation with proper columns and constraints
 * - Row Level Security (RLS) policies
 * - Indexes for performance
 * - Timestamps (created_at, updated_at)
 * - UUID primary key
 * 
 * @param ctx - Template context
 * @returns SQL migration content
 */
export function migrationTemplate(ctx: TemplateContext): string {
  return `-- ${ctx.pluginName} - Initial Migration
-- Creates the main ${ctx.resourceNameLowerPlural} table and related objects
-- Generated: ${ctx.date}

-- ============================================================================
-- TABLE: ${ctx.pluginId}_${ctx.resourceNameLowerPlural}
-- ============================================================================

CREATE TABLE IF NOT EXISTS ${ctx.pluginId}_${ctx.resourceNameLowerPlural} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Soft delete support (optional)
  deleted_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for searching by name
CREATE INDEX IF NOT EXISTS idx_${ctx.pluginId}_${ctx.resourceNameLowerPlural}_name 
  ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural} (name);

-- Index for filtering active items
CREATE INDEX IF NOT EXISTS idx_${ctx.pluginId}_${ctx.resourceNameLowerPlural}_active 
  ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural} (is_active) 
  WHERE is_active = true;

-- Index for created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_${ctx.pluginId}_${ctx.resourceNameLowerPlural}_created 
  ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural} (created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_${ctx.pluginId}_${ctx.resourceNameLowerPlural}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_${ctx.pluginId}_${ctx.resourceNameLowerPlural}_updated_at
  BEFORE UPDATE ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural}
  FOR EACH ROW
  EXECUTE FUNCTION update_${ctx.pluginId}_${ctx.resourceNameLowerPlural}_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE ${ctx.pluginId}_${ctx.resourceNameLowerPlural} ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view ${ctx.resourceNameLowerPlural} if they have the view permission
CREATE POLICY "${ctx.pluginId}_${ctx.resourceNameLowerPlural}_select_policy"
  ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural}
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    -- Add permission check here if needed
    -- For example: auth.uid() IN (SELECT user_id FROM user_permissions WHERE permission = '${ctx.pluginId}:view')
  );

-- Policy: Users can insert ${ctx.resourceNameLowerPlural} if they have the create permission
CREATE POLICY "${ctx.pluginId}_${ctx.resourceNameLowerPlural}_insert_policy"
  ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural}
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    -- Add permission check here if needed
  );

-- Policy: Users can update ${ctx.resourceNameLowerPlural} if they have the edit permission
CREATE POLICY "${ctx.pluginId}_${ctx.resourceNameLowerPlural}_update_policy"
  ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural}
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    -- Add permission check here if needed
  );

-- Policy: Users can delete ${ctx.resourceNameLowerPlural} if they have the delete permission
CREATE POLICY "${ctx.pluginId}_${ctx.resourceNameLowerPlural}_delete_policy"
  ON ${ctx.pluginId}_${ctx.resourceNameLowerPlural}
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    -- Add permission check here if needed
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ${ctx.pluginId}_${ctx.resourceNameLowerPlural} IS '${ctx.description}';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.id IS 'Unique identifier';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.name IS '${ctx.resourceName} name (2-100 characters)';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.description IS 'Optional description (max 500 characters)';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.updated_at IS 'Timestamp when record was last updated';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.created_by IS 'User who created the record';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN ${ctx.pluginId}_${ctx.resourceNameLowerPlural}.is_active IS 'Whether the record is active (soft delete support)';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Insert plugin permissions into the permissions table
-- Note: This assumes your Core ERP has a permissions table
-- Adjust if your schema is different

INSERT INTO permissions (code, name, description, category)
VALUES
  ('${ctx.pluginId}:view', 'View ${ctx.resourceNamePlural}', 'Can view ${ctx.resourceNameLowerPlural}', '${ctx.pluginId}'),
  ('${ctx.pluginId}:create', 'Create ${ctx.resourceNamePlural}', 'Can create new ${ctx.resourceNameLowerPlural}', '${ctx.pluginId}'),
  ('${ctx.pluginId}:edit', 'Edit ${ctx.resourceNamePlural}', 'Can modify ${ctx.resourceNameLowerPlural}', '${ctx.pluginId}'),
  ('${ctx.pluginId}:delete', 'Delete ${ctx.resourceNamePlural}', 'Can delete ${ctx.resourceNameLowerPlural}', '${ctx.pluginId}')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- MIGRATION ROLLBACK
-- ============================================================================
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS ${ctx.pluginId}_${ctx.resourceNameLowerPlural} CASCADE;
-- DELETE FROM permissions WHERE category = '${ctx.pluginId}';
`
}

/**
 * Generates seed data SQL
 * 
 * Creates sample data for testing and development:
 * - 2-3 sample records
 * - Realistic data
 * - Proper timestamps
 * 
 * @param ctx - Template context
 * @returns SQL seed data content
 */
export function seedTemplate(ctx: TemplateContext): string {
  return `-- ${ctx.pluginName} - Seed Data
-- Sample data for testing and development
-- Generated: ${ctx.date}

-- ============================================================================
-- SAMPLE ${ctx.resourceNamePlural.toUpperCase()}
-- ============================================================================

-- Note: This seed data is for development/testing only
-- Remove or modify for production deployment

INSERT INTO ${ctx.pluginId}_${ctx.resourceNameLowerPlural} (name, description, is_active)
VALUES
  (
    'Sample ${ctx.resourceName} 1',
    'This is a sample ${ctx.resourceNameLower} for testing purposes',
    true
  ),
  (
    'Sample ${ctx.resourceName} 2',
    'Another example ${ctx.resourceNameLower} with a longer description to demonstrate how text fields work in the interface',
    true
  ),
  (
    'Sample ${ctx.resourceName} 3',
    NULL,  -- No description
    true
  ),
  (
    'Inactive ${ctx.resourceName}',
    'This ${ctx.resourceNameLower} is inactive for testing inactive/soft-delete scenarios',
    false
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the seed data was inserted
DO $$
DECLARE
  record_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO record_count 
  FROM ${ctx.pluginId}_${ctx.resourceNameLowerPlural};
  
  RAISE NOTICE 'Inserted % ${ctx.resourceNameLowerPlural}', record_count;
END $$;
`
}

