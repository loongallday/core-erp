# Supabase Integration

This folder contains all Supabase-related files for Core ERP.

---

## 📁 Files

### Database Setup:

- **`CORE_COMPLETE.sql`** ⭐ - **ONE-FILE complete setup** (recommended)
  - Creates 8 tables
  - Seeds roles, permissions, translations, system config
  - ~610 lines
  - Just copy & paste!

- **`RESET_DATABASE.sql`** 🔄 - Clean database for testing
  - Drops all tables
  - Use before fresh installation test

- **`migrations/`** - Individual migration files (6 files)
  - For version control history
  - Can be used incrementally
  - Or use CORE_COMPLETE.sql instead

### Deployment:

- **`DEPLOYMENT_GUIDE.md`** - Production deployment guide
- **`docs/SYSTEM_CONFIG.md`** - System configuration guide
- **`README.md`** - This file

### Functions:

- **`functions/`** - Supabase Edge Functions (4 functions)
  - From @composable-erp/core-entity package
  - Deploy to Supabase for production

---

## 🚀 Quick Setup

### Method 1: ONE-FILE Setup (Recommended)

```bash
# 1. Copy CORE_COMPLETE.sql content
# 2. Paste in Supabase SQL Editor
# 3. Click Run
# ✅ Done! (5 seconds)
```

### Method 2: Individual Migrations

```bash
# Run these in order in Supabase SQL Editor:
1. 20250110000001_create_core_tables.sql
2. 20250110000002_seed_roles_and_permissions.sql
3. 20250110000003_add_user_locale.sql
4. 20250110000004_create_translations_table.sql
5. 20250110000005_seed_translations.sql
6. 20250110000006_create_system_config.sql
```

### Method 3: Via CLI

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push --yes
```

---

## 📊 What Gets Created

### Tables (8):
1. **users** - User profiles
2. **roles** - Role definitions
3. **permissions** - Permission definitions  
4. **user_roles** - User-role assignments (many-to-many)
5. **role_permissions** - Role-permission assignments (many-to-many)
6. **audit_log** - Audit trail
7. **system_config** - System-wide configuration
8. **translations** - i18n translations

### Default Data:
- **3 roles**: Superadmin, Admin, User
- **13 permissions**: users:*, roles:*, permissions:*, system:*
- **8 system configs**: Auth settings
- **60+ translations**: EN + TH

### Security:
- Row Level Security (RLS) on all tables
- Permission-based policies
- Service role for admin operations

---

## 🔧 Supabase Project Info

**Current Project**:
- ID: gtktmxrshikgehfdopaa
- URL: https://gtktmxrshikgehfdopaa.supabase.co
- Region: ap-southeast-1 (Thailand)
- Port: 5175 (dev)

---

## 📚 Documentation

- **Setup**: See `../QUICK_START.md`
- **Architecture**: See `../PROJECT_CONTEXT.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **System Config**: See `docs/SYSTEM_CONFIG.md`

---

## 🧪 Testing

Use `RESET_DATABASE.sql` to clean database for fresh testing.

See `../docs/testing/TESTING_FRESH_INSTALL.md` for complete test procedure.

---

**All Supabase files are production-ready!** ✅
