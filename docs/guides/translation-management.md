# Translation Management UI

## ✅ Feature Complete!

You now have a full-featured **Translation Management Interface** built into your Core ERP application!

## 🎯 What's New

### New Page: `/translations`

A complete admin interface for managing all application translations with:

- ✅ **List all translations** with search and filters
- ✅ **Add new translations** via dialog form
- ✅ **Edit existing translations** inline
- ✅ **Delete translations** with confirmation
- ✅ **Filter by locale** (English/Thai)
- ✅ **Filter by namespace** (common, auth, users, roles, errors)
- ✅ **Search** across keys and values
- ✅ **Real-time updates** - changes appear immediately in UI

## 🔐 Access Control

**Permission Required:** `system:configure`

Only users with the `system:configure` permission can access the Translations page.

### Grant Access

To give a user access to translation management:

```sql
-- Check if system:configure permission exists
SELECT * FROM permissions WHERE code = 'system:configure';

-- If it doesn't exist, create it
INSERT INTO permissions (code, name, description, category)
VALUES ('system:configure', 'System Configuration', 'Configure system settings and translations', 'system');

-- Assign to superadmin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'superadmin' AND p.code = 'system:configure'
ON CONFLICT DO NOTHING;
```

## 🚀 How to Use

### 1. Access the Page

- Click **"Translations"** in the sidebar (Languages icon 🌐)
- Or navigate to: `http://localhost:5175/translations`

### 2. View Translations

The main page shows all translations in a table with:
- **Locale** badge (🇺🇸 EN or 🇹🇭 TH)
- **Namespace** badge (common, auth, etc.)
- **Key** in monospace font (e.g., `actions.save`)
- **Value** (the actual translated text)
- **Actions** (Edit ✏️ and Delete 🗑️ buttons)

### 3. Filter Translations

Use the filter bar at the top:

**Search Box:**
- Search by key or value
- Example: "save" finds all translations containing "save"

**Locale Filter:**
- All Locales
- 🇺🇸 English
- 🇹🇭 ไทย

**Namespace Filter:**
- All Namespaces
- common (shared UI elements)
- auth (authentication)
- users (user management)
- roles (role management)
- errors (error messages)

**Clear Filters:**
- Click "Clear Filters" to reset all filters

### 4. Add New Translation

1. Click **"Add Translation"** button (top right)
2. Fill in the form:
   - **Locale:** en or th
   - **Namespace:** common, auth, users, roles, or errors
   - **Key:** Use dot notation (e.g., `actions.new_action`)
   - **Value:** The translated text
3. Click **"Create"**

**Example - Adding English Translation:**
```
Locale: 🇺🇸 English (en)
Namespace: common
Key: actions.export_pdf
Value: Export to PDF
```

**Example - Adding Thai Translation:**
```
Locale: 🇹🇭 ไทย (th)
Namespace: common
Key: actions.export_pdf
Value: ส่งออกเป็น PDF
```

### 5. Edit Translation

1. Click the **Edit** button (✏️) on any translation row
2. Update the **Value** field (locale, namespace, and key are locked)
3. Click **"Update"**

**Note:** You cannot change the locale, namespace, or key when editing. If you need to change these, create a new translation instead.

### 6. Delete Translation

1. Click the **Delete** button (🗑️) on any translation row
2. Confirm deletion in the dialog
3. Translation is permanently removed

**Warning:** Deleted translations will cause the key to show instead of text in the UI until you add it back.

## 🔄 Real-Time Updates

**After any change (create, update, delete):**
- ✅ Translation cache is cleared automatically
- ✅ i18n reloads the affected locale/namespace
- ✅ UI updates immediately (no refresh needed)
- ✅ Changes visible in all open tabs

**Try it:**
1. Open the app in two browser tabs
2. Edit a translation in one tab
3. Switch language or navigate in the other tab
4. Changes appear instantly!

## 📋 Translation Key Guidelines

### Naming Convention

Use **dot notation** for hierarchical keys:

