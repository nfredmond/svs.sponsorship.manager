# SVS Sponsorship Manager - Full Feature Upgrade Instructions

This document guides you through upgrading your sponsorship manager app with comprehensive new features.

## Overview of New Features

This upgrade transforms your minimal app into a fully-functional sponsorship CRM with:

- **Enhanced Sponsor Management**: Multiple contacts per sponsor, tags, categorization, sponsor types
- **Advanced Sponsorship Tracking**: Automatic expiration calculation, renewal windows, source tracking
- **Events Management**: Track events and sponsor benefit usage (tickets, passes)
- **Email Automation**: Templates, automated renewal reminders, bulk email
- **User Roles & Permissions**: Admin, Manager, Treasurer, Board Member roles
- **File Attachments**: Upload invoices, agreements, receipts, logos
- **Comprehensive Reporting**: Enhanced dashboards, export capabilities
- **Timeline & History**: Track all interactions with sponsors

## Step 1: Apply Database Migration

### 1.1 Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### 1.2 Run the Migration Script

1. Open the file `database-migration.sql` from this repository
2. Copy the entire contents
3. Paste into a new query in the Supabase SQL Editor
4. Click **Run** to execute the migration

The migration will:
- ✓ Add new fields to existing tables (sponsors, sponsorships, sponsorship_tiers)
- ✓ Create 13 new tables (contacts, tags, events, email_templates, etc.)
- ✓ Set up automatic triggers for expiration dates and status calculations
- ✓ Migrate existing contact data from sponsors table to new contacts table
- ✓ Create helpful database views for common queries
- ✓ Pre-populate with default data (tags, email templates, user roles, settings)

### 1.3 Verify Migration Success

After running the migration, verify it worked:

```sql
-- Check that new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('contacts', 'tags', 'events', 'email_templates', 'files');

-- Check that new columns were added to sponsors
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'sponsors'
AND column_name IN ('sponsor_type', 'industry', 'current_status');

-- Check that contacts were migrated
SELECT COUNT(*) as contact_count FROM contacts;
```

All queries should return results. If any fail, review the migration errors.

## Step 2: Configure Supabase Storage (for File Uploads)

### 2.1 Create Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named **sponsor-files**
3. Configure bucket settings:
   - Public: **No** (files should be private)
   - File size limit: **10MB** (or as needed)
   - Allowed MIME types: `image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*`

### 2.2 Set Storage Policies

Add these RLS policies for the sponsor-files bucket:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sponsor-files');

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'sponsor-files');

-- Allow authenticated users to update their uploaded files
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'sponsor-files');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'sponsor-files');
```

## Step 3: Update Row Level Security (RLS) Policies

Add RLS policies for the new tables:

```sql
-- Enable RLS on all new tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_interactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (authenticated users can do everything)
-- You can refine these later based on user roles

CREATE POLICY "Authenticated users full access" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON sponsor_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON event_passes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON email_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON files FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can view roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view role assignments" ON user_role_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view settings" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users full access" ON sponsor_interactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

## Step 4: Configure Email Service (Optional)

For email automation features to work, you'll need to configure an email service:

### Option A: Using Supabase Edge Functions (Recommended)

1. Install Supabase CLI: `npm install -g supabase`
2. Create an edge function for sending emails
3. Configure with SendGrid, Mailgun, or AWS SES

### Option B: Using a Third-Party Service

1. Sign up for SendGrid, Mailgun, Postmark, or similar
2. Get API credentials
3. Add credentials to Settings page in the app
4. Update `email_settings` in the settings table

## Step 5: Assign User Roles

After logging in, assign yourself an admin role:

```sql
-- Get your user ID (check the auth.users table or from profile)
SELECT id, email FROM auth.users;

-- Assign Admin role to your user
INSERT INTO user_role_assignments (user_id, role_id)
SELECT
    'YOUR_USER_ID_HERE',
    id
FROM user_roles
WHERE role_name = 'Admin';
```

## Step 6: Configure Organization Settings

1. Log into the app
2. Go to **Settings** > **Organization**
3. Update:
   - Organization name, email, phone
   - Payment link (Square, PayPal, etc.)
   - Sponsor chair name and email
   - Logo URL

## Step 7: Import Existing Data (if needed)

