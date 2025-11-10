# Supabase-Based Localization System

## Overview

The Core ERP localization system now fetches translations from Supabase database instead of static JSON files. This provides:

✅ **Dynamic translations** - Update without redeploying  
✅ **Database-backed** - Centralized translation management  
✅ **Fallback support** - Shows translation keys when fetch fails  
✅ **Caching** - Fast performance with in-memory cache  
✅ **Preloading** - All translations loaded on app startup  

## Architecture

### Database Schema

**Table: `translations`**
```sql
- id: UUID (primary key)
- locale: VARCHAR(10) (e.g., 'en', 'th')
- namespace: VARCHAR(50) (e.g., 'common', 'auth')
- key: TEXT (e.g., 'actions.save')
- value: TEXT (e.g., 'Save')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- UNIQUE(locale, namespace, key)
```

### Translation Flow

```
App Startup
    ↓
Preload Translations (all locales/namespaces)
    ↓
Fetch from Supabase → Cache in Memory
    ↓
i18next uses cached translations
    ↓
On Change Language → Load from cache (instant)
    ↓
If cache miss → Fetch from Supabase
    ↓
If fetch fails → Show translation key
```

## Setup Instructions

### 1. Apply Database Migrations

```bash
# Option A: Via Supabase Dashboard
# Go to SQL Editor and run:
# - supabase/migrations/20250110000004_create_translations_table.sql
# - supabase/migrations/20250110000005_seed_translations.sql

# Option B: Via Supabase CLI (if installed)
supabase db push
```

### 2. Verify Translations in Database

```sql
-- Check translations are loaded
SELECT locale, namespace, COUNT(*) as count
FROM translations
GROUP BY locale, namespace
ORDER BY locale, namespace;

-- Expected output:
-- en | common | ~28 rows
-- en | auth   | ~13 rows
-- en | users  | ~10 rows
-- en | roles  | ~5 rows
-- th | common | ~28 rows
-- th | auth   | ~13 rows
-- th | users  | ~10 rows
-- th | roles  | ~5 rows
```

### 3. Test the Application

```bash
npm run dev
```

**What to test:**
1. App should load without errors
2. Translations should display correctly
3. Language switcher should work
4. If you temporarily disable Supabase connection, translation keys should appear

## How It Works

### Custom Backend

**File: `src/lib/supabaseI18nBackend.ts`**

The `SupabaseBackend` class implements i18next's backend interface:

- `read(language, namespace, callback)` - Fetches translations
- Converts flat keys (e.g., `actions.save`) to nested objects
- Caches results to avoid repeated database calls
- Returns empty object on error (causes i18next to show keys)

### Configuration

**File: `src/i18n/config.ts`**

```typescript
i18n
  .use(SupabaseBackend)      // Custom Supabase backend
  .use(LanguageDetector)     // Browser language detection
  .use(initReactI18next)     // React integration
  .init({
    // Shows keys when translation missing
    parseMissingKeyHandler: (key) => key
  })
```

### Preloading

**File: `src/lib/preloadTranslations.ts`**

Preloads all translations on app startup:
- Runs before React renders
- Loads all locales × namespaces in parallel
- Populates cache
- App doesn't block if it fails (loads on demand)

### Locale Update

**File: `src/contexts/LocaleContext.tsx`**

Updated to save locale directly to database:
```typescript
await supabase
  .from('users')
  .update({ locale: newLocale, timezone })
  .eq('id', user.id)
```

No Edge Function needed - uses RLS policies.

## Adding New Translations

### Option 1: Via SQL (Recommended for bulk)

```sql
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'common', 'new_feature.title', 'New Feature'),
('th', 'common', 'new_feature.title', 'ฟีเจอร์ใหม่')
ON CONFLICT (locale, namespace, key) 
DO UPDATE SET value = EXCLUDED.value;
```

### Option 2: Via Supabase Dashboard

1. Go to Table Editor → `translations`
2. Click "Insert row"
3. Fill in: locale, namespace, key, value
4. Save

### Option 3: Programmatically (Future)

You can build an admin interface to manage translations:

```typescript
const { error } = await supabase
  .from('translations')
  .upsert({
    locale: 'en',
    namespace: 'common',
    key: 'new_key',
    value: 'New Value'
  })
```

## Translation Key Format

### Dot Notation

Keys use dot notation for nesting:

```
actions.save     → { actions: { save: 'Save' } }
login.title      → { login: { title: 'Sign In' } }
messages.error   → { messages: { error: 'Error' } }
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('common')
  
  return (
    <button>{t('actions.save')}</button>
  )
}

// Multiple namespaces
const { t } = useTranslation(['common', 'auth'])
t('common:actions.save')  // 'Save'
t('auth:login.title')     // 'Sign In'
```

## Fallback Behavior

### When Translations Fail to Load

The system shows **translation keys** instead of text:

**Example:**
- Translation loads successfully: "Dashboard"
- Translation fails: "common:navigation.dashboard"

This makes it obvious when translations are missing or failed to load.

### Console Logging

Watch the browser console for translation status:

```
[i18n] Preloading translations...
[i18n] Fetching translations for en:common
[i18n] Loaded 28 translations for en:common
[i18n] Using cached translations for en:common
[i18n] Translation preloading complete
```

## Performance

### Caching Strategy

**First Load:**
```
Request → Supabase → Cache → i18next
~500ms (depends on network)
```

**Subsequent Loads:**
```
Request → Cache → i18next
<1ms (instant)
```

### Preloading Impact

- **Without preloading**: Each namespace loads on-demand (200-500ms delay)
- **With preloading**: All translations ready before UI renders (no delays)

### Cache Management

