# Plugin Management Quick Start

Simple, actionable guide for managing plugins in Core ERP.

---

## 🚀 Adding a Plugin (3 Steps)

### 1️⃣ Install

```bash
npm install @composable-erp/plugin-inventory
```

### 2️⃣ Configure

Edit `plugins.config.ts`:

```typescript
export default {
  plugins: [
    {
      package: '@composable-erp/plugin-inventory',
      enabled: true,
      config: {
        // Your settings here
      },
      permissions: {
        'inventory:view': ['user', 'admin'],
        'inventory:create': ['admin'],
      },
    },
  ],
}
```

### 3️⃣ Restart

```bash
npm run dev
```

✅ Done! Plugin is now active.

---

## 🛑 Removing a Plugin (2 Options)

### Option A: Disable (Recommended - Data is Safe)

Edit `plugins.config.ts`:

```typescript
{
  package: '@composable-erp/plugin-inventory',
  enabled: false,  // Just change this
}
```

```bash
npm run dev
```

✅ Plugin disabled, data preserved, can re-enable anytime.

### Option B: Uninstall (Permanent Removal)

```bash
npm uninstall @composable-erp/plugin-inventory
```

Remove from `plugins.config.ts`:

```typescript
export default {
  plugins: [
    // Remove plugin configuration entirely
  ],
}
```

```bash
npm run dev
```

⚠️ Plugin removed completely.

---

## 🔄 Updating a Plugin (3 Steps)

### 1️⃣ Update Package

```bash
npm update @composable-erp/plugin-inventory
```

### 2️⃣ Check Changelog

Review breaking changes and new features.

### 3️⃣ Restart

```bash
npm run dev
```

✅ Plugin updated!

---

## 🎛️ Enable/Disable Anytime

**Disable temporarily**:
```typescript
{ enabled: false }
```

**Re-enable**:
```typescript
{ enabled: true }
```

**Always restart after changes**:
```bash
npm run dev
```

---

## 📋 Plugin Management Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    Plugin Lifecycle                     │
└─────────────────────────────────────────────────────────┘

1. INSTALL
   └─> npm install @composable-erp/plugin-name
   
2. CONFIGURE
   └─> Edit plugins.config.ts
       ├─> Set enabled: true
       ├─> Add configuration
       ├─> Map permissions
       └─> Customize UI
   
3. RESTART
   └─> npm run dev
   
4. VERIFY
   └─> Check menu, routes, permissions
   
5. USE
   └─> Plugin is active and integrated!


To Disable:
   └─> Set enabled: false → Restart

To Update:
   └─> npm update → Check changelog → Restart

To Remove:
   └─> npm uninstall → Remove from config → Restart
```

---

## 🎯 Production Deployment

### Before Deploying

```bash
# 1. Test in development
npm run dev

# 2. Test in staging
# Deploy to staging first

# 3. Backup database
npm run db:backup

# 4. Review migrations
# Check what database changes will be made
```

### Deploy

```bash
# 1. Install plugin
npm install @composable-erp/plugin-name

# 2. Update config
# Edit plugins.config.ts

# 3. Build
npm run build

# 4. Deploy
# Use your deployment process (Vercel, Docker, etc.)
```

### After Deploying

```bash
# 1. Apply database migrations (via Supabase Dashboard)
# 2. Verify plugin loads correctly
# 3. Test functionality
# 4. Monitor for errors
```

---

## 💡 Common Scenarios

### Installing First Plugin

```bash
# 1. Install
npm install @composable-erp/plugin-inventory

# 2. Add to plugins.config.ts
export default {
  plugins: [
    {
      package: '@composable-erp/plugin-inventory',
      enabled: true,
      config: { defaultWarehouse: 'main' },
      permissions: {
        'inventory:view': ['user', 'admin'],
      },
    },
  ],
}

# 3. Restart
npm run dev
```

### Installing Multiple Plugins

```bash
# Install all at once
npm install @composable-erp/plugin-inventory @composable-erp/plugin-crm
```

```typescript
// Configure all in plugins.config.ts
export default {
  plugins: [
    {
      package: '@composable-erp/plugin-inventory',
      enabled: true,
      // ... config
    },
    {
      package: '@composable-erp/plugin-crm',
      enabled: true,
      // ... config
    },
  ],
}
```

### Temporarily Disable for Testing

```typescript
// Disable one plugin
{
  package: '@composable-erp/plugin-inventory',
  enabled: false,  // Temporarily disabled
}

// Other plugins stay enabled
{
  package: '@composable-erp/plugin-crm',
  enabled: true,  // Still active
}
```

### Customer-Specific Configuration

```typescript
// Customer A deployment
export default {
  plugins: [
    { package: '@composable-erp/plugin-inventory', enabled: true },
    { package: '@composable-erp/plugin-crm', enabled: true },
    { package: '@composable-erp/plugin-accounting', enabled: false },
  ],
}

// Customer B deployment
export default {
  plugins: [
    { package: '@composable-erp/plugin-inventory', enabled: true },
    { package: '@composable-erp/plugin-crm', enabled: false },
    { package: '@composable-erp/plugin-accounting', enabled: true },
  ],
}
```

---

## 🔍 Verification Checklist

After adding/updating a plugin:

- [ ] No errors in console
- [ ] Plugin menu item appears
- [ ] Routes are accessible
- [ ] Permissions work correctly
- [ ] Translations display properly
- [ ] Database tables created (if applicable)
- [ ] Configuration is applied
- [ ] Features work as expected

---

## 🆘 Quick Troubleshooting

### Plugin Not Showing

```typescript
// Check these:
1. enabled: true ✓
2. Package installed: npm list @composable-erp/plugin-name ✓
3. Config syntax correct ✓
4. Restarted app ✓
5. Check console for errors ✓
```

### Permission Denied

```typescript
// Map permissions in config
permissions: {
  'plugin:view': ['user', 'admin'],
  'plugin:create': ['admin'],
}

// Check user has required role
```

### Menu Item Missing

```typescript
// Check:
1. Plugin enabled ✓
2. User has permission ✓
3. Menu order not conflicting ✓

ui: {
  sidebar: {
    position: 100,  // Try different number
  },
}
```

---

## 📝 Important Files

### Main Configuration File

```
plugins.config.ts  ← Your main control panel
```

This file controls everything about plugins.

### Package Installation

```
package.json  ← Lists installed plugins
node_modules/@composable-erp/plugin-*/  ← Plugin code
```

### Application Entry Points

```
src/App.tsx  ← Routes integration
src/components/AppLayout.tsx  ← Menu integration
```

---

## 🎓 Key Concepts

### Enabled vs Installed

- **Installed** = Package exists in `node_modules/`
- **Enabled** = Plugin is active (`enabled: true`)

You can have a plugin installed but disabled!

### Configuration Precedence

```
Core Config (plugins.config.ts)
        ↓
  OVERRIDES
        ↓
Plugin Defaults
```

Your configuration always wins!

### No Code Changes Needed

✅ All plugin management via:
- `npm install/uninstall`
- `plugins.config.ts`
- Restart

❌ Never modify:
- Core code
- Plugin code directly

---

## 🔗 Related Documentation

- **[Full Lifecycle Guide](./PLUGIN_LIFECYCLE_MANAGEMENT.md)** - Detailed operations
- **[Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)** - Creating plugins
- **[Quick Reference](./QUICK_REFERENCE.md)** - Code snippets

---

**Managing plugins is simple: Install → Configure → Restart!** 🎉

