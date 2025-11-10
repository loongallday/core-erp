# Supabase Deployment Guide - Core ERP

This guide explains how to deploy the database migrations and Edge Functions to your Supabase project.

## 📋 Prerequisites

1. **Supabase Project**: Active Supabase project (current: `gtktmxrshikgehfdopaa`)
2. **Supabase CLI**: Install from https://supabase.com/docs/guides/cli
3. **Database Access**: Access to Supabase Dashboard SQL Editor
4. **Environment**: Service Role Key for Edge Functions

## 🗄️ Database Migrations

### Migration Files Overview

We have 5 migration files in `supabase/migrations/`:

1. **20250110000001_create_core_tables.sql** - Core tables (users, roles, permissions, audit_log)
2. **20250110000002_seed_roles_and_permissions.sql** - Default roles and permissions
3. **20250110000003_add_user_locale.sql** - Localization support
4. **20250110000004_create_translations_table.sql** - Translation storage
5. **20250110000005_seed_translations.sql** - Default translations (en, th)

### Option 1: Deploy via Supabase Dashboard (Recommended)

1. **Go to SQL Editor**:
   - Navigate to: https://app.supabase.com/project/gtktmxrshikgehfdopaa/sql
   
2. **Run migrations in order**:
   ```sql
   -- Copy and paste each migration file content, one at a time
   -- Start with 20250110000001_create_core_tables.sql
   -- Then 20250110000002_seed_roles_and_permissions.sql
   -- Continue in numerical order...
   ```

3. **Verify each migration**:
   - Check "Success" message after each run
   - Verify tables appear in Table Editor

### Option 2: Deploy via Supabase CLI

If you have Supabase CLI configured:

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref gtktmxrshikgehfdopaa

# Push migrations
supabase db push

# Or apply specific migration
supabase db push --path supabase/migrations/20250110000001_create_core_tables.sql
```

### Verification Checklist

After running migrations, verify:

- ✅ **Tables created**: users, roles, permissions, user_roles, role_permissions, audit_log, translations
- ✅ **RLS enabled**: All tables should have Row Level Security enabled
- ✅ **Default data**: 3 roles (SUPERADMIN, ADMIN, USER)
- ✅ **Permissions**: 14 default permissions across 4 categories
- ✅ **Translations**: English and Thai translations seeded

**Query to verify**:
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check roles
SELECT code, name, level FROM roles ORDER BY level DESC;

-- Check permissions
SELECT code, category FROM permissions ORDER BY category, code;

-- Check translations count
SELECT locale, COUNT(*) as count FROM translations GROUP BY locale;
```

## ⚡ Edge Functions

### Edge Functions Overview

We have 4 Edge Functions in `supabase/functions/`:

1. **get-user-permissions** - Calculate user permissions
2. **create-user** - Create new user with auth + profile + roles
3. **update-user** - Update user profile
4. **assign-roles** - Assign/revoke user roles

**Note**: Locale updates are handled directly by the frontend (LocaleContext) via direct UPDATE to the `users` table.

### Deploy Edge Functions

#### Deploy All Functions

```bash
# Navigate to project root
cd core-erp

# Deploy each function
supabase functions deploy get-user-permissions --project-ref gtktmxrshikgehfdopaa
supabase functions deploy create-user --project-ref gtktmxrshikgehfdopaa
supabase functions deploy update-user --project-ref gtktmxrshikgehfdopaa
supabase functions deploy assign-roles --project-ref gtktmxrshikgehfdopaa
```

#### Deploy Single Function

```bash
# Deploy specific function
supabase functions deploy <function-name> --project-ref gtktmxrshikgehfdopaa

# Example:
supabase functions deploy create-user --project-ref gtktmxrshikgehfdopaa
```

#### Set Environment Variables

Edge Functions need access to Supabase URL and service role key:

**These are automatically available in Supabase Edge Functions:**
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `SUPABASE_ANON_KEY` - Anonymous key

No manual configuration needed! 🎉

### Testing Edge Functions

#### Test via Supabase Dashboard

1. Go to Edge Functions: https://app.supabase.com/project/gtktmxrshikgehfdopaa/functions
2. Click on a function
3. Use "Invoke" tab to test with sample data

**Example: Test get-user-permissions**
```json
{
  "user_id": "YOUR_USER_ID_HERE"
}
```

#### Test via cURL

```bash
# Get user permissions
curl -X POST \
  https://gtktmxrshikgehfdopaa.supabase.co/functions/v1/get-user-permissions \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID"}'

# Create user
curl -X POST \
  https://gtktmxrshikgehfdopaa.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "phone": "+66812345678",
    "role_ids": ["ROLE_ID_1", "ROLE_ID_2"]
  }'
```

#### Test via Frontend

