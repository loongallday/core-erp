# Migration to @core-erp/ui Package

## Overview

The Core ERP plugin template generator has been updated to use the centralized `@core-erp/ui` package for all UI components, utilities, and design system elements.

## What Changed

### Before (Old Pattern)
```typescript
// Old imports from core-erp directly
import { Button } from '@core-erp/components/ui/button'
import { Card } from '@core-erp/components/ui/card'
import { PageHeader } from '@core-erp/components/responsive'
import { cn } from '@core-erp/lib/utils'
import { useToast } from '@core-erp/hooks/use-toast'
```

### After (New Pattern)
```typescript
// New imports from @core-erp/ui package
import { Button, Card } from '@core-erp/ui/components/ui'
import { PageHeader } from '@core-erp/ui/components/responsive'
import { cn } from '@core-erp/ui/lib'
import { useToast } from '@core-erp/ui/hooks'
```

## Core ERP Specific Imports (Unchanged)

These imports remain the same as they're core-erp specific, not UI components:

```typescript
import { supabase } from '@core-erp/lib/supabase'
import { useAuth } from '@core-erp/contexts/AuthContext'
```

## Package Dependencies

### Plugin package.json

Plugins should declare `@core-erp/ui` as a peer dependency:

```json
{
  "peerDependencies": {
    "@core-erp/ui": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### Tailwind Configuration

Plugins should extend the Core ERP UI preset:

```typescript
import uiPreset from '@core-erp/ui/tailwind-preset'

export default {
  presets: [uiPreset],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@core-erp/ui/dist/**/*.js'
  ],
}
```

## What's Included in @core-erp/ui

### Components
- **48 shadcn/ui components**: Button, Card, Dialog, Table, Select, Input, etc.
- **6 responsive components**: PageContainer, PageHeader, ResponsiveGrid, ResponsiveStack, ResponsiveButton, ResponsiveTable
- **2 loading components**: SkeletonCard, SkeletonTable

### Utilities
- `cn()` - Class name merger
- `formatDate()`, `formatDateTime()` - Date formatting
- `formatCurrency()`, `formatNumber()` - Number formatting
- `formatRelativeTime()` - Relative time (e.g., "2 hours ago")
- `formatPercentage()` - Percentage formatting

### Hooks
- `useToast()` - Toast notifications
- `useIsMobile()` - Mobile device detection

### Design System
- Tailwind preset with all design tokens
- CSS variables for theming
- Custom utilities (touch-target, scrollbar-thin, safe area)
- Animations and transitions

## Template Generator Updates

All templates in the plugin generator now use the new import patterns:

1. ✅ `src/templates/frontend.ts` - Updated all component imports
2. ✅ `src/templates/base.ts` - Updated package.json template
3. ✅ Documentation updated

## Benefits

1. **Single Source of Truth** - All UI components in one place
2. **Consistent Design** - Same look and feel across all plugins
3. **Version Control** - Lock UI versions for stability
4. **Better DX** - Clear separation between UI and business logic
5. **Type Safety** - Full TypeScript support from the UI package

## Migration Checklist for Existing Plugins

If you have existing plugins to migrate:

- [ ] Install `@core-erp/ui` as peer dependency
- [ ] Update all component imports to use `@core-erp/ui/components/ui`
- [ ] Update responsive component imports to use `@core-erp/ui/components/responsive`
- [ ] Update utility imports to use `@core-erp/ui/lib`
- [ ] Update hook imports to use `@core-erp/ui/hooks`
- [ ] Update Tailwind config to use UI preset
- [ ] Test build and verify all components work
- [ ] Remove any copied UI components from plugin

## Example Plugin Structure

```
plugin-inventory/
├── package.json           (declares @core-erp/ui as peer dep)
├── tailwind.config.ts     (extends @core-erp/ui preset)
├── src/
│   ├── frontend/
│   │   ├── pages/         (uses @core-erp/ui components)
│   │   ├── routes.tsx     (plugin routes)
│   │   └── menu.tsx       (plugin menu)
│   ├── backend/           (Edge Functions - if needed)
│   └── index.ts           (plugin manifest)
└── README.md
```

## Support

For questions about the UI package, see:
- `core-ui/README.md` - Full documentation
- Core ERP documentation - Integration guides