**Clear cache programmatically:**
```typescript
import { clearTranslationCache } from '@/lib/supabaseI18nBackend'

// Force refresh from database
clearTranslationCache()
await i18n.reloadResources()
```

## Security

### Row Level Security (RLS)

**Read Policy:** Public (anyone can read)
```sql
CREATE POLICY "Translations are viewable by everyone"
  ON translations FOR SELECT USING (true);
```

**Write Policy:** Only admins with `system:configure` permission
```sql
CREATE POLICY "Only admins can modify translations"
  ON translations FOR ALL USING (
    -- User must have system:configure permission
  );
```

This means:
- ✅ Anyone can read translations (needed for app to work)
- ❌ Only authorized admins can add/edit translations

## Troubleshooting

### Translations Not Loading

**Check:**
1. Migrations applied: `SELECT COUNT(*) FROM translations;`
2. Browser console for errors
3. Network tab for Supabase requests
4. RLS policies allow SELECT

**Quick fix:**
```sql
-- Verify translations exist
SELECT * FROM translations LIMIT 10;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'translations';
```

### Language Change Error

**Symptoms:** "เปลี่ยนภาษาไม่สำเร็จ" (Failed to change language)

**Causes:**
1. User not authenticated
2. RLS policy blocking update
3. Invalid locale value

**Fix:**
```sql
-- Check user can update their locale
SELECT * FROM users WHERE id = 'user-id';

-- Verify locale column exists
\d users
```

### Keys Showing Instead of Translations

**This is expected when:**
- Database connection fails
- No translations for that key
- Cache is cleared and fetch fails

**Check:**
```javascript
// Browser console
localStorage.getItem('i18nextLng')  // Should be 'en' or 'th'
```

## Migration from JSON Files

The JSON files in `src/i18n/locales/` are **no longer used** but kept for reference.

**What changed:**
- ❌ Before: i18next loaded from JSON files
- ✅ Now: i18next loads from Supabase

**Benefits:**
- Update translations without code deployment
- Add new languages without rebuilding app
- Centralized translation management
- Can build translation admin interface

## Adding New Languages

1. **Insert language translations:**
```sql
INSERT INTO translations (locale, namespace, key, value) VALUES
('es', 'common', 'app_name', 'Core ERP'),
('es', 'common', 'actions.save', 'Guardar'),
-- ... more translations
```

2. **Update supported locales:**
```typescript
// src/lib/formatters.ts
export type SupportedLocale = 'en' | 'th' | 'es'

// src/lib/preloadTranslations.ts
const locales = ['en', 'th', 'es']
```

3. **Add to LocaleSelector:**
```typescript
// src/components/LocaleSelector.tsx
<SelectItem value="es">
  <span>🇪🇸</span>
  <span>Español</span>
</SelectItem>
```

4. **Update database constraint:**
```sql
ALTER TABLE users DROP CONSTRAINT users_locale_check;
ALTER TABLE users ADD CONSTRAINT users_locale_check 
  CHECK (locale IN ('en', 'th', 'es'));
```

## Best Practices

### 1. Consistent Key Naming

```
✅ Good:
  actions.save
  navigation.dashboard
  messages.error

❌ Bad:
  Save
  Dashboard-Link
  ERR_MESSAGE
```

### 2. Namespace Organization

```
common    - Shared UI elements
auth      - Authentication
users     - User management
roles     - Role management
errors    - Error messages
<feature> - Feature-specific translations
```

### 3. Avoid Hardcoded Text

```typescript
❌ Bad:
<button>Save</button>

✅ Good:
<button>{t('common:actions.save')}</button>
```

### 4. Test Both Languages

Always test:
- English version works
- Thai version works
- Language switching works
- Missing keys show as keys (not errors)

## Monitoring

### Check Translation Coverage

```sql
-- Count translations per locale/namespace
SELECT 
  locale,
  namespace,
  COUNT(*) as translation_count
FROM translations
GROUP BY locale, namespace
ORDER BY locale, namespace;

-- Find missing translations (keys in EN but not TH)
SELECT DISTINCT t1.key
FROM translations t1
WHERE t1.locale = 'en'
  AND t1.key NOT IN (
    SELECT key FROM translations WHERE locale = 'th'
  );
```

### Audit Translation Changes

```sql
-- Recent translation updates
SELECT 
  locale,
  namespace,
  key,
  value,
  updated_at
FROM translations
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;
```

## Files Reference

### New Files
- `supabase/migrations/20250110000004_create_translations_table.sql`
- `supabase/migrations/20250110000005_seed_translations.sql`
- `src/lib/supabaseI18nBackend.ts`
- `src/lib/preloadTranslations.ts`
- `SUPABASE_LOCALIZATION_GUIDE.md`

### Modified Files
- `src/i18n/config.ts` - Uses SupabaseBackend
- `src/main.tsx` - Preloads translations
- `src/contexts/LocaleContext.tsx` - Direct DB update
- `src/types/i18next.d.ts` - Simplified types

### Deprecated Files
- `src/i18n/locales/en/*.json` - Keep for reference only
- `src/i18n/locales/th/*.json` - Keep for reference only
- `supabase/functions/update-user-locale/` - No longer needed

## Summary

🎉 **Your localization system is now fully database-backed!**

**Key Benefits:**
- ✅ Translations stored in Supabase
- ✅ Fetched on app startup
- ✅ Shows keys when fetch fails (never breaks UI)
- ✅ Direct database updates (no Edge Function needed)
- ✅ Fast performance with caching
- ✅ Easy to manage and update

**Next Steps:**
1. Apply the migrations
2. Test the application
3. Optionally build translation management UI

---

**Last Updated:** 2025-01-10  
**Version:** 2.0 (Supabase-backed)