```typescript
import { supabase } from './lib/supabase'

// Get user permissions
const { data, error } = await supabase.functions.invoke('get-user-permissions', {
  body: { user_id: userId }
})

// Create user
const { data, error } = await supabase.functions.invoke('create-user', {
  body: {
    email: 'newuser@example.com',
    name: 'New User',
    phone: '+66812345678',
    role_ids: [roleId1, roleId2]
  }
})
```

### Edge Function Logs

View function logs in Supabase Dashboard:
1. Go to: https://app.supabase.com/project/gtktmxrshikgehfdopaa/functions
2. Click on function name
3. View "Logs" tab for invocation history and errors

## 🎯 Initial Setup After Deployment

### 1. Create First Admin User

**Via Supabase Dashboard SQL Editor:**

```sql
-- Step 1: Create auth user (via Auth Dashboard or SQL)
-- Go to Authentication > Users > Add User
-- OR run this in SQL Editor:

-- Note: You'll need to use Supabase Dashboard UI for auth user creation
-- as auth.users requires special permissions

-- Step 2: After auth user is created, insert profile
INSERT INTO users (auth_user_id, email, name, is_active)
SELECT 
  id,
  email,
  'System Administrator',
  true
FROM auth.users 
WHERE email = 'YOUR_ADMIN_EMAIL@example.com';

-- Step 3: Assign SUPERADMIN role
INSERT INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'YOUR_ADMIN_EMAIL@example.com'
  AND r.code = 'SUPERADMIN';

-- Step 4: Verify
SELECT 
  u.email,
  u.name,
  r.name as role,
  r.level
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'YOUR_ADMIN_EMAIL@example.com';
```

### 2. Test Authentication

1. Go to your app login page: http://localhost:5175
2. Try logging in with admin email
3. Check magic link in email
4. Verify you can access Users, Roles pages

### 3. Verify Permissions

After logging in, check browser console:
```javascript
// Should show all permissions for SUPERADMIN
console.log('User permissions:', userPermissions)
```

## 🔧 Troubleshooting

### Database Issues

**Problem: "relation does not exist"**
```bash
# Solution: Run migrations in correct order
# Ensure 20250110000001 runs before others
```

**Problem: "duplicate key value violates unique constraint"**
```bash
# Solution: Seed data already exists
# This is OK - migrations use ON CONFLICT DO NOTHING
```

**Problem: RLS policies blocking access**
```bash
# Solution: Check that service_role key is used in Edge Functions
# Client requests should use anon key + user auth token
```

### Edge Function Issues

**Problem: "Function not found"**
```bash
# Solution: Redeploy function
supabase functions deploy <function-name> --project-ref gtktmxrshikgehfdopaa
```

**Problem: "Unauthorized"**
```bash
# Solution: Ensure Authorization header is sent
# Format: "Bearer YOUR_TOKEN"
```

**Problem: CORS errors**
```bash
# Solution: Verify _shared/cors.ts is deployed
# Check that all functions handle OPTIONS request
```

**Problem: "SUPABASE_SERVICE_ROLE_KEY is not defined"**
```bash
# Solution: This should be auto-injected by Supabase
# If testing locally, set in .env file
```

### Testing Locally

To test Edge Functions locally:

```bash
# Start Supabase local development
supabase start

# Serve functions locally
supabase functions serve

# Test locally
curl -X POST http://localhost:54321/functions/v1/get-user-permissions \
  -H "Authorization: Bearer YOUR_LOCAL_ANON_KEY" \
  -d '{"user_id": "USER_ID"}'
```

## 📊 Monitoring

### Check Function Usage

Dashboard: https://app.supabase.com/project/gtktmxrshikgehfdopaa/functions

Metrics available:
- Invocation count
- Error rate
- Average execution time
- Logs with timestamps

### Database Monitoring

Dashboard: https://app.supabase.com/project/gtktmxrshikgehfdopaa/reports

Check:
- Database size
- Number of connections
- Query performance
- Table sizes

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] All migrations tested in development
- [ ] All Edge Functions deployed and tested
- [ ] First admin user created
- [ ] Authentication working (magic link emails)
- [ ] RLS policies verified (users can't access unauthorized data)
- [ ] Audit logging working
- [ ] Error handling tested
- [ ] Edge Function logs reviewed
- [ ] Database backups configured
- [ ] Environment variables secured

## 📝 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions Guide**: https://supabase.com/docs/guides/functions
- **CLI Reference**: https://supabase.com/docs/reference/cli
- **Project Dashboard**: https://app.supabase.com/project/gtktmxrshikgehfdopaa

## 🆘 Need Help?

1. Check Supabase Dashboard logs
2. Review Edge Function logs
3. Check browser console for frontend errors
4. Verify environment variables
5. Test with cURL to isolate issues

---

**Project**: Core ERP  
**Supabase Project ID**: gtktmxrshikgehfdopaa  
**Region**: ap-southeast-1 (Thailand)  
**Last Updated**: 2025-01-10

