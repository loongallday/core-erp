-- Core ERP Seed Data
-- Migration: Insert default roles and permissions

-- =====================================================
-- SEED DEFAULT ROLES
-- =====================================================
INSERT INTO roles (code, name, description, level, is_system, is_active) VALUES
  ('SUPERADMIN', 'Super Administrator', 'Full system access with all permissions. Cannot be deleted.', 100, true, true),
  ('ADMIN', 'Administrator', 'Administrative access to manage users and system settings.', 50, true, true),
  ('USER', 'Standard User', 'Basic user access with limited permissions.', 10, true, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SEED DEFAULT PERMISSIONS
-- =====================================================

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

-- =====================================================
-- ASSIGN PERMISSIONS TO SUPERADMIN ROLE
-- =====================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPERADMIN'
ON CONFLICT DO NOTHING;

-- =====================================================
-- ASSIGN PERMISSIONS TO ADMIN ROLE
-- =====================================================
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

-- =====================================================
-- ASSIGN PERMISSIONS TO USER ROLE
-- =====================================================
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

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
DECLARE
  role_count INTEGER;
  permission_count INTEGER;
  assignment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO permission_count FROM permissions;
  SELECT COUNT(*) INTO assignment_count FROM role_permissions;
  
  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE '  - Roles: %', role_count;
  RAISE NOTICE '  - Permissions: %', permission_count;
  RAISE NOTICE '  - Role-Permission assignments: %', assignment_count;
END $$;

