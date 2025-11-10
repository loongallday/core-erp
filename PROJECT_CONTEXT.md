# Core ERP - Project Context & Architecture

## 📖 Project Overview

**Core ERP** is a foundational Enterprise Resource Planning (ERP) system designed as a **per-customer deployable solution**. Each customer receives their own independent deployment with a dedicated Supabase backend, ensuring complete data isolation and customization potential.

### Purpose & Vision

This is the **foundation** of a larger composable ERP ecosystem. The core-erp provides:
- User authentication and management
- Role-based access control (RBAC)
- Granular permission system
- Audit logging
- A solid foundation for future ERP modules

### Key Design Principle: Per-Customer Deployment

```
Customer A → Deploy core-erp instance → Customer A's Supabase Project
Customer B → Deploy core-erp instance → Customer B's Supabase Project  
Customer C → Deploy core-erp instance → Customer C's Supabase Project
```

Each deployment is **completely isolated**:
- ✅ Independent codebase instances
- ✅ Separate Supabase projects
- ✅ Individual environment configurations
- ✅ Complete data isolation
- ✅ Per-customer customization capability

---

## 🏗️ Architecture & Technology Stack

### Frontend Architecture

**Framework**: React 18 + TypeScript
- **Why React 18**: Latest features, concurrent rendering, improved performance
- **Why TypeScript**: Type safety, better DX, catch errors at compile time

**Build Tool**: Vite
- **Why Vite**: Lightning-fast HMR, optimized builds, better DX than CRA
- **Configuration**: Port 5175, React SWC for fast refresh

**UI Framework**: Tailwind CSS + shadcn/ui (48 components)
- **Why Tailwind**: Utility-first, rapid development, consistent design
- **Why shadcn/ui**: Accessible components, full customization, copy-paste approach
- **Components copied from**: ticket-calendar-pro (maintaining design consistency)

**State Management**:
- React Context (AuthContext from @composable-erp/core-entity, LocaleContext for i18n)
- TanStack React Query (server state, caching, automatic refetching)
- React Hook Form + Zod (form state and validation)

**Shared Packages**:
- **@composable-erp/core-entity** - Database types, Supabase utilities, Auth context, entity hooks, validation schemas
- **@composable-erp/core-ui** - 48 shadcn/ui components, design system, responsive utilities

**Routing**: React Router v6
- Protected routes with permission checking
- Nested layouts
- Lazy loading for code splitting

### Backend Architecture

**Database**: Supabase PostgreSQL
- **Why Supabase**: Managed PostgreSQL, built-in auth, real-time capabilities, edge functions
- **Current Project**: gtktmxrshikgehfdopaa.supabase.co
- **Cost**: $10/month (Pro plan)

**Authentication**: Supabase Auth
- Magic link authentication (passwordless)
- Email-based, no password management needed
- Automatic session management

**Business Logic**: Supabase Edge Functions (Deno runtime)
- Server-side user creation/updates
- Permission calculations
- Role assignments
- Audit logging
- Why: Keep sensitive logic server-side, bypass RLS when needed

**Security**: Row Level Security (RLS)
- All tables protected
- Users can only access what they're permitted to
- Admin operations via service_role key in Edge Functions

---

## 🗄️ Database Schema & Design

### Core Tables

