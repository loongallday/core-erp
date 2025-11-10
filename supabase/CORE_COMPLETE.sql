-- ============================================================================
-- CORE ERP - COMPLETE DATABASE SETUP
-- ============================================================================
-- This is a COMPLETE, SELF-CONTAINED setup script for Core ERP
-- Copy and paste this ENTIRE file into Supabase SQL Editor to set up Core ERP
-- 
-- What this script does:
-- 1. Creates 7 core tables (users, roles, permissions, user_roles, role_permissions, audit_log, translations)
-- 2. Sets up Row Level Security (RLS) policies
-- 3. Creates indexes for performance
-- 4. Adds functions and triggers
-- 5. Seeds 3 default roles (Superadmin, Admin, User)
-- 6. Seeds 13 default permissions
-- 7. Assigns permissions to roles
-- 8. Adds localization support (locale, timezone columns)
-- 9. Creates translations table
-- 10. Seeds default translations (EN + TH)
-- 
-- Run this ONCE when setting up a new Core ERP deployment
-- This replaces running the 5 separate migration files
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: CORE TABLES
-- ============================================================================

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
  locale VARCHAR(10) DEFAULT 'en' NOT NULL,
  timezone VARCHAR(100) DEFAULT 'Asia/Bangkok' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT users_locale_check CHECK (locale IN ('en', 'th'))
);

CREATE INDEX IF NOT EXISTS idx_users_locale ON users(locale);

COMMENT ON COLUMN users.locale IS 'User preferred language (en=English, th=Thai)';
COMMENT ON COLUMN users.timezone IS 'User timezone for date/time formatting';

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

-- =====================================================
-- 4. USER_ROLES TABLE (Many-to-Many Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- =====================================================
-- 5. ROLE_PERMISSIONS TABLE (Many-to-Many Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- =====================================================
-- 6. AUDIT_LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- =====================================================
-- 7. TRANSLATIONS TABLE (for i18n)
-- =====================================================
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

CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);
CREATE INDEX IF NOT EXISTS idx_translations_namespace ON translations(namespace);
CREATE INDEX IF NOT EXISTS idx_translations_locale_namespace ON translations(locale, namespace);

COMMENT ON TABLE translations IS 'Stores application translations for internationalization';

-- ============================================================================
-- PART 2: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Roles table RLS
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

-- Permissions table RLS
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

-- User_roles table RLS
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

-- Role_permissions table RLS
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

-- Audit_log table RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs are viewable by authenticated users"
  ON audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert audit logs"
  ON audit_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Translations table RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Translations are viewable by everyone"
  ON translations FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify translations"
  ON translations FOR ALL
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

-- ============================================================================
-- PART 4: SEED DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (code, name, description, level, is_system, is_active) VALUES
  ('SUPERADMIN', 'Super Administrator', 'Full system access with all permissions. Cannot be deleted.', 100, true, true),
  ('ADMIN', 'Administrator', 'Administrative access to manage users and system settings.', 50, true, true),
  ('USER', 'Standard User', 'Basic user access with limited permissions.', 10, true, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PART 5: SEED DEFAULT PERMISSIONS
-- ============================================================================

-- Users Category
INSERT INTO permissions (code, name, description, category) VALUES
  ('users:view', 'View Users', 'Can view user list and profiles', 'users'),
  ('users:create', 'Create Users', 'Can create new users', 'users'),
  ('users:edit', 'Edit Users', 'Can edit user information', 'users'),
  ('users:delete', 'Delete Users', 'Can delete users', 'users'),
  ('users:manage_roles', 'Manage User Roles', 'Can assign and revoke roles from users', 'users')
ON CONFLICT (code) DO NOTHING;

-- Roles Category
INSERT INTO permissions (code, name, description, category) VALUES
  ('roles:view', 'View Roles', 'Can view roles list', 'roles'),
  ('roles:create', 'Create Roles', 'Can create new roles', 'roles'),
  ('roles:edit', 'Edit Roles', 'Can edit role information', 'roles'),
  ('roles:delete', 'Delete Roles', 'Can delete custom roles', 'roles')
ON CONFLICT (code) DO NOTHING;

-- Permissions Category
INSERT INTO permissions (code, name, description, category) VALUES
  ('permissions:view', 'View Permissions', 'Can view permissions list', 'permissions'),
  ('permissions:assign', 'Assign Permissions', 'Can assign permissions to roles', 'permissions')
ON CONFLICT (code) DO NOTHING;

-- System Category
INSERT INTO permissions (code, name, description, category) VALUES
  ('system:configure', 'Configure System', 'Can configure system settings', 'system'),
  ('system:audit', 'View Audit Logs', 'Can view audit logs and system activity', 'system')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PART 6: ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- SUPERADMIN gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPERADMIN'
ON CONFLICT DO NOTHING;

-- ADMIN gets most permissions (except some system-level ones)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'users:view', 'users:create', 'users:edit', 'users:manage_roles',
  'roles:view', 'roles:create', 'roles:edit',
  'permissions:view',
  'system:audit'
)
WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

-- USER gets basic read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'users:view',
  'roles:view',
  'permissions:view'
)
WHERE r.code = 'USER'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 7: SEED DEFAULT TRANSLATIONS
-- ============================================================================

