# Plugin Template Generator Architecture

Complete system design and technical documentation for the Core ERP Plugin Template Generator.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [File Organization](#file-organization)
6. [Key Design Decisions](#key-design-decisions)
7. [Extension Points](#extension-points)
8. [Performance Considerations](#performance-considerations)

## System Overview

The Plugin Template Generator is a CLI tool that transforms user inputs into complete, working plugin packages. It follows a pipeline architecture:

```
User Input → Prompts → Configuration → Template Context → File Generation → Disk Write
```

### Key Principles

1. **Separation of Concerns**: Each component has a single responsibility
2. **Type Safety**: Full TypeScript coverage prevents runtime errors
3. **Extensibility**: Easy to add new templates and features
4. **User-Friendly**: Interactive prompts guide users through setup
5. **Production-Ready**: Generated code follows best practices

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Entry                            │
│                      (src/index.ts)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Interactive Prompts                       │
│                     (src/prompts.ts)                         │
│  • Plugin metadata  • Feature selection  • Validation        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  PluginConfig Object
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Generator Orchestrator                     │
│                    (src/generator.ts)                        │
│  • Create template context  • Orchestrate generation         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  TemplateContext Object
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     File Generator                           │
│                 (src/fileGenerator.ts)                       │
│  • Select templates  • Generate content  • Build file list   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
    ┌─────────────┐            ┌─────────────┐
    │  Templates  │            │   Utilities │
    │ (src/       │            │   (src/     │
    │  templates/)│            │    utils.ts)│
    └──────┬──────┘            └─────────────┘
           │
           │ Generate Content
           ▼
     GeneratedFile[]
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      File System Writer                      │
│               (generator.ts - fs-extra)                      │
│  • Create directories  • Write files  • Error handling       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  Generated Plugin
```

## Core Components

### 1. CLI Entry Point (`src/index.ts`)

**Purpose**: Main entry point for the CLI application

**Responsibilities**:
- Display welcome banner
- Coordinate the generation flow
- Handle top-level errors
- Display success/failure messages

**Key Functions**:
- `main()`: Orchestrates the entire process

### 2. Interactive Prompts (`src/prompts.ts`)

**Purpose**: Collect user inputs through interactive CLI prompts

**Responsibilities**:
- Ask questions about plugin metadata
- Validate user inputs
- Provide helpful defaults
- Show configuration summary
- Confirm before proceeding

**Key Functions**:
- `promptForConfig()`: Main prompt flow, returns `PluginConfig`

**Technologies**:
- `inquirer`: Interactive CLI prompts
- Custom validators for input validation

### 3. Generator Orchestrator (`src/generator.ts`)

**Purpose**: Coordinate the entire generation process

**Responsibilities**:
- Create template context from config
- Call file generator
- Create output directories
- Write files to disk
- Show progress indicators
- Handle errors gracefully

**Key Functions**:
- `generatePlugin(config)`: Main generation function
- `createTemplateContext(config)`: Transform config to context

**Technologies**:
- `fs-extra`: Enhanced file operations
- `ora`: Loading spinners
- `chalk`: Colored terminal output

### 4. File Generator (`src/fileGenerator.ts`)

**Purpose**: Generate file contents from templates

**Responsibilities**:
- Import all template modules
- Select templates based on features
- Call template functions with context
- Build array of files to generate

**Key Functions**:
- `generateAllFiles(ctx)`: Generate all files
- `generateBaseFiles(ctx)`: Base files (always)
- `generateFrontendFiles(ctx)`: Frontend files (conditional)
- `generateBackendFiles(ctx)`: Backend files (conditional)
- `generateDatabaseFiles(ctx)`: Database files (conditional)
- etc.

### 5. Template Modules (`src/templates/*.ts`)

**Purpose**: Generate specific file contents

**Responsibilities**:
- Take `TemplateContext` as input
- Return string content for files
- Handle conditional content
- Apply naming conventions

**Template Categories**:
- `base.ts`: package.json, tsconfig, README, etc.
- `manifest.ts`: Plugin manifest (index.ts)
- `frontend.ts`: React components and routes
- `backend.ts`: Edge Functions
- `database.ts`: SQL migrations and seeds
- `permissions.ts`: Permission definitions
- `translations.ts`: i18n files
- `events.ts`: Event handlers

### 6. Utilities (`src/utils.ts`)

**Purpose**: Helper functions used throughout the system

**Responsibilities**:
- String transformations (kebab-case, PascalCase, etc.)
- Input validation
- Date/time formatting
- Package naming

**Key Functions**:
- `toKebabCase(str)`: Convert to kebab-case
- `toCamelCase(str)`: Convert to camelCase
- `toPascalCase(str)`: Convert to PascalCase
- `toPlural(str)`: Pluralize words
- `validatePluginName(name)`: Validate plugin name
- `validateResourceName(name)`: Validate resource name

### 7. Type Definitions (`src/types.ts`)

**Purpose**: TypeScript interfaces for the entire system

**Key Types**:
- `PluginConfig`: User configuration
- `TemplateContext`: Template interpolation variables
- `PluginFeatures`: Feature flags
- `GeneratedFile`: File to be written
- `TemplateFunction`: Template function signature

## Data Flow

### 1. User Input Phase

```typescript
User → Prompts → PluginConfig
```

**Input**: User answers
**Output**: `PluginConfig` object

**Example**:
```typescript
{
  name: "Inventory Management",
  id: "inventory-management",
  description: "Manage inventory items",
  author: "ACME Corp",
  category: "operations",
  outputDir: "/projects/plugins",
  resourceName: "Item",
  features: {
    frontend: true,
    backend: true,
    database: true,
    // ...
  }
}
```

### 2. Context Creation Phase

```typescript
PluginConfig → Generator → TemplateContext
```

**Transformation**:
- Extract values from config
- Generate naming variants (kebab, camel, pascal)
- Add metadata (year, date)
- Create complete context object

**Example**:
```typescript
{
  pluginName: "Inventory Management",
  pluginId: "inventory-management",
  pluginIdCamel: "inventoryManagement",
  pluginIdPascal: "InventoryManagement",
  packageName: "@core-erp/plugin-inventory-management",
  resourceName: "Item",
  resourceNamePlural: "Items",
  // ... 20+ variables
}
```

### 3. File Generation Phase

```typescript
TemplateContext → FileGenerator → Templates → GeneratedFile[]
```

**Process**:
1. File generator calls template functions
2. Each template receives context
3. Templates return string content
4. File generator builds file list

**Example**:
```typescript
[
  { path: 'package.json', content: '{ "name": "@core-erp/..." }' },
  { path: 'src/index.ts', content: 'export const plugin = ...' },
  { path: 'src/frontend/routes.tsx', content: 'import ...' },
  // ... more files
]
```

### 4. File Writing Phase

```typescript
GeneratedFile[] → Generator → File System
```

**Process**:
1. Create plugin directory
2. For each file:
   - Create parent directories
   - Write file content
   - Show progress
3. Handle errors

## File Organization

```
tools/plugin-template-generator/
├── package.json              # CLI tool dependencies
├── tsconfig.json             # TypeScript config
├── README.md                 # Main documentation
├── ARCHITECTURE.md           # This file
├── TEMPLATE_DEVELOPMENT.md   # Template guide
├── AI_CONTEXT.md             # AI-friendly docs
├── QUICK_START_TEMPLATES.md  # Quick guide
│
├── src/
│   ├── index.ts              # CLI entry point
│   ├── prompts.ts            # Interactive prompts
│   ├── generator.ts          # Generation orchestration
│   ├── fileGenerator.ts      # File generation logic
│   ├── utils.ts              # Helper functions
│   ├── types.ts              # TypeScript interfaces
│   │
│   └── templates/
│       ├── README.md         # Template reference
│       ├── base.ts           # Base files
│       ├── manifest.ts       # Plugin manifest
│       ├── frontend.ts       # Frontend templates
│       ├── backend.ts        # Backend templates
│       ├── database.ts       # Database templates
│       ├── permissions.ts    # Permission templates
│       ├── translations.ts   # Translation templates
│       └── events.ts         # Event templates
│
└── dist/                     # Compiled output (after build)
```

## Key Design Decisions

### 1. Template Functions Over String Templates

**Decision**: Use TypeScript functions instead of separate template files

**Rationale**:
- Type safety at compile time
- Better IDE support (autocomplete, refactoring)
- Can use JavaScript logic (conditionals, loops)
- No need for separate template parsing
- Easier to test

### 2. Single Context Object

**Decision**: Pass one `TemplateContext` object to all templates

**Rationale**:
- Consistent interface across templates
- Easy to add new variables
- Self-documenting (TypeScript interface)
- Prevents parameter drift

### 3. Separate Template Modules by Category

**Decision**: Group templates by feature category (frontend, backend, etc.)

**Rationale**:
- Logical organization
- Easy to find templates
- Can import only needed templates
- Clear separation of concerns

### 4. Synchronous File Generation

**Decision**: Generate all files synchronously, then write them

**Rationale**:
- Simpler error handling
- Can show progress accurately
- Atomic operation (all or nothing)
- Easier to rollback on failure

### 5. No Template Inheritance

**Decision**: Each template is independent

**Rationale**:
- Simpler to understand
- No hidden dependencies
- Each template fully self-contained
- Can be tested in isolation

## Extension Points

### Adding a New Template

1. Create template function in appropriate file
2. Add to `fileGenerator.ts`
3. Update types if needed
4. Update prompts if needed
5. Test the output

### Adding a New Feature Flag

1. Add to `PluginFeatures` interface
2. Add prompt option
3. Create template(s) for the feature
4. Add conditional generation logic
5. Document the feature

### Customizing Existing Templates

1. Locate template in `src/templates/`
2. Modify the template function
3. Test with generator
4. Update documentation if needed

### Adding New Prompt Questions

1. Open `src/prompts.ts`
2. Add new `inquirer.prompt()` question
3. Add to `PluginConfig` interface
4. Use in template context
5. Update templates to use new value

## Performance Considerations

### Template Generation

- **Fast**: Templates are simple functions, execute in milliseconds
- **Memory Efficient**: Strings generated on-demand
- **Scalable**: Can add hundreds of templates without impact

### File Writing

- **Bottleneck**: I/O operations are the slowest part
- **Optimization**: Batch operations, async writes (future)
- **Trade-off**: Synchronous is simpler, fast enough for typical usage

### User Experience

- **Progress Indicators**: `ora` spinners show progress
- **Colored Output**: `chalk` makes messages clear
- **Error Handling**: Helpful error messages guide users

## Sequence Diagram

```
User    CLI    Prompts    Generator    FileGen    Templates    FileSystem
 │       │        │           │           │           │            │
 │──run──>│        │           │           │           │            │
 │       │─ask────>│           │           │           │            │
 │       │<─input──│           │           │           │            │
 │       │────config────────────>│         │           │            │
 │       │        │           │─context───>│           │            │
 │       │        │           │           │─generate───>│            │
 │       │        │           │           │<─content───│            │
 │       │        │           │<─files────│            │            │
 │       │        │           │───create dirs───────────────────────>│
 │       │        │           │───write files───────────────────────>│
 │       │<──────result───────│           │           │            │
 │<─done─│        │           │           │           │            │
```

## Error Handling Strategy

1. **Validation**: Catch errors early in prompts
2. **Graceful Degradation**: Show helpful error messages
3. **Rollback**: Don't leave partial plugins on error
4. **Logging**: Log errors for debugging
5. **User Feedback**: Clear messages about what went wrong

## Future Enhancements

Potential improvements:

1. **Async File Writing**: Parallel I/O for better performance
2. **Template Validation**: Verify templates produce valid code
3. **Plugin Preview**: Show what will be generated before writing
4. **Update Existing**: Update existing plugins with new features
5. **Template Marketplace**: Share custom templates
6. **Interactive Editing**: Edit generated files in-place
7. **Diff View**: Show changes when regenerating

---

**For questions about architecture, consult this document or review the source code.**