If you have existing sponsor data in spreadsheets:

1. Use the **Import** feature (Settings > Import/Export)
2. Map your CSV columns to app fields
3. Review and confirm import

## What's New in the App

### Enhanced Sponsor Management

- **Multiple Contacts**: Each sponsor can have multiple contacts with a primary contact designation
- **Tags & Categories**: Organize sponsors with custom tags (Award Sponsor, In-Kind, etc.)
- **Sponsor Types**: Classify as Company, Agency, or Individual
- **Industry & Geography**: Track what industry and regions they serve
- **Status Tracking**: Automatic status calculation (Active, Pending, Lapsed, Prospect)

### Advanced Sponsorship Features

- **Automatic Expiration**: Sponsorships auto-expire 1 year + end of month from payment date
- **Source Tracking**: Record if sponsorship is New, Renewal, Referral, etc.
- **Benefits Tracking**: Monitor which benefits have been used
- **Enhanced Tiers**: Detailed benefit lists, event passes included, awards tickets

### Events Management

- **Event Creation**: Track Speaker Series, Awards Ceremonies, trainings, etc.
- **Pass Allocation**: Automatically allocate passes based on sponsorship tier
- **Attendance Tracking**: Mark which contacts attended which events
- **Usage Monitoring**: See which sponsors have used/unused passes

### Email & Communications

- **Email Templates**: Pre-built templates for welcome, payment confirmation, renewals
- **Merge Fields**: Personalize emails with sponsor name, amount, dates, etc.
- **Automated Reminders**: Set up automatic renewal reminders (90/60/30 days)
- **Email Logging**: Track all emails sent, opened, clicked
- **Bulk Email**: Send emails to multiple sponsors at once

### User Management

- **Roles**: Admin, Sponsorship Manager, Treasurer, Board Member
- **Permissions**: Granular control over who can do what
- **Activity Logging**: Track all changes (who did what and when)

### Enhanced Reporting

- **Renewal Pipeline**: See all sponsors due for renewal with status
- **Expiring Soon**: Dashboard of sponsors expiring in next 90 days
- **By-Tier Analysis**: Revenue and sponsor breakdown by tier
- **Payment Timeline**: Visual timeline of payments received
- **Custom Reports**: Build your own reports with filters
- **CSV/Excel Export**: Export any data to spreadsheets

### File Management

- **Attachments**: Upload invoices, agreements, receipts to sponsors/sponsorships
- **Logo Management**: Store sponsor logos for website and materials
- **Document Organization**: Categorize files by type

### Timeline & History

- **Interaction Log**: Record calls, emails, meetings with sponsors
- **Change History**: See all changes made to sponsor records
- **Payment History**: Full history of all sponsorships by year
- **Event Participation**: Track which events they've sponsored/attended

## Troubleshooting

### Migration Errors

If the migration fails:

1. **Check for existing tables**: Some tables may already exist. Run `DROP TABLE IF EXISTS table_name CASCADE;` before re-running
2. **Check permissions**: Ensure your database user has CREATE TABLE, ALTER TABLE permissions
3. **Review error messages**: Read the specific error and address it line by line

### Type Errors After Upgrade

If you see TypeScript errors:

1. Restart your development server: `npm run dev`
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

### Data Not Showing

If data doesn't appear after migration:

1. **Check RLS policies**: Ensure policies allow reading data
2. **Verify migration**: Run the verification queries in Step 1.3
3. **Check browser console**: Look for API errors

## Next Steps

1. **Customize Email Templates**: Go to Settings > Email Templates and personalize
2. **Import Existing Data**: Use Import feature to bring in historical sponsors
3. **Set Up Automation**: Configure renewal reminder windows
4. **Assign Roles**: Add other team members and assign appropriate roles
5. **Test Workflows**: Create a test sponsor and sponsorship to verify everything works
6. **Configure Payment Links**: Update settings with your Square/PayPal links

## Support

For issues or questions:

1. Check the application logs in Supabase Dashboard > Logs
2. Review this documentation
3. Contact support or file an issue in the repository

## Backup Recommendation

Before making changes, backup your database:

1. In Supabase Dashboard, go to **Database** > **Backups**
2. Create a manual backup
3. Download it for safekeeping

This way, you can restore if anything goes wrong.