-- English - Common
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'common', 'app_name', 'Core ERP'),
('en', 'common', 'navigation.dashboard', 'Dashboard'),
('en', 'common', 'navigation.users', 'Users'),
('en', 'common', 'navigation.roles', 'Roles'),
('en', 'common', 'navigation.permissions', 'Permissions'),
('en', 'common', 'navigation.settings', 'Settings'),
('en', 'common', 'actions.create', 'Create'),
('en', 'common', 'actions.edit', 'Edit'),
('en', 'common', 'actions.delete', 'Delete'),
('en', 'common', 'actions.save', 'Save'),
('en', 'common', 'actions.cancel', 'Cancel'),
('en', 'common', 'actions.confirm', 'Confirm'),
('en', 'common', 'actions.close', 'Close'),
('en', 'common', 'actions.back', 'Back'),
('en', 'common', 'actions.next', 'Next'),
('en', 'common', 'actions.search', 'Search'),
('en', 'common', 'actions.filter', 'Filter'),
('en', 'common', 'actions.view', 'View'),
('en', 'common', 'actions.add', 'Add'),
('en', 'common', 'status.active', 'Active'),
('en', 'common', 'status.inactive', 'Inactive'),
('en', 'common', 'status.loading', 'Loading...'),
('en', 'common', 'status.success', 'Success'),
('en', 'common', 'status.error', 'Error'),
('en', 'common', 'messages.save_success', 'Saved successfully'),
('en', 'common', 'messages.save_error', 'Failed to save'),
('en', 'common', 'messages.no_data', 'No data available')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- English - Auth
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'auth', 'login.title', 'Sign In'),
('en', 'auth', 'login.subtitle', 'Welcome to Core ERP'),
('en', 'auth', 'login.email_label', 'Email Address'),
('en', 'auth', 'login.email_placeholder', 'Enter your email'),
('en', 'auth', 'login.password_label', 'Password'),
('en', 'auth', 'login.password_placeholder', 'Enter your password'),
('en', 'auth', 'login.magic_link_button', 'Send Magic Link'),
('en', 'auth', 'login.password_button', 'Sign In with Password'),
('en', 'auth', 'login.magic_link_sent', 'Check your email for the magic link!'),
('en', 'auth', 'login.magic_link_description', 'We''ve sent you a magic link to sign in. Click the link in your email to continue.'),
('en', 'auth', 'login.signing_in', 'Signing in...'),
('en', 'auth', 'actions.logout', 'Sign Out'),
('en', 'auth', 'errors.unknown_error', 'An unexpected error occurred')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- English - Users
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'users', 'title', 'Users'),
('en', 'users', 'subtitle', 'Manage system users and their roles'),
('en', 'users', 'actions.add_user', 'Add New User'),
('en', 'users', 'messages.loading', 'Loading users...'),
('en', 'users', 'messages.no_users', 'No users found'),
('en', 'users', 'table.name', 'Name'),
('en', 'users', 'table.email', 'Email'),
('en', 'users', 'table.roles', 'Roles'),
('en', 'users', 'table.status', 'Status'),
('en', 'users', 'table.actions', 'Actions')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- English - Roles
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'roles', 'title', 'Roles'),
('en', 'roles', 'subtitle', 'Manage roles and permissions'),
('en', 'roles', 'fields.level', 'Level'),
('en', 'roles', 'fields.is_system', 'System'),
('en', 'roles', 'messages.loading', 'Loading roles...')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Common
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'common', 'app_name', 'Core ERP'),
('th', 'common', 'navigation.dashboard', 'แดชบอร์ด'),
('th', 'common', 'navigation.users', 'ผู้ใช้'),
('th', 'common', 'navigation.roles', 'บทบาท'),
('th', 'common', 'navigation.permissions', 'สิทธิ์'),
('th', 'common', 'navigation.settings', 'ตั้งค่า'),
('th', 'common', 'actions.create', 'สร้าง'),
('th', 'common', 'actions.edit', 'แก้ไข'),
('th', 'common', 'actions.delete', 'ลบ'),
('th', 'common', 'actions.save', 'บันทึก'),
('th', 'common', 'actions.cancel', 'ยกเลิก'),
('th', 'common', 'actions.confirm', 'ยืนยัน'),
('th', 'common', 'actions.close', 'ปิด'),
('th', 'common', 'actions.back', 'กลับ'),
('th', 'common', 'actions.next', 'ถัดไป'),
('th', 'common', 'actions.search', 'ค้นหา'),
('th', 'common', 'actions.filter', 'กรอง'),
('th', 'common', 'actions.view', 'ดู'),
('th', 'common', 'actions.add', 'เพิ่ม'),
('th', 'common', 'status.active', 'ใช้งาน'),
('th', 'common', 'status.inactive', 'ไม่ใช้งาน'),
('th', 'common', 'status.loading', 'กำลังโหลด...'),
('th', 'common', 'status.success', 'สำเร็จ'),
('th', 'common', 'status.error', 'ผิดพลาด'),
('th', 'common', 'messages.save_success', 'บันทึกสำเร็จ'),
('th', 'common', 'messages.save_error', 'บันทึกไม่สำเร็จ'),
('th', 'common', 'messages.no_data', 'ไม่มีข้อมูล')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Auth
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'auth', 'login.title', 'เข้าสู่ระบบ'),
('th', 'auth', 'login.subtitle', 'ยินดีต้อนรับสู่ Core ERP'),
('th', 'auth', 'login.email_label', 'ที่อยู่อีเมล'),
('th', 'auth', 'login.email_placeholder', 'กรอกอีเมลของคุณ'),
('th', 'auth', 'login.password_label', 'รหัสผ่าน'),
('th', 'auth', 'login.password_placeholder', 'กรอกรหัสผ่านของคุณ'),
('th', 'auth', 'login.magic_link_button', 'ส่งลิงก์เข้าสู่ระบบ'),
('th', 'auth', 'login.password_button', 'เข้าสู่ระบบด้วยรหัสผ่าน'),
('th', 'auth', 'login.magic_link_sent', 'ตรวจสอบอีเมลของคุณสำหรับลิงก์เข้าสู่ระบบ!'),
('th', 'auth', 'login.magic_link_description', 'เราได้ส่งลิงก์สำหรับเข้าสู่ระบบไปยังอีเมลของคุณแล้ว คลิกที่ลิงก์ในอีเมลเพื่อดำเนินการต่อ'),
('th', 'auth', 'login.signing_in', 'กำลังเข้าสู่ระบบ...'),
('th', 'auth', 'actions.logout', 'ออกจากระบบ'),
('th', 'auth', 'errors.unknown_error', 'เกิดข้อผิดพลาดที่ไม่คาดคิด')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Users
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'users', 'title', 'ผู้ใช้'),
('th', 'users', 'subtitle', 'จัดการผู้ใช้ระบบและบทบาทของพวกเขา'),
('th', 'users', 'actions.add_user', 'เพิ่มผู้ใช้ใหม่'),
('th', 'users', 'messages.loading', 'กำลังโหลดผู้ใช้...'),
('th', 'users', 'messages.no_users', 'ไม่พบผู้ใช้'),
('th', 'users', 'table.name', 'ชื่อ'),
('th', 'users', 'table.email', 'อีเมล'),
('th', 'users', 'table.roles', 'บทบาท'),
('th', 'users', 'table.status', 'สถานะ'),
('th', 'users', 'table.actions', 'การดำเนินการ')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Roles
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'roles', 'title', 'บทบาท'),
('th', 'roles', 'subtitle', 'จัดการบทบาทและสิทธิ์'),
('th', 'roles', 'fields.level', 'ระดับ'),
('th', 'roles', 'fields.is_system', 'ระบบ'),
('th', 'roles', 'messages.loading', 'กำลังโหลดบทบาท...')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  role_count INTEGER;
  permission_count INTEGER;
  assignment_count INTEGER;
  translation_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'audit_log', 'translations');
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO permission_count FROM permissions;
  SELECT COUNT(*) INTO assignment_count FROM role_permissions;
  SELECT COUNT(*) INTO translation_count FROM translations;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Core ERP Database Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: %', table_count;
  RAISE NOTICE 'Roles: %', role_count;
  RAISE NOTICE 'Permissions: %', permission_count;
  RAISE NOTICE 'Role assignments: %', assignment_count;
  RAISE NOTICE 'Translations: %', translation_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your first user in Supabase Auth';
  RAISE NOTICE '2. Link user to Core ERP (see QUICK_START.md)';
  RAISE NOTICE '3. Login and start using Core ERP!';
  RAISE NOTICE '========================================';
END $$;

