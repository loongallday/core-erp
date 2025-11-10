# Supabase Helper Scripts

Quick SQL scripts for common database operations.

---

## 🔧 User Management Scripts

### 1. Create Admin User

**File**: `CREATE_ADMIN_USER.sql`

**Use when**: Setting up a new deployment and need first admin user

**Steps**:
1. Create user in Supabase Auth Dashboard
2. Run `CREATE_ADMIN_USER.sql` (update email and auth_user_id)
3. User is created and assigned SUPERADMIN role

### 2. Assign Admin Role

**File**: `ASSIGN_ADMIN_ROLE.sql`

**Use when**: Promoting existing user to admin

**Steps**:
1. Update email in script
2. Choose role (SUPERADMIN, ADMIN, or USER)
3. Run script
4. User gets new role

---

## 🗄️ Database Scripts

### 3. Reset Database

**File**: `RESET_DATABASE.sql`

**Use when**: Testing fresh installation or cleaning database

**Warning**: ⚠️ Deletes ALL data!

**What it does**:
- Drops all Core ERP tables (with CASCADE)
- Drops all plugin tables (e.g., Leave Management)
- Drops all functions, triggers, and sequences
- Dynamically cleans up any remaining dependencies
- Safely handles non-existent objects (no errors)

**How it works**:
1. Drops tables with CASCADE (auto-removes dependencies)
2. Drops functions and sequences
3. Dynamically finds and removes any leftover triggers
4. Works even if database is partially set up or empty

**After reset**:
1. Run `CORE_COMPLETE.sql` (core setup)
2. Run `PLUGIN_COMPLETE.sql` for each plugin you want
3. Create users via Supabase Auth + CREATE_ADMIN_USER.sql

### 4. Complete Core Setup

**File**: `CORE_COMPLETE.sql`

**Use when**: Fresh installation or after reset

**What it does**:
- Creates 8 core tables
- Seeds 3 roles
- Seeds 13 permissions
- Seeds 8 system config values
- Seeds 60+ translations (EN + TH)
- Sets up all RLS policies

**Time**: ~5 seconds

---

## 📊 Inspection Scripts

### View All Users with Roles

```sql
SELECT 
  u.email,
  u.name,
  u.is_active,
  STRING_AGG(r.name, ', ') as roles,
  u.created_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.name, u.is_active, u.created_at
ORDER BY u.created_at DESC;
```

### View User Permissions

```sql
-- Replace 'user@example.com' with actual email
SELECT DISTINCT p.code, p.name, p.category
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN role_permissions rp ON ur.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'user@example.com'
ORDER BY p.category, p.code;
```

### View All Roles and Permission Counts

```sql
SELECT 
  r.code,
  r.name,
  r.level,
  COUNT(p.id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id, r.code, r.name, r.level
ORDER BY r.level DESC;
```

### View System Config

```sql
SELECT key, value, description, category
FROM system_config
ORDER BY category, key;
```

---

## 🔐 Permission Management

### Grant Permission to Role

```sql
-- Grant 'users:create' permission to 'USER' role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'USER'
AND p.code = 'users:create'
ON CONFLICT DO NOTHING;
```

### Remove Permission from Role

```sql
-- Remove 'users:delete' from 'ADMIN' role
DELETE FROM role_permissions
WHERE role_id = (SELECT id FROM roles WHERE code = 'ADMIN')
AND permission_id = (SELECT id FROM permissions WHERE code = 'users:delete');
```

---

## 🧹 Cleanup Scripts

### Remove User (Soft Delete)

```sql
-- Deactivate user (keeps data, prevents login)
UPDATE users 
SET is_active = false 
WHERE email = 'user@example.com';
```

### Remove Role from User

```sql
-- Remove specific role from user
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'user@example.com')
AND role_id = (SELECT id FROM roles WHERE code = 'ADMIN');
```

---

## 🧪 Testing Scripts

### Create Test Users

```sql
-- Create test users (auth users must exist in Supabase Auth first!)
-- This just links them to Core ERP

INSERT INTO users (auth_user_id, email, name, is_active) VALUES
  ('<auth-id-1>', 'test1@example.com', 'Test User 1', true),
  ('<auth-id-2>', 'test2@example.com', 'Test User 2', true),
  ('<auth-id-3>', 'test3@example.com', 'Test Manager', true)
ON CONFLICT (auth_user_id) DO NOTHING;

-- Assign roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'test1@example.com' AND r.code = 'USER'
UNION ALL
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'test2@example.com' AND r.code = 'USER'
UNION ALL
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'test3@example.com' AND r.code = 'ADMIN'
ON CONFLICT DO NOTHING;
```

---

## 📚 Quick Reference

| Script | Purpose | Danger Level | Notes |
|--------|---------|--------------|-------|
| CREATE_ADMIN_USER.sql | Create new admin | ✅ Safe | Creates user + assigns SUPERADMIN |
| ASSIGN_ADMIN_ROLE.sql | Promote user | ✅ Safe | Adds role to existing user |
| CORE_COMPLETE.sql | Fresh setup | ✅ Safe | Idempotent (can rerun safely) |
| RESET_DATABASE.sql | Delete all data | ⚠️ DANGEROUS | Drops everything, no backups! |

---

## 💡 Tips

- Always verify email before running user scripts
- Use `ON CONFLICT DO NOTHING` for safety
- Check results with SELECT queries
- Keep backups before major changes
- Test scripts on development database first

---

**All helper scripts are ready to use!** 🎯

