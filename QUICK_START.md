# Core ERP - Quick Start Guide

Get Core ERP up and running in **5 minutes**!

---

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git

---

## 🚀 Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd core-erp

# Install dependencies
npm install
```

---

## 🗄️ Step 2: Database Setup

### A. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "**New Project**"
3. Choose organization
4. Enter project name: e.g., "my-company-erp"
5. Choose region (closest to you)
6. Click "**Create Project**"
7. Wait ~2 minutes for provisioning

### B. Get Your Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### C. Configure Core ERP

Create `.env` file in `core-erp/` directory:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

### D. Apply Database Setup

This is the **most important step**! Core ERP needs its database structure.

#### Method 1: One-File Setup (Recommended) ⭐

**Easiest way** - Just one copy & paste!

1. Open **Supabase SQL Editor**: Dashboard → SQL Editor → **+ New query**
2. Open the file: `supabase/CORE_COMPLETE.sql`
3. **Copy the entire file** (Ctrl+A, Ctrl+C)
4. **Paste** into SQL Editor (Ctrl+V)
5. Click **"Run"** or press **Ctrl+Enter**
6. ✅ Wait for success message
7. **Done!** All tables, roles, permissions, and translations are set up!

**What this does:**
- Creates 7 tables (users, roles, permissions, user_roles, role_permissions, audit_log, translations)
- Adds 3 default roles (Superadmin, Admin, User)
- Adds 13 default permissions
- Assigns permissions to roles
- Seeds translations (EN + TH)
- Sets up all RLS policies
- Creates indexes for performance

**Time**: ~5 seconds

#### Method 2: Individual Migrations (Alternative)

If you prefer running migrations separately:

```bash
# Copy these files one by one into Supabase SQL Editor:
1. supabase/migrations/20250110000001_create_core_tables.sql
2. supabase/migrations/20250110000002_seed_roles_and_permissions.sql
3. supabase/migrations/20250110000003_add_user_locale.sql
4. supabase/migrations/20250110000004_create_translations_table.sql
5. supabase/migrations/20250110000005_seed_translations.sql
```

Run each in order.

#### Method 3: Via Supabase CLI (If installed)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push --yes
```

---

## ▶️ Step 3: Start Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:5175**

---

## 🔐 Step 4: Create First User

### Via Supabase Auth UI:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click "**Add user**"
3. Enter email (e.g., `admin@example.com`)
4. **Auto-generate password** or set your own
5. Click "**Create user**"

### Link to Core ERP:

Run this SQL in **Supabase SQL Editor**:

```sql
-- Get the auth user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Insert into Core ERP users table (replace <auth-user-id> with ID from above)
INSERT INTO users (auth_user_id, email, full_name, is_active)
VALUES ('<auth-user-id>', 'admin@example.com', 'Admin User', true);

-- Assign superadmin role
INSERT INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u, roles r
WHERE u.email = 'admin@example.com'
AND r.code = 'superadmin';
```

---

## 🎯 Step 5: Login & Test

1. Go to **http://localhost:5175/login**
2. Click "**Password**" tab
3. Enter your credentials
4. Click "**Sign In**"

You should see:
- ✅ Dashboard
- ✅ Sidebar menu with: Dashboard, Users, Roles, Plugins
- ✅ Your name in the header

---

## 🧩 Optional: Install Leave Management Plugin

### Quick Plugin Installation (3 steps)

**Step 1: Install Package**
```bash
npm install ../core-leave
# or: npm install @composable-erp/core-leave (if published)
```

**Step 2: Apply Plugin Database**

1. Open **Supabase SQL Editor**
2. Open file: `../core-leave/PLUGIN_COMPLETE.sql`
3. **Copy entire file** (Ctrl+A, Ctrl+C)
4. **Paste** into SQL Editor (Ctrl+V)
5. Click **"Run"** (Ctrl+Enter)
6. ✅ Success! Plugin database is set up

**What this does:**
- Creates 4 tables (leave_types, leave_balances, leave_requests, leave_calendar_cache)
- Adds 10 default leave types (Annual, Sick, Personal, etc.)
- Adds 10 leave permissions
- Assigns permissions to roles
- Sets up RLS policies

**Step 3: Restart**
```bash
npm run dev
```

After restart, you'll see **"Leave Management"** in the sidebar with:
- My Requests
- My Balance
- Calendar
- Reports
- Leave Types (admin)

**Time**: ~1 minute total!

---

## 📖 Understanding Migrations

### What Are Migrations?

Migrations are **SQL scripts** that set up your database structure (tables, columns, indexes, policies, etc.). They're like "version control for your database schema".

### Why Multiple Migration Files?

