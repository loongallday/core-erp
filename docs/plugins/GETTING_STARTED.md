# Getting Started with Core ERP Plugin System

**Quick guide to get you started with the plugin system.**

---

## 🎯 What You Need to Know

The Core ERP plugin system is **fully implemented and ready to use**. You can:

1. ✅ Create plugins as NPM packages
2. ✅ Install plugins with `npm install`  
3. ✅ Configure everything in `plugins.config.ts`
4. ✅ Automatic integration (no core code changes)

---

## 📖 Documentation Available

### For Using Plugins (Installing in Your App)

1. **[Plugin Management Quick Start](./PLUGIN_MANAGEMENT_QUICK_START.md)** ⭐
   - Add plugin in 3 steps
   - Remove plugins safely
   - Common scenarios

2. **[Plugin Lifecycle Management](./PLUGIN_LIFECYCLE_MANAGEMENT.md)**
   - Detailed operations
   - Production deployment
   - Database migrations
   - Rollback strategies

### For Creating Plugins

3. **[Plugin Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)** ⭐
   - Complete tutorial
   - Step-by-step walkthrough
   - Your first plugin

4. **[Quick Reference](./QUICK_REFERENCE.md)**
   - Code snippets
   - Common patterns
   - Copy-paste examples

### For Understanding the System

5. **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)**
   - What was built
   - Architecture overview
   - Technical details

6. **[i18n Architecture Explained](./I18N_ARCHITECTURE_EXPLAINED.md)**
   - Translation system
   - How core and plugins work together
   - Important clarifications

---

## 🚀 Quick Start

### Install Your First Plugin

```bash
# 1. Install
npm install @core-erp/plugin-inventory

# 2. Configure (edit plugins.config.ts)
export default {
  plugins: [
    {
      package: '@core-erp/plugin-inventory',
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

# Done! Plugin is active.
```

### Create Your First Plugin

Follow the **[Plugin Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)** for complete tutorial.

**Quick overview:**
```bash
# 1. Create package
mkdir plugin-myfeature
cd plugin-myfeature
npm init -y

# 2. Create manifest (src/index.ts)
# 3. Create routes (src/frontend/routes.tsx)
# 4. Create pages (src/frontend/pages/)
# 5. Build
npm run build

# 6. Install in core-erp
cd ../core-erp
npm install ../plugin-myfeature

# 7. Configure in plugins.config.ts
# 8. Test
npm run dev
```

---

## 🎓 Key Concepts

### Core-Controlled Architecture

**Plugins declare capabilities** → **Core decides how to use them**

**Example:**
```typescript
// Plugin says: "I can provide inventory features"
export const plugin = {
  id: 'inventory',
  frontend: {
    routes: () => import('./routes'),
    menu: () => import('./menu'),
  },
}

// Core says: "Use them like this"
// plugins.config.ts
{
  package: '@core-erp/plugin-inventory',
  enabled: true,
  ui: {
    sidebar: {
      label: 'Stock',      // Core customizes label
      icon: 'Package',     // Core chooses icon
      position: 100,       // Core sets order
    },
  },
}
```

### Configuration-Driven

Everything controlled via `plugins.config.ts`:
- ✅ Plugin settings
- ✅ Translation overrides
- ✅ Permission mapping
- ✅ UI customization
- ✅ Feature flags

**No code changes needed!**

---

## 📋 Common Tasks

### Add a Plugin

```bash
npm install @core-erp/plugin-name
# Edit plugins.config.ts
npm run dev
```

### Remove a Plugin

```typescript
// plugins.config.ts
{ enabled: false }  // Just flip to false
```

### Update a Plugin

```bash
npm update @core-erp/plugin-name
# Check changelog for breaking changes
npm run dev
```

### Customize Plugin

```typescript
// plugins.config.ts
{
  package: '@core-erp/plugin-name',
  config: { /* your settings */ },
  localization: {
    en: { 'plugin.key': 'Custom Text' },
  },
  permissions: {
    'plugin:action': ['admin'],
  },
}
```

---

## 🆘 Need Help?

### Quick Answers

**Q: How do I add a plugin?**  
A: [Plugin Management Quick Start](./PLUGIN_MANAGEMENT_QUICK_START.md)

**Q: How do I create a plugin?**  
A: [Plugin Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)

**Q: How does localization work?**  
A: [i18n Architecture Explained](./I18N_ARCHITECTURE_EXPLAINED.md)

**Q: What was implemented?**  
A: [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

### Full Documentation

See [README.md](./README.md) for complete documentation index.

---

## ✨ Summary

**The plugin system is ready!** You can now:

1. Install plugins with npm
2. Configure via `plugins.config.ts`
3. Create custom plugins
4. Per-customer customization
5. No core code modifications

**Start with:** [Plugin Management Quick Start](./PLUGIN_MANAGEMENT_QUICK_START.md)

---

**Happy Plugin Development!** 🚀

