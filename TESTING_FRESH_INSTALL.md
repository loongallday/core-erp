# Testing Fresh Installation

**Purpose**: Test the complete installation process from scratch

---

## 🎯 Test Scenario

Verify that a fresh installation works perfectly with the ONE-FILE setup scripts.

---

## 📋 Test Steps

### Step 1: Reset Database

1. Open **Supabase SQL Editor**
2. Copy entire content of `supabase/RESET_DATABASE.sql`
3. Paste and **Run**
4. ✅ Verify success message: "Database Reset Complete!"

**What this does**:
- Drops all Core ERP tables
- Drops all plugin tables (Leave)
- Drops all functions and triggers
- **Clean slate** - ready for fresh install

### Step 2: Install Core ERP

1. Open **Supabase SQL Editor**  
2. **New query** (don't reuse previous)
3. Copy entire content of `supabase/CORE_COMPLETE.sql`
4. Paste and **Run**
5. ✅ Verify success message shows:
   - Tables created: 7
   - Roles: 3
   - Permissions: 13
   - Translations: 60+

**Expected Result**:
- 7 tables created
- 3 roles (Superadmin, Admin, User)
- 13 permissions
- All RLS policies active
- Translations seeded

### Step 3: Create First User

**In Supabase Dashboard** → Authentication → Users:
1. Click "Add user"
2. Email: `admin@test.com`
3. Auto-generate password (or set your own)
4. Copy the generated password
5. Click "Create user"

**Link to Core ERP** - Run this SQL:

```sql
-- Get the auth user ID (just created)
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Replace <auth-user-id> with the ID from above
INSERT INTO users (auth_user_id, email, name, is_active)
VALUES ('<auth-user-id>', 'admin@test.com', 'Test Admin', true);

-- Assign superadmin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@test.com'
AND r.code = 'SUPERADMIN';

-- Verify
SELECT u.name, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@test.com';
```

### Step 4: Test Core ERP Login

1. Go to http://localhost:5175
2. Click "Password" tab
3. Enter: `admin@test.com`
4. Enter: (your password)
5. Click "Sign In"

**Expected Result**:
- ✅ Login successful
- ✅ Redirected to /dashboard
- ✅ Sidebar shows: Dashboard, Users, Roles, Plugins
- ✅ No "Leave Management" yet (not installed)

### Step 5: Install Leave Plugin Database

1. Open **Supabase SQL Editor**
2. **New query**
3. Copy entire content of `../core-leave/PLUGIN_COMPLETE.sql`
4. Paste and **Run**
5. ✅ Verify success message

**Expected Result**:
- 4 new tables (leave_types, leave_balances, leave_requests, leave_calendar_cache)
- 10 leave types seeded
- 10 leave permissions added
- Permissions assigned to roles

### Step 6: Restart Server & Test Plugin

```bash
# Stop server (Ctrl+C)
npm run dev
```

1. Refresh browser (F5)
2. Login again if needed
3. **Look at sidebar**

**Expected Result**:
- ✅ "Leave Management" menu appears (Calendar icon)
- ✅ Submenu: My Requests, My Balance, Calendar, Reports, Leave Types
- ✅ Click to access
- ✅ Page loads successfully

### Step 7: Test Plugin Features

**Test Leave Types**:
1. Navigate to `/leave/types`
2. ✅ Should see 10 default leave types
3. ✅ Can view details

**Test Balance**:
1. Navigate to `/leave/balance`
2. ✅ Page loads (no balances yet - expected)

**Test Requests**:
1. Navigate to `/leave/requests`
2. ✅ Empty state shows
3. ✅ "Create" button visible

**Test Plugins Page**:
1. Navigate to `/plugins`
2. ✅ Shows 1 plugin (Leave Management)
3. ✅ Status: Enabled
4. ✅ Shows: 9 routes, 1 menu item, 10 permissions

---

## ✅ Success Criteria

### Core Installation:
- [ ] Database reset successful
- [ ] CORE_COMPLETE.sql runs without errors
- [ ] 7 tables created
- [ ] 3 roles, 13 permissions seeded
- [ ] User created and can login
- [ ] Dashboard loads
- [ ] Core menus visible

### Plugin Installation:
- [ ] PLUGIN_COMPLETE.sql runs without errors
- [ ] 4 plugin tables created
- [ ] 10 leave types seeded
- [ ] 10 permissions added
- [ ] Plugin menu appears after restart
- [ ] Plugin pages accessible
- [ ] Plugins page shows Leave Management

### Overall:
- [ ] No errors in browser console
- [ ] No 404 errors
- [ ] All permissions working
- [ ] Translations loading
- [ ] UI responsive

---

## 🐛 Troubleshooting

### If core tables don't drop:
```sql
-- Force drop with CASCADE
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run CORE_COMPLETE.sql

### If plugin shows "Access Denied":
```sql
-- Verify permissions were added
SELECT code FROM permissions WHERE code LIKE 'leave:%';

-- Verify role assignments
SELECT r.name, p.code 
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id  
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE 'leave:%'
ORDER BY r.level DESC, p.code;
```

### If plugin doesn't appear:
1. Check browser console for errors
2. Verify plugin in plugins.config.ts
3. Restart dev server completely
4. Clear browser cache (Ctrl+Shift+R)

---

## 📊 Test Results Template

```
✅ Database Reset: Success
✅ Core Installation: Success  
✅ User Creation: Success
✅ Login: Success
✅ Plugin Installation: Success
✅ Plugin Visible: Success
✅ All Features: Working

Total Time: ___ minutes
Issues Found: ___
Overall: PASS / FAIL
```

---

## 🎯 Expected Timeline

- Step 1 (Reset): 10 seconds
- Step 2 (Core): 5 seconds
- Step 3 (User): 2 minutes
- Step 4 (Login Test): 30 seconds
- Step 5 (Plugin): 5 seconds
- Step 6 (Restart): 30 seconds
- Step 7 (Test): 2 minutes

**Total**: ~6 minutes

---

**This tests the complete user experience of installing Core ERP + plugin from scratch!**