#### 1. users
Stores user profile information (separate from Supabase auth.users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why separate table?**: 
- auth.users is managed by Supabase Auth
- users table gives us full control over custom fields
- Easier to query and join with business data

**RLS Policies**:
- SELECT: Any authenticated user
- INSERT: Service role only (via Edge Function)
- UPDATE: Own profile OR admin permission
- DELETE: Admin permission only

#### 2. roles
Hierarchical role definitions

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,        -- e.g., 'SUPERADMIN', 'MANAGER'
  name VARCHAR(255) NOT NULL,              -- Display name
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,        -- Hierarchy level (0-100)
  is_system BOOLEAN DEFAULT FALSE,         -- Protected system roles
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default System Roles**:
- `superadmin` (level 100) - Full system access, cannot be deleted
- `admin` (level 50) - Administrative access
- `user` (level 10) - Standard user access

**Hierarchy**: Higher level = more authority. Used for comparing role power.

#### 3. permissions
Granular permission definitions

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,       -- e.g., 'users:create'
  name VARCHAR(255) NOT NULL,              -- Display name
  description TEXT,
  category VARCHAR(100),                   -- Groups permissions (users, roles, system)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Permission Naming Convention**: `resource:action`
- `users:view`, `users:create`, `users:edit`, `users:delete`
- `roles:view`, `roles:create`, `roles:edit`, `roles:delete`
- `permissions:view`, `permissions:assign`
- `system:configure`, `system:audit`

**Categories**:
- `users` - User management permissions
- `roles` - Role management permissions
- `permissions` - Permission management permissions
- `system` - System-level permissions

#### 4. user_roles (Junction Table)
Many-to-many relationship: Users ↔ Roles

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),   -- Who assigned this role
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);
```

**Design Note**: A user can have **multiple roles**. Their effective permissions are the **union** of all permissions from all their roles.

#### 5. role_permissions (Junction Table)
Many-to-many relationship: Roles ↔ Permissions

```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);
```

#### 6. audit_log
Track all important actions

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,            -- e.g., 'user_created', 'role_assigned'
  resource_type VARCHAR(50),               -- e.g., 'user', 'role'
  resource_id UUID,                        -- ID of affected resource
  changes JSONB,                           -- What changed (JSON)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Audited Actions**:
- User created/updated/deleted
- Role assigned/revoked
- Permission changes
- Login attempts
- System configuration changes

### Permission Resolution Flow

```
User → user_roles → roles → role_permissions → permissions
```

1. Get all roles for user (from `user_roles`)
2. Get all permissions for those roles (from `role_permissions`)
3. Deduplicate permissions (a user might get same permission from multiple roles)
4. Return unique list of permission codes

**Implementation**: `get-user-permissions` Edge Function handles this

---

## ⚡ Edge Functions (Server-Side Logic)

### Why Edge Functions?

1. **Bypass RLS**: Perform admin operations with service_role key
2. **Business Logic**: Keep complex logic server-side
3. **Security**: Validate permissions before operations
4. **Transactions**: Atomic operations (e.g., create user + assign roles)
5. **Audit**: Centralized logging of all important actions

### Available Functions

#### 1. get-user-permissions
**Purpose**: Calculate all permissions for a user

**Input**:
```typescript
{ user_id: string }
```

**Output**:
```typescript
{ permissions: string[] }  // e.g., ['users:view', 'users:create', ...]
```

**Usage**: 
- Called by frontend AuthContext on login
- Used for permission checks in UI (button visibility, route guards)
- Cached in React Query

**Logic**:
```typescript
1. Query user_roles for user's role IDs
2. Query role_permissions for those role IDs
3. Join with permissions to get permission codes
4. Deduplicate and return array of codes
```

#### 2. create-user (To Deploy)
**Purpose**: Create new user with auth account and roles

**Input**:
```typescript
{
  email: string
  name: string
  phone?: string
  role_ids: string[]
}
```

**Process**:
1. Validate requesting user has `users:create` permission
2. Create Supabase auth user (with service_role key)
3. Insert into users table
4. Insert into user_roles (assign initial roles)
5. Log action to audit_log
6. Return created user

**Why needed**: RLS prevents direct INSERT into users table. This function uses service_role to bypass RLS.

#### 3. update-user (To Deploy)
**Purpose**: Update user information

**Input**:
```typescript
{
  user_id: string
  updates: {
    name?: string
    phone?: string
    is_active?: boolean
  }
}
```

**Validations**:
- Check requester has `users:edit` permission
- Log changes to audit_log

#### 4. assign-roles (To Deploy)
**Purpose**: Assign/revoke roles for a user

**Input**:
```typescript
{
  user_id: string
  role_ids: string[]  // Complete list of roles user should have
}
```

**Process**:
1. Check requester has `users:manage_roles` permission
2. Delete all existing user_roles for this user
3. Insert new user_roles
4. Log to audit_log

---

## 🎨 Frontend Structure & Pages

### File Organization

```
core-erp/src/
├── components/
│   ├── ui/                    # 48 shadcn/ui components (from @composable-erp/core-ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ... (45 more)
│   ├── AppLayout.tsx          # Main layout with sidebar
│   ├── ProtectedRoute.tsx     # Auth & permission guard
│   ├── PageHeader.tsx         # Consistent page headers
│   ├── LoadingState.tsx       # Loading spinner/skeleton
│   ├── EmptyState.tsx         # Empty state illustrations
│   ├── UserCard.tsx           # User display component
│   └── RoleCard.tsx           # Role display component
├── pages/
│   ├── Login.tsx              # Magic link authentication
│   ├── Dashboard.tsx          # Overview page (landing after login)
│   ├── Users/
│   │   ├── UserList.tsx       # Table of all users
│   │   ├── UserForm.tsx       # Add/edit user form
│   │   └── UserDetail.tsx     # Single user profile view
│   ├── Roles/
│   │   ├── RoleList.tsx       # Grid of role cards
│   │   ├── RoleForm.tsx       # Add/edit role form
│   │   └── RoleDetail.tsx     # Role details + permission assignment
│   └── Permissions/
│       └── PermissionManagement.tsx  # Assign permissions to roles
├── contexts/
│   └── LocaleContext.tsx      # Localization & i18n state
├── hooks/
│   ├── useLocale.ts           # Locale management
│   ├── useTranslations.ts     # I18n hooks
│   └── use-toast.ts           # Toast notifications
├── lib/
│   ├── supabase.ts            # Configured Supabase client (uses @composable-erp/core-entity)
│   ├── plugin-system/         # 🔌 Plugin system implementation
│   ├── utils.ts               # Utility functions (cn, etc.)
│   └── i18n/                  # i18next configuration
├── i18n/
│   └── config.ts              # i18next setup
├── App.tsx                    # Route definitions
├── main.tsx                   # React root + providers
└── index.css                  # Global styles + Tailwind
```

### Core Entity Package Structure

The `@composable-erp/core-entity` package provides all entity-related functionality:

```
../core-entity/
├── src/
│   ├── types/
│   │   ├── database.ts        # All database TypeScript types
│   │   └── config.ts          # Configuration types (SupabaseConfig)
│   ├── lib/
│   │   ├── supabase.ts        # createSupabaseClient() factory
│   │   ├── permissions.ts     # Permission checking utilities
│   │   ├── constants.ts       # Auth & session constants
│   │   └── authRetry.ts       # Retry logic with exponential backoff
│   ├── schemas/
│   │   ├── user.ts            # Zod validation for users
│   │   ├── role.ts            # Zod validation for roles
│   │   ├── permission.ts      # Zod validation for permissions
│   │   ├── audit.ts           # Zod validation for audit logs
│   │   └── index.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Auth state + permissions
│   │   ├── SupabaseContext.tsx # Supabase client provider
│   │   └── index.ts
│   └── hooks/
│       ├── useAuth.ts         # Access auth context
│       ├── useUsers.ts        # User CRUD operations
│       ├── useRoles.ts        # Role CRUD operations
│       ├── usePermissions.ts  # Permission queries
│       ├── useNetworkStatus.ts # Network monitoring
│       ├── useSessionManagement.ts # Cross-tab sync
│       └── index.ts
├── supabase/
│   ├── functions/             # Edge Functions (Deno)
│   └── migrations/            # SQL migrations
└── dist/                      # Built package
```

### Key Components Explained

#### AuthContext (from @composable-erp/core-entity)
**Package**: `@composable-erp/core-entity`  
**File**: `../core-entity/src/contexts/AuthContext.tsx`

**Purpose**: Manage authentication state and user permissions globally

**Provides**:
```typescript
interface AuthContextType {
  session: Session | null           // Supabase session
  user: User | null                 // User from users table
  loading: boolean                  // Initial auth loading
  permissions: string[]             // User's permission codes
  isOnline: boolean                 // Network status
  isReconnecting: boolean           // Reconnection state
  sessionExpiresAt: Date | null     // Session expiry time
  hasPermission: (code: string) => boolean
  signInWithEmail: (email: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setIntendedDestination: (url: string) => void
  getAndClearReturnUrl: () => string | null
  isSessionExpiringSoon: (thresholdMs?: number) => boolean
}
```

**Configuration**:
```tsx
import { AuthProvider } from '@composable-erp/core-entity'
import { supabase } from './lib/supabase'
import { toast } from 'sonner'

<AuthProvider supabaseClient={supabase} toast={toast}>
  <App />
</AuthProvider>
```

**Initialization Flow**:
1. Listen to Supabase auth state changes
2. When user logs in, fetch their profile from `users` table
3. Call `get-user-permissions` Edge Function
4. Store permissions in context
5. Provide `hasPermission()` helper for UI checks
6. Monitor network status and session expiry

**Usage Throughout App**:
```tsx
import { useAuth } from '@composable-erp/core-entity'

const { hasPermission } = useAuth()

{hasPermission('users:create') && (
  <Button onClick={createUser}>Add User</Button>
)}
```

#### ProtectedRoute
**File**: `src/components/ProtectedRoute.tsx`

**Purpose**: Guard routes that require authentication/permissions

**Props**:
```typescript
interface Props {
  children: ReactNode
  requiredPermission?: string     // Optional permission check
  requiredRole?: string           // Optional role check (future)
  fallback?: ReactNode            // Custom access denied message
}
```

**Logic**:
1. Check if user is authenticated
2. If not → redirect to /login
3. If authenticated, check requiredPermission
4. If lacks permission → show access denied
5. Otherwise → render children

**Usage**:
```tsx
<Route path="/users" element={
  <ProtectedRoute requiredPermission="users:view">
    <UserList />
  </ProtectedRoute>
} />
```

#### AppLayout
**File**: `src/components/AppLayout.tsx`

**Purpose**: Consistent layout with sidebar navigation

**Structure**:
```
┌────────────────────────────────────────────┐
│  [Logo]  Core ERP           [User Menu]    │  ← Header
├────────────┬───────────────────────────────┤
│            │                               │
│  📊 Dash   │                               │
│  👥 Users  │      Page Content             │
│  🛡️ Roles  │      (children)               │
│  🔐 Perms  │                               │
│  🚪 Logout │                               │
│            │                               │
└────────────┴───────────────────────────────┘
   Sidebar          Main Content Area
```

**Features**:
- Responsive (collapsible sidebar on mobile)
- Active route highlighting
- Permission-based menu items (hide what user can't access)
- User profile dropdown in header
- Sign out button

**Menu Items**:
- Dashboard → / (always visible)
- Users → /users (requires `users:view`)
- Roles → /roles (requires `roles:view`)
- Permissions → /permissions (requires `permissions:view`)

### Page Implementations

#### Dashboard
**File**: `src/pages/Dashboard.tsx`

**Purpose**: Landing page after login, system overview

**Sections**:
1. **Stats Cards**: Total users, active roles, total permissions
2. **Quick Actions**: Shortcuts to add user, create role (if permitted)
3. **Recent Activity**: Last 5 users created
4. **System Info**: Current user's roles and permission count

**Data Fetched**:
- All users (for count and recent list)
- All roles (for count)
- All permissions (for count)
- Current user info from AuthContext

#### UserList
**File**: `src/pages/Users/UserList.tsx`

**Purpose**: Browse and manage all users

**Features**:
- Table view with columns: Avatar/Name, Email, Phone, Roles (badges), Status, Actions
- Search by name or email (client-side filtering)
- Filter by role (dropdown)
- Filter by status (active/inactive)
- Sort by name or created date
- Pagination (20 users per page)
- "Add User" button (if has `users:create`)

**Actions per User**:
- View (navigate to UserDetail)
- Edit (navigate to UserForm with user ID)
- Delete (if has `users:delete`) - with confirmation dialog

**Data Source**: `useUsers()` hook → queries `users` table with joined roles

#### UserForm
**File**: `src/pages/Users/UserForm.tsx`

**Purpose**: Create or edit user

**Form Fields**:
- Name* (required, min 2 chars)
- Email* (required, email validation)
- Phone (optional, international format)
- Roles* (multi-select, at least one required)
- Status (active/inactive toggle)

**Validation**: React Hook Form + Zod schema

**Submit Logic**:
- If creating: Call `create-user` Edge Function
- If editing: Call `update-user` Edge Function
- Show success toast
- Redirect to UserDetail page

**Edge Cases**:
- Email uniqueness (handled by DB constraint, show error)
- Invalid phone format (Zod validation)
- Role assignment (ensure at least one role)

#### UserDetail
**File**: `src/pages/Users/UserDetail.tsx`

**Purpose**: View single user profile and manage

**Sections**:
1. **User Info**: Avatar, name, email, phone, status
2. **Assigned Roles**: Chips/badges for each role
3. **Effective Permissions**: List of all permissions (from all roles)
4. **Recent Activity**: User's actions from audit_log

**Actions**:
- Edit button → navigate to UserForm
- Assign Roles button → open dialog with role selector
- Deactivate/Activate toggle (if has permission)
- View Audit Log → filter audit_log by this user

#### RoleList
**File**: `src/pages/Roles/RoleList.tsx`

**Purpose**: Browse all roles

**Layout**: Card grid (3 columns)

**Each Card Shows**:
- Role name and description
- Level (hierarchy indicator)
- User count (how many users have this role)
- Permission count (how many permissions assigned)
- System badge (if is_system=true, cannot delete)

**Interactions**:
- Click card → navigate to RoleDetail
- "Add Role" button (if has `roles:create`)

#### RoleDetail
**File**: `src/pages/Roles/RoleDetail.tsx`

**Purpose**: View role and manage its permissions

**Sections**:
1. **Role Info**: Name, code, level, description, system flag
2. **Permission Assignment**: 
   - Grouped by category (users, roles, permissions, system)
   - Checkboxes for each permission
   - Select all per category
   - Save button
3. **Users with this Role**: List of users (with link to UserDetail)

**Permission Assignment Flow**:
1. Load current role_permissions
2. Display checkboxes (checked if role has permission)
3. User toggles checkboxes
4. Click Save
5. Delete all role_permissions for this role
6. Insert new role_permissions based on checked boxes
7. Show success toast
8. Invalidate React Query cache

---

## 🔐 Security Model

### Authentication Flow

1. **User visits site** → Check for Supabase session
2. **No session** → Redirect to /login
3. **Login page** → Enter email → Click "Send Magic Link"
4. **Supabase Auth** → Sends email with magic link
5. **User clicks link** → Supabase verifies token → Creates session
6. **Frontend detects session** → Fetch user profile → Load permissions
7. **AuthContext updates** → User is logged in
8. **Redirect to Dashboard**

### Permission Checking

**Server-Side (Edge Functions)**:
```typescript
// Before any sensitive operation
const hasPermission = await checkUserPermission(userId, 'users:create')
if (!hasPermission) {
  return new Response('Forbidden', { status: 403 })
}
```

**Client-Side (UI)**:
```typescript
// In React components
const { hasPermission } = useAuth()

// Conditional rendering
{hasPermission('users:create') && <AddUserButton />}

// Route guards
<ProtectedRoute requiredPermission="users:view">
  <UserList />
</ProtectedRoute>
```

**Important**: Client-side checks are for UX only. Real security is enforced by:
1. RLS policies on database tables
2. Permission checks in Edge Functions
3. Service role key only in Edge Functions (never exposed to client)

### Row Level Security (RLS)

All tables have RLS enabled. Example for `users` table:

```sql
-- Anyone can view users
CREATE POLICY "Users are viewable by authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert
CREATE POLICY "Users can only be inserted via Edge Functions"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Users can update their own profile OR admins can update anyone
CREATE POLICY "Users can update own profile or be admin"
  ON users FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = auth_user_id OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
      AND p.code = 'users:edit'
    )
  );
