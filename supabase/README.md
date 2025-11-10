# Supabase - Core ERP Backend

This directory contains all Supabase-related configurations, migrations, and Edge Functions for the Core ERP system.

## 📁 Directory Structure

```
supabase/
├── migrations/                          # Database migrations (SQL)
│   ├── 20250110000001_create_core_tables.sql
│   ├── 20250110000002_seed_roles_and_permissions.sql
│   ├── 20250110000003_add_user_locale.sql
│   ├── 20250110000004_create_translations_table.sql
│   └── 20250110000005_seed_translations.sql
├── functions/                           # Edge Functions (Deno)
│   ├── _shared/
│   │   └── cors.ts                     # CORS configuration
│   ├── get-user-permissions/
│   │   └── index.ts                    # Calculate user permissions
│   ├── create-user/
│   │   └── index.ts                    # Create user with auth + profile
│   ├── update-user/
│   │   └── index.ts                    # Update user profile
│   └── assign-roles/
│       └── index.ts                    # Assign/revoke roles
├── constants.ts                        # Shared constants for frontend
├── docs/                               # Documentation
│   ├── CONSTANTS_REVISION_SUMMARY.md
│   └── SYSTEM_CONFIG.md
├── DEPLOYMENT_GUIDE.md                 # Deployment instructions
└── README.md                           # This file
```

## 🗄️ Database Migrations

### Core Tables

1. **users** - User profiles (linked to auth.users)
2. **roles** - Role definitions (hierarchical)
3. **permissions** - Permission definitions (resource:action format)
4. **user_roles** - Junction table: users ↔ roles (many-to-many)
5. **role_permissions** - Junction table: roles ↔ permissions (many-to-many)
6. **audit_log** - Audit trail of all important actions
7. **translations** - i18n translations (en, th)

### Default Data

**Roles** (3):
- `SUPERADMIN` (level 100) - Full system access
- `ADMIN` (level 50) - Administrative access
- `USER` (level 10) - Basic access

**Permissions** (14):
- Users: view, create, edit, delete, manage_roles
- Roles: view, create, edit, delete
- Permissions: view, assign
- System: configure, audit

**Locales** (2):
- English (en)
- Thai (th)

### Security

All tables have:
- ✅ Row Level Security (RLS) enabled
- ✅ Proper indexes for performance
- ✅ Foreign key constraints with CASCADE
- ✅ Updated_at triggers (where applicable)

## ⚡ Edge Functions

### Overview

Edge Functions run on Deno runtime and use the service_role key to bypass RLS for administrative operations.

**Total: 4 Edge Functions**

### Functions

#### 1. get-user-permissions
**Purpose**: Calculate all permissions for a user based on their roles

**Input**:
```json
{
  "user_id": "uuid"
}
```

**Output**:
```json
{
  "permissions": ["users:view", "users:create", ...]
}
```

**Used by**: AuthContext on login, permission checks

---

#### 2. create-user
**Purpose**: Create new user (auth + profile + roles) atomically

**Input**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+66812345678",
  "role_ids": ["uuid1", "uuid2"]
}
```

**Output**:
```json
{
  "success": true,
  "user": { ... },
  "message": "User created successfully"
}
```

**Features**:
- Creates Supabase auth user
- Creates user profile
- Assigns roles
- Logs to audit_log
- Rolls back on any failure

---

#### 3. update-user
**Purpose**: Update user profile information

**Input**:
```json
{
  "user_id": "uuid",
  "name": "John Doe Updated",
  "phone": "+66887654321",
  "is_active": true
}
```

**Output**:
```json
{
  "success": true,
  "user": { ... },
  "message": "User updated successfully"
}
```

**Features**:
- Updates user table
- Logs changes to audit_log
- Tracks before/after state

---

#### 4. assign-roles
**Purpose**: Assign or revoke roles for a user

**Input**:
```json
{
  "user_id": "uuid",
  "role_ids": ["uuid1", "uuid2"]
}
```

**Output**:
```json
{
  "success": true,
  "message": "Roles assigned successfully",
  "role_count": 2
}
```

**Features**:
- Replaces all user roles (not additive)
- Logs to audit_log
- Supports empty array (remove all roles)

---

## 🚀 Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions.

### Quick Start

```bash
# Deploy migrations (via Dashboard SQL Editor)
# Copy each migration file content and run in order

# Deploy Edge Functions
supabase functions deploy get-user-permissions --project-ref gtktmxrshikgehfdopaa
supabase functions deploy create-user --project-ref gtktmxrshikgehfdopaa
supabase functions deploy update-user --project-ref gtktmxrshikgehfdopaa
supabase functions deploy assign-roles --project-ref gtktmxrshikgehfdopaa
supabase functions deploy update-user-locale --project-ref gtktmxrshikgehfdopaa
```

## 🔐 Environment Variables

Edge Functions automatically have access to:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)
- `SUPABASE_ANON_KEY` - Anonymous key (public access)

No manual configuration needed! These are injected by Supabase.

## 📝 Development Notes

### Adding New Migration

1. Create file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Write SQL with `IF NOT EXISTS` for idempotency
3. Test locally or in dev environment
4. Deploy via Dashboard SQL Editor or CLI
5. Update this README if schema changes

### Adding New Edge Function

1. Create folder: `supabase/functions/function-name/`
2. Create `index.ts` with Deno.serve()
3. Import CORS from `../_shared/cors.ts`
4. Handle OPTIONS for CORS preflight
5. Use service_role client for admin operations
6. Deploy: `supabase functions deploy function-name --project-ref ...`
7. Test via Dashboard or cURL
8. Update this README with function details

### Testing Locally

```bash
# Start local Supabase (requires Docker)
supabase start

# Serve functions locally
supabase functions serve

# Test function
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer YOUR_LOCAL_ANON_KEY" \
  -d '{"key": "value"}'
```

## 🔗 Related Documentation

- **[PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)** - Complete architecture guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[constants.ts](./constants.ts)** - Shared constants
- **[../docs/](../docs/)** - Additional documentation

## 📊 Current Project

- **Project ID**: gtktmxrshikgehfdopaa
- **URL**: https://gtktmxrshikgehfdopaa.supabase.co
- **Dashboard**: https://app.supabase.com/project/gtktmxrshikgehfdopaa
- **Region**: ap-southeast-1 (Thailand)
- **Plan**: Pro ($10/month)

## 🆘 Troubleshooting

### Common Issues

**Migrations fail**:
- Check migration order (run sequentially)
- Verify no syntax errors in SQL
- Check if tables already exist

**Edge Function errors**:
- Check function logs in Dashboard
- Verify CORS headers
- Ensure Authorization header is sent
- Check service_role key access

**RLS blocking access**:
- Remember: RLS applies to anon/authenticated roles
- Edge Functions use service_role (bypasses RLS)
- Client requests need proper auth token

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Database**: https://supabase.com/docs/guides/database
- **CLI**: https://supabase.com/docs/reference/cli

---

**Last Updated**: 2025-01-10  
**Core ERP Version**: 1.0.0

