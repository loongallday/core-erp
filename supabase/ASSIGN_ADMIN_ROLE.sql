-- ============================================================================
-- ASSIGN ADMIN ROLE TO USER - ONE-STEP SETUP
-- ============================================================================
-- This script assigns a role to an existing user in Core ERP
--
-- PREREQUISITES:
-- 1. User must already exist in Core ERP (use CREATE_ADMIN_USER.sql if needed)
-- 2. Update the email in the CONFIGURATION section below (ONCE)
-- 3. Run the entire script
-- 
-- NOTE: Defaults to ADMIN role. Change role_code if you need SUPERADMIN or USER.
-- ============================================================================

-- ============================================================================
-- ⚙️ CONFIGURATION - CHANGE THIS 1 VALUE ONLY
-- ============================================================================

DO $$
DECLARE
    -- ⚙️ CHANGE THIS: User's email address (must exist in Core ERP)
    user_email TEXT := 'user@example.com';
    
    -- Role defaults to ADMIN (change if you need SUPERADMIN or USER)
    role_code TEXT := 'ADMIN';
    
    -- Variables (don't change these)
    core_user_uuid UUID;
    role_uuid UUID;
BEGIN
    -- ============================================================================
    -- STEP 1: Find user in Core ERP
    -- ============================================================================
    
    SELECT id INTO core_user_uuid
    FROM users
    WHERE email = user_email;
    
    IF core_user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in Core ERP. Use CREATE_ADMIN_USER.sql to create the user first!', user_email;
    END IF;
    
    RAISE NOTICE 'Found user: % (ID: %)', user_email, core_user_uuid;
    
    -- ============================================================================
    -- STEP 2: Get role ID
    -- ============================================================================
    
    SELECT id INTO role_uuid
    FROM roles
    WHERE code = role_code;
    
    IF role_uuid IS NULL THEN
        RAISE EXCEPTION 'Role % not found. Available roles: SUPERADMIN, ADMIN, USER', role_code;
    END IF;
    
    RAISE NOTICE 'Found role: %', role_code;
    
    -- ============================================================================
    -- STEP 3: Assign role to user
    -- ============================================================================
    
    INSERT INTO user_roles (user_id, role_id)
    VALUES (core_user_uuid, role_uuid)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Role % assigned to user %', role_code, user_email;
    
    -- ============================================================================
    -- SUCCESS!
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Role assignment complete!';
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Role: %', role_code;
    RAISE NOTICE '========================================';
    
END $$;

-- ============================================================================
-- VERIFICATION - View the user's roles
-- ============================================================================
-- ⚠️ IMPORTANT: Update the email in the WHERE clause below to match 
--    the user_email you set in the CONFIGURATION section above!

SELECT 
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
WHERE u.email = 'user@example.com'  -- ⚙️ Copy the email from CONFIGURATION above
GROUP BY u.id, u.email, u.name, u.is_active, r.code, r.name, r.level
ORDER BY r.level DESC;

-- ============================================================================
-- QUICK REFERENCE:
-- ============================================================================
-- SUPERADMIN (Level 100) - All permissions (13 core + all plugin permissions)
-- ADMIN (Level 50) - Most permissions except system:configure
-- USER (Level 10) - Basic read permissions only
-- ============================================================================