```

---

## 🚀 Deployment Model

### Per-Customer Deployment Process

1. **Create Supabase Project for Customer**
   - New Supabase project: `{customer-name}-erp`
   - Apply all migrations from `supabase/migrations/`
   - Seed default data (roles, permissions)

2. **Configure Environment**
   - Create `.env.{customer-name}` file
   - Set `VITE_SUPABASE_URL`
   - Set `VITE_SUPABASE_ANON_KEY`
   - Optional: Customer branding variables

3. **Build Application**
   ```bash
   cp .env.customer-a .env
   npm run build
   ```

4. **Deploy Edge Functions**
   ```bash
   supabase functions deploy get-user-permissions --project-ref {project-ref}
   supabase functions deploy create-user --project-ref {project-ref}
   supabase functions deploy update-user --project-ref {project-ref}
   ```

5. **Deploy Frontend**
   - Upload `dist/` folder to hosting (Vercel, Netlify, Cloudflare Pages)
   - Configure custom domain: `{customer-name}.yourdomain.com`

6. **Initialize First Admin User**
   - Use Supabase Dashboard to create user in auth
   - Insert into `users` table with service role
   - Assign `superadmin` role in `user_roles`

### Environment Variables

**Required**:
- `VITE_SUPABASE_URL` - Customer's Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anon key (public, safe to expose)

**Optional** (for customization):
- `VITE_CUSTOMER_NAME` - Display name in UI
- `VITE_CUSTOMER_LOGO` - Logo URL
- `VITE_CUSTOMER_PRIMARY_COLOR` - Theme color

### Hosting Options

**Recommended**:
- **Vercel** - Zero config, automatic HTTPS, edge network
- **Netlify** - Similar to Vercel, great DX
- **Cloudflare Pages** - Fast, generous free tier

**Self-Hosted**:
- Build static files: `npm run build`
- Serve `dist/` folder with any static host (nginx, Apache, etc.)

---

## 🛠️ Development Workflow

### Local Development

1. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Visits http://localhost:5175

2. **Environment Variables**
   - Uses `.env` file in root
   - Points to development Supabase project (gtktmxrshikgehfdopaa)

3. **Hot Module Replacement**
   - Vite provides instant HMR
   - Changes reflect immediately

### Database Changes

**Process**:
1. Write migration SQL in `supabase/migrations/`
2. Name: `{timestamp}_{description}.sql`
3. Test locally: `supabase db reset` (if running locally)
4. Deploy: Use Supabase Dashboard SQL Editor OR `supabase db push`

**Migration Guidelines**:
- Always add `IF NOT EXISTS` for idempotency
- Never delete system data (roles, permissions) in migrations
- Use transactions for multi-step changes
- Test rollback scenarios

### Adding New Permissions

1. **Add to Database**
   ```sql
   INSERT INTO permissions (code, name, description, category)
   VALUES ('invoices:create', 'Create Invoices', 'Can create new invoices', 'invoices');
   ```

2. **Update TypeScript Types** (if using generated types)
   ```bash
   supabase gen types typescript --project-id gtktmxrshikgehfdopaa > src/types/database.ts
   ```

3. **Use in Code**
   ```tsx
   {hasPermission('invoices:create') && <CreateInvoiceButton />}
   ```

4. **Assign to Roles**
   - Via UI: Go to Role Detail → Check new permission → Save
   - Via SQL: Insert into `role_permissions`

### Adding New Edge Function

1. **Create Function Folder**
   ```bash
   mkdir supabase/functions/my-new-function
   ```

2. **Write Function**
   ```typescript
   // supabase/functions/my-new-function/index.ts
   import { createClient } from '@supabase/supabase-js'
   import { corsHeaders } from '../_shared/cors.ts'
   
   Deno.serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }
     
     try {
       // Your logic here
       return new Response(
         JSON.stringify({ success: true }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
   })
   ```

3. **Deploy Function**
   ```bash
   supabase functions deploy my-new-function --project-ref gtktmxrshikgehfdopaa
   ```

4. **Call from Frontend**
   ```typescript
   const { data, error } = await supabase.functions.invoke('my-new-function', {
     body: { param: 'value' }
   })
   ```

---

## 📦 Dependencies & Tech Choices

### Core Dependencies

**React Ecosystem**:
- `react` v18.3.1 - UI library
- `react-dom` v18.3.1 - DOM rendering
- `react-router-dom` v6.30.1 - Routing

**State Management**:
- `@tanstack/react-query` v5.83.0 - Server state, caching
- Context API (built-in) - Global auth state

**Forms**:
- `react-hook-form` v7.61.1 - Form state management
- `zod` v3.25.76 - Schema validation
- `@hookform/resolvers` v3.10.0 - Bridge RHF ↔ Zod

**Backend**:
- `@supabase/supabase-js` v2.79.0 - Supabase client

**UI Components** (Radix UI primitives):
- `@radix-ui/react-avatar` - Avatar component
- `@radix-ui/react-checkbox` - Checkbox
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-dropdown-menu` - Dropdowns
- `@radix-ui/react-select` - Select inputs
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-tabs` - Tab panels
- `@radix-ui/react-toast` - Toast notifications
- `@radix-ui/react-tooltip` - Tooltips
- ... and more (total 48 UI components)

**Styling**:
- `tailwindcss` v3.4.17 - Utility CSS
- `tailwindcss-animate` v1.0.7 - Animation utilities
- `class-variance-authority` v0.7.1 - Variant handling
- `tailwind-merge` v2.6.0 - Merge Tailwind classes
- `clsx` v2.1.1 - Conditional classes

**Icons**:
- `lucide-react` v0.462.0 - Icon library

**Utilities**:
- `date-fns` v3.6.0 - Date formatting
- `sonner` v1.7.4 - Toast notifications

### Build Tools

**Development**:
- `vite` v5.4.19 - Build tool
- `@vitejs/plugin-react-swc` v3.11.0 - Fast Refresh with SWC

**TypeScript**:
- `typescript` v5.8.3 - Type checking
- `@types/react` v18.3.23 - React types
- `@types/react-dom` v18.3.7 - React DOM types
- `@types/node` v22.16.5 - Node types

**Linting**:
- `eslint` v9.32.0 - Code linting
- `typescript-eslint` v8.38.0 - TS-specific rules
- `eslint-plugin-react-hooks` v5.2.0 - React Hooks rules
- `eslint-plugin-react-refresh` v0.4.20 - Fast Refresh rules

---

## 🎯 Current Status & Next Steps

### ✅ Completed

- [x] Project setup (Vite, Tailwind, TypeScript)
- [x] Database schema designed and created
- [x] Default roles and permissions seeded
- [x] RLS policies enabled
- [x] Frontend structure complete
- [x] Authentication system (magic link)
- [x] All pages implemented (Dashboard, Users, Roles, Permissions)
- [x] UI components (48 from shadcn/ui)
- [x] AppLayout with sidebar
- [x] AuthContext with permission checking
- [x] React Query hooks for data fetching
- [x] get-user-permissions Edge Function created

### 🚧 To Deploy/Test

- [ ] Deploy all Edge Functions to Supabase
- [ ] Test create-user flow end-to-end
- [ ] Test role assignment
- [ ] Test permission checking in UI
- [ ] Add first admin user to production
- [ ] Test magic link authentication
- [ ] Verify RLS policies work correctly
- [ ] Test audit log functionality

### ✅ Recently Implemented

- [x] **Plugin system for ERP modules** - Complete! See [`docs/plugins/`](./docs/plugins/README.md)
- [x] **Internationalization (i18n)** - Database-backed with en/th support
- [x] **Responsive UI** - Mobile-first design with responsive components

### 🔮 Future Enhancements

- [ ] Advanced audit log viewer with filtering
- [ ] User profile picture upload
- [ ] Email notifications (integration with plugins)
- [ ] Two-factor authentication
- [ ] API key management
- [ ] Dark mode
- [ ] Export users/roles to CSV
- [ ] Bulk user import
- [ ] Plugin marketplace UI
- [ ] Visual plugin manager

---

## 🧠 Key Concepts to Remember

### Users vs. Roles vs. Permissions

**Users**: People who use the system
- Have profile info (name, email, phone)
- Can be active or inactive
- Have one or more roles

**Roles**: Job functions or responsibility levels
- e.g., "Sales Manager", "Accountant", "Admin"
- Have a hierarchy level (0-100)
- Collect related permissions
- Can be assigned to multiple users

**Permissions**: Specific actions a user can perform
- e.g., "Create users", "View reports", "Delete invoices"
- Very granular (fine-grained control)
- Assigned to roles (not directly to users)
- A user's permissions = union of all their roles' permissions

### Why This Separation?

**Without roles** (Direct user → permission):
- Assign 50 permissions to every new manager → tedious
- Change what managers can do → update 100 users individually

**With roles** (User → Role → Permissions):
- Assign "Manager" role to new manager → instant access
- Change what managers can do → update role once → all managers updated

### System vs. Custom Roles

**System Roles** (is_system=true):
- superadmin, admin, user
- Cannot be deleted
- Pre-configured permissions
- Core to system functioning

**Custom Roles** (is_system=false):
- Created by admins for specific needs
- e.g., "Warehouse Manager", "Customer Support", "Accountant"
- Can be modified or deleted
- Business-specific

---

## 🎓 Code Patterns & Conventions

### Naming Conventions

**Files**:
- Components: PascalCase (e.g., `UserList.tsx`, `AppLayout.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useUsers.ts`, `useAuth.ts`)
- Utils: camelCase (e.g., `utils.ts`, `api.ts`)
- Types: PascalCase (e.g., `User`, `Role`, `Permission`)

**Database**:
- Tables: lowercase, plural (e.g., `users`, `roles`, `permissions`)
- Columns: snake_case (e.g., `auth_user_id`, `is_active`, `created_at`)
- Permissions: `resource:action` (e.g., `users:create`, `roles:view`)

**Components**:
- UI components: lowercase (e.g., `<button>`, `<card>`)
- Page components: PascalCase (e.g., `<UserList>`, `<Dashboard>`)

### Data Fetching Pattern

```typescript
// 1. Define query hook
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles:user_roles(role:roles(*))')
      if (error) throw error
      return data
    }
  })
}

