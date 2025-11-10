-- ============================================================================
-- CREATE ADMIN USER - ONE-STEP SETUP
-- ============================================================================
-- This script creates a complete admin user linked to Supabase Auth
--
-- PREREQUISITES:
-- 1. Create user in Supabase Auth Dashboard first (or use magic link)
-- 2. Update the 3 values in the CONFIGURATION section below (ONCE)
-- 3. Run the entire script
-- ============================================================================

-- ============================================================================
-- ⚙️ CONFIGURATION - CHANGE THESE 3 VALUES ONLY
-- ============================================================================

DO $$
DECLARE
    -- ⚙️ 1. Your user's email address (must exist in Supabase Auth)
    user_email TEXT := 'admin@example.com';
    
    -- ⚙️ 2. User's full name
    user_name TEXT := 'Admin User';
    
    -- ⚙️ 3. Role to assign (SUPERADMIN, ADMIN, or USER)
    role_code TEXT := 'SUPERADMIN';
    
    -- Variables (don't change these)
    auth_user_uuid UUID;
    core_user_uuid UUID;
    role_uuid UUID;
BEGIN
    -- ============================================================================
    -- STEP 1: Find auth user by email
    -- ============================================================================
    
    SELECT id INTO auth_user_uuid
    FROM auth.users
    WHERE email = user_email;
    
    IF auth_user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in Supabase Auth. Please create the user in Auth Dashboard first!', user_email;
    END IF;
    
    RAISE NOTICE 'Found auth user: % (ID: %)', user_email, auth_user_uuid;
    
    -- ============================================================================
    -- STEP 2: Create or update user in Core ERP
    -- ============================================================================
    
    INSERT INTO users (auth_user_id, email, name, is_active)
    VALUES (auth_user_uuid, user_email, user_name, true)
    ON CONFLICT (auth_user_id) DO UPDATE 
    SET email = EXCLUDED.email, name = EXCLUDED.name, is_active = true
    RETURNING id INTO core_user_uuid;
    
    RAISE NOTICE 'User created/updated in Core ERP: %', user_email;
    
    -- ============================================================================
    -- STEP 3: Get role ID
    -- ============================================================================
    
    SELECT id INTO role_uuid
    FROM roles
    WHERE code = role_code;
    
    IF role_uuid IS NULL THEN
        RAISE EXCEPTION 'Role % not found. Available roles: SUPERADMIN, ADMIN, USER', role_code;
    END IF;
    
    RAISE NOTICE 'Found role: %', role_code;
    
    -- ============================================================================
    -- STEP 4: Assign role to user
    -- ============================================================================
    
    INSERT INTO user_roles (user_id, role_id)
    VALUES (core_user_uuid, role_uuid)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Role % assigned to user %', role_code, user_email;
    
    -- ============================================================================
    -- SUCCESS!
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'User setup complete!';
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Role: %', role_code;
    RAISE NOTICE '========================================';
    
END $$;

-- ============================================================================
-- VERIFICATION - View the created user
-- ============================================================================
-- ⚠️ IMPORTANT: Update the email in the WHERE clause below to match 
--    the user_email you set in the CONFIGURATION section above!

SELECT 
  u.id,
  u.auth_user_id,
  u.email,
  u.name,
  u.is_active,
  r.code as role_code,
  r.name as role_name,
  r.level as role_level,
  COUNT(DISTINCT p.id) as permission_count
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@example.com'  -- ⚙️ Copy the email from CONFIGURATION above
GROUP BY u.id, u.auth_user_id, u.email, u.name, u.is_active, r.code, r.name, r.level;

-- ============================================================================
-- QUICK REFERENCE:
-- ============================================================================
-- SUPERADMIN (Level 100) - All permissions (13 core + all plugin permissions)
-- ADMIN (Level 50) - Most permissions except system:configure
-- USER (Level 10) - Basic read permissions only
-- ============================================================================