```
✅ Good:
  actions.save
  actions.delete
  login.title
  login.subtitle
  messages.success
  validation.email_required

❌ Bad:
  save
  LoginTitle
  SUCCESS_MESSAGE
```

### Namespace Organization

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| `common` | Shared UI elements | `actions.save`, `status.active` |
| `auth` | Authentication | `login.title`, `logout.confirm` |
| `users` | User management | `users.title`, `table.name` |
| `roles` | Role management | `roles.title`, `fields.level` |
| `errors` | Error messages | `general.unknown`, `validation.required` |

### Key Structure Examples

**Actions:**
```
actions.create
actions.edit
actions.delete
actions.save
actions.cancel
```

**Navigation:**
```
navigation.dashboard
navigation.users
navigation.settings
```

**Form Fields:**
```
fields.name
fields.email
fields.password
```

**Messages:**
```
messages.success
messages.error
messages.confirm_delete
```

## 🎨 UI Features

### Search
- Real-time search across keys and values
- Case-insensitive
- Highlights matches

### Filters
- Combine multiple filters
- Show count of filtered results
- One-click clear

### Table
- Sortable columns
- Responsive design
- Truncates long values with hover tooltip
- Color-coded locale and namespace badges

### Forms
- Validation on all fields
- Dropdown selects for locale/namespace
- Text area for multi-line translations
- Helpful placeholders and hints

## 📊 Use Cases

### 1. Fix Typos
Find and fix typos in existing translations quickly.

### 2. Add New Features
When adding a new feature, add all required translations from one place.

### 3. Consistency Check
Review all translations for a namespace to ensure consistency.

### 4. Translation Coverage
Filter by locale to see which translations exist for each language.

### 5. Bulk Updates
Edit multiple translations one after another without navigating away.

## 🔍 Finding Translations

### By Feature
Filter by namespace to see all translations for a feature:
- Users page → namespace: `users`
- Login page → namespace: `auth`
- Buttons/actions → namespace: `common`

### By Language
Filter by locale to see translations in one language:
- English → locale: `en`
- Thai → locale: `th`

### By Text
Search for specific text:
- "save" → finds all keys/values with "save"
- "ผู้ใช้" → finds Thai text for "users"

## ⚡ Performance

- **Lazy Loading:** Translations load on demand
- **Caching:** Results cached in React Query
- **Instant Updates:** Optimistic UI updates
- **No Page Reload:** All operations happen via API

## 🛡️ Security

- **RLS Policies:** Only users with `system:configure` can modify
- **Read Access:** Everyone can read (needed for app to work)
- **Audit Trail:** All changes tracked with `updated_at` timestamp

## 📱 Responsive Design

The translation management UI works on:
- ✅ Desktop (full table view)
- ✅ Tablet (scrollable table)
- ✅ Mobile (horizontal scroll for table)

## 🔧 Developer Notes

### Files Created

| File | Purpose |
|------|---------|
| `src/hooks/useTranslations.ts` | React Query hooks for CRUD |
| `src/pages/TranslationManagement.tsx` | Main page component |
| `src/pages/Translations/TranslationDialog.tsx` | Add/Edit form dialog |

### Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Added `/translations` route |
| `src/components/AppLayout.tsx` | Added Translations menu item |

### API Operations

All operations use Supabase client directly:
- **List:** `supabase.from('translations').select()`
- **Create:** `supabase.from('translations').insert()`
- **Update:** `supabase.from('translations').update()`
- **Delete:** `supabase.from('translations').delete()`

### Cache Invalidation

After mutations, the code:
1. Invalidates React Query cache
2. Clears i18n translation cache
3. Reloads affected locale/namespace in i18n

## 🎉 Summary

You now have a **fully functional translation management system**:

✅ **Database storage** (Supabase)  
✅ **API operations** (React Query hooks)  
✅ **Admin UI** (Translation Management page)  
✅ **Real-time updates** (Automatic cache clearing)  
✅ **Permission control** (system:configure)  
✅ **Search & filter** (Easy to find translations)  

**No more SQL queries needed!** Manage all translations through the UI. 🚀

---

**Ready to Use:** Just refresh your browser and look for "Translations" in the sidebar!