// 2. Define mutation hook
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// 3. Use in component
function UserList() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  
  if (isLoading) return <LoadingState />
  
  return (
    <div>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
      <Button onClick={() => createUser.mutate({ ... })}>
        Add User
      </Button>
    </div>
  )
}
```

### Permission Check Pattern

```typescript
// In component
const { hasPermission } = useAuth()

// Conditional rendering
{hasPermission('users:create') && (
  <Button onClick={handleCreate}>Add User</Button>
)}

// Disable button
<Button 
  onClick={handleDelete}
  disabled={!hasPermission('users:delete')}
>
  Delete
</Button>

// Route protection
<Route path="/users" element={
  <ProtectedRoute requiredPermission="users:view">
    <UserList />
  </ProtectedRoute>
} />
```

### Form Pattern

```typescript
// 1. Define Zod schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role_ids: z.array(z.string()).min(1, 'Select at least one role')
})

// 2. Initialize form
const form = useForm({
  resolver: zodResolver(userSchema),
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    role_ids: []
  }
})

// 3. Submit handler
const onSubmit = async (data) => {
  try {
    await createUser.mutateAsync(data)
    navigate('/users')
  } catch (error) {
    toast.error(error.message)
  }
}

// 4. Render form
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

---

## 📚 Additional Resources