Each migration is a separate, incremental change:

```
20250110000001_create_core_tables.sql      ← Creates users, roles, permissions tables
20250110000002_seed_roles_and_permissions.sql  ← Adds default data
20250110000003_add_user_locale.sql         ← Adds locale column
20250110000004_create_translations_table.sql   ← Adds i18n support
20250110000005_seed_translations.sql       ← Adds default translations
```

**Why separate?**
- ✅ Version history
- ✅ Rollback capability
- ✅ Team collaboration
- ✅ Incremental updates
- ✅ Easier debugging

### Migration Naming Convention

```
YYYYMMDDHHMMSS_description.sql
│    │  │ │ │ │
│    │  │ │ │ └─ Second
│    │  │ │ └─── Minute
│    │  │ └───── Hour
│    │  └─────── Day
│    └────────── Month
└─────────────── Year
```

**Example**: `20250110153045_create_inventory_table.sql`

The timestamp ensures **order of execution** - migrations run in chronological order.

### Core vs Plugin Migrations

**Core Migrations** (`core-erp/supabase/migrations/`):
- Essential tables (users, roles, permissions)
- Core system functionality
- **Required** for Core ERP to work

**Plugin Migrations** (in plugin packages):
- Plugin-specific tables
- Self-contained
- **Optional** - only needed if plugin installed
- Included in `PLUGIN_COMPLETE.sql` for easy installation

**Example**:
```
Core ERP migrations/
├── 20250110000001_create_core_tables.sql  ← Core: Required
├── 20250110000002_seed_roles_and_permissions.sql  ← Core: Required
└── ...

Plugin migrations/
└── core-leave/PLUGIN_COMPLETE.sql  ← Plugin: Optional, run when installing plugin
```

### How to Apply Migrations

#### Method 1: Supabase Dashboard (Easiest)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click "**+ New query**"
4. **Copy migration content** from file
5. **Paste** into editor
6. Click "**Run**" or press **Ctrl+Enter**
7. ✅ Check for success message
8. Repeat for each migration **in order**

#### Method 2: Supabase CLI (Automated)

```bash
# Must be in core-erp directory
cd core-erp

# Login (first time only)
supabase login

# Link to your project (first time only)
supabase link --project-ref <your-project-ref>

# Apply all pending migrations
supabase db push --yes
```

**Benefits**: Automatically applies migrations in order, tracks what's been run.

### Migration Best Practices

✅ **DO**:
- Run migrations in timestamp order
- Keep migrations immutable (don't edit after applying)
- Use `IF NOT EXISTS` for safety
- Use `ON CONFLICT DO NOTHING` for idempotency
- Test migrations locally first

❌ **DON'T**:
- Skip migrations
- Edit applied migrations
- Run migrations out of order
- Forget to backup before major changes

### Idempotent Migrations

Our migrations are **idempotent** - safe to run multiple times:

```sql
-- ✅ Safe to run multiple times
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
INSERT INTO roles (code, name) VALUES ('admin', 'Administrator') 
  ON CONFLICT (code) DO NOTHING;

-- ❌ Not safe to run twice (would error)
CREATE TABLE users (...);  -- Error: relation already exists
INSERT INTO roles (code, name) VALUES ('admin', 'Administrator');  -- Error: duplicate
```

This means you can re-run a migration if unsure whether it was applied!

---

## 🔍 Troubleshooting

### "Module not found" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Plugin not loading"

1. Check `plugins.config.ts` has plugin configured
2. Restart dev server completely
3. Check browser console for errors
4. Verify plugin migrations were applied

### "Access denied" in UI

1. Check user has correct role assigned
2. Verify permissions were seeded
3. Run permission query:
```sql
SELECT p.code FROM user_roles ur
JOIN role_permissions rp ON ur.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
JOIN users u ON ur.user_id = u.id
WHERE u.email = 'your-email@example.com';
```

### Migration errors

- Check if migration was already applied
- Verify table/column names don't conflict
- Check foreign key references exist
- Run migrations in correct order

---

## 📚 Next Steps

1. ✅ **Read**: `PROJECT_CONTEXT.md` - Complete architecture guide
2. ✅ **Explore**: Create users, assign roles, test permissions
3. ✅ **Customize**: Update branding, colors, translations
4. ✅ **Install Plugins**: Start with Leave Management plugin
5. ✅ **Develop**: Build your own plugins

---

## 📞 Help & Documentation

- **PROJECT_CONTEXT.md** - Comprehensive architecture guide
- **README.md** - Project overview
- **docs/plugins/** - Plugin development guides
- **Supabase Docs** - https://supabase.com/docs

---

**You're all set!** 🚀 Start building your ERP system!

