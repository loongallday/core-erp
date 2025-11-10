# @core-erp/entity Package

## Overview

The `@core-erp/entity` package is a **shared package** that provides all core Supabase-related functionality for the composable ERP system. It was extracted from `core-erp` to enable code sharing across all applications.

## What's Included

### 📝 Database Types
- Complete TypeScript definitions for all database tables
- Type-safe Supabase client
- Insert/Update type helpers

### 🔐 Authentication & Authorization
- **AuthContext** - Authentication state management
- **SupabaseContext** - Supabase client provider
- Permission checking utilities
- Network status monitoring
- Session management with cross-tab synchronization

### 🪝 React Hooks
- `useAuth()` - Access authentication context
- `useUsers()` - User CRUD operations
- `useRoles()` - Role management
- `usePermissions()` - Permission queries
- `useNetworkStatus()` - Monitor online/offline state
- `useSessionManagement()` - Cross-tab session sync

### ✅ Validation Schemas
- Zod schemas for all entities
- User validation (create/update)
- Role validation (create/update)
- Permission validation
- Audit log validation

### 🛠️ Utilities
- Supabase client factory (configurable)
- Permission checking functions
- Auth retry logic with exponential backoff
- Constants for auth and session management

### 🗄️ Database Resources
- **Migrations**: All SQL schema migrations
- **Edge Functions**: Serverless business logic (Deno)

## Architecture Principle

**Critical**: The `@core-erp/entity` package is **fully configurable** and **never reads environment variables**.

All configuration (Supabase URL, keys, etc.) must be passed from the consuming application.

## Usage

### 1. Configure Private Registry

Set up access to your private npm registry (see [PRIVATE_PACKAGE_SETUP.md](./PRIVATE_PACKAGE_SETUP.md) for details):

```bash
# For GitHub Packages
echo "@core-erp:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# For private npm
npm login --registry=https://your-private-registry.com
```

### 2. Install

```json
// package.json
{
  "dependencies": {
    "@core-erp/entity": "^1.0.0",
    "@core-erp/ui": "^1.0.0"
  }
}
```

```bash
npm install
```

### 3. Configure Supabase Client

```typescript
// src/lib/supabase.ts
import { createSupabaseClient } from '@core-erp/entity'

export const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})
```

### 4. Wrap App with Providers

```typescript
// src/main.tsx
import { SupabaseProvider, AuthProvider } from '@core-erp/entity'
import { toast } from 'sonner'
import { supabase } from './lib/supabase'

<SupabaseProvider client={supabase}>
  <AuthProvider supabaseClient={supabase} toast={toast}>
    <App />
  </AuthProvider>
</SupabaseProvider>
```

### 5. Use Hooks in Components

```typescript
// src/pages/Users.tsx
import { useAuth, useUsers } from '@core-erp/entity'

function Users() {
  const { hasPermission } = useAuth()
  const { data: users, isLoading } = useUsers()
  
  if (!hasPermission('users:view')) {
    return <div>Access denied</div>
  }
  
  return (
    <div>
      {isLoading ? <p>Loading...</p> : (
        <ul>
          {users?.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### 6. Use Validation Schemas

```typescript
import { createUserSchema } from '@core-erp/entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const form = useForm({
  resolver: zodResolver(createUserSchema),
  defaultValues: {
    email: '',
    name: '',
    role_ids: [],
  }
})
```

## Package Structure

```
core-entity/
├── src/
│   ├── types/
│   │   ├── database.ts         # All database TypeScript types
│   │   └── config.ts           # SupabaseConfig type
│   ├── lib/
│   │   ├── supabase.ts         # createSupabaseClient() factory
│   │   ├── permissions.ts      # Permission checking utilities
│   │   ├── constants.ts        # Auth constants
│   │   └── authRetry.ts        # Retry logic
│   ├── schemas/
│   │   ├── user.ts             # User validation schemas
│   │   ├── role.ts             # Role validation schemas
│   │   ├── permission.ts       # Permission validation schemas
│   │   ├── audit.ts            # Audit log validation
│   │   └── index.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Auth state + permissions
│   │   ├── SupabaseContext.tsx # Supabase client provider
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── useRoles.ts
│   │   ├── usePermissions.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useSessionManagement.ts
│   │   └── index.ts
│   └── index.ts                # Main exports
├── supabase/
│   ├── migrations/             # SQL migrations
│   │   ├── 20250110000001_create_core_tables.sql
│   │   ├── 20250110000002_seed_roles_and_permissions.sql
│   │   ├── 20250110000003_add_user_locale.sql
│   │   ├── 20250110000004_create_translations_table.sql
│   │   └── 20250110000005_seed_translations.sql
│   └── functions/              # Edge Functions
│       ├── get-user-permissions/
│       ├── create-user/
│       ├── update-user/
│       ├── assign-roles/
│       ├── update-user-locale/
│       └── _shared/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── MIGRATION_SUMMARY.md
└── dist/                       # Built package
```

## Exports

```typescript
// Types
export * from './types/database'
export * from './types/config'