### Documentation

- **Supabase Docs**: https://supabase.com/docs
- **React Router Docs**: https://reactrouter.com/
- **TanStack Query Docs**: https://tanstack.com/query/latest
- **shadcn/ui Docs**: https://ui.shadcn.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs

### Related Files

- **Full Implementation Plan**: `../PLAN_CORE_ERP.md` (in workspace root)
- **Start Guide**: `START_GUIDE.md`
- **Package Info**: `package.json`
- **TypeScript Config**: `tsconfig.json`
- **Vite Config**: `vite.config.ts`

### Supabase Project

- **Project ID**: gtktmxrshikgehfdopaa
- **URL**: https://gtktmxrshikgehfdopaa.supabase.co
- **Dashboard**: https://app.supabase.com/project/gtktmxrshikgehfdopaa
- **Cost**: $10/month (Pro plan)
- **Region**: ap-southeast-1 (Thailand)

---

## 🤝 Working on This Project

### For AI Assistants

When working on this codebase:

1. **Understand the architecture**: This is a per-customer deployable ERP foundation
2. **Security first**: Always check permissions, use RLS, validate input
3. **Consistency**: Follow existing patterns (hooks, components, naming)
4. **Type safety**: Use TypeScript properly, define types for DB tables
5. **User experience**: Loading states, error messages, empty states, confirmations
6. **Audit**: Log important actions to audit_log
7. **Test edge cases**: What if user has no roles? Multiple roles? Deactivated?

