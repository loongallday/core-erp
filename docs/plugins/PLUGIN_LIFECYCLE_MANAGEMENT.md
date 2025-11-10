# Plugin Lifecycle Management

Complete guide for adding, removing, updating, and managing plugins in Core ERP.

## Table of Contents

1. [Adding a Plugin](#adding-a-plugin)
2. [Removing a Plugin](#removing-a-plugin)
3. [Updating a Plugin](#updating-a-plugin)
4. [Enabling/Disabling Plugins](#enablingdisabling-plugins)
5. [Plugin Configuration Changes](#plugin-configuration-changes)
6. [Database Migrations](#database-migrations)
7. [Rollback Strategy](#rollback-strategy)
8. [Production Deployment](#production-deployment)

---

## Adding a Plugin

### Step 1: Install the Plugin Package

```bash
# Install from private npm registry
npm install @core-erp/plugin-inventory

# OR install from git repository
npm install git+ssh://git@github.com:your-org/plugin-inventory.git#v1.0.0

# OR install from local path (development only)
npm install file:../plugin-inventory
```

### Step 2: Configure the Plugin

Edit `plugins.config.ts` in the root of core-erp:

```typescript
// plugins.config.ts
import { PluginsConfiguration } from './src/lib/plugin-system/types'

const config: PluginsConfiguration = {
  global: {
    enableHotReload: process.env.NODE_ENV === 'development',
    sandboxMode: process.env.NODE_ENV === 'production' ? 'strict' : 'moderate',
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    maxMemoryPerPlugin: 256,
    maxExecutionTime: 30,
  },

  plugins: [
    // Add your new plugin here
    {
      package: '@core-erp/plugin-inventory',
      enabled: true,
      version: '^1.0.0',
      
      // Plugin configuration
      config: {
        defaultWarehouse: 'main',
        autoReorder: true,
        reorderThreshold: 10,
      },
      
      // Translation overrides (optional)
      localization: {
        en: {
          'inventory.title': 'Stock Management',
          'inventory.subtitle': 'Manage your inventory',
        },
        th: {
          'inventory.title': 'การจัดการสต็อก',
          'inventory.subtitle': 'จัดการสินค้าคงคลัง',
        },
      },
      
      // Permission mapping
      permissions: {
        'inventory:view': ['user', 'manager', 'admin', 'superadmin'],
        'inventory:create': ['manager', 'admin', 'superadmin'],
        'inventory:edit': ['manager', 'admin', 'superadmin'],
        'inventory:delete': ['admin', 'superadmin'],
      },
      
      // UI customization
      ui: {
        sidebar: {
          position: 100,
          icon: 'Package',
          label: 'Inventory',
        },
      },
    },
    
    // Other existing plugins...
  ],
}

export default config
```

### Step 3: Apply Database Migrations

Plugins may include database migrations. You need to apply them:

**Option A: Automatic (Recommended for Development)**
The plugin system can collect and apply migrations automatically (if implemented).

**Option B: Manual (Production)**
```bash
# Review plugin migrations first
# Check: node_modules/@core-erp/plugin-inventory/dist/database/migrations/

# Apply via Supabase Dashboard SQL Editor
# OR use migration script (if available)
npm run plugins:migrate:apply
```

### Step 4: Seed Plugin Permissions

Plugin permissions need to be registered in the database:

```sql
-- Option 1: Via Supabase Dashboard SQL Editor
-- Insert permissions from plugin definition

-- Option 2: Via Edge Function (recommended)
-- The plugin system will automatically register permissions on startup
```

### Step 5: Restart the Application

```bash
# Development
npm run dev

# Production
# Restart your deployment (e.g., rebuild and redeploy)
```

### Step 6: Verify Installation

1. **Check Console Logs**:
   - Look for: `[PluginManager] Plugin loaded: inventory`
   - Look for: `[PluginManager] Plugin enabled: inventory`

2. **Check UI**:
   - New menu item should appear in sidebar
   - Navigate to plugin routes (e.g., `/inventory`)

3. **Check Permissions**:
   - Verify permissions are in database
   - Check role assignments

4. **Test Functionality**:
   - Try creating/reading/updating data
   - Test all plugin features

---

## Removing a Plugin

### Option 1: Disable Plugin (Soft Removal - Recommended)

This keeps the plugin installed but inactive. Data remains intact.

**Step 1: Disable in Configuration**

```typescript
// plugins.config.ts
{
  package: '@core-erp/plugin-inventory',
  enabled: false,  // Change to false
  // ... rest of config
}
```

**Step 2: Restart Application**

```bash
npm run dev
```

**Result**:
- ✅ Plugin routes are removed
- ✅ Menu items disappear
- ✅ Plugin code doesn't execute
- ✅ Database tables remain (data is safe)
- ✅ Can re-enable anytime by setting `enabled: true`

### Option 2: Remove Plugin (Hard Removal)

This completely removes the plugin. Use with caution!

**Step 1: Backup Data** ⚠️

```sql
-- Backup plugin tables
CREATE TABLE inventory_items_backup AS 
SELECT * FROM inventory_items;

CREATE TABLE inventory_locations_backup AS 
SELECT * FROM inventory_locations;
```

**Step 2: Remove from Configuration**

```typescript
// plugins.config.ts
export default {
  plugins: [
    // Remove or comment out the plugin configuration
    // {
    //   package: '@core-erp/plugin-inventory',
    //   ...
    // },
    
    // Other plugins remain...
  ],
}
```

**Step 3: Uninstall Package**

```bash
npm uninstall @core-erp/plugin-inventory
```

**Step 4: Remove Database Objects** (Optional - Careful!)

```sql
-- Remove plugin tables (IRREVERSIBLE!)
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_locations CASCADE;

-- Remove plugin permissions
DELETE FROM role_permissions 
WHERE permission_id IN (
  SELECT id FROM permissions WHERE category = 'inventory'
);

DELETE FROM permissions WHERE category = 'inventory';
```

**Step 5: Restart Application**

```bash
npm run dev
```

**Step 6: Clean Up** (Optional)

```bash
# Remove unused dependencies
npm prune

# Clear build cache
rm -rf node_modules/.cache
rm -rf .vite
```

---

## Updating a Plugin

### Step 1: Check for Updates

```bash
# Check available versions
npm info @core-erp/plugin-inventory versions

# Check current version
npm list @core-erp/plugin-inventory
```

### Step 2: Review Changelog

Always check the plugin's changelog for:
- Breaking changes
- New features
- Database migration requirements
- Configuration changes

### Step 3: Update Package

```bash
# Update to latest compatible version
npm update @core-erp/plugin-inventory

# OR update to specific version
npm install @core-erp/plugin-inventory@2.0.0
```

### Step 4: Update Configuration

Check if new version requires configuration changes:

```typescript
// plugins.config.ts
{
  package: '@core-erp/plugin-inventory',
  version: '^2.0.0',  // Update version constraint
  enabled: true,
  
  config: {
    // Add new configuration options
    newFeature: true,
    // Keep existing config
    defaultWarehouse: 'main',
  },
}
```

### Step 5: Apply New Migrations

```bash
# Check for new migrations
# Review: node_modules/@core-erp/plugin-inventory/dist/database/migrations/

# Apply new migrations
npm run plugins:migrate:apply
```

### Step 6: Test Thoroughly

```bash
# Restart application
npm run dev

# Test all plugin features
# Verify data integrity
# Check for console errors
```

### Step 7: Deploy

Once tested, deploy to production following your deployment process.

---

## Enabling/Disabling Plugins

### Enable a Plugin

```typescript
// plugins.config.ts
{
  package: '@core-erp/plugin-inventory',
  enabled: true,  // Set to true
}
```

```bash
npm run dev
```

**What Happens**:
- ✅ Plugin routes registered
- ✅ Menu items appear
- ✅ Permissions activated
- ✅ `onEnable` lifecycle hook called
- ✅ Plugin fully functional

### Disable a Plugin

```typescript
// plugins.config.ts
{
  package: '@core-erp/plugin-inventory',
  enabled: false,  // Set to false
}
```

```bash
npm run dev
```

**What Happens**:
- ✅ Plugin routes removed
- ✅ Menu items hidden
- ✅ Plugin code doesn't execute
- ✅ `onDisable` lifecycle hook called
- ❌ Database tables remain (data safe)
- ❌ Plugin package still installed

### Use Cases for Disable

- **Temporary Maintenance**: Disable while fixing issues
- **Feature Testing**: Disable in production, enable in staging
- **License Control**: Disable if license expired
- **Customer Specific**: Some customers don't need certain features
- **Performance**: Disable unused plugins

---

## Plugin Configuration Changes

### Runtime Changes (Hot Config Update)

Some configuration can be changed without restart:

```typescript
// Example: Feature flags
features: {
  'barcode-scanning': false,  // Disable feature
  'batch-tracking': true,     // Enable feature
}
```

**To Apply**:
1. Save `plugins.config.ts`
2. In development with hot reload: Changes auto-apply
3. In production: Restart required

### Persistent Changes

Most config changes require restart:

```typescript
config: {
  defaultWarehouse: 'new-warehouse',  // Changed
  autoReorder: true,                  // Changed
}
```

**To Apply**:
1. Update `plugins.config.ts`
2. Restart application
3. Plugin receives new config via `onConfigChange` hook

---

## Database Migrations

### Migration Strategy

Plugins can include database migrations that need to be managed:

**Development Environment**:
```bash
# Automatic migration on plugin load (if implemented)
npm run dev

# OR manual via script
npm run plugins:migrate:apply
```

**Production Environment**:

**Option 1: Manual Review (Recommended)**
```bash
# 1. Review migration files
cat node_modules/@core-erp/plugin-inventory/dist/database/migrations/*.sql

# 2. Apply via Supabase Dashboard
# - Copy SQL
# - Run in SQL Editor
# - Verify results

# 3. Mark as applied (if tracking)
# Update migrations table
```

**Option 2: Automated (with safeguards)**
```bash
# 1. Dry run first
npm run plugins:migrate:dry-run

# 2. Backup database
npm run db:backup

# 3. Apply migrations
npm run plugins:migrate:apply

# 4. Verify
npm run plugins:migrate:status
```

### Migration Tracking

Track which migrations have been applied:

```sql
-- Create migration tracking table (if not exists)
CREATE TABLE IF NOT EXISTS plugin_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id VARCHAR(100) NOT NULL,
  migration_id VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plugin_id, migration_id)
);

-- Check applied migrations
SELECT * FROM plugin_migrations WHERE plugin_id = 'inventory';
```

---

## Rollback Strategy

### Plugin Rollback

If a plugin update causes issues:

**Step 1: Disable Plugin Immediately**
```typescript
// plugins.config.ts
{ enabled: false }
```

**Step 2: Rollback Package Version**
```bash
npm install @core-erp/plugin-inventory@1.0.0
```

**Step 3: Rollback Database (if needed)**
```sql
-- Restore from backup
-- OR run rollback migrations (if plugin provides them)
```

**Step 4: Re-enable with Old Config**
```typescript
// plugins.config.ts
{
  package: '@core-erp/plugin-inventory',
  version: '1.0.0',
  enabled: true,
  // Old configuration
}
```

### Data Recovery

If data was lost:

```sql
-- Restore from backup tables
INSERT INTO inventory_items 
SELECT * FROM inventory_items_backup 
WHERE created_at > '2024-01-01';
```

---

## Production Deployment

### Pre-Deployment Checklist

Before deploying plugin changes to production:

- [ ] Test thoroughly in development
- [ ] Test in staging environment
- [ ] Review all database migrations
- [ ] Backup production database
- [ ] Document rollback plan
- [ ] Review plugin changelog
- [ ] Check breaking changes
- [ ] Update monitoring/alerts
- [ ] Notify team about deployment

### Deployment Process

**1. Maintenance Window (Recommended)**
```bash
# Put app in maintenance mode
# Display maintenance page to users
```

**2. Backup**
```bash
# Backup database
npm run db:backup

# Backup current config
cp plugins.config.ts plugins.config.ts.backup
```

**3. Deploy Changes**
```bash
# Pull latest code (includes plugins.config.ts changes)
git pull

# Install plugin
npm install @core-erp/plugin-inventory

# Build application
npm run build
```

**4. Apply Migrations**
```sql
-- Run migrations via Supabase Dashboard
-- Test with READ queries first
```

**5. Restart Application**
```bash
# Restart your deployment
# (Method depends on hosting: Vercel, Docker, etc.)
```

**6. Verify**
- [ ] Check application logs
- [ ] Test plugin functionality
- [ ] Verify database integrity
- [ ] Test user workflows
- [ ] Monitor performance

**7. Remove Maintenance Mode**
```bash
# Re-enable application
```

### Zero-Downtime Deployment

For critical systems:

1. **Blue-Green Deployment**:
   - Deploy to new environment (green)
   - Test thoroughly
   - Switch traffic from old (blue) to new (green)
   - Keep old environment for quick rollback

2. **Rolling Update**:
   - Update instances one at a time
   - Monitor each update
   - Rollback if issues detected

3. **Feature Flags**:
   ```typescript
   features: {
     'new-feature': false,  // Deploy disabled
   }
   ```
   - Deploy with feature disabled
   - Enable gradually
   - Monitor and adjust

---

## Plugin Management Scripts

Create helper scripts for common operations:

**package.json**:
```json
{
  "scripts": {
    "plugins:list": "node scripts/list-plugins.js",
    "plugins:validate": "node scripts/validate-plugins.js",
    "plugins:migrate:status": "node scripts/migration-status.js",
    "plugins:migrate:apply": "node scripts/apply-migrations.js",
    "plugins:backup": "node scripts/backup-plugins.js",
    "plugins:health": "node scripts/check-plugin-health.js"
  }
}
```

---

## Best Practices

### Do's ✅

- **Always test in development first**
- **Review migrations before applying**
- **Backup before major changes**
- **Use version constraints** (^1.0.0, not *)
- **Document configuration changes**
- **Monitor plugin performance**
- **Keep plugins updated**
- **Use disable instead of remove when possible**

### Don'ts ❌

- **Don't skip testing**
- **Don't apply migrations blindly**
- **Don't delete data without backup**
- **Don't update in production without staging test**
- **Don't ignore breaking changes**
- **Don't mix plugin versions**
- **Don't modify plugin code directly**
- **Don't skip the changelog**

---

## Troubleshooting

### Plugin Not Loading

```bash
# Check installation
npm list @core-erp/plugin-inventory

# Check configuration
# Verify plugins.config.ts syntax

# Check logs
# Look for error messages in console

# Verify plugin manifest
# Check node_modules/@core-erp/plugin-inventory/dist/index.js
```

### Migration Conflicts

```sql
-- Check existing tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check migration status
SELECT * FROM plugin_migrations WHERE plugin_id = 'inventory';

-- Manually mark as applied if already run
INSERT INTO plugin_migrations (plugin_id, migration_id)
VALUES ('inventory', '001_initial');
```

### Performance Issues

```typescript
// Disable problematic features
features: {
  'heavy-feature': false,
}

// Adjust resource limits
global: {
  maxMemoryPerPlugin: 128,  // Reduce
  maxExecutionTime: 10,     // Reduce
}
```

---

## Summary

### Quick Reference

**Add Plugin**:
```bash
npm install @core-erp/plugin-name
# Edit plugins.config.ts
npm run dev
```

**Remove Plugin**:
```typescript
// plugins.config.ts: set enabled: false
// OR
npm uninstall @core-erp/plugin-name
```

**Update Plugin**:
```bash
npm update @core-erp/plugin-name
# Review changelog
# Update config if needed
npm run dev
```

**Enable/Disable**:
```typescript
// plugins.config.ts
{ enabled: true }  // or false
```

---

**The plugin lifecycle is fully managed through configuration and npm!** 🎉

