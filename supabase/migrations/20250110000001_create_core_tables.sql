-- Core ERP Database Schema
-- Migration: Create all core tables with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view users
CREATE POLICY "Users are viewable by authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Service role can insert (via Edge Functions)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- =====================================================
-- 2. ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles are viewable by authenticated users"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage roles"
  ON roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for permissions
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissions are viewable by authenticated users"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage permissions"
  ON permissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. USER_ROLES TABLE (Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- RLS Policies for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User roles are viewable by authenticated users"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage user roles"
  ON user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. ROLE_PERMISSIONS TABLE (Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- RLS Policies for role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role permissions are viewable by authenticated users"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage role permissions"
  ON role_permissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. AUDIT_LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- RLS Policies for audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs are viewable by authenticated users"
  ON audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert audit logs"
  ON audit_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Core ERP tables created successfully!';
END $$;