### For Developers

When adding features:

1. **Database first**: Design schema, create migration, apply
2. **Edge Function**: If needs admin/complex logic, create function
3. **Types**: Update TypeScript types (or generate from Supabase)
4. **Hooks**: Create React Query hook for data fetching
5. **UI**: Build component/page using shadcn/ui components
6. **Permissions**: Add permission check if needed
7. **Test**: Verify RLS works, test with different roles
8. **Document**: Update this file if architecture changes

---

## ❓ FAQ

**Q: Why separate users table from auth.users?**
A: auth.users is managed by Supabase Auth (read-only). We need custom fields and full control, so we mirror it in users table.

**Q: Can users have multiple roles?**
A: Yes. Their effective permissions are the union of all permissions from all their roles.

**Q: What happens if I delete a role that users have?**
A: CASCADE delete in user_roles removes those assignments. Users lose permissions from that role.

**Q: Can I modify system roles?**
A: You can modify their permissions, but cannot delete them (is_system=true prevents deletion).

**Q: How do I add a first admin user?**
A: Use Supabase Dashboard SQL editor → Create auth user → Insert into users → Insert into user_roles with superadmin role_id.

**Q: Why Edge Functions instead of direct DB access?**
A: Edge Functions use service_role key to bypass RLS for admin operations. They also centralize business logic and audit logging.

