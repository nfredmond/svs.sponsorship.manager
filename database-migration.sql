-- =====================================================
-- SVS Sponsorship Manager - Comprehensive Database Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. ENHANCE SPONSORS TABLE
-- Add new fields for sponsor type, industry, geography, etc.
ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS sponsor_type TEXT CHECK (sponsor_type IN ('company', 'agency', 'individual')) DEFAULT 'company',
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS geography TEXT[], -- Array of counties/regions served
ADD COLUMN IF NOT EXISTS current_status TEXT CHECK (current_status IN ('Active', 'Pending', 'Lapsed', 'Prospect')) DEFAULT 'Prospect',
ADD COLUMN IF NOT EXISTS status_override BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(current_status);
CREATE INDEX IF NOT EXISTS idx_sponsors_type ON sponsors(sponsor_type);

-- 2. CREATE CONTACTS TABLE (1-to-many with sponsors)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    secondary_email TEXT,
    secondary_phone TEXT,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_sponsor ON contacts(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_contacts_primary ON contacts(sponsor_id, is_primary) WHERE is_primary = TRUE;

-- Trigger to ensure only one primary contact per sponsor
CREATE OR REPLACE FUNCTION ensure_one_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        UPDATE contacts
        SET is_primary = FALSE
        WHERE sponsor_id = NEW.sponsor_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_one_primary_contact
BEFORE INSERT OR UPDATE ON contacts
FOR EACH ROW
WHEN (NEW.is_primary = TRUE)
EXECUTE FUNCTION ensure_one_primary_contact();

-- 3. CREATE TAGS TABLE
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name TEXT UNIQUE NOT NULL,
    tag_category TEXT, -- e.g., 'type', 'program', 'status'
    color TEXT DEFAULT '#6B8E9E',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with common tags
INSERT INTO tags (tag_name, tag_category, color) VALUES
('Award Sponsor', 'program', '#D4A443'),
('In-Kind Only', 'type', '#6B8E9E'),
('Scot Mende Fund', 'program', '#4A2C2A'),
('Board Contact', 'source', '#10B981'),
('Cold Outreach', 'source', '#8B5CF6'),
('Event Sponsor', 'type', '#F59E0B'),
('Renewal', 'status', '#3B82F6'),
('New Sponsor', 'status', '#22C55E')
ON CONFLICT (tag_name) DO NOTHING;

-- 4. CREATE SPONSOR_TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS sponsor_tags (
    sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (sponsor_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_sponsor_tags_sponsor ON sponsor_tags(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_tags_tag ON sponsor_tags(tag_id);

-- 5. ENHANCE SPONSORSHIP_TIERS TABLE
ALTER TABLE sponsorship_tiers
ADD COLUMN IF NOT EXISTS benefits_list JSONB, -- Structured list of benefits
ADD COLUMN IF NOT EXISTS event_passes_included INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS awards_tickets_included INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS speaker_series_passes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_cash BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_in_kind BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allows_both BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS program_specific TEXT, -- e.g., 'Scot Mende Memorial Fund'
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing tiers with benefits data
UPDATE sponsorship_tiers SET
    benefits_list = CASE tier_name
        WHEN 'Presenting Sponsor' THEN '["Premier logo placement on all materials", "Speaking opportunity at awards ceremony", "10 awards ceremony tickets", "Recognition in all communications", "Dedicated social media posts", "Company profile in newsletter"]'::jsonb
        WHEN 'Section Visionary' THEN '["Prominent logo on website and materials", "6 awards ceremony tickets", "Recognition at events", "Newsletter feature", "Social media recognition"]'::jsonb
        WHEN 'Section Partner' THEN '["Logo on website and select materials", "4 awards ceremony tickets", "Recognition in newsletter", "Social media mention"]'::jsonb
        WHEN 'Section Supporter' THEN '["Name listing on website", "2 awards ceremony tickets", "Recognition in annual report"]'::jsonb
        WHEN 'Section Friend' THEN '["Name listing on website", "1 awards ceremony ticket", "Recognition in materials"]'::jsonb
        ELSE '[]'::jsonb
    END,
    awards_tickets_included = CASE tier_name
        WHEN 'Presenting Sponsor' THEN 10
        WHEN 'Section Visionary' THEN 6
        WHEN 'Section Partner' THEN 4
        WHEN 'Section Supporter' THEN 2
        WHEN 'Section Friend' THEN 1
        ELSE 0
    END,
    display_order = CASE tier_name
        WHEN 'Presenting Sponsor' THEN 1
        WHEN 'Section Visionary' THEN 2
        WHEN 'Section Partner' THEN 3
        WHEN 'Section Supporter' THEN 4
        WHEN 'Section Friend' THEN 5
        WHEN 'In-Kind Sponsor' THEN 6
        ELSE 10
    END
WHERE tier_name IN ('Presenting Sponsor', 'Section Visionary', 'Section Partner', 'Section Supporter', 'Section Friend');

-- 6. ENHANCE SPONSORSHIPS TABLE
ALTER TABLE sponsorships
ADD COLUMN IF NOT EXISTS expiration_date DATE,
ADD COLUMN IF NOT EXISTS auto_calculated_expiration BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('New', 'Renewal', 'Referral', 'Event', 'Cold Outreach', 'Board Contact')),
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS benefits_used JSONB DEFAULT '{}'::jsonb; -- Track which benefits have been used

-- Add index for expiration tracking
CREATE INDEX IF NOT EXISTS idx_sponsorships_expiration ON sponsorships(expiration_date) WHERE status = 'Received';

-- Function to auto-calculate expiration date (payment date + 1 year + end of month)
CREATE OR REPLACE FUNCTION calculate_expiration_date(payment_date DATE)
RETURNS DATE AS $$
DECLARE
    one_year_later DATE;
    end_of_month DATE;
BEGIN
    IF payment_date IS NULL THEN
        RETURN NULL;
    END IF;

    -- Add 1 year
    one_year_later := payment_date + INTERVAL '1 year';

    -- Get last day of that month
    end_of_month := (DATE_TRUNC('MONTH', one_year_later) + INTERVAL '1 MONTH - 1 day')::DATE;

    RETURN end_of_month;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate expiration on insert/update
CREATE OR REPLACE FUNCTION set_expiration_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.auto_calculated_expiration = TRUE AND NEW.payment_date IS NOT NULL THEN
        NEW.expiration_date := calculate_expiration_date(NEW.payment_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_expiration
BEFORE INSERT OR UPDATE ON sponsorships
FOR EACH ROW
EXECUTE FUNCTION set_expiration_date();

-- Backfill expiration dates for existing sponsorships
UPDATE sponsorships
SET expiration_date = calculate_expiration_date(payment_date)
WHERE payment_date IS NOT NULL AND expiration_date IS NULL;

-- 7. CREATE EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    event_type TEXT CHECK (event_type IN ('Speaker Series', 'Awards Ceremony', 'Training', 'Networking', 'Conference', 'Workshop', 'Other')),
    event_date DATE,
    event_time TIME,
    location TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_link TEXT,
    description TEXT,
    max_attendees INTEGER,
    requires_registration BOOLEAN DEFAULT TRUE,
    fiscal_year TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_fiscal_year ON events(fiscal_year);

-- 8. CREATE EVENT_PASSES TABLE (tracks benefit usage)
CREATE TABLE IF NOT EXISTS event_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sponsorship_id UUID NOT NULL REFERENCES sponsorships(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    pass_type TEXT, -- e.g., 'Awards Ticket', 'Speaker Series Pass'
    allocated_count INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    attended BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_passes_event ON event_passes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_passes_sponsorship ON event_passes(sponsorship_id);

-- 9. CREATE EMAIL_TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT UNIQUE NOT NULL,
    template_category TEXT CHECK (template_category IN ('Welcome', 'Payment Confirmation', 'Renewal Reminder', 'Lapsed Follow-up', 'Thank You', 'Custom')),
    subject_line TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    merge_fields TEXT[], -- Available merge fields like {{sponsor_name}}, {{amount}}, etc.
    is_active BOOLEAN DEFAULT TRUE,
    send_timing TEXT, -- e.g., '90 days before expiration'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with default templates
INSERT INTO email_templates (template_name, template_category, subject_line, body_html, merge_fields) VALUES
(
    'New Sponsor Welcome',
    'Welcome',
    'Welcome to the SVS APA Sponsorship Program!',
    '<p>Dear {{contact_name}},</p><p>Thank you for becoming a {{tier_name}} sponsor! We truly appreciate your support of the Sacramento Valley Section of the American Planning Association.</p><p>Your sponsorship of {{amount}} supports our mission to advance planning in the Sacramento region.</p><p>Sponsorship Period: {{start_date}} - {{expiration_date}}</p><p>Best regards,<br>{{sponsor_chair_name}}<br>Sponsorship Chair</p>',
    ARRAY['{{contact_name}}', '{{organization_name}}', '{{tier_name}}', '{{amount}}', '{{start_date}}', '{{expiration_date}}', '{{sponsor_chair_name}}']
),
(
    'Payment Confirmation',
    'Payment Confirmation',
    'Payment Received - Thank You!',
    '<p>Dear {{contact_name}},</p><p>This confirms we have received your payment of {{amount}} for {{organization_name}}''s {{tier_name}} sponsorship.</p><p>Payment Date: {{payment_date}}<br>Receipt Number: {{receipt_number}}<br>Sponsorship Valid Through: {{expiration_date}}</p><p>Thank you for your continued support!</p><p>Best regards,<br>SVS APA Sponsorship Team</p>',
    ARRAY['{{contact_name}}', '{{organization_name}}', '{{tier_name}}', '{{amount}}', '{{payment_date}}', '{{receipt_number}}', '{{expiration_date}}']
),
(
    'Renewal Reminder - 90 Days',
    'Renewal Reminder',
    'Your SVS APA Sponsorship Expires in 90 Days',
    '<p>Dear {{contact_name}},</p><p>We wanted to remind you that {{organization_name}}''s sponsorship will expire on {{expiration_date}} (90 days from now).</p><p>We hope you''ll consider renewing your {{tier_name}} sponsorship. Your support has been invaluable in helping us advance planning in the Sacramento region.</p><p>To renew, please visit: {{payment_link}}</p><p>Questions? Contact us at {{sponsor_chair_email}}</p><p>Thank you,<br>{{sponsor_chair_name}}</p>',
    ARRAY['{{contact_name}}', '{{organization_name}}', '{{tier_name}}', '{{expiration_date}}', '{{payment_link}}', '{{sponsor_chair_email}}', '{{sponsor_chair_name}}']
)
ON CONFLICT (template_name) DO NOTHING;

-- 10. CREATE EMAIL_LOGS TABLE
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('Queued', 'Sent', 'Failed', 'Bounced', 'Opened', 'Clicked')),
    error_message TEXT,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    sent_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sponsor ON email_logs(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);

-- 11. CREATE FILES TABLE (attachments)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_type TEXT, -- e.g., 'invoice', 'agreement', 'receipt', 'logo', 'other'
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type TEXT,
    sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
    sponsorship_id UUID REFERENCES sponsorships(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_files_sponsor ON files(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_files_sponsorship ON files(sponsorship_id);

-- 12. CREATE USER_ROLES TABLE
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    role_description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate roles
INSERT INTO user_roles (role_name, role_description, permissions) VALUES
(
    'Admin',
    'Full access to all features including user management',
    '{"can_manage_users": true, "can_manage_sponsors": true, "can_manage_sponsorships": true, "can_view_financials": true, "can_manage_settings": true, "can_send_emails": true, "can_export_data": true}'::jsonb
),
(
    'Sponsorship Manager',
    'Manage sponsors, contracts, and emails but not user management',
    '{"can_manage_users": false, "can_manage_sponsors": true, "can_manage_sponsorships": true, "can_view_financials": true, "can_manage_settings": false, "can_send_emails": true, "can_export_data": true}'::jsonb
),
(
    'Treasurer',
    'Read-only sponsor details with full access to payment info',
    '{"can_manage_users": false, "can_manage_sponsors": false, "can_manage_sponsorships": false, "can_view_financials": true, "can_manage_settings": false, "can_send_emails": false, "can_export_data": true}'::jsonb
),
(
    'Board Member',
    'View-only access to sponsors, statuses, and dashboard',
    '{"can_manage_users": false, "can_manage_sponsors": false, "can_manage_sponsorships": false, "can_view_financials": false, "can_manage_settings": false, "can_send_emails": false, "can_export_data": false}'::jsonb
)
ON CONFLICT (role_name) DO NOTHING;

-- 13. CREATE USER_ROLE_ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS user_role_assignments (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES user_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

-- 14. CREATE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_category TEXT, -- e.g., 'organization', 'email', 'automation'
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Pre-populate with default settings
INSERT INTO settings (setting_key, setting_value, setting_category, description) VALUES
(
    'organization_info',
    '{"name": "Sacramento Valley Section - American Planning Association", "email": "sponsorships@svsapa.org", "phone": "", "address": "", "website": "https://svsapa.org", "logo_url": "/logo.jpg"}'::jsonb,
    'organization',
    'Organization contact and branding information'
),
(
    'renewal_windows',
    '{"reminder_90_days": true, "reminder_60_days": true, "reminder_30_days": true, "reminder_on_expiry": true, "reminder_30_days_after": true, "grace_period_days": 30}'::jsonb,
    'automation',
    'Renewal reminder timing and grace period settings'
),
(
    'email_settings',
    '{"from_email": "sponsorships@svsapa.org", "from_name": "SVS APA Sponsorships", "sponsor_chair_name": "Sponsorship Chair", "sponsor_chair_email": "sponsorships@svsapa.org", "payment_link": "https://square.link/u/example", "smtp_configured": false}'::jsonb,
    'email',
    'Email configuration and default sender information'
),
(
    'sponsorship_term_rule',
    '{"rule_type": "payment_plus_one_year_end_of_month", "description": "Sponsorship expires 1 year from payment date, extended to end of that month"}'::jsonb,
    'automation',
    'Business rule for calculating sponsorship expiration dates'
)
ON CONFLICT (setting_key) DO NOTHING;

-- 15. ENHANCE ACTIVITY_LOG TABLE
ALTER TABLE activity_log
ADD COLUMN IF NOT EXISTS old_value JSONB,
ADD COLUMN IF NOT EXISTS new_value JSONB,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 16. CREATE SPONSOR_INTERACTIONS TABLE (for timeline)
CREATE TABLE IF NOT EXISTS sponsor_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('Call', 'Email', 'Meeting', 'Event', 'Note', 'Status Change', 'Payment', 'Other')),
    interaction_date TIMESTAMPTZ DEFAULT NOW(),
    summary TEXT NOT NULL,
    details TEXT,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_sponsor ON sponsor_interactions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON sponsor_interactions(interaction_date);

-- 17. CREATE FUNCTION TO AUTO-UPDATE SPONSOR STATUS
CREATE OR REPLACE FUNCTION update_sponsor_status()
RETURNS TRIGGER AS $$
DECLARE
    latest_sponsorship RECORD;
    new_status TEXT;
BEGIN
    -- Find the most recent sponsorship for this sponsor
    SELECT * INTO latest_sponsorship
    FROM sponsorships
    WHERE sponsor_id = COALESCE(NEW.sponsor_id, OLD.sponsor_id)
    AND status = 'Received'
    ORDER BY payment_date DESC NULLS LAST, created_at DESC
    LIMIT 1;

    -- Determine status based on expiration date
    IF latest_sponsorship IS NULL THEN
        new_status := 'Prospect';
    ELSIF latest_sponsorship.expiration_date IS NULL THEN
        new_status := 'Pending';
    ELSIF latest_sponsorship.expiration_date >= CURRENT_DATE THEN
        new_status := 'Active';
    ELSIF latest_sponsorship.expiration_date >= CURRENT_DATE - INTERVAL '90 days' THEN
        new_status := 'Lapsed';
    ELSE
        new_status := 'Lapsed';
    END IF;

    -- Update sponsor status if not manually overridden
    UPDATE sponsors
    SET current_status = new_status,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.sponsor_id, OLD.sponsor_id)
    AND status_override = FALSE;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update sponsor status when sponsorship changes
CREATE TRIGGER trigger_update_sponsor_status
AFTER INSERT OR UPDATE OR DELETE ON sponsorships
FOR EACH ROW
EXECUTE FUNCTION update_sponsor_status();

-- Backfill sponsor statuses based on existing sponsorships
DO $$
DECLARE
    sponsor_record RECORD;
BEGIN
    FOR sponsor_record IN SELECT id FROM sponsors LOOP
        PERFORM update_sponsor_status() FROM sponsorships WHERE sponsor_id = sponsor_record.id LIMIT 1;
    END LOOP;
END $$;

-- 18. MIGRATE EXISTING CONTACT DATA
-- Move existing contact data from sponsors table to contacts table
INSERT INTO contacts (sponsor_id, contact_name, email, phone, is_primary)
SELECT
    id,
    COALESCE(contact_person_name, 'Primary Contact'),
    contact_email,
    contact_phone,
    TRUE
FROM sponsors
WHERE contact_person_name IS NOT NULL
   OR contact_email IS NOT NULL
   OR contact_phone IS NOT NULL
ON CONFLICT DO NOTHING;

-- 19. CREATE VIEWS FOR COMMON QUERIES

-- View for active sponsors with their primary contact
CREATE OR REPLACE VIEW v_active_sponsors AS
SELECT
    s.*,
    c.contact_name as primary_contact_name,
    c.email as primary_contact_email,
    c.phone as primary_contact_phone,
    (
        SELECT json_agg(t.tag_name)
        FROM sponsor_tags st
        JOIN tags t ON st.tag_id = t.id
        WHERE st.sponsor_id = s.id
    ) as tags
FROM sponsors s
LEFT JOIN contacts c ON s.id = c.sponsor_id AND c.is_primary = TRUE
WHERE s.current_status = 'Active';

-- View for sponsors expiring soon
CREATE OR REPLACE VIEW v_expiring_soon AS
SELECT
    s.id as sponsor_id,
    s.organization_name,
    s.current_status,
    sp.id as sponsorship_id,
    sp.expiration_date,
    sp.renewal_date,
    sp.sponsorship_tier_id,
    st.tier_name,
    sp.total_value,
    (sp.expiration_date - CURRENT_DATE) as days_until_expiration,
    c.contact_name as primary_contact_name,
    c.email as primary_contact_email
FROM sponsors s
JOIN sponsorships sp ON s.id = sp.sponsor_id
JOIN sponsorship_tiers st ON sp.sponsorship_tier_id = st.id
LEFT JOIN contacts c ON s.id = c.sponsor_id AND c.is_primary = TRUE
WHERE sp.status = 'Received'
  AND sp.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
ORDER BY sp.expiration_date ASC;

-- View for renewal pipeline
CREATE OR REPLACE VIEW v_renewal_pipeline AS
SELECT
    s.id as sponsor_id,
    s.organization_name,
    s.current_status,
    sp.fiscal_year as last_fiscal_year,
    st.tier_name as last_tier,
    sp.total_value as last_amount,
    sp.expiration_date,
    CASE
        WHEN sp.expiration_date >= CURRENT_DATE THEN 'Active'
        WHEN sp.expiration_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Just Expired'
        WHEN sp.expiration_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'Recently Lapsed'
        ELSE 'Long Lapsed'
    END as renewal_status,
    c.contact_name as primary_contact_name,
    c.email as primary_contact_email
FROM sponsors s
JOIN (
    SELECT DISTINCT ON (sponsor_id) *
    FROM sponsorships
    WHERE status = 'Received'
    ORDER BY sponsor_id, payment_date DESC
) sp ON s.id = sp.sponsor_id
JOIN sponsorship_tiers st ON sp.sponsorship_tier_id = st.id
LEFT JOIN contacts c ON s.id = c.sponsor_id AND c.is_primary = TRUE
ORDER BY sp.expiration_date DESC;

-- =====================================================
-- GRANT PERMISSIONS (adjust based on your RLS policies)
-- =====================================================

-- Grant access to authenticated users (modify as needed for your RLS)
GRANT ALL ON contacts TO authenticated;
GRANT ALL ON tags TO authenticated;
GRANT ALL ON sponsor_tags TO authenticated;
GRANT ALL ON events TO authenticated;
GRANT ALL ON event_passes TO authenticated;
GRANT ALL ON email_templates TO authenticated;
GRANT ALL ON email_logs TO authenticated;
GRANT ALL ON files TO authenticated;
GRANT ALL ON user_roles TO authenticated;
GRANT ALL ON user_role_assignments TO authenticated;
GRANT ALL ON settings TO authenticated;
GRANT ALL ON sponsor_interactions TO authenticated;

GRANT SELECT ON v_active_sponsors TO authenticated;
GRANT SELECT ON v_expiring_soon TO authenticated;
GRANT SELECT ON v_renewal_pipeline TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Summary of changes:
-- ✓ Enhanced sponsors table with type, industry, geography, status
-- ✓ Created contacts table (1-to-many)
-- ✓ Created tags and sponsor_tags for categorization
-- ✓ Enhanced sponsorship_tiers with detailed benefits
-- ✓ Enhanced sponsorships with expiration tracking
-- ✓ Created events and event_passes tables
-- ✓ Created email_templates and email_logs
-- ✓ Created files table for attachments
-- ✓ Created user_roles and assignments
-- ✓ Created settings table
-- ✓ Created sponsor_interactions for timeline
-- ✓ Added automatic status calculation
-- ✓ Added automatic expiration date calculation
-- ✓ Migrated existing contact data
-- ✓ Created helpful views
