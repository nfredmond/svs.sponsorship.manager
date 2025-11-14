# Supabase Security Configuration

## ✅ Disable Public Signups

To ensure only admin-created users can access the application:

1. **Go to Supabase Authentication Settings**:
   https://ssjlyksagkzmchjvvtao.supabase.co/project/ssjlyksagkzmchjvvtao/auth/url-configuration

2. **Scroll to "Enable email confirmations"**:
   - Set to **OFF** (users created by admin don't need to confirm)

3. **Go to Providers Settings**:
   https://ssjlyksagkzmchjvvtao.supabase.co/project/ssjlyksagkzmchjvvtao/auth/providers

4. **Under "Email Provider"**:
   - Make sure **"Confirm email"** is **disabled**
   - Make sure **"Enable sign-ups"** is **disabled** (if this option exists)

5. **Go to Authentication Policies**:
   https://ssjlyksagkzmchjvvtao.supabase.co/project/ssjlyksagkzmchjvvtao/auth/policies

6. **Review Settings**:
   - Site URL: Should be your Vercel URL
   - Redirect URLs: Add your Vercel URL + `/auth/callback`

## 🔐 Creating New Users (Admin Only)

Only admins can create users through Supabase Dashboard:

1. Go to: https://ssjlyksagkzmchjvvtao.supabase.co/project/ssjlyksagkzmchjvvtao/auth/users
2. Click **"Add user"** → **"Create new user"**
3. Enter email and password
4. User can immediately sign in

## 👥 Recommended User Roles (Future Enhancement)

For role-based access control, consider adding user metadata:
- **Admin**: Full access (Nathaniel Redmond)
- **Editor**: Can create/edit but not delete
- **Viewer**: Read-only access

## 🛡️ Current Security Status

✅ No signup page in the application
✅ Only login page exists
✅ All routes protected by authentication middleware
✅ RLS policies enabled on all database tables
✅ Environment variables properly configured

## 📝 User Management Process

**To add a new user:**
1. Admin logs into Supabase Dashboard
2. Navigate to Authentication → Users
3. Click "Add user"
4. Provide email and temporary password
5. Share credentials with the new user securely
6. User logs in and should change password immediately

**To remove a user:**
1. Admin logs into Supabase Dashboard
2. Navigate to Authentication → Users
3. Find the user
4. Click the three dots → Delete user

