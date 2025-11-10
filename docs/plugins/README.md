# Core ERP Plugin System Documentation

Welcome to the Core ERP Plugin System documentation. This comprehensive guide will help you create, configure, and deploy plugins for Core ERP.

## 📚 Documentation Index

### Getting Started

1. **[Getting Started](./GETTING_STARTED.md)** ⭐⭐⭐ START HERE FIRST
   - Quick overview of the plugin system
   - What documentation is available
   - Quick start guide
   - Common tasks

2. **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** ⭐ OVERVIEW
   - What was built and why
   - Complete file structure
   - Key features and capabilities
   - Quick usage examples

3. **[Plugin Management Quick Start](./PLUGIN_MANAGEMENT_QUICK_START.md)** ⭐ OPERATIONS
   - How to add/remove plugins in your app
   - Quick 3-step guide
   - Common scenarios

4. **[Plugin Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)** ⭐ CREATE PLUGINS
   - Complete walkthrough of creating your first plugin
   - Step-by-step tutorial with examples
   - Best practices and conventions

### Core Concepts

2. **[Plugin Architecture](./ARCHITECTURE.md)**
   - Understanding the plugin system
   - Core-controlled architecture
   - Plugin lifecycle
   - Dependency management

3. **[Plugin Manifest](./PLUGIN_MANIFEST.md)**
   - Complete manifest specification
   - All configuration options
   - TypeScript interfaces

### Frontend Development

4. **[Routes and Navigation](./ROUTES_AND_NAVIGATION.md)**
   - Creating plugin routes
   - Dynamic route registration
   - Permission-based routing

5. **[Menu Items and UI](./MENU_ITEMS_AND_UI.md)**
   - Adding menu items
   - UI customization
   - Dashboard widgets

6. **[Components and Hooks](./COMPONENTS_AND_HOOKS.md)**
   - React components
   - Custom hooks
   - Sharing components between plugins

### Backend Development

7. **[Edge Functions](./EDGE_FUNCTIONS.md)**
   - Creating Supabase Edge Functions
   - API endpoints
   - Authentication and authorization

8. **[Data Providers](./DATA_PROVIDERS.md)**
   - Creating data providers
   - Inter-plugin data sharing
   - API design

9. **[Background Jobs](./BACKGROUND_JOBS.md)**
   - Scheduled tasks
   - Cron expressions
   - Job management

### Database

10. **[Database Migrations](./DATABASE_MIGRATIONS.md)**
    - Writing migrations
    - Schema management
    - Best practices

11. **[Seed Data](./SEED_DATA.md)**
    - Initial data setup
    - Testing data
    - Migration vs seeds

### Configuration

12. **[Plugin Configuration](./PLUGIN_CONFIGURATION.md)**
    - Configuration schema with Zod
    - Default values
    - Runtime configuration
    - Feature flags

13. **[i18n Architecture Explained](./I18N_ARCHITECTURE_EXPLAINED.md)** ⭐ MUST READ
    - Understanding local JSON files vs runtime translations
    - How core and plugin translations coexist
    - Complete translation flow
    - Database vs in-memory translations
    - Core override mechanism
    - Why the current approach is correct

### Security

14. **[Permission System](./PERMISSION_SYSTEM.md)** (To be created)
    - Declaring permissions
    - Permission checking
    - Role mapping
    - Best practices

15. **[Security and Sandboxing](./SECURITY.md)** (To be created)
    - Plugin isolation
    - Security best practices
    - Rate limiting
    - Data validation

### Integration

16. **[Event System](./EVENT_SYSTEM.md)** (To be created)
    - Emitting events
    - Listening to events
    - Inter-plugin communication
    - Event naming conventions

17. **[Hook System](./HOOK_SYSTEM.md)** (To be created)
    - Available hooks
    - Registering hooks
    - Hook priorities
    - Core extension points

18. **[Plugin Dependencies](./PLUGIN_DEPENDENCIES.md)** (To be created)
    - Depending on other plugins
    - Dependency resolution
    - Version management

### Testing and Quality

19. **[Testing Guide](./TESTING_GUIDE.md)** (To be created)
    - Unit testing
    - Integration testing
    - Testing with core system
    - Mocking

20. **[Code Quality](./CODE_QUALITY.md)** (To be created)
    - Linting
    - TypeScript best practices
    - Performance optimization
    - Accessibility

### Deployment

21. **[Plugin Lifecycle Management](./PLUGIN_LIFECYCLE_MANAGEMENT.md)** ⭐ OPERATIONS
    - Adding plugins to your app
    - Removing plugins safely
    - Updating plugins
    - Enabling/disabling plugins
    - Database migrations
    - Production deployment
    - Rollback strategies

22. **[Publishing Guide](./PUBLISHING_GUIDE.md)** (To be created)
    - Building for production
    - Publishing to npm registry
    - Versioning
    - Release management

### Reference

23. **[Quick Reference](./QUICK_REFERENCE.md)**
    - Code snippets
    - Common patterns
    - Essential commands
    - Cheat sheet

24. **[API Reference](./API_REFERENCE.md)** (To be created)
    - Complete API documentation
    - TypeScript types
    - Examples

