# Core ERP - Production Deployment Guide

**Last Updated:** November 10, 2025  
**Version:** 1.0.0  

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [Frontend Build](#frontend-build)
6. [Hosting Deployment](#hosting-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Disaster Recovery](#backup--disaster-recovery)
10. [Rollback Procedures](#rollback-procedures)
11. [Performance Optimization](#performance-optimization)
12. [Security Checklist](#security-checklist)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ Supabase account (Pro plan recommended: $10/month)
- ✅ Hosting provider account (Vercel/Netlify/Cloudflare Pages)
- ✅ Domain registrar (for custom domain)
- ✅ Private npm registry access (for @core-erp/* packages)

### Required Tools
- ✅ Node.js 18+ and npm
- ✅ Git
- ✅ Supabase CLI (optional but recommended)

### System Requirements
- Internet connection
- Modern web browser for testing
- SSH access to production environment (if self-hosted)

---

## Environment Setup

### 1. Create Production Supabase Project

1. **Go to Supabase Dashboard:**  
   https://app.supabase.com/

2. **Create New Project:**
   - Organization: Select your organization
   - Name: `{customer-name}-erp-prod`
   - Database Password: Generate strong password (save securely!)
   - Region: Choose closest to target users
     - US East: `us-east-1`
     - Europe: `eu-west-1`
     - Asia: `ap-southeast-1` (Thailand)
     - Asia Pacific: `ap-northeast-1` (Tokyo)

3. **Save Project Credentials:**
   ```
   Project URL: https://{project-ref}.supabase.co
   Project ID: {project-ref}
   Anon Key: {anon-key}
   Service Role Key: {service-role-key} (Keep SECRET!)
   ```

### 2. Configure Environment Variables

Create `.env.production` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://{project-ref}.supabase.co
VITE_SUPABASE_ANON_KEY={your-anon-key}

# Application Configuration
VITE_APP_ENV=production
VITE_CUSTOMER_NAME=Your Company Name
VITE_CUSTOMER_LOGO=/assets/logo.png

# Optional: Custom Branding
VITE_PRIMARY_COLOR=#3b82f6
VITE_APP_TITLE=Your ERP System
```

**⚠️ Security Notes:**
- ✅ The `VITE_SUPABASE_ANON_KEY` is safe to expose (public key with RLS protection)
- 🚨 NEVER expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- 🚨 Never commit `.env` files to version control

---

## Database Setup

### 1. Apply Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. Navigate to SQL Editor in Supabase Dashboard
2. Copy migration files from `@core-erp/entity` package:
   ```bash
   # Extract migrations from node_modules
   cp -r node_modules/@core-erp/entity/supabase/migrations ./supabase/migrations
   ```
3. Execute each migration file in order (by timestamp)
4. Verify tables created: users, roles, permissions, user_roles, role_permissions, audit_log, translations

**Option B: Using Supabase CLI**

```bash
# Link to production project
supabase link --project-ref {your-project-ref}

# Push migrations
supabase db push --project-ref {your-project-ref}
```

### 2. Seed Default Data

Run SQL in Supabase SQL Editor:

```sql
-- Insert default roles
INSERT INTO roles (code, name, description, level, is_system) VALUES
  ('SUPERADMIN', 'Super Administrator', 'Full system access', 100, true),
  ('ADMIN', 'Administrator', 'Administrative access', 50, true),
  ('USER', 'User', 'Standard user access', 10, true)
ON CONFLICT (code) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (code, name, description, category) VALUES
  ('users:view', 'View Users', 'Can view user list', 'users'),
  ('users:create', 'Create Users', 'Can create new users', 'users'),
  ('users:edit', 'Edit Users', 'Can edit user information', 'users'),
  ('users:delete', 'Delete Users', 'Can delete users', 'users'),
  ('users:manage_roles', 'Manage User Roles', 'Can assign roles to users', 'users'),
  ('roles:view', 'View Roles', 'Can view roles', 'roles'),
  ('roles:create', 'Create Roles', 'Can create new roles', 'roles'),
  ('roles:edit', 'Edit Roles', 'Can edit role information', 'roles'),
  ('roles:delete', 'Delete Roles', 'Can delete roles', 'roles'),
  ('permissions:view', 'View Permissions', 'Can view permissions', 'permissions'),
  ('permissions:assign', 'Assign Permissions', 'Can assign permissions to roles', 'permissions'),
  ('system:configure', 'Configure System', 'Can configure system settings', 'system'),
  ('system:audit', 'View Audit Logs', 'Can view audit logs', 'system')
ON CONFLICT (code) DO NOTHING;

-- Assign all permissions to superadmin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPERADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;
```

### 3. Create First Admin User

```sql
-- Option 1: Create user manually
INSERT INTO auth.users (
  email,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  'admin@yourcompany.com',
  NOW(),
  '{"name": "System Administrator"}'::jsonb
) RETURNING id;

-- Insert into users table (use the returned auth_user_id from above)
INSERT INTO users (auth_user_id, email, name, is_active) VALUES
  ('{auth-user-id-from-above}', 'admin@yourcompany.com', 'System Administrator', true)
RETURNING id;

-- Assign superadmin role (use the returned user.id from above)
INSERT INTO user_roles (user_id, role_id)
SELECT '{user-id-from-above}', id FROM roles WHERE code = 'SUPERADMIN';
```

**Option 2: Use Supabase Auth Admin UI**
1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add User"
3. Enter email and auto-generate password
4. Copy user ID
5. Run SQL to create profile and assign role (as above)

---

## Edge Functions Deployment

### 1. Extract Edge Functions

```bash
# Copy Edge Functions from @core-erp/entity package
cp -r node_modules/@core-erp/entity/supabase/functions ./supabase/functions
```

### 2. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy get-user-permissions --project-ref {your-project-ref}
supabase functions deploy create-user --project-ref {your-project-ref}
supabase functions deploy update-user --project-ref {your-project-ref}
supabase functions deploy assign-roles --project-ref {your-project-ref}
supabase functions deploy update-user-locale --project-ref {your-project-ref}
```

### 3. Set Function Secrets

```bash
# Set environment variables for Edge Functions
supabase secrets set SUPABASE_URL={your-project-url} --project-ref {your-project-ref}
supabase secrets set SUPABASE_SERVICE_ROLE_KEY={your-service-role-key} --project-ref {your-project-ref}
```

### 4. Verify Deployment

```bash
# Test function
curl -X POST https://{project-ref}.supabase.co/functions/v1/get-user-permissions \
  -H "Authorization: Bearer {your-anon-key}" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "{test-user-id}"}'
```

---

## Frontend Build

### 1. Install Dependencies

```bash
# Ensure private registry access
npm login --registry=https://your-private-registry.com

# Install dependencies
npm install
```

### 2. Configure Production Environment

```bash
# Copy production environment
cp .env.production .env

# Verify environment variables
cat .env
```

### 3. Build Application

```bash
# Run production build
npm run build

# Output will be in dist/ folder
```

### 4. Verify Build

```bash
# Preview production build locally
npm run preview

# Open http://localhost:4173
# Test login and basic functionality
```

### 5. Build Optimization

```bash
# Check bundle size
npm run build -- --mode production

# Analyze bundle (if analyzer plugin installed)
npm run build:analyze
```

**Expected Bundle Sizes:**
- Main bundle: ~150-200 KB (gzipped)
- Vendor bundle: ~100-150 KB (gzipped)
- Chunks: Various sizes

---

## Hosting Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard:**
   - Project Settings > Environment Variables
   - Add all variables from `.env.production`

4. **Configure Custom Domain:**
   - Project Settings > Domains
   - Add: `erp.yourcompany.com`
   - Configure DNS: Add CNAME record

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Create netlify.toml:**
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Configure environment variables in Netlify Dashboard**

### Option 3: Cloudflare Pages

1. **Connect GitHub Repository**
2. **Configure Build Settings:**
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Environment variables: Add from `.env.production`

3. **Deploy automatically via Git push**

### Option 4: Self-Hosted (nginx)

1. **Install nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Copy build files:**
   ```bash
   scp -r dist/* user@server:/var/www/erp
   ```

3. **Configure nginx:**
   ```nginx
   server {
       listen 80;
       server_name erp.yourcompany.com;
       root /var/www/erp;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

4. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d erp.yourcompany.com
   ```

---

## Post-Deployment Verification

### 1. Functional Testing

**Authentication:**
- [ ] Magic link login works
- [ ] Password login works (if enabled)
- [ ] Session persistence across tabs
- [ ] Logout functionality

**User Management:**
- [ ] View users list
- [ ] Create new user
- [ ] Edit user
- [ ] Deactivate user
- [ ] Assign roles

**Role Management:**
- [ ] View roles
- [ ] Create custom role
- [ ] Assign permissions to role
- [ ] Edit role details

**Permission System:**
- [ ] Permission checks work
- [ ] UI elements hidden for unauthorized users
- [ ] Access denied pages show correctly

**Internationalization:**
- [ ] Language switching works
- [ ] Translations load correctly
- [ ] User locale preference persists

### 2. Performance Testing

**Load Times:**
- [ ] Initial page load < 2 seconds
- [ ] Subsequent navigation < 500ms
- [ ] API calls < 1 second

**Browser Testing:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

### 3. Security Verification

- [ ] Environment variables not exposed in client
- [ ] Service role key not in frontend code
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] XSS protection active
- [ ] CSRF protection via Supabase

### 4. Mobile Testing

- [ ] Responsive design works on phones
- [ ] Touch targets are accessible (44px minimum)
- [ ] Mobile menu functions correctly
- [ ] Forms work on mobile
- [ ] Tables scroll horizontally

---

## Monitoring & Logging

### Supabase Monitoring

**Database:**
- Monitor query performance in Supabase Dashboard
- Check database size and growth
- Review slow queries
- Set up alerts for high CPU/memory usage

**Authentication:**
- Monitor auth errors in Logs
- Track failed login attempts
- Review session expiry rates

**Edge Functions:**
- Monitor function execution times
- Check error rates
- Review invocation counts

### Application Monitoring (Recommended)

**Error Tracking:**
- Set up Sentry or similar service
- Track JavaScript errors
- Monitor API failures
- Alert on critical errors

**Performance Monitoring:**
- Use Google Analytics or similar
- Track Core Web Vitals
- Monitor page load times
- Track user engagement

**Uptime Monitoring:**
- Use UptimeRobot or Pingdom
- Check every 5 minutes
- Alert via email/SMS

---

## Backup & Disaster Recovery

### Database Backups

**Automatic Backups (Supabase Pro):**
- Daily automatic backups
- 7-day retention
- Point-in-time recovery (Pro plan)

**Manual Backups:**
   ```bash
# Export database
supabase db dump --project-ref {your-project-ref} > backup_$(date +%Y%m%d).sql

# Store in secure location (S3, Google Cloud Storage, etc.)
```

**Backup Schedule:**
- Daily automatic backups (Supabase handles this)
- Weekly manual backups before major changes
- Pre-deployment backup before updates

### Code Backups

- Git repository with version control
- Tagged releases for each deployment
- Backup of `dist/` folder for quick rollback

### Configuration Backups

- Backup `.env.production`
- Backup Supabase configuration
- Backup DNS records
- Backup hosting configuration

---

## Rollback Procedures

### Database Rollback

**Option 1: Restore from Backup (Supabase Dashboard)**
1. Go to Database > Backups
2. Select backup point
3. Click "Restore"
4. Confirm restoration

**Option 2: Manual Rollback**
```bash
# Revert migration
supabase migration revert --project-ref {your-project-ref}
```

### Application Rollback

**Vercel:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback {deployment-url}
```

**Netlify:**
```bash
# Rollback via dashboard
# Site > Deploys > Previous deployment > Publish
```

**Self-Hosted:**
```bash
# Deploy previous version
scp -r dist-backup/* user@server:/var/www/erp
sudo systemctl reload nginx
```

### Edge Functions Rollback

```bash
# Re-deploy previous version
cd previous-version/
supabase functions deploy {function-name} --project-ref {your-project-ref}
```

---

## Performance Optimization

### Frontend Optimization

**Code Splitting:**
- ✅ Lazy loading implemented for routes
- ✅ Dynamic imports for large components
- ✅ Plugin system loads on-demand

**Asset Optimization:**
- Optimize images (WebP format, compression)
- Use CDN for static assets
- Enable Brotli/Gzip compression

**Caching:**
- Configure browser caching headers
- Set appropriate cache durations
- Use service worker for offline support

### Database Optimization

**Indexes:**
```sql
-- Ensure these indexes exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
```

**Connection Pooling:**
- Supabase handles this automatically
- Pro plan: 60 connections
- Monitor connection usage

### Edge Function Optimization

- Keep function code small
- Minimize dependencies
- Use connection pooling
- Implement caching where appropriate

---

## Security Checklist

### Pre-Deployment Security

- [ ] All environment variables configured correctly
- [ ] Service role key stored securely (not in frontend)
- [ ] RLS policies enabled on all tables
- [ ] API keys rotated from development
- [ ] CORS configured properly
- [ ] Rate limiting configured (Supabase Auth)
- [ ] SQL injection prevention (using Supabase parameterized queries)
- [ ] XSS prevention (React escaping + validation)

### Post-Deployment Security

- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] Content Security Policy (CSP) set
- [ ] Audit logging working
- [ ] Failed login attempts monitored
- [ ] Session management tested
- [ ] Permission checks verified

### Recommended Security Headers

```nginx
# nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

For Vercel/Netlify, add to `vercel.json` or `netlify.toml`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

**Build Fails:**
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Check for TypeScript errors: `npm run type-check`
- Check for linting errors: `npm run lint`

**Environment Variables Not Working:**
- Verify `.env` file exists
- Check variable names start with `VITE_`
- Rebuild after changing environment variables
- Clear Vite cache: `rm -rf node_modules/.vite`

**Database Connection Issues:**
- Verify Supabase URL and anon key
- Check network connectivity
- Verify project is not paused
- Check Supabase service status

**Edge Functions Not Working:**
- Verify functions are deployed
- Check function logs in Supabase Dashboard
- Verify secrets are set
- Test function endpoint directly

**Authentication Issues:**
- Check email templates in Supabase
- Verify redirect URLs configured
- Check site URL in Supabase settings
- Test with different email providers

**Translation Loading Issues:**
- Verify translations table exists
- Check translations are seeded
- Clear browser cache
- Check i18n backend configuration

---

## Maintenance Schedule

### Daily
- Monitor error rates
- Check uptime status
- Review critical alerts

### Weekly
- Review audit logs
- Check database size
- Monitor performance metrics
- Review failed requests

### Monthly
- Review and update dependencies
- Check for security updates
- Optimize database queries
- Review user feedback

### Quarterly
- Full security audit
- Performance review
- Backup verification
- Documentation update

---

## Support & Escalation

### Severity Levels

**P0 - Critical (Immediate):**
- System down
- Data loss
- Security breach
- Authentication failure

**P1 - High (< 4 hours):**
- Major feature broken
- Performance degradation
- Multiple users affected

**P2 - Medium (< 24 hours):**
- Minor feature issues
- UI bugs
- Single user affected

**P3 - Low (< 1 week):**
- Enhancement requests
- Documentation updates
- Cosmetic issues

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] No linter errors
- [ ] Type check passing
- [ ] Database migrations ready
- [ ] Edge Functions tested
- [ ] Environment variables configured
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Stakeholders notified

### Deployment

- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Frontend built successfully
- [ ] Application deployed
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Security headers set

### Post-Deployment

- [ ] All features tested
- [ ] Authentication verified
- [ ] Permissions checked
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Backup verified
- [ ] Documentation updated
- [ ] Team notified
- [ ] Customer notified

---

## Quick Reference

### Important URLs

```
Production App: https://erp.yourcompany.com
Supabase Dashboard: https://app.supabase.com/project/{project-ref}
Edge Functions: https://{project-ref}.supabase.co/functions/v1/
Database: https://{project-ref}.supabase.co
```

### Key Commands

```bash
# Build
npm run build

# Test
npm run test
npm run test:coverage

# Type Check
npm run type-check

# Lint
npm run lint

# Deploy (Vercel)
vercel --prod

# Deploy Functions
supabase functions deploy {function-name} --project-ref {project-ref}
```

### Emergency Contacts

- Hosting Provider Support: [contact info]
- Supabase Support: support@supabase.io
- Team Lead: [contact info]
- On-Call Developer: [contact info]

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)

---

**Document Version:** 1.0.0  
**Last Updated:** November 10, 2025  
**Next Review:** After first production deployment
