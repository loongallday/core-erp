-- ============================================================================
-- DATABASE RESET SCRIPT - DROP EVERYTHING
-- ============================================================================
-- This script removes ALL tables, functions, triggers, sequences in public schema
-- Use this to test fresh installation or reset to completely clean state
--
-- ⚠️ WARNING: This will DELETE ALL DATA in the public schema!
-- ⚠️ This drops EVERYTHING - not just Core ERP tables!
-- ⚠️ Make sure you have a backup if needed!
--
-- Usage:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Click Run
-- 4. Database will be completely empty and ready for fresh setup
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop ALL triggers first (to avoid dependency issues)
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name, event_object_table, event_object_schema
        FROM information_schema.triggers
        WHERE event_object_schema = 'public'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
            r.trigger_name, r.event_object_schema, r.event_object_table);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: Drop ALL tables in public schema (CASCADE handles dependencies)
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Drop ALL functions in public schema
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    func_signature TEXT;
BEGIN
    FOR r IN (
        SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    ) LOOP
        IF r.args IS NULL OR r.args = '' THEN
            func_signature := format('%I()', r.proname);
        ELSE
            func_signature := format('%I(%s)', r.proname, r.args);
        END IF;
        EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', func_signature);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Drop ALL sequences in public schema
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', r.sequence_name);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 5: Drop ALL types in public schema (if any custom types exist)
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT typname
        FROM pg_type
        WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'c'  -- composite types
    ) LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', r.typname);
    END LOOP;
END $$;

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

