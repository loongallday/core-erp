-- ============================================================================
-- DATABASE RESET SCRIPT
-- ============================================================================
-- This script removes ALL Core ERP and plugin tables
-- Use this to test fresh installation or reset to clean state
--
-- ⚠️ WARNING: This will DELETE ALL DATA!
-- ⚠️ Make sure you have a backup if needed!
--
-- Usage:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Click Run
-- 4. Database will be empty and ready for fresh setup
-- ============================================================================

-- Drop all triggers first (to avoid dependency issues)
DROP TRIGGER IF EXISTS generate_leave_request_number_trigger ON leave_requests;
DROP TRIGGER IF EXISTS log_leave_request_audit ON leave_requests;
DROP TRIGGER IF EXISTS update_leave_types_updated_at ON leave_types;
DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON leave_balances;
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS set_translations_updated_at ON translations;

-- Drop all functions
DROP FUNCTION IF EXISTS generate_leave_request_number() CASCADE;
DROP FUNCTION IF EXISTS log_leave_request_change() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_translations_updated_at() CASCADE;

-- Drop all sequences
DROP SEQUENCE IF EXISTS leave_request_seq CASCADE;

-- ============================================================================
-- Drop Plugin Tables (in dependency order)
-- ============================================================================

-- Leave Management Plugin
DROP TABLE IF EXISTS leave_calendar_cache CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;

-- ============================================================================
-- Drop Core Tables (in dependency order)
-- ============================================================================

-- Drop junction tables first
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- CLEANUP COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database Reset Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All Core ERP and plugin tables dropped.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run supabase/CORE_COMPLETE.sql for core setup';
  RAISE NOTICE '2. Run core-leave/PLUGIN_COMPLETE.sql for Leave plugin';
  RAISE NOTICE '3. Create your first user';
  RAISE NOTICE '4. Test the fresh installation!';
  RAISE NOTICE '========================================';
END $$;

