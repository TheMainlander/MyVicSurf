-- Bootstrap script to make any user an admin
-- Replace 'YOUR_USER_ID' with the actual user ID from Replit Auth

-- To make yourself a super admin (replace with your actual user ID):
-- UPDATE users SET role = 'super_admin' WHERE id = 'YOUR_USER_ID';

-- To make someone an admin:
-- UPDATE users SET role = 'admin' WHERE id = 'USER_ID';

-- To check current users and their roles:
SELECT id, email, display_name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;

-- To see who are the current admins:
SELECT id, email, display_name, role 
FROM users 
WHERE role IN ('admin', 'super_admin');