// Supabase utilities
export { createSupabaseClient, type TypedSupabaseClient } from './lib/supabase'

// Validation schemas
export * from './schemas'

// Permission utilities
export * from './lib/permissions'

// Constants
export * from './lib/constants'

// Auth retry utilities
export { withRetry, createRetryWrapper } from './lib/authRetry'

// Contexts
export * from './contexts'

// Hooks
export * from './hooks'
```

## Development & Publishing

### Build the Package

```bash
# Clone the entity package repository
git clone https://github.com/your-org/core-entity.git
cd core-entity

# Install dependencies
npm install

# Build
npm run build
```

### Publish New Version

```bash
# Update version
npm version patch  # or minor, major

# Publish to private registry
npm publish

# Tag in git
git push origin main --tags
```

### Update in Consuming Apps

After publishing a new version of `@core-erp/entity`:

```bash
cd core-erp

# Update to specific version
npm install @core-erp/entity@1.2.0

# Or update to latest
npm update @core-erp/entity

# Verify
npm run type-check
npm run build
```

## Deployment

### Applying Migrations

Migrations are included in the `@core-erp/entity` package:

**Option 1: Extract from node_modules**
```bash
# In your core-erp project
cp -r node_modules/@core-erp/entity/supabase/migrations ./supabase/
supabase db push --project-ref <project-ref>
```

**Option 2: Clone and apply**
```bash
git clone https://github.com/your-org/core-entity.git
cd core-entity
supabase db push --project-ref <project-ref>
```

### Deploying Edge Functions

Edge Functions are included in the package:

**Option 1: Extract from node_modules**
```bash
# In your core-erp project
cp -r node_modules/@core-erp/entity/supabase/functions ./supabase/

# Deploy functions
supabase functions deploy get-user-permissions --project-ref <project-ref>
supabase functions deploy create-user --project-ref <project-ref>
supabase functions deploy update-user --project-ref <project-ref>
supabase functions deploy assign-roles --project-ref <project-ref>
supabase functions deploy update-user-locale --project-ref <project-ref>
```

**Option 2: Deploy from repository**
```bash
git clone https://github.com/your-org/core-entity.git
cd core-entity/supabase

# Deploy all functions
for dir in functions/*/; do
  func_name=$(basename "$dir")
  if [ "$func_name" != "_shared" ]; then
    supabase functions deploy "$func_name" --project-ref <project-ref>
  fi
done
```

## Benefits

1. **Code Sharing**: All apps use the same entity logic
2. **Type Safety**: Centralized types prevent inconsistencies
3. **Validation**: Reusable Zod schemas across apps
4. **Permission System**: Consistent permission checking
5. **Database Schema**: Single source of truth for migrations
6. **Configurable**: No hard-coded values, fully flexible
7. **Maintainable**: Update once, all apps benefit

## Related Documentation

- **[PRIVATE_PACKAGE_SETUP.md](./PRIVATE_PACKAGE_SETUP.md)** - Complete guide to private package publishing and consumption
- **[PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)** - Full architecture documentation
- **[README.md](../README.md)** - Project overview

## Package Repository

The `@core-erp/entity` package is maintained in a separate repository:
- **Repository**: https://github.com/your-org/core-entity
- **npm Package**: `@core-erp/entity`
- **Registry**: Private npm registry (GitHub Packages, npm, or self-hosted)

