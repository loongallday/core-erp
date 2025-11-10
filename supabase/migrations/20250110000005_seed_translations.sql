-- Seed translations from JSON files to database
-- This populates the translations table with English and Thai translations

-- English - Common
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'common', 'app_name', 'Core ERP'),
('en', 'common', 'navigation.dashboard', 'Dashboard'),
('en', 'common', 'navigation.users', 'Users'),
('en', 'common', 'navigation.roles', 'Roles'),
('en', 'common', 'navigation.permissions', 'Permissions'),
('en', 'common', 'navigation.settings', 'Settings'),
('en', 'common', 'actions.create', 'Create'),
('en', 'common', 'actions.edit', 'Edit'),
('en', 'common', 'actions.delete', 'Delete'),
('en', 'common', 'actions.save', 'Save'),
('en', 'common', 'actions.cancel', 'Cancel'),
('en', 'common', 'actions.confirm', 'Confirm'),
('en', 'common', 'actions.close', 'Close'),
('en', 'common', 'actions.back', 'Back'),
('en', 'common', 'actions.next', 'Next'),
('en', 'common', 'actions.search', 'Search'),
('en', 'common', 'actions.filter', 'Filter'),
('en', 'common', 'actions.view', 'View'),
('en', 'common', 'actions.add', 'Add'),
('en', 'common', 'status.active', 'Active'),
('en', 'common', 'status.inactive', 'Inactive'),
('en', 'common', 'status.loading', 'Loading...'),
('en', 'common', 'status.success', 'Success'),
('en', 'common', 'status.error', 'Error'),
('en', 'common', 'messages.save_success', 'Saved successfully'),
('en', 'common', 'messages.save_error', 'Failed to save'),
('en', 'common', 'messages.no_data', 'No data available')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- English - Auth
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'auth', 'login.title', 'Sign In'),
('en', 'auth', 'login.subtitle', 'Welcome to Core ERP'),
('en', 'auth', 'login.email_label', 'Email Address'),
('en', 'auth', 'login.email_placeholder', 'Enter your email'),
('en', 'auth', 'login.password_label', 'Password'),
('en', 'auth', 'login.password_placeholder', 'Enter your password'),
('en', 'auth', 'login.magic_link_button', 'Send Magic Link'),
('en', 'auth', 'login.password_button', 'Sign In with Password'),
('en', 'auth', 'login.magic_link_sent', 'Check your email for the magic link!'),
('en', 'auth', 'login.magic_link_description', 'We''ve sent you a magic link to sign in. Click the link in your email to continue.'),
('en', 'auth', 'login.signing_in', 'Signing in...'),
('en', 'auth', 'actions.logout', 'Sign Out'),
('en', 'auth', 'errors.unknown_error', 'An unexpected error occurred')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- English - Users
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'users', 'title', 'Users'),
('en', 'users', 'subtitle', 'Manage system users and their roles'),
('en', 'users', 'actions.add_user', 'Add New User'),
('en', 'users', 'messages.loading', 'Loading users...'),
('en', 'users', 'messages.no_users', 'No users found'),
('en', 'users', 'table.name', 'Name'),
('en', 'users', 'table.email', 'Email'),
('en', 'users', 'table.roles', 'Roles'),
('en', 'users', 'table.status', 'Status'),
('en', 'users', 'table.actions', 'Actions')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- English - Roles
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'roles', 'title', 'Roles'),
('en', 'roles', 'subtitle', 'Manage roles and permissions'),
('en', 'roles', 'fields.level', 'Level'),
('en', 'roles', 'fields.is_system', 'System'),
('en', 'roles', 'messages.loading', 'Loading roles...')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Common
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'common', 'app_name', 'Core ERP'),
('th', 'common', 'navigation.dashboard', 'แดชบอร์ด'),
('th', 'common', 'navigation.users', 'ผู้ใช้'),
('th', 'common', 'navigation.roles', 'บทบาท'),
('th', 'common', 'navigation.permissions', 'สิทธิ์'),
('th', 'common', 'navigation.settings', 'ตั้งค่า'),
('th', 'common', 'actions.create', 'สร้าง'),
('th', 'common', 'actions.edit', 'แก้ไข'),
('th', 'common', 'actions.delete', 'ลบ'),
('th', 'common', 'actions.save', 'บันทึก'),
('th', 'common', 'actions.cancel', 'ยกเลิก'),
('th', 'common', 'actions.confirm', 'ยืนยัน'),
('th', 'common', 'actions.close', 'ปิด'),
('th', 'common', 'actions.back', 'กลับ'),
('th', 'common', 'actions.next', 'ถัดไป'),
('th', 'common', 'actions.search', 'ค้นหา'),
('th', 'common', 'actions.filter', 'กรอง'),
('th', 'common', 'actions.view', 'ดู'),
('th', 'common', 'actions.add', 'เพิ่ม'),
('th', 'common', 'status.active', 'ใช้งาน'),
('th', 'common', 'status.inactive', 'ไม่ใช้งาน'),
('th', 'common', 'status.loading', 'กำลังโหลด...'),
('th', 'common', 'status.success', 'สำเร็จ'),
('th', 'common', 'status.error', 'ผิดพลาด'),
('th', 'common', 'messages.save_success', 'บันทึกสำเร็จ'),
('th', 'common', 'messages.save_error', 'บันทึกไม่สำเร็จ'),
('th', 'common', 'messages.no_data', 'ไม่มีข้อมูล')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Auth
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'auth', 'login.title', 'เข้าสู่ระบบ'),
('th', 'auth', 'login.subtitle', 'ยินดีต้อนรับสู่ Core ERP'),
('th', 'auth', 'login.email_label', 'ที่อยู่อีเมล'),
('th', 'auth', 'login.email_placeholder', 'กรอกอีเมลของคุณ'),
('th', 'auth', 'login.password_label', 'รหัสผ่าน'),
('th', 'auth', 'login.password_placeholder', 'กรอกรหัสผ่านของคุณ'),
('th', 'auth', 'login.magic_link_button', 'ส่งลิงก์เข้าสู่ระบบ'),
('th', 'auth', 'login.password_button', 'เข้าสู่ระบบด้วยรหัสผ่าน'),
('th', 'auth', 'login.magic_link_sent', 'ตรวจสอบอีเมลของคุณสำหรับลิงก์เข้าสู่ระบบ!'),
('th', 'auth', 'login.magic_link_description', 'เราได้ส่งลิงก์สำหรับเข้าสู่ระบบไปยังอีเมลของคุณแล้ว คลิกที่ลิงก์ในอีเมลเพื่อดำเนินการต่อ'),
('th', 'auth', 'login.signing_in', 'กำลังเข้าสู่ระบบ...'),
('th', 'auth', 'actions.logout', 'ออกจากระบบ'),
('th', 'auth', 'errors.unknown_error', 'เกิดข้อผิดพลาดที่ไม่คาดคิด')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Users
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'users', 'title', 'ผู้ใช้'),
('th', 'users', 'subtitle', 'จัดการผู้ใช้ระบบและบทบาทของพวกเขา'),
('th', 'users', 'actions.add_user', 'เพิ่มผู้ใช้ใหม่'),
('th', 'users', 'messages.loading', 'กำลังโหลดผู้ใช้...'),
('th', 'users', 'messages.no_users', 'ไม่พบผู้ใช้'),
('th', 'users', 'table.name', 'ชื่อ'),
('th', 'users', 'table.email', 'อีเมล'),
('th', 'users', 'table.roles', 'บทบาท'),
('th', 'users', 'table.status', 'สถานะ'),
('th', 'users', 'table.actions', 'การดำเนินการ')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Thai - Roles
INSERT INTO translations (locale, namespace, key, value) VALUES
('th', 'roles', 'title', 'บทบาท'),
('th', 'roles', 'subtitle', 'จัดการบทบาทและสิทธิ์'),
('th', 'roles', 'fields.level', 'ระดับ'),
('th', 'roles', 'fields.is_system', 'ระบบ'),
('th', 'roles', 'messages.loading', 'กำลังโหลดบทบาท...')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

