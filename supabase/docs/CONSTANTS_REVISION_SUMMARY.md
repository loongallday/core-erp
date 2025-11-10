# System Constants Revision Summary

## Overview

The system constants have been moved from hardcoded TypeScript files to the Supabase database and revised to align with Core ERP project conventions.

## Changes Made

### 1. Database Migration ✅

**Created:** `system_config` table in Supabase
- Stores configuration as JSONB for flexibility
- RLS policies: read for all authenticated, write for `system:configure` permission
- Includes metadata: description, category, is_system flag
- Auto-updating timestamps
- 8 initial constants migrated from code

### 2. Core Module (`supabase/constants.ts`) ✅

**Aligned with project conventions:**

✅ **Logging Integration**
- Uses centralized `logger` from `src/lib/logger.ts`
- Replaced `console.error/warn/log` with `logError()`, `logWarn()`, `logDebug()`
- Includes context for better debugging: `{ component: 'SystemConfig', action: '...' }`
- Environment-aware logging (silent in production)

✅ **Type Safety**
- Added `SystemConfigRow` interface for database schema
- Strong typing for all functions and exports
- TypeScript generics for type-safe config value access
- Proper error type casting

✅ **Error Handling**
- Try-catch blocks with proper error propagation
- Fallback to default values if database unavailable
- Graceful degradation pattern

✅ **Caching Pattern**
- Similar to `supabaseI18nBackend.ts` translation cache
- 5-minute TTL with manual invalidation support
- Pre-loads on module initialization

✅ **Documentation**
- Comprehensive JSDoc comments
- Usage examples in comments
- Clear function signatures

### 3. React Query Hooks (`src/hooks/useSystemConfig.ts`) ✅

**Following project patterns from `useTranslations.ts`:**

✅ **Standard Hook Structure**
```typescript
// Query hooks
export function useSystemConfig()
export function useSystemConfigValue(key)
export function useSystemConfigAdmin()

// Mutation hooks
export function useUpdateSystemConfig()
export function useBulkUpdateSystemConfig()
```

✅ **Consistent Patterns**
- Uses `@tanstack/react-query`
- Proper `queryKey` structure
- `staleTime` and `gcTime` configuration
- Toast notifications on success/error
- Query invalidation after mutations
- Cache clearing integration

✅ **Error Handling**
- Supabase type casting: `(supabase.from('...') as any)`
- Matches pattern from `useTranslations.ts`
- Error messages via toast notifications

✅ **Shared Success/Error Handlers**
- Consistent mutation response handling
- Cache invalidation on updates
- User feedback through toast

### 4. Documentation (`supabase/docs/SYSTEM_CONFIG.md`) ✅

**Comprehensive documentation:**
- Table structure and schema
- Current constants with descriptions
- Usage examples for React and non-React code
- Security and RLS information
- Caching strategy explanation
- Migration guide from old patterns
- Best practices
- Troubleshooting guide

## Alignment with Core ERP Conventions

### ✅ Naming Conventions
- Files: `constants.ts` (camelCase for utils)
- Hooks: `useSystemConfig.ts` (camelCase with "use" prefix)
- Database: `system_config` table (snake_case)
- Functions: camelCase (getSystemConfig, clearConfigCache)

### ✅ Import Patterns
```typescript
// Hooks use path aliases
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Cross-boundary imports use relative paths
import { supabase } from '../src/lib/supabase'
```

### ✅ Data Fetching Patterns
- React Query for components (like `useTranslations`)
- Async functions for server-side/Edge Functions
- Proper loading states and error handling
- Query key structure: `['system_config']`, `['system_config', key]`

### ✅ Type Safety
- Interfaces for all data structures
- Generic type parameters for type-safe access
- Proper TypeScript error handling
- Exported types for reuse

### ✅ Security Patterns
- RLS policies on database table
- Permission checks (system:configure)
- Service role key only in Edge Functions
- Client-side uses authenticated user context

### ✅ Logging and Monitoring
- Environment-aware logging
- Structured log context
- Component and action tracking
- Error tracking with stack traces

### ✅ UX Patterns
- Toast notifications for user feedback
- Loading states in React Query
- Error boundaries support
- Graceful fallbacks

## File Structure

```
supabase/
├── constants.ts              # Core module with cache logic
└── docs/
    ├── SYSTEM_CONFIG.md      # Comprehensive guide
    └── CONSTANTS_REVISION_SUMMARY.md  # This file

src/
└── hooks/
    └── useSystemConfig.ts    # React Query hooks

Database:
└── public.system_config      # Configuration table
```

## Usage Comparison

### Old Way ❌
```typescript
// Hardcoded constants
export const MAX_AUTH_RETRIES = 3

// Direct usage
import { MAX_AUTH_RETRIES } from './constants'
console.log(MAX_AUTH_RETRIES)
```

### New Way ✅

**React Components:**
```typescript
import { useSystemConfigValue } from '@/hooks/useSystemConfig'

function MyComponent() {
  const { data, isLoading } = useSystemConfigValue('MAX_AUTH_RETRIES')
  if (isLoading) return <LoadingSpinner />
  return <div>{data}</div>
}
```

**Non-React / Edge Functions:**
```typescript
import { getConfigValue } from '../supabase/constants'

const maxRetries = await getConfigValue('MAX_AUTH_RETRIES')
```

## Benefits of Revision

1. **✅ Follows project conventions** - Matches patterns from existing code
2. **✅ Better logging** - Uses centralized logger with context
3. **✅ Type safety** - Proper TypeScript throughout
4. **✅ React Query integration** - Consistent with other hooks
5. **✅ Separation of concerns** - Core logic separate from React hooks
6. **✅ Comprehensive docs** - Clear usage and migration guides
7. **✅ Dynamic configuration** - Can be updated without deployment
8. **✅ Per-customer customization** - Each deployment can have different values

## Testing Checklist

- [ ] Verify constants load on app startup
- [ ] Test React Query hooks in components
- [ ] Verify RLS policies work correctly
- [ ] Test update mutations with proper permissions
- [ ] Verify cache invalidation works
- [ ] Test fallback to defaults when DB unavailable
- [ ] Verify logging in development vs production
- [ ] Test synchronous access after initial load

## Future Enhancements

1. **Admin UI** - Create settings page using `useSystemConfigAdmin()`
2. **Real-time Updates** - Use Supabase realtime for instant updates
3. **Validation** - Add JSON schema validation for config values
4. **Audit Log** - Track config changes in audit_log table
5. **Environment Variants** - Support dev/staging/prod configs

## Migration Steps for Existing Code

1. Replace hardcoded imports:
   ```typescript
   // Old
   import { MAX_AUTH_RETRIES } from '@/lib/constants'
   
   // New (React)
   import { useSystemConfigValue } from '@/hooks/useSystemConfig'
   const { data: MAX_AUTH_RETRIES } = useSystemConfigValue('MAX_AUTH_RETRIES')
   
   // New (Non-React)
   import { getConfigValue } from '../supabase/constants'
   const MAX_AUTH_RETRIES = await getConfigValue('MAX_AUTH_RETRIES')
   ```

2. Update any code that directly references constants
3. Test thoroughly in development
4. Update any tests that mock constants
5. Deploy and verify in staging

---

**Revision Date:** November 10, 2025  
**Status:** ✅ Complete and aligned with Core ERP conventions

