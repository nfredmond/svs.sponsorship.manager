# SVS APA Sponsorship Tracker - Deployment Guide

## ✅ Completed Steps

1. ✓ Application built and tested locally
2. ✓ Code pushed to GitHub repository: https://github.com/nfredmond/svs.sponsorship.manager
3. ✓ Supabase database configured with all tables, RLS policies, and initial data
4. ✓ Vercel project created and linked to GitHub repository

## 🔧 Required: Add Environment Variables to Vercel

The deployment is currently failing because environment variables are not configured. Follow these steps:

### 1. Access Vercel Project Settings

Visit: https://vercel.com/natford/svs-sponsorship-manager/settings/environment-variables

### 2. Add Environment Variables

Add the following environment variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://ssjlyksagkzmchjvvtao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzamx5a3NhZ2t6bWNoanZ2dGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzY5MzcsImV4cCI6MjA3ODY1MjkzN30.H2vWsillTXtR3TOpISVzGPeJPHqDzZOMQoUtFA85e94
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` should NOT be added to Vercel environment variables as it's only for server-side operations and should remain secret.

### 3. Redeploy

After adding the environment variables:

1. Go to: https://vercel.com/natford/svs-sponsorship-manager
2. Click on the "Deployments" tab
3. Click "Redeploy" on the latest deployment

OR simply push a new commit to GitHub and it will trigger a new deployment automatically.

## 📋 What's Been Built

### Core Features
- ✓ Authentication system with Supabase Auth
- ✓ Dashboard with metrics and statistics
- ✓ Sponsors management (list, create, view details)
- ✓ Sponsorships management (list, create)
- ✓ Individual donations tracking
- ✓ Fiscal year summary reports
- ✓ Settings page

### Database
- ✓ All tables created (sponsors, sponsorships, sponsorship_tiers, individual_donations, activity_log)
- ✓ Row Level Security (RLS) policies enabled
- ✓ Initial data imported (tiers and current sponsors)
- ✓ Triggers and functions configured

### UI/UX
- ✓ Professional SVS APA branding with logo
- ✓ SVS APA colors (Gold #D4A443, Blue #6B8E9E, Brown #4A2C2A)
- ✓ Responsive design
- ✓ Sidebar navigation
- ✓ Dashboard with progress tracking

## 🎯 Next Steps (After Deployment)

1. **Create Admin User**
   - Access: https://ssjlyksagkzmchjvvtao.supabase.co/project/ssjlyksagkzmchjvvtao/auth/users
   - Create a user account for Nathaniel Redmond (nathaniel@greendottransportation.com)

2. **Test the Application**
   - Login at: https://svs-sponsorship-manager-natford.vercel.app/login
   - Verify dashboard data
   - Test creating a new sponsor
   - Test creating a new sponsorship

3. **Optional Enhancements** (Future Development)
   - PDF generation for invoices and receipts
   - Email notifications
   - Advanced reporting features
   - Export functionality
   - Sponsor logos upload
   - Public sponsor recognition page

## 📊 Current Data in Database

The following data has been imported:

- **Sponsorship Tiers**: 7 tiers (Presenting Sponsor, Section Visionary, Section Partner, Section Supporter, Section Friend, In-Kind Sponsor, Scot Mende Memorial Fund)
- **Sponsors**: 20 organizations
- **Sponsorships**: ~20 sponsorships for FY 2025/2026
- **Total Revenue**: ~$10,000 tracked

## 🔐 Security Notes

- All database operations are protected by RLS policies
- Authentication required for all pages except login
- Environment variables properly secured
- No sensitive keys exposed in client-side code

## 📞 Support

For issues or questions:
- **Contact**: Nathaniel Redmond
- **Email**: nathaniel@greendottransportation.com
- **Phone**: (530) 492-9775

## 🚀 Deployment URLs

- **Production**: https://svs-sponsorship-manager-natford.vercel.app
- **GitHub Repository**: https://github.com/nfredmond/svs.sponsorship.manager
- **Supabase Project**: https://ssjlyksagkzmchjvvtao.supabase.co