**Q: Is this multi-tenant?**
A: No. Each customer gets their own deployment and Supabase project. Complete data isolation.

**Q: Can I customize per customer?**
A: Yes. Fork the codebase for each customer, modify as needed, deploy separately. Or use the plugin system to enable/disable features per customer via plugins.config.ts.

**Q: What about plugins?**
A: ✅ **Plugin system is implemented!** Complete documentation at [`docs/plugins/README.md`](./docs/plugins/README.md). You can now create modular ERP features as plugins, install them via npm, and configure them per customer without touching core code.

**Q: How do I add features as plugins?**
A: See [`docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md`](./docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md) for complete tutorial.

---

## 🔌 Plugin System

**Status**: ✅ **Implemented and Ready**

The Core ERP now includes a comprehensive plugin system that allows you to extend the platform with modular features.

### Quick Overview

- **Architecture**: Core-controlled, configuration-driven
- **Distribution**: Private NPM packages
- **Integration**: Automatic (routes, menus, permissions)
- **Control**: Everything configured via `plugins.config.ts`
- **Localization**: Full i18n support with core overrides
- **Security**: Permission-based access control

### Documentation

Complete plugin documentation available at **[`docs/plugins/`](./docs/plugins/README.md)**

**Essential Guides:**
1. [Plugin Management Quick Start](./docs/plugins/PLUGIN_MANAGEMENT_QUICK_START.md) - Add/remove plugins
2. [Plugin Development Guide](./docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md) - Create plugins
3. [Implementation Summary](./docs/plugins/IMPLEMENTATION_SUMMARY.md) - Technical overview

### Benefits

- ✅ Modular feature development
- ✅ Per-customer customization (enable/disable features)
- ✅ No core code changes needed
- ✅ Type-safe plugin development
- ✅ Automatic integration with auth, i18n, routing

---

**Last Updated**: 2025-01-10  
**Project Version**: 1.0.0  
**Status**: ✅ Core Complete + Plugin System Ready

