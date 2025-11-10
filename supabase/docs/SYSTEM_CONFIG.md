# System Configuration (Database-Backed Constants)

## Overview

System constants are now stored in the Supabase `system_config` table instead of being hardcoded in TypeScript files. This provides several benefits:

- **Dynamic Updates**: Change configuration without redeploying the application
- **Per-Customer Customization**: Each customer deployment can have different values
- **Audit Trail**: Track when and who changed configuration values
- **Centralized Management**: Manage all constants through the database or admin UI

## Table Structure

```sql
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Current Constants

### Session Management (`category: session`)

| Key | Type | Default Value | Description |
|-----|------|---------------|-------------|
| `SESSION_WARNING_THRESHOLDS` | number[] | `[300000, 60000]` | Warning times before session expiry (5min, 1min) |
| `ACTIVITY_DEBOUNCE_MS` | number | `30000` | Debounce delay for activity tracking (30s) |
| `SESSION_CHECK_INTERVAL_MS` | number | `60000` | Interval for checking session status (1min) |
| `ACTIVITY_EVENTS` | string[] | `["mousemove", "keydown", "click", "scroll", "touchstart"]` | Events that count as user activity |

### Authentication (`category: auth`)

| Key | Type | Default Value | Description |
|-----|------|---------------|-------------|
| `MAX_AUTH_RETRIES` | number | `3` | Maximum retry attempts for auth operations |
| `AUTH_RETRY_BASE_DELAY_MS` | number | `1000` | Base delay for exponential backoff (1s) |
| `AUTH_SYNC_CHANNEL` | string | `"auth-sync"` | BroadcastChannel name for cross-tab sync |
| `RETURN_URL_KEY` | string | `"auth_return_url"` | LocalStorage key for return URLs |

## Usage in Code

### React Components (Recommended)

For React components, use the React Query hooks for automatic caching and state management:

```typescript
import { useSystemConfig, useSystemConfigValue } from '@/hooks/useSystemConfig'

function MyComponent() {
  // Get all config
  const { data: config, isLoading, error } = useSystemConfig()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <div>Max retries: {config.MAX_AUTH_RETRIES}</div>
}

// Or get a specific value
function AuthComponent() {
  const { data: maxRetries } = useSystemConfigValue('MAX_AUTH_RETRIES')
  return <div>Max retries: {maxRetries}</div>
}
```

### Updating Configuration (Admin Only)

```typescript
import { useUpdateSystemConfig } from '@/hooks/useSystemConfig'

function SettingsPage() {
  const updateConfig = useUpdateSystemConfig()
  
  const handleSave = () => {
    updateConfig.mutate({
      key: 'MAX_AUTH_RETRIES',
      value: 5
    })
  }
  
  return (
    <button 
      onClick={handleSave}
      disabled={updateConfig.isPending}
    >
      Save
    </button>
  )
}
```

### Non-React / Server-Side Usage

For Edge Functions or non-React code:

```typescript
import { getSystemConfig, getConfigValue } from '@/lib/systemConfig'

// Get all config at once (recommended at app startup)
const config = await getSystemConfig()
console.log(config.MAX_AUTH_RETRIES) // 3

// Get a specific value
const maxRetries = await getConfigValue('MAX_AUTH_RETRIES')
```

### Synchronous Access (After Initial Load)

```typescript
import { getSystemConfigSync, SESSION_CHECK_INTERVAL_MS } from '@/lib/systemConfig'

// After config has been loaded once, use sync access
const config = getSystemConfigSync()
const interval = SESSION_CHECK_INTERVAL_MS()
```

### Pre-loading at App Startup

The config is automatically pre-loaded when the module is imported, but you can explicitly pre-load:

```typescript
// In main.tsx or App.tsx
import { getSystemConfig } from '@/lib/systemConfig'

async function initApp() {
  await getSystemConfig() // Pre-load config
  // ... rest of initialization
}
```

### Clearing Cache (After Config Updates)

```typescript
import { clearConfigCache } from '@/lib/systemConfig'