25. **[Configuration Reference](./CONFIGURATION_REFERENCE.md)** (To be created)
    - plugins.config.ts reference
    - All configuration options
    - Examples for each option

### Additional Resources

26. **[Troubleshooting](./TROUBLESHOOTING.md)** (To be created)
    - Common issues
    - Error messages
    - Solutions

27. **[Migration Guides](./MIGRATION_GUIDES.md)** (To be created)
    - Upgrading plugins
    - Breaking changes
    - Migration scripts

28. **[Examples](./examples/)** (To be created)
    - Complete example plugins
    - Code snippets
    - Real-world use cases

---

## 🚀 Quick Start

### Create Your First Plugin

```bash
# 1. Create plugin directory
mkdir plugin-myfeature
cd plugin-myfeature

# 2. Initialize package
npm init -y

# 3. Install dependencies
npm install --save-dev typescript @types/react

# 4. Create plugin manifest
# (See Plugin Development Guide)

# 5. Build
npm run build

# 6. Install in Core ERP
cd ../core-erp
npm install ../plugin-myfeature

# 7. Configure in plugins.config.ts
# Add your plugin configuration

# 8. Run
npm run dev
```

---

## 📋 Plugin System Features

### What Plugins Can Do

✅ **Frontend**
- Add new pages and routes
- Contribute menu items
- Create dashboard widgets
- Provide reusable components
- Add custom hooks
- Extend existing pages

✅ **Backend**
- Create Edge Functions
- Define API endpoints
- Implement background jobs
- Provide data services
- Add middleware

✅ **Database**
- Create tables
- Add migrations
- Seed data
- Define schemas

✅ **Configuration**
- Define configuration schema
- Provide defaults
- Accept core overrides
- Feature flags

✅ **Localization**
- Multiple languages
- Translation files
- Core overrides
- i18next integration

✅ **Security**
- Define permissions
- Role-based access
- Sandboxed execution
- Rate limiting

✅ **Integration**
- Emit events
- Listen to events
- Register hooks
- Depend on other plugins

### What Core Controls

The core system maintains complete control over plugins:

- **Configuration**: Core overrides plugin defaults
- **Localization**: Core can change any translation
- **Permissions**: Core maps permissions to roles
- **UI**: Core customizes menu, labels, icons
- **Features**: Core enables/disables features
- **Lifecycle**: Core manages plugin state

---

## 🎯 Plugin Development Workflow

### Development Cycle

```
1. Create Plugin → 2. Develop → 3. Test → 4. Build → 5. Publish
        ↑_______________________________________________|
```

### Typical Development Process

1. **Plan**: Define plugin scope and features
2. **Scaffold**: Create package structure
3. **Manifest**: Define plugin capabilities
4. **Frontend**: Build UI components
5. **Backend**: Create Edge Functions
6. **Database**: Write migrations
7. **Translations**: Add localization
8. **Permissions**: Define access control
9. **Test**: Write and run tests
10. **Document**: Update README
11. **Build**: Compile TypeScript
12. **Publish**: Release to registry

### Local Development

```bash
# In plugin directory
npm run dev  # Watch mode

# In core-erp directory
npm run dev  # Test integration
```

---

## 💡 Best Practices

### Do's ✅

- Use TypeScript for type safety
- Follow naming conventions
- Write comprehensive tests
- Document your plugin
- Use Zod for validation
- Handle errors gracefully
- Log important events
- Version your releases
- Keep plugins focused
- Follow accessibility guidelines

### Don'ts ❌

- Don't modify core code
- Don't bypass permissions
- Don't hardcode configuration
- Don't skip error handling
- Don't ignore type errors
- Don't couple tightly with other plugins
- Don't store sensitive data in code
- Don't skip migration rollbacks
- Don't ignore performance
- Don't forget localization

---

## 🔧 Development Tools

### Recommended IDE

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - i18n Ally

### Useful Commands

```bash
# Build plugin
npm run build

# Watch mode
npm run dev

# Lint code
npm run lint

# Run tests
npm run test

# Type check
npx tsc --noEmit

# Generate types from core
npm run generate-types
```

---

## 📦 Plugin Distribution

### Private NPM Registry

Recommended for enterprise deployments:

- **Verdaccio**: Self-hosted npm proxy
- **GitHub Packages**: Integrated with GitHub
- **npm Private**: Official npm service
- **Artifactory**: Enterprise artifact management

### Git Repositories

For internal plugins:

```json
{
  "dependencies": {
    "@core-erp/plugin-custom": "git+ssh://git@github.com:org/plugin.git#v1.0.0"
  }
}
```

### Local Development

For development and testing:

```json
{
  "dependencies": {
    "@core-erp/plugin-custom": "file:../plugin-custom"
  }
}
```

---

## 🆘 Getting Help

### Resources

- 📖 [Full Documentation](./PLUGIN_DEVELOPMENT_GUIDE.md)
- 💬 [Community Forum](#)
- 🐛 [Issue Tracker](#)
- 📧 [Email Support](#)

### Common Issues

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for:
- Plugin not loading
- Routes not registering
- Permissions not working
- Translation issues
- Build errors

---

## 📝 Contributing

Want to improve plugin system documentation?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

Plugin system and documentation are proprietary to Core ERP.

---

**Happy Plugin Development! 🚀**

