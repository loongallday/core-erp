# Private Package Setup & Publishing

This document explains how to set up, publish, and consume the private `@core-erp` packages.

## Overview

Core ERP uses two **private npm packages** published to a private registry:

- **@core-erp/entity** - Database types, hooks, contexts, validation, migrations, Edge Functions
- **@core-erp/ui** - UI components and design system

## Private Registry Options

### Option 1: GitHub Packages (Recommended)

**Pros**: Free for private repos, integrates with GitHub auth, good CI/CD

**Setup**:

1. **Configure package.json** in each package:

```json
{
  "name": "@core-erp/entity",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/core-entity.git"
  }
}
```

2. **Create .npmrc** in consuming apps:

```bash
@core-erp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

3. **Publish**:

```bash
npm login --registry=https://npm.pkg.github.com
npm publish
```

### Option 2: npm Private Packages

**Pros**: Official npm solution, $7/month

**Setup**:

1. **Create npm organization**: https://www.npmjs.com/org/create
2. **Configure package.json**:

```json
{
  "name": "@core-erp/entity",
  "private": true
}
```

3. **Publish**:

```bash
npm login
npm publish --access restricted
```

### Option 3: Verdaccio (Self-Hosted)

**Pros**: Free, full control, can run on-premise

**Setup**: See https://verdaccio.org/docs/installation

### Option 4: Azure Artifacts / AWS CodeArtifact

**Pros**: Enterprise features, integrates with cloud infrastructure

## Publishing Packages

### 1. @core-erp/entity

```bash
# Clone and navigate to entity repo
git clone https://github.com/your-org/core-entity.git
cd core-entity

# Install dependencies
npm install

# Update version
npm version patch  # or minor, major

# Build
npm run build

# Publish
npm publish
```

**Package structure**:
```json
{
  "name": "@core-erp/entity",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "supabase"
  ]
}
```

### 2. @core-erp/ui

```bash
# Clone and navigate to UI repo
git clone https://github.com/your-org/core-ui.git
cd core-ui

# Install dependencies
npm install

# Update version
npm version patch

# Build
npm run build

# Publish
npm publish
```

## Consuming Packages in Applications

### 1. Authentication Setup

**For GitHub Packages**:

Create `.npmrc` in project root:

```
@core-erp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Generate token: https://github.com/settings/tokens
- Select: `read:packages`

**For npm Private**:

```bash
npm login
# Enter credentials when prompted
```

### 2. Install Packages

**package.json**:
```json
{
  "dependencies": {
    "@core-erp/entity": "^1.0.0",
    "@core-erp/ui": "^1.0.0"
  }
}
```

```bash
npm install
```

### 3. Use in Application

```typescript
// Import from published packages
import { useAuth, useUsers, createSupabaseClient } from '@core-erp/entity'
import { Button, Card, Dialog } from '@core-erp/ui/components/ui'
```

## Version Management

### Semantic Versioning

Follow semver: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., API changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Version Update Commands

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0
```

### Updating Dependencies

In consuming apps (e.g., core-erp):

```bash
# Update to latest patch version
npm update @core-erp/entity

# Update to specific version
npm install @core-erp/entity@1.2.0

# Update to latest minor version
npm install @core-erp/entity@^1.2.0

# Always use latest
npm install @core-erp/entity@latest
```

## CI/CD Integration

### GitHub Actions Example

**.github/workflows/publish.yml**:

```yaml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://npm.pkg.github.com'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

### Consuming in CI/CD

**.github/workflows/deploy.yml** (in core-erp):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Configure npm
        run: |
          echo "@core-erp:registry=https://npm.pkg.github.com" >> .npmrc
          echo "//npm.pkg.github.com/:_authToken=${{secrets.GITHUB_TOKEN}}" >> .npmrc
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: npm run deploy
```

## Database Migrations

Migrations are included in `@core-erp/entity` package under `supabase/migrations/`.

### Applying Migrations

**Option 1: Copy from node_modules**

```bash
# Copy migrations to local supabase folder
cp -r node_modules/@core-erp/entity/supabase/migrations ./supabase/

# Apply migrations
supabase db push --project-ref <project-ref>
```

**Option 2: Clone entity repo**

```bash
# Clone entity repo
git clone https://github.com/your-org/core-entity.git

# Navigate and apply
cd core-entity
supabase db push --project-ref <project-ref>
```

## Edge Functions Deployment

Edge Functions are included in the `@core-erp/entity` package.

### Deploying Functions

**Option 1: Copy from node_modules**

```bash
# Copy functions to local supabase folder
cp -r node_modules/@core-erp/entity/supabase/functions ./supabase/

# Deploy functions
supabase functions deploy get-user-permissions --project-ref <project-ref>
supabase functions deploy create-user --project-ref <project-ref>
supabase functions deploy update-user --project-ref <project-ref>
supabase functions deploy assign-roles --project-ref <project-ref>
supabase functions deploy update-user-locale --project-ref <project-ref>
```

**Option 2: Deploy from entity repo**

```bash
# Clone entity repo
git clone https://github.com/your-org/core-entity.git
cd core-entity

# Deploy all functions
cd supabase
for dir in functions/*/; do
  func_name=$(basename "$dir")
  if [ "$func_name" != "_shared" ]; then
    supabase functions deploy "$func_name" --project-ref <project-ref>
  fi
done
```

## Security Best Practices

### 1. Token Management

**Never commit tokens to git:**

```bash
# Add to .gitignore
.npmrc
.env
.env.*
```

**Use environment variables:**

```bash
# .npmrc
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# Run with env var
GITHUB_TOKEN=ghp_xxx npm install
```

### 2. Access Control

**GitHub Packages:**
- Grant team read access to packages
- Restrict publish access to CI/CD and maintainers

**npm Private:**
- Use teams for access control
- Enable 2FA for all maintainers

### 3. Audit Logs

Monitor package downloads and publishes:

- **GitHub**: Check package insights
- **npm**: Check package access logs
- **Verdaccio**: Check audit logs

## Troubleshooting

### Error: 401 Unauthorized

**Solution**: Check authentication

```bash
# Re-login
npm login --registry=https://npm.pkg.github.com

# Or regenerate token
# GitHub Settings -> Developer settings -> Personal access tokens
```

### Error: 404 Package not found

**Solution**: Check registry configuration

```bash
# Verify .npmrc
cat .npmrc

# Should show:
@core-erp:registry=https://npm.pkg.github.com
```

### Error: EPERM (Windows)

**Solution**: Close IDE and try again, or:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Slow Install Times

**Solution**: Use lockfile and ci command

```bash
# Generates package-lock.json
npm install

# Commit package-lock.json
git add package-lock.json
git commit -m "Add lockfile"

# Use ci for faster installs
npm ci  # instead of npm install
```

## Migration from Local Packages

If you previously used `file:../core-entity`:

1. **Update package.json**:
   ```json
   // Before
   "@core-erp/entity": "file:../core-entity"
   
   // After
   "@core-erp/entity": "^1.0.0"
   ```

2. **Setup authentication** (see above)

3. **Remove local copies**:
   ```bash
   rm -rf ../core-entity ../core-ui
   ```

4. **Install from registry**:
   ```bash
   npm install
   ```

## Related Documentation

- [Entity Package Documentation](./ENTITY_PACKAGE.md)
- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)
- [README.md](../README.md)

