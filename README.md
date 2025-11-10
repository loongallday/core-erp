# Core ERP - Foundation System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](docs/releases/VERSION.md)
[![Status](https://img.shields.io/badge/status-production%20ready-green.svg)](docs/releases/V1.0.0_FREEZE.md)
[![Plugins](https://img.shields.io/badge/plugins-1%20available-purple.svg)](docs/plugins/)

> A foundational Enterprise Resource Planning (ERP) system with user management, role-based access control (RBAC), granular permissions, and a **revolutionary composable plugin architecture**. Version 1.0.0 - First stable release!

⚡ **[Quick Start](QUICK_START.md)** | 📚 **[Documentation](docs/DOCUMENTATION_INDEX.md)** | 🏗️ **[Architecture](PROJECT_CONTEXT.md)** | 🚀 **[Deployment](supabase/DEPLOYMENT_GUIDE.md)**

## 📖 What is Core ERP?

Core ERP is the foundation of a composable ERP ecosystem. It provides:

- 🔐 **Authentication** - Passwordless magic link authentication via Supabase Auth
- 👥 **User Management** - Full CRUD operations for system users
- 🛡️ **Role System** - Hierarchical roles with configurable permissions
- 🔑 **Permission System** - Granular access control (e.g., `users:create`, `roles:edit`)
- 📊 **Dashboard** - System overview with stats and quick actions
- ⚡ **Edge Functions** - Server-side business logic in Deno runtime
- 📝 **Audit Logging** - Track all important user actions
- 🎨 **Modern UI** - 48 shadcn/ui components with Tailwind CSS

### Deployment Model

Each customer receives their **own independent deployment**:

```
Customer A → core-erp instance → Customer A's Supabase Project
Customer B → core-erp instance → Customer B's Supabase Project  
Customer C → core-erp instance → Customer C's Supabase Project
```

**Benefits**:
- ✅ Complete data isolation per customer
- ✅ Independent scaling
- ✅ Customizable per customer needs
- ✅ Separate databases and environments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### 1. Install Dependencies

```bash
cd core-erp
npm install
```

The following local packages will be installed:
- `@composable-erp/core-entity` - Entity management & database utilities (from ../core-entity)
- `@composable-erp/core-ui` - UI components & design system (from ../core-ui)
- `@composable-erp/core-leave` - Leave management plugin (from ../core-leave)

### 2. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Apply Database Setup

**Quick method** - Copy & paste ONE file:

1. Open Supabase SQL Editor
2. Copy entire content of `supabase/CORE_COMPLETE.sql`
3. Paste and Run

This sets up all tables, roles, permissions, and translations!

See [QUICK_START.md](QUICK_START.md) for detailed database setup instructions.

### 4. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:5175**

### 5. Create First User & Login

1. Create user in Supabase Auth Dashboard
2. Link to Core ERP using SQL (see QUICK_START.md Step 4)
3. Login at http://localhost:5175

Detailed instructions in [QUICK_START.md](QUICK_START.md).

## 📁 Project Structure

```
core-erp/
├── src/
│   ├── components/
│   │   ├── ui/              # 48 shadcn/ui components
│   │   ├── AppLayout.tsx    # Main layout with sidebar
│   │   └── ProtectedRoute.tsx # Auth guard
│   ├── pages/
│   │   ├── Login.tsx        # Magic link auth
│   │   ├── Dashboard.tsx    # Overview page
│   │   ├── Users/           # User management
│   │   ├── Roles/           # Role management
│   │   └── Permissions/     # Permission management
│   ├── contexts/
│   │   └── LocaleContext.tsx # Localization context
│   ├── hooks/
│   │   ├── useLocale.ts     # Locale management
│   │   └── useTranslations.ts # I18n hooks
│   ├── lib/
│   │   ├── supabase.ts      # Configured Supabase client (uses @composable-erp/core-entity)
│   │   ├── plugin-system/   # 🔌 Plugin system
│   │   └── i18n/            # Localization setup
│   └── i18n/
│       └── config.ts        # i18next configuration
├── docs/
│   ├── plugins/             # 🔌 Plugin system documentation (6 guides)
│   ├── guides/              # Core feature guides (4 guides)
│   └── testing/             # Testing documentation
├── plugins.config.ts        # 🔌 Plugin configuration
├── PROJECT_CONTEXT.md       # 📚 COMPREHENSIVE ARCHITECTURE GUIDE
├── QUICK_START.md           # ⚡ 5-MINUTE SETUP GUIDE
├── docs/
│   └── DOCUMENTATION_INDEX.md # 📚 COMPLETE DOCUMENTATION INDEX
└── package.json

Local Packages (Sibling directories):

@composable-erp/core-entity # 📦 Entity Package
├── types/                  # Database TypeScript types
├── lib/                    # Supabase utilities & permissions
├── schemas/                # Zod validation schemas
├── contexts/               # AuthContext + SupabaseContext
├── hooks/                  # Entity hooks (useUsers, useRoles, etc.)
└── supabase/
    ├── functions/          # Edge Functions (Deno)
    └── migrations/         # SQL migrations

@composable-erp/core-ui     # 🎨 UI Package
└── components/             # 48 shadcn/ui components
```

## 🗄️ Database Schema

### Core Tables

- **users** - User profiles (name, email, phone, status)
- **roles** - Role definitions (superadmin, admin, user, custom)
- **permissions** - Permission definitions (users:create, roles:view, etc.)
- **user_roles** - Junction: Users ↔ Roles (many-to-many)
- **role_permissions** - Junction: Roles ↔ Permissions (many-to-many)
- **audit_log** - Audit trail of all actions

### Permission Flow

```
User → user_roles → roles → role_permissions → permissions
```

A user can have **multiple roles**. Their effective permissions are the **union** of all permissions from all their roles.

## 🛡️ Default Roles

The system comes with 3 system roles:

| Role | Level | Description |
|------|-------|-------------|
| **superadmin** | 100 | Full system access, cannot be deleted |
| **admin** | 50 | Administrative access |
| **user** | 10 | Standard user access |

Custom roles can be created as needed.

## 🔑 Permission Categories

### Users
- `users:view` - View user list
- `users:create` - Create new users
- `users:edit` - Edit user information
- `users:delete` - Delete users
- `users:manage_roles` - Assign roles to users

### Roles
- `roles:view` - View roles
- `roles:create` - Create new roles
- `roles:edit` - Edit role information
- `roles:delete` - Delete custom roles

### Permissions
- `permissions:view` - View permissions
- `permissions:assign` - Assign permissions to roles

### System
- `system:configure` - Configure system settings
- `system:audit` - View audit logs

## 💻 Tech Stack

### Frontend
- **React 18** - UI library with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **@composable-erp/core-ui** - 48 accessible shadcn/ui components (shared package)
- **@composable-erp/core-entity** - Entity management & Supabase utilities (shared package)
- **React Router v6** - Client-side routing
- **TanStack React Query** - Server state management
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Supabase PostgreSQL** - Managed database
- **Supabase Auth** - Magic link authentication
- **Supabase Edge Functions** - Serverless business logic (Deno)
- **Row Level Security (RLS)** - Database-level security

### Local Packages (Sibling directories)
- **@composable-erp/core-entity** - Database types, hooks, contexts, validation schemas, migrations, Edge Functions
- **@composable-erp/core-ui** - UI components and design system

Both packages are installed from sibling directories (../core-entity, ../core-ui).

### Current Project
- **Project ID**: gtktmxrshikgehfdopaa
- **URL**: https://gtktmxrshikgehfdopaa.supabase.co
- **Region**: ap-southeast-1 (Thailand)
- **Port**: 5175 (dev server)

## 🔒 Security Features

- ✅ **Row Level Security (RLS)** - Enabled on all tables
- ✅ **Magic Link Auth** - No passwords to manage/leak
- ✅ **Permission Checks** - Both client and server-side
- ✅ **Audit Logging** - All important actions tracked
- ✅ **Service Role Protection** - Admin operations via Edge Functions only
- ✅ **Input Validation** - Zod schemas on forms

## 🚢 Deployment

### Quick Start

For complete production deployment instructions, see **[Production Deployment Guide](./docs/PRODUCTION_DEPLOYMENT.md)**.

### Build for Production

```bash
# Set environment for customer
cp .env.customer-a .env

# Build
npm run build

# Output in dist/ folder
```

### Deploy Edge Functions

Edge Functions are included in the `@composable-erp/core-entity` package:

```bash
# Extract functions from node_modules
cp -r node_modules/@composable-erp/core-entity/supabase/functions ./supabase/functions

# Deploy to Supabase
supabase functions deploy get-user-permissions --project-ref <project-ref>
supabase functions deploy create-user --project-ref <project-ref>
supabase functions deploy update-user --project-ref <project-ref>
supabase functions deploy assign-roles --project-ref <project-ref>
supabase functions deploy update-user-locale --project-ref <project-ref>
```

Or use functions from the `../core-entity` directory.

### Hosting Options

- **Vercel** (recommended) - Zero config deployment
- **Netlify** - Great for static sites
- **Cloudflare Pages** - Fast edge network
- **Self-hosted** - Serve `dist/` folder with nginx/Apache

## 📚 Documentation

### 📁 Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - 📖 **Master documentation index**
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - 📖 **Complete architecture** (1300+ lines)
- **[PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)** - 🚀 **Production deployment guide**
- **[docs/plugins/](./docs/plugins/)** - 🔌 Plugin system documentation (6 guides)
- **[docs/guides/](./docs/guides/)** - Core feature guides (4 guides)  
- **[docs/testing/](./docs/testing/)** - Testing documentation

### 🔧 For AI Assistants

- **[.cursor/rules/core-erp-project.mdc](./.cursor/rules/core-erp-project.mdc)** - Project rules and context
- **[.cursor/rules/documentation-protocol.mdc](./.cursor/rules/documentation-protocol.mdc)** - Documentation guidelines

> **👉 Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for complete architecture**  
> **📍 Use [DOCUMENTATION.md](./DOCUMENTATION.md) to navigate all docs**  
> **🔌 See [docs/plugins/](./docs/plugins/) for plugin development**

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start dev server (port 5175)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features

**If updating core entity logic** (requires publishing new version):

1. Modify the `../core-entity` package
2. **Database**: Create migration in `supabase/migrations/`
3. **Edge Function**: Create in `supabase/functions/` if needed
4. **Types**: Update `src/types/database.ts`
5. **Schemas**: Add Zod validation in `src/schemas/`
6. **Hooks**: Create React Query hooks in `src/hooks/`
7. Build and publish new version: `npm run build && npm publish`
8. Update `core-erp` package.json to use new version

**If adding app-specific features**:

1. **UI**: Build pages using `@composable-erp/core-ui` components
2. **Permissions**: Add permission checks with `hasPermission()` from `@composable-erp/core-entity`
3. **Routes**: Add to `src/App.tsx` with `ProtectedRoute`
4. **Menu**: Add navigation items to `src/components/AppLayout.tsx`

### Adding New Permissions

```sql
-- In Supabase SQL Editor or new migration
INSERT INTO permissions (code, name, description, category)
VALUES ('invoices:create', 'Create Invoices', 'Can create new invoices', 'invoices');
```

Then assign to roles via UI or SQL.

## 🔌 Plugin System

**Status**: ✅ **Fully Implemented**

Core ERP includes a comprehensive plugin system for modular feature development.

### Quick Start

**Add a Plugin:**
```bash
npm install @composable-erp/plugin-inventory
# Edit plugins.config.ts to configure
npm run dev
```

**Remove a Plugin:**
```typescript
// plugins.config.ts - Set enabled: false
{ package: '@composable-erp/plugin-inventory', enabled: false }
```

### Key Features

- ✅ **NPM Package Distribution** - Plugins as npm packages
- ✅ **Core-Controlled** - All configuration in `plugins.config.ts`
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Auto-Integration** - Routes, menus, permissions automatically registered
- ✅ **Localization** - i18n support with core overrides
- ✅ **Per-Customer** - Enable/disable features per deployment

### Documentation

**Complete guides:** [`docs/plugins/README.md`](./docs/plugins/README.md)

**Quick Links:**
- [Add/Remove Plugins (3 steps)](./docs/plugins/PLUGIN_MANAGEMENT_QUICK_START.md)
- [Create Your First Plugin](./docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md)
- [Plugin Lifecycle Management](./docs/plugins/PLUGIN_LIFECYCLE_MANAGEMENT.md)
- [Quick Reference](./docs/plugins/QUICK_REFERENCE.md)

### Benefits

- Build features as isolated plugins (inventory, CRM, accounting)
- Customer-specific customization without code changes
- Version and distribute plugins independently
- No modifications to core code

**See full documentation for details!**

## ❓ FAQ

**Q: Is this multi-tenant?**  
A: No. Each customer gets their own deployment and Supabase project for complete isolation.

**Q: Can users have multiple roles?**  
A: Yes. Their permissions are the union of all permissions from all their roles.

**Q: Why Edge Functions instead of direct database access?**  
A: Edge Functions use service_role key to bypass RLS for admin operations, centralize business logic, and enable audit logging.

**Q: Can I customize per customer?**  
A: Yes. Each deployment can be customized independently since they're separate codebases.

**Q: How do I create the first admin user?**  
A: Use Supabase Dashboard to create auth user, then use SQL editor to insert into `users` table and assign `superadmin` role.

**Q: How do I add new features without modifying core?**  
A: Use the plugin system! Create features as plugins and install via npm. See [`docs/plugins/`](./docs/plugins/README.md).

**Q: Can I add inventory/CRM/accounting features?**  
A: Yes! Create them as plugins. The plugin system handles routes, menus, permissions, and database integration automatically.

## 🤝 Contributing

This is a per-customer deployment model. Each customer deployment can be customized as needed.

For architectural changes or general improvements, document them in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

## 📄 License

Proprietary - For customer deployments only.

---

**Status**: ✅ Core Complete | 🔌 Plugin System Ready | 🚀 Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-01-10

---

> 💡 **New to this project?**  
> - Read [DOCUMENTATION.md](./DOCUMENTATION.md) for complete navigation  
> - Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for comprehensive architecture  
> - Check [docs/plugins/](./docs/plugins/) for plugin development

