# i18n Architecture Explained

Understanding how translations work in Core ERP and the plugin system.

---

## 🎯 The Short Answer

**Local JSON files** (`src/i18n/locales/`) are **SOURCE FILES** for Core ERP translations. They are:
- ✅ Used to seed the database (via migrations)
- ✅ Version controlled in git
- ✅ Easy to edit for developers
- ❌ **NOT loaded directly by i18next at runtime**

**At runtime**, Core ERP fetches translations from **Supabase database**.

---

## 🏗️ Complete Architecture

### Core ERP Translations (Database-Backed)

```
Developer edits:
src/i18n/locales/en/common.json
        ↓
Create migration:
supabase/migrations/XXXXX_seed_translations.sql
        ↓
Apply to database:
INSERT INTO translations (locale, namespace, key, value) VALUES (...)
        ↓
Runtime fetch:
SupabaseBackend → SELECT * FROM translations
        ↓
Display:
i18next → React components
```

**Code Flow**:
```typescript
// 1. i18next configured with SupabaseBackend
i18n.use(SupabaseBackend)  // Custom backend

// 2. Component requests translation
const { t } = useTranslation('common')
t('actions.save')

// 3. SupabaseBackend fetches from database
await supabase
  .from('translations')
  .select('key, value')
  .eq('locale', 'en')
  .eq('namespace', 'common')

// 4. Returns: "Save"
```

### Plugin Translations (In-Memory)

```
Plugin provides:
@core-erp/plugin-inventory/src/translations/en.json
        ↓
LocalizationManager loads:
import('./translations/en.json')
        ↓
Core overrides applied:
plugins.config.ts → localization overrides
        ↓
Added to i18next memory:
i18n.addResourceBundle('en', 'inventory', {...})
        ↓
Display:
i18next → React components
```

**Code Flow**:
```typescript
// 1. Plugin loaded by PluginManager
await pluginManager.initialize(config)

// 2. LocalizationManager loads plugin translations
await localizationManager.loadPluginTranslations(manifest, config)

// 3. Merges with core overrides
const merged = deepMerge(pluginDefaults, coreOverrides)

// 4. Adds to i18next (in-memory, not database!)
i18n.addResourceBundle('en', 'inventory', merged)

// 5. Component uses it
const { t } = useTranslation('inventory')
t('title')  // Works!
```

---

## 🔍 Why Two Different Approaches?

### Core = Database

**Advantages**:
- ✅ Update without redeploying
- ✅ Translation Management UI possible
- ✅ Centralized management
- ✅ Query and analyze translations

**Why for Core**:
- Core is stable, changes infrequently
- Benefits from centralized editing
- Same translations for all deployments (before customization)

### Plugins = In-Memory

**Advantages**:
- ✅ Fast loading
- ✅ No database dependency
- ✅ Bundled with plugin code
- ✅ Version controlled with plugin
- ✅ Deploy with plugin package

**Why for Plugins**:
- Plugins come from different packages
- Each plugin manages its own translations
- Simpler distribution
- Core can still override via `plugins.config.ts`

---

## 📊 Translation Sources at Runtime

```
┌─────────────────────────────────────────────────────────┐
│                    i18next Instance                     │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼──────────┐         ┌─────────▼─────────┐
│  Core Namespaces │         │ Plugin Namespaces │
│                  │         │                   │
│  Source:         │         │  Source:          │
│  Supabase DB     │         │  In-Memory        │
│  via             │         │  via              │
│  SupabaseBackend │         │  addResourceBundle│
│                  │         │                   │
│  • common        │         │  • inventory      │
│  • auth          │         │  • crm            │
│  • users         │         │  • accounting     │
│  • roles         │         │  • [other plugins]│
│  • errors        │         │                   │
└──────────────────┘         └───────────────────┘
```

---

## 🔄 Translation Update Process

### Update Core Translation

```bash
# 1. Edit local JSON file (source)
# src/i18n/locales/en/common.json

# 2. Create migration
# supabase/migrations/XXXXXX_update_translations.sql
UPDATE translations 
SET value = 'New Value'
WHERE locale = 'en' 
  AND namespace = 'common' 
  AND key = 'actions.save';

# 3. Apply via Supabase Dashboard

# 4. Clear cache (or restart app)
# Translations update immediately
```

### Update Plugin Translation (Two Ways)

**Option A: Via Core Config** (No code changes)
```typescript
// plugins.config.ts
localization: {
  en: {
    'inventory.title': 'Stock Management',  // Override
  },
}

// Restart app
npm run dev
```

**Option B: Update Plugin** (Plugin developer updates)
```typescript
// In plugin package
// src/translations/en.json
{
  "title": "New Title"
}

// Rebuild and republish plugin
npm version patch
npm publish

// Update in core
npm update @core-erp/plugin-inventory
npm run dev
```

---

## 💡 Best Practices

### For Core Team

1. **Keep Local JSON Files Updated**
   - They're your source of truth
   - Commit changes to git
   - Use them to regenerate database seeds

2. **Seed Database from JSON**
   - When adding translations, update both JSON and migration
   - Keep them in sync

3. **Override Plugin Translations**
   - Use `plugins.config.ts` for customer-specific terms
   - Don't modify plugin code

### For Plugin Developers

1. **Bundle Translations with Plugin**
   - Include translation files in your package
   - Export via plugin manifest
   - Let core override if needed

2. **Namespace by Plugin ID**
   - Use your plugin ID as namespace
   - Example: 'inventory', 'crm', 'accounting'
   - Avoid conflicts

3. **Provide Complete Translations**
   - All supported languages
   - All keys documented
   - Fallback to English

---

## 🎨 Translation Loading Flow

### Application Startup

```typescript
// 1. App starts
ReactDOM.render(<App />)

// 2. i18next initializes
i18n.use(SupabaseBackend).use(LanguageDetector)

// 3. Preload core translations (optional)
await preloadTranslations(['en', 'th'], ['common', 'auth', ...])
// Fetches from Supabase database

// 4. Plugin system initializes
await pluginManager.initialize(pluginConfig)

// 5. Plugin translations loaded
for (plugin of enabledPlugins) {
  await localizationManager.loadPluginTranslations(plugin)
  // Loads from plugin packages, adds to i18next memory
}

// 6. All translations ready
// - Core: From database
// - Plugins: From memory
// - Both accessible via useTranslation()
```

### User Changes Language

```typescript
// 1. User clicks language selector
await changeLocale('th')

// 2. i18next switches language
i18n.changeLanguage('th')

// 3. Core translations: Already in cache or fetched from DB
// 4. Plugin translations: Already in memory
// 5. UI updates immediately
```

---

## 📝 Summary

### What Local JSON Files Are For

**Purpose**: Source files for Core ERP translations that get seeded into Supabase database

**NOT for**:
- ❌ Direct loading at runtime
- ❌ Plugin translations (plugins bring their own)
- ❌ Fallback mechanism

### Current System Works Correctly

Your implementation is correct:
- ✅ Core uses database (flexible, editable)
- ✅ Plugins use in-memory (fast, bundled)
- ✅ Core can override plugins via config
- ✅ All use same i18next instance
- ✅ No conflicts, no issues

### The Plugin System is Ready!

No changes needed. The `LocalizationManager` integrates perfectly with your existing Supabase-based i18n system. 🎉

---

**Key Takeaway**: Your local JSON files are "source code" for database translations, similar to how TypeScript files are "source code" that compiles to JavaScript. At runtime, everything comes from the database (core) or plugin packages (plugins), not from local JSON files.

