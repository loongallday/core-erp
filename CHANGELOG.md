# Changelog

All notable changes to Core ERP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-11-10

### 🎉 Initial Release - First Stable Version

The first production-ready release of Core ERP with complete plugin system.

### Added

#### Core System
- ✅ User management system with CRUD operations
- ✅ Role-based access control (RBAC)
- ✅ Granular permission system (13 default permissions)
- ✅ Audit logging for all important actions
- ✅ Multi-language support (English + Thai)
- ✅ Translation management UI
- ✅ Database-backed translations
- ✅ Responsive design with mobile support
- ✅ Dark mode support
- ✅ Error boundary for graceful error handling
- ✅ Loading states throughout
- ✅ Supabase authentication (magic link + password)
- ✅ Row Level Security (RLS) on all tables
- ✅ 4 Edge Functions (create-user, update-user, assign-roles, get-user-permissions)
- ✅ Complete TypeScript types
- ✅ shadcn/ui components (48 components)

#### Plugin System
- ✅ Dynamic plugin loading architecture
- ✅ npm-based plugin distribution
- ✅ Configuration-driven plugin customization via `plugins.config.ts`
- ✅ Plugin routes integration
- ✅ Plugin menu integration
- ✅ Plugin permission integration
- ✅ Plugin translation integration
- ✅ Plugin widget system
- ✅ Event bus for inter-plugin communication
- ✅ Plugin lifecycle hooks
- ✅ Plugin validation system
- ✅ Dependency resolution
- ✅ Plugin management UI

#### First Plugin: Leave Management
- ✅ Leave request management
- ✅ Leave balance tracking
- ✅ Approval workflow (single-level)
- ✅ 10 default leave types
- ✅ 10 leave permissions
- ✅ 9 routes
- ✅ Complete Edge Function
- ✅ Full translations (EN/TH)
- ✅ Calendar view structure
- ✅ Reports structure

#### Database
- ✅ `supabase/CORE_COMPLETE.sql` - ONE-FILE core database setup
- ✅ 7 core tables (users, roles, permissions, user_roles, role_permissions, audit_log, translations)
- ✅ Comprehensive RLS policies
- ✅ Indexes for performance
- ✅ Functions and triggers
- ✅ Audit integration

#### Documentation
- ✅ QUICK_START.md - 5-minute setup guide
- ✅ PROJECT_CONTEXT.md - Complete architecture
- ✅ README.md - Project overview
- ✅ Plugin development guides (8 docs)
- ✅ Migration explanations
- ✅ ONE-FILE setup documentation

#### Developer Experience
- ✅ Hot module reload
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Vitest for testing
- ✅ Comprehensive error logging
- ✅ Performance monitoring hooks
- ✅ Developer-friendly console logs

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- ✅ Row Level Security on all tables
- ✅ Permission checks at UI and API level
- ✅ Service role key never exposed to client
- ✅ CORS configured properly
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection via parameterized queries
- ✅ XSS protection via React

---

## Technical Details

### Dependencies
- React: 18.3.1
- TypeScript: 5.8.3
- Vite: 6.0.7
- Supabase: 2.79.0
- React Query: 5.64.2
- React Router: 6.30.1
- Tailwind CSS: 4.1.0

### Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

### Database
- PostgreSQL 15+ (via Supabase)
- UUID extension required
- RLS enabled

---

## Installation

See **QUICK_START.md** for complete installation guide.

**Quick Install:**
```bash
npm install
# Apply supabase/CORE_COMPLETE.sql
npm run dev
```

---

## Upgrade Instructions

N/A for v1.0.0 (initial release)

Future versions will include upgrade instructions here.

---

## Breaking Changes

N/A for v1.0.0 (initial release)

---

## Contributors

- Core ERP Team

---

## License

Proprietary - Per-customer deployment model

---

[1.0.0]: https://github.com/your-org/core-erp/releases/tag/v1.0.0

