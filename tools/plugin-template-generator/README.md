# Core ERP Plugin Template Generator

🎨 Interactive CLI tool to generate complete, working plugin packages for Core ERP.

## Overview

The Plugin Template Generator is a powerful CLI tool that scaffolds production-ready plugins with:

- ✅ **Working CRUD Examples** - Complete list, form, and detail pages
- ✅ **Best Practices** - Follows all Core ERP patterns and conventions
- ✅ **Type-Safe** - Full TypeScript support throughout
- ✅ **Customizable** - Select only the features you need
- ✅ **Interactive** - User-friendly prompts guide you through setup
- ✅ **Production-Ready** - Generate plugins ready to deploy

## Quick Start

### 1. Run the Generator

From your Core ERP directory:

\`\`\`bash
npm run generate-plugin
\`\`\`

### 2. Answer the Prompts

The generator will ask you:

- Plugin name (e.g., "Inventory Management")
- Description
- Author name
- Category (operations, sales, finance, etc.)
- Output directory
- Features to include (frontend, backend, database, etc.)
- Resource name for CRUD examples (e.g., "Item", "Product")

### 3. Wait for Generation

The tool will:

- Create directory structure
- Generate all selected files
- Create working CRUD examples
- Set up configuration

### 4. Use Your Plugin

\`\`\`bash
# Navigate to your plugin
cd <output-directory>/plugin-<name>

# Install dependencies
npm install

# Build the plugin
npm run build

# Install in Core ERP
cd <core-erp-directory>
npm install <path-to-your-plugin>

# Configure in plugins.config.ts
# Add your plugin configuration

# Run Core ERP
npm run dev
\`\`\`

## Features

### Selectable Components

Choose which parts of your plugin to generate:

#### ✅ Frontend (React + TypeScript)
- Routes with React Router v6
- Page components (List, Form, Detail)
- shadcn/ui integration
- Permission-based access control
- i18next translations
- React Query data fetching

#### ✅ Menu Items
- Sidebar integration
- Icon support (Lucide React)
- Permission-based visibility
- Custom ordering and grouping

#### ✅ Dashboard Widgets
- Summary statistics
- Recent items display
- Quick actions
- Responsive design

#### ✅ Backend (Supabase Edge Functions)
- Full CRUD operations
- Authentication & authorization
- Input validation
- Error handling
- CORS support

#### ✅ Database (PostgreSQL)
- Migration SQL
- Table creation with constraints
- Row Level Security (RLS) policies
- Indexes for performance
- Seed data for testing

#### ✅ Permissions
- Standard CRUD permissions
- Core ERP integration
- Role mapping support

#### ✅ Translations (i18next)
- English (en)
- Thai (th)
- Complete translation keys
- Form labels and messages
- Error messages

#### ✅ Event Handlers
- Inter-plugin communication
- Core system events
- Custom event emitters
- Async workflows

## Generated File Structure

\`\`\`
plugin-{name}/
├── package.json              # NPM package configuration
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Plugin documentation
├── .npmignore               # NPM ignore rules
├── .gitignore               # Git ignore rules
├── src/
│   ├── index.ts             # Plugin manifest (always generated)
│   │
│   ├── frontend/            # (if frontend selected)
│   │   ├── routes.tsx       # Route definitions
│   │   ├── menu.tsx         # Menu items
│   │   ├── pages/
│   │   │   ├── {Resource}List.tsx    # List/table view
│   │   │   ├── {Resource}Form.tsx    # Create/edit form
│   │   │   └── {Resource}Detail.tsx  # Detail view
│   │   └── widgets/         # (if widgets selected)
│   │       └── {Plugin}Widget.tsx
│   │
│   ├── backend/             # (if backend selected)
│   │   └── functions/
│   │       └── manage-{resources}/
│   │           └── index.ts  # Edge Function with CRUD
│   │
│   ├── database/            # (if database selected)
│   │   ├── migrations/
│   │   │   └── 001_initial.sql
│   │   └── seeds/
│   │       └── sample_data.sql
│   │
│   ├── permissions/         # (if permissions selected)
│   │   └── definitions.json
│   │
│   ├── translations/        # (if translations selected)
│   │   ├── en.json
│   │   └── th.json
│   │
│   └── events/              # (if events selected)
│       └── handlers.ts
│
└── dist/                    # Compiled output (after build)
\`\`\`

## Example Usage

### Creating an Inventory Plugin

\`\`\`bash
$ npm run generate-plugin

🎨 Core ERP Plugin Template Generator

Plugin name: Inventory Management
Plugin description: Manage inventory items and stock levels
Author name: ACME Corp
Plugin category: operations
Output directory: /projects/plugins
✓ Frontend (Routes + Pages)
✓ Menu Items
✗ Dashboard Widgets
✓ Backend (Edge Functions)
✓ Database (Migrations)
✓ Permissions
✓ Translations (en + th)
✗ Event Handlers
Resource name: Item

✅ Plugin generated successfully!

Next Steps:
1. cd /projects/plugins/plugin-inventory-management
2. npm install
3. npm run build
4. Install in Core ERP and configure
\`\`\`

## What Gets Generated

### Complete CRUD Example

The generator creates a fully functional CRUD system for your resource:

**Frontend:**
- **List Page**: Table with search, sort, pagination, and actions
- **Form Page**: Create/edit form with validation (React Hook Form + Zod)
- **Detail Page**: Read-only view with edit/delete actions

**Backend:**
- **Edge Function**: API endpoints for create, read, update, delete, list

**Database:**
- **Table**: With proper columns, constraints, and indexes
- **RLS Policies**: Row-level security for all operations
- **Seed Data**: Sample records for testing

**Permissions:**
- `{plugin}:view` - View records
- `{plugin}:create` - Create records
- `{plugin}:edit` - Edit records
- `{plugin}:delete` - Delete records

**Translations:**
- All UI text in English and Thai
- Field labels and descriptions
- Success/error messages
- Empty states

## Code Quality

All generated code follows:

- ✅ TypeScript strict mode
- ✅ ESLint rules
- ✅ Core ERP patterns
- ✅ Accessibility guidelines
- ✅ Security best practices
- ✅ Performance optimizations

## Customization

After generation, you can:

1. **Modify templates** - Edit `src/templates/*` files
2. **Add fields** - Extend forms and database schema
3. **Add features** - Implement additional functionality
4. **Customize UI** - Update components and styles
5. **Add validations** - Enhance Zod schemas

## Documentation

- **[Template Development Guide](./TEMPLATE_DEVELOPMENT.md)** - Create custom templates
- **[Architecture](./ARCHITECTURE.md)** - System design and flow
- **[Template Reference](./templates/README.md)** - Available templates
- **[AI Context](./AI_CONTEXT.md)** - AI-friendly documentation
- **[Quick Start Templates](./QUICK_START_TEMPLATES.md)** - Quick guide

## Requirements

- Node.js 18+
- TypeScript 5+
- Core ERP 1.0+

## Support

For issues and questions:

- Check the documentation files
- Review generated plugin README
- Consult Core ERP plugin development guide

## License

Proprietary. For use with Core ERP only.

---

**Happy Plugin Development! 🚀**