// After updating config in the database
await updateSystemConfig('MAX_AUTH_RETRIES', 5)
clearConfigCache() // Force refresh on next access

// Note: React Query hooks automatically clear cache on updates
```

## Managing Configuration

### Reading Configuration

```sql
-- Get all configuration
SELECT * FROM system_config ORDER BY category, key;

-- Get specific category
SELECT * FROM system_config WHERE category = 'auth';

-- Get specific value
SELECT value FROM system_config WHERE key = 'MAX_AUTH_RETRIES';
```

### Updating Configuration

```sql
-- Update a single value
UPDATE system_config 
SET value = '5'::jsonb 
WHERE key = 'MAX_AUTH_RETRIES';

-- Update array value
UPDATE system_config 
SET value = '["mousemove", "keydown", "click"]'::jsonb 
WHERE key = 'ACTIVITY_EVENTS';
```

### Adding New Configuration

```sql
INSERT INTO system_config (key, value, description, category)
VALUES (
  'NEW_CONSTANT',
  '"value"'::jsonb,
  'Description of the constant',
  'category_name'
);
```

**Note**: After adding new constants, you must update the `SystemConfig` interface in `src/lib/systemConfig.ts`.

## Security

### Row Level Security (RLS)

- **Read Access**: All authenticated users can read system config
- **Write Access**: Only users with `system:configure` permission can modify

### System Protection

- Constants with `is_system = true` cannot be deleted (update only)
- Deleting system constants requires direct database access with proper permissions

## Caching Strategy

- **Cache Duration**: 5 minutes (TTL)
- **Cache Invalidation**: Automatic after TTL or manual via `clearConfigCache()`
- **Fallback**: If database is unavailable, uses hardcoded defaults

## Best Practices

1. **Use React Query hooks in components**: Provides automatic caching, loading states, and error handling
2. **Use async functions in Edge Functions**: `getSystemConfig()` or `getConfigValue()`
3. **Use typed access**: TypeScript will catch invalid config keys at compile time
4. **Document changes**: Update this file when adding new constants
5. **Test defaults**: Ensure fallback values are sensible for offline scenarios
6. **Leverage logging**: Uses centralized logger for environment-aware logging

## Migration from Hardcoded Constants

### Old Pattern (Hardcoded)
```typescript
// src/lib/constants.ts
export const MAX_AUTH_RETRIES = 3
export const AUTH_SYNC_CHANNEL = 'auth-sync'

// Usage
import { MAX_AUTH_RETRIES } from './constants'
console.log(MAX_AUTH_RETRIES) // 3
```

### New Pattern (Database-Backed)

**In React Components:**
```typescript
import { useSystemConfigValue } from '@/hooks/useSystemConfig'

function MyComponent() {
  const { data: maxRetries } = useSystemConfigValue('MAX_AUTH_RETRIES')
  return <div>Max retries: {maxRetries}</div>
}
```

**In Non-React Code:**
```typescript
import { getConfigValue } from '@/lib/systemConfig'

async function myFunction() {
  const maxRetries = await getConfigValue('MAX_AUTH_RETRIES')
  console.log(maxRetries) // 3
}
```

**For Synchronous Access (after initial load):**
```typescript
import { MAX_AUTH_RETRIES } from '@/lib/systemConfig'

// Function call (returns cached value)
const retries = MAX_AUTH_RETRIES() // 3
```

## Troubleshooting

### Config not loading
- Check database connection
- Verify RLS policies allow read access
- Check console for error messages

### Stale values after update
- Clear cache: `clearConfigCache()`
- Wait for TTL (5 minutes) to expire
- Verify database was actually updated

### TypeScript errors
- Ensure `SystemConfig` interface is updated
- Run `npm run build` to check types
- Restart TypeScript server in IDE

## Future Enhancements

Potential improvements for the config system:

1. **Admin UI**: Create a settings page to manage config through the UI
2. **Real-time Updates**: Use Supabase realtime to push config changes
3. **Validation**: Add JSON schema validation for config values
4. **Versioning**: Track config history in audit log
5. **Environment-specific**: Support dev/staging/prod config variants

