export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SponsorType = 'company' | 'agency' | 'individual'
export type SponsorStatus = 'Active' | 'Pending' | 'Lapsed' | 'Prospect'
export type PreferredContactMethod = 'email' | 'phone' | 'both'
export type EventType = 'Speaker Series' | 'Awards Ceremony' | 'Training' | 'Networking' | 'Conference' | 'Workshop' | 'Other'
export type EmailTemplateCategory = 'Welcome' | 'Payment Confirmation' | 'Renewal Reminder' | 'Lapsed Follow-up' | 'Thank You' | 'Custom'
export type EmailStatus = 'Queued' | 'Sent' | 'Failed' | 'Bounced' | 'Opened' | 'Clicked'
export type FileType = 'invoice' | 'agreement' | 'receipt' | 'logo' | 'other'
export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Event' | 'Note' | 'Status Change' | 'Payment' | 'Other'
export type SourceType = 'New' | 'Renewal' | 'Referral' | 'Event' | 'Cold Outreach' | 'Board Contact'

export interface Database {
  public: {
    Tables: {
      sponsors: {
        Row: {
          id: string
          organization_name: string
          contact_person_name: string | null // Legacy - use contacts table
          contact_email: string | null // Legacy - use contacts table
          contact_phone: string | null // Legacy - use contacts table
          address: string | null
          website: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
          // New fields
          sponsor_type: SponsorType
          industry: string | null
          geography: string[] | null
          current_status: SponsorStatus
          status_override: boolean
          logo_url: string | null
          description: string | null
        }
        Insert: {
          id?: string
          organization_name: string
          contact_person_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          website?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          sponsor_type?: SponsorType
          industry?: string | null
          geography?: string[] | null
          current_status?: SponsorStatus
          status_override?: boolean
          logo_url?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          organization_name?: string
          contact_person_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          website?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          sponsor_type?: SponsorType
          industry?: string | null
          geography?: string[] | null
          current_status?: SponsorStatus
          status_override?: boolean
          logo_url?: string | null
          description?: string | null
        }
      }
      contacts: {
        Row: {
          id: string
          sponsor_id: string
          contact_name: string
          title: string | null
          email: string | null
          phone: string | null
          secondary_email: string | null
          secondary_phone: string | null
          preferred_contact_method: PreferredContactMethod | null
          is_primary: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sponsor_id: string
          contact_name: string
          title?: string | null
          email?: string | null
          phone?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
          preferred_contact_method?: PreferredContactMethod | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sponsor_id?: string
          contact_name?: string
          title?: string | null
          email?: string | null
          phone?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
          preferred_contact_method?: PreferredContactMethod | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          tag_name: string
          tag_category: string | null
          color: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tag_name: string
          tag_category?: string | null
          color?: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tag_name?: string
          tag_category?: string | null
          color?: string
          description?: string | null
          created_at?: string
        }
      }
      sponsor_tags: {
        Row: {
          sponsor_id: string
          tag_id: string
          added_at: string
          added_by: string | null
        }
        Insert: {
          sponsor_id: string
          tag_id: string
          added_at?: string
          added_by?: string | null
        }
        Update: {
          sponsor_id?: string
          tag_id?: string
          added_at?: string
          added_by?: string | null
        }
      }
      sponsorship_tiers: {
        Row: {
          id: string
          tier_name: string
          tier_level: number
          suggested_amount: number | null
          benefits_description: string | null
          is_active: boolean
          is_individual_only: boolean
          created_at: string
          // New fields
          benefits_list: Json | null
          event_passes_included: number
          awards_tickets_included: number
          speaker_series_passes: number
          is_cash: boolean
          is_in_kind: boolean
          allows_both: boolean
          program_specific: string | null
          display_order: number
        }
        Insert: {
          id?: string
          tier_name: string
          tier_level: number
          suggested_amount?: number | null
          benefits_description?: string | null
          is_active?: boolean
          is_individual_only?: boolean
          created_at?: string
          benefits_list?: Json | null
          event_passes_included?: number
          awards_tickets_included?: number
          speaker_series_passes?: number
          is_cash?: boolean
          is_in_kind?: boolean
          allows_both?: boolean
          program_specific?: string | null
          display_order?: number
        }
        Update: {
          id?: string
          tier_name?: string
          tier_level?: number
          suggested_amount?: number | null
          benefits_description?: string | null
          is_active?: boolean
          is_individual_only?: boolean
          created_at?: string
          benefits_list?: Json | null
          event_passes_included?: number
          awards_tickets_included?: number
          speaker_series_passes?: number
          is_cash?: boolean
          is_in_kind?: boolean
          allows_both?: boolean
          program_specific?: string | null
          display_order?: number
        }
      }
      sponsorships: {
        Row: {
          id: string
          sponsor_id: string
          sponsorship_tier_id: string | null
          fiscal_year: string
          sponsorship_type: 'Monetary' | 'In-Kind' | 'Both'
          monetary_amount: number
          in_kind_description: string | null
          in_kind_value: number
          total_value: number
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          status: 'Pending' | 'Received' | 'Overdue' | 'Cancelled'
          invoice_number: string | null
          invoice_sent_date: string | null
          receipt_issued: boolean
          receipt_number: string | null
          renewal_date: string | null
          renewal_reminder_sent: boolean
          scot_mende_fund: boolean
          scot_mende_amount: number
          notes: string | null
          last_year_notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          // New fields
          expiration_date: string | null
          auto_calculated_expiration: boolean
          source_type: SourceType | null
          referred_by: string | null
          grace_period_days: number
          benefits_used: Json
        }
        Insert: {
          id?: string
          sponsor_id: string
          sponsorship_tier_id?: string | null
          fiscal_year: string
          sponsorship_type: 'Monetary' | 'In-Kind' | 'Both'
          monetary_amount?: number
          in_kind_description?: string | null
          in_kind_value?: number
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: 'Pending' | 'Received' | 'Overdue' | 'Cancelled'
          invoice_number?: string | null
          invoice_sent_date?: string | null
          receipt_issued?: boolean
          receipt_number?: string | null
          renewal_date?: string | null
          renewal_reminder_sent?: boolean
          scot_mende_fund?: boolean
          scot_mende_amount?: number
          notes?: string | null
          last_year_notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          expiration_date?: string | null
          auto_calculated_expiration?: boolean
          source_type?: SourceType | null
          referred_by?: string | null
          grace_period_days?: number
          benefits_used?: Json
        }
        Update: {
          id?: string
          sponsor_id?: string
          sponsorship_tier_id?: string | null
          fiscal_year?: string
          sponsorship_type?: 'Monetary' | 'In-Kind' | 'Both'
          monetary_amount?: number
          in_kind_description?: string | null
          in_kind_value?: number
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: 'Pending' | 'Received' | 'Overdue' | 'Cancelled'
          invoice_number?: string | null
          invoice_sent_date?: string | null
          receipt_issued?: boolean
          receipt_number?: string | null
          renewal_date?: string | null
          renewal_reminder_sent?: boolean
          scot_mende_fund?: boolean
          scot_mende_amount?: number
          notes?: string | null
          last_year_notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          expiration_date?: string | null
          auto_calculated_expiration?: boolean
          source_type?: SourceType | null
          referred_by?: string | null
          grace_period_days?: number
          benefits_used?: Json
        }
      }
      events: {
        Row: {
          id: string
          event_name: string
          event_type: EventType | null
          event_date: string | null
          event_time: string | null
          location: string | null
          is_virtual: boolean
          virtual_link: string | null
          description: string | null
          max_attendees: number | null
          requires_registration: boolean
          fiscal_year: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_name: string
          event_type?: EventType | null
          event_date?: string | null
          event_time?: string | null
          location?: string | null
          is_virtual?: boolean
          virtual_link?: string | null
          description?: string | null
          max_attendees?: number | null
          requires_registration?: boolean
          fiscal_year?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          event_type?: EventType | null
          event_date?: string | null
          event_time?: string | null
          location?: string | null
          is_virtual?: boolean
          virtual_link?: string | null
          description?: string | null
          max_attendees?: number | null
          requires_registration?: boolean
          fiscal_year?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_passes: {
        Row: {
          id: string
          event_id: string
          sponsorship_id: string
          contact_id: string | null
          pass_type: string | null
          allocated_count: number
          used_count: number
          attended: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          sponsorship_id: string
          contact_id?: string | null
          pass_type?: string | null
          allocated_count?: number
          used_count?: number
          attended?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          sponsorship_id?: string
          contact_id?: string | null
          pass_type?: string | null
          allocated_count?: number
          used_count?: number
          attended?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          template_name: string
          template_category: EmailTemplateCategory | null
          subject_line: string
          body_html: string
          body_text: string | null
          merge_fields: string[] | null
          is_active: boolean
          send_timing: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_name: string
          template_category?: EmailTemplateCategory | null
          subject_line: string
          body_html: string
          body_text?: string | null
          merge_fields?: string[] | null
          is_active?: boolean
          send_timing?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_name?: string
          template_category?: EmailTemplateCategory | null
          subject_line?: string
          body_html?: string
          body_text?: string | null
          merge_fields?: string[] | null
          is_active?: boolean
          send_timing?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          sponsor_id: string | null
          contact_id: string | null
          template_id: string | null
          subject: string
          recipient_email: string
          sent_at: string
          status: EmailStatus | null
          error_message: string | null
          opened_at: string | null
          clicked_at: string | null
          sent_by: string | null
        }
        Insert: {
          id?: string
          sponsor_id?: string | null
          contact_id?: string | null
          template_id?: string | null
          subject: string
          recipient_email: string
          sent_at?: string
          status?: EmailStatus | null
          error_message?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          sent_by?: string | null
        }
        Update: {
          id?: string
          sponsor_id?: string | null
          contact_id?: string | null
          template_id?: string | null
          subject?: string
          recipient_email?: string
          sent_at?: string
          status?: EmailStatus | null
          error_message?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          sent_by?: string | null
        }
      }
      files: {
        Row: {
          id: string
          file_name: string
          file_type: FileType | null
          file_url: string
          file_size: number | null
          mime_type: string | null
          sponsor_id: string | null
          sponsorship_id: string | null
          uploaded_by: string | null
          uploaded_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          file_name: string
          file_type?: FileType | null
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          sponsor_id?: string | null
          sponsorship_id?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: FileType | null
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          sponsor_id?: string | null
          sponsorship_id?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
          notes?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          role_name: string
          role_description: string | null
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          role_name: string
          role_description?: string | null
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          role_name?: string
          role_description?: string | null
          permissions?: Json
          created_at?: string
        }
      }
      user_role_assignments: {
        Row: {
          user_id: string
          role_id: string
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          user_id: string
          role_id: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Update: {
          user_id?: string
          role_id?: string
          assigned_at?: string
          assigned_by?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          setting_category: string | null
          description: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          setting_category?: string | null
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          setting_category?: string | null
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      sponsor_interactions: {
        Row: {
          id: string
          sponsor_id: string
          interaction_type: InteractionType | null
          interaction_date: string
          summary: string
          details: string | null
          contact_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sponsor_id: string
          interaction_type?: InteractionType | null
          interaction_date?: string
          summary: string
          details?: string | null
          contact_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sponsor_id?: string
          interaction_type?: InteractionType | null
          interaction_date?: string
          summary?: string
          details?: string | null
          contact_id?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      individual_donations: {
        Row: {
          id: string
          donor_name: string
          donor_email: string | null
          donor_phone: string | null
          donation_amount: number
          donation_date: string
          payment_method: string | null
          payment_reference: string | null
          is_anonymous: boolean
          is_recurring: boolean
          recurring_frequency: 'Monthly' | 'Quarterly' | 'Annually' | null
          purpose: string | null
          program_specific: string | null
          receipt_issued: boolean
          receipt_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_name: string
          donor_email?: string | null
          donor_phone?: string | null
          donation_amount: number
          donation_date: string
          payment_method?: string | null
          payment_reference?: string | null
          is_anonymous?: boolean
          is_recurring?: boolean
          recurring_frequency?: 'Monthly' | 'Quarterly' | 'Annually' | null
          purpose?: string | null
          program_specific?: string | null
          receipt_issued?: boolean
          receipt_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_name?: string
          donor_email?: string | null
          donor_phone?: string | null
          donation_amount?: number
          donation_date?: string
          payment_method?: string | null
          payment_reference?: string | null
          is_anonymous?: boolean
          is_recurring?: boolean
          recurring_frequency?: 'Monthly' | 'Quarterly' | 'Annually' | null
          purpose?: string | null
          program_specific?: string | null
          receipt_issued?: boolean
          receipt_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action_type: string
          table_name: string | null
          record_id: string | null
          description: string | null
          created_at: string
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action_type: string
          table_name?: string | null
          record_id?: string | null
          description?: string | null
          created_at?: string
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action_type?: string
          table_name?: string | null
          record_id?: string | null
          description?: string | null
          created_at?: string
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
    Views: {
      v_active_sponsors: {
        Row: {
          id: string
          organization_name: string
          sponsor_type: SponsorType
          industry: string | null
          current_status: SponsorStatus
          primary_contact_name: string | null
          primary_contact_email: string | null
          primary_contact_phone: string | null
          tags: Json | null
        }
      }
      v_expiring_soon: {
        Row: {
          sponsor_id: string
          organization_name: string
          current_status: SponsorStatus
          sponsorship_id: string
          expiration_date: string | null
          renewal_date: string | null
          sponsorship_tier_id: string | null
          tier_name: string
          total_value: number
          days_until_expiration: number | null
          primary_contact_name: string | null
          primary_contact_email: string | null
        }
      }
      v_renewal_pipeline: {
        Row: {
          sponsor_id: string
          organization_name: string
          current_status: SponsorStatus
          last_fiscal_year: string
          last_tier: string
          last_amount: number
          expiration_date: string | null
          renewal_status: string
          primary_contact_name: string | null
          primary_contact_email: string | null
        }
      }
    }
    Functions: {
      calculate_expiration_date: {
        Args: { payment_date: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for common queries
export type Sponsor = Database['public']['Tables']['sponsors']['Row']
export type SponsorInsert = Database['public']['Tables']['sponsors']['Insert']
export type SponsorUpdate = Database['public']['Tables']['sponsors']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

export type SponsorshipTier = Database['public']['Tables']['sponsorship_tiers']['Row']
export type SponsorshipTierInsert = Database['public']['Tables']['sponsorship_tiers']['Insert']
export type SponsorshipTierUpdate = Database['public']['Tables']['sponsorship_tiers']['Update']

export type Sponsorship = Database['public']['Tables']['sponsorships']['Row']
export type SponsorshipInsert = Database['public']['Tables']['sponsorships']['Insert']
export type SponsorshipUpdate = Database['public']['Tables']['sponsorships']['Update']

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

export type EventPass = Database['public']['Tables']['event_passes']['Row']
export type EventPassInsert = Database['public']['Tables']['event_passes']['Insert']
export type EventPassUpdate = Database['public']['Tables']['event_passes']['Update']

export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']

export type EmailLog = Database['public']['Tables']['email_logs']['Row']
export type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert']
export type EmailLogUpdate = Database['public']['Tables']['email_logs']['Update']

export type File = Database['public']['Tables']['files']['Row']
export type FileInsert = Database['public']['Tables']['files']['Insert']
export type FileUpdate = Database['public']['Tables']['files']['Update']

export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert']
export type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update']

export type Setting = Database['public']['Tables']['settings']['Row']
export type SettingInsert = Database['public']['Tables']['settings']['Insert']
export type SettingUpdate = Database['public']['Tables']['settings']['Update']

export type SponsorInteraction = Database['public']['Tables']['sponsor_interactions']['Row']
export type SponsorInteractionInsert = Database['public']['Tables']['sponsor_interactions']['Insert']
export type SponsorInteractionUpdate = Database['public']['Tables']['sponsor_interactions']['Update']

export type IndividualDonation = Database['public']['Tables']['individual_donations']['Row']
export type IndividualDonationInsert = Database['public']['Tables']['individual_donations']['Insert']
export type IndividualDonationUpdate = Database['public']['Tables']['individual_donations']['Update']

export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
export type ActivityLogInsert = Database['public']['Tables']['activity_log']['Insert']
export type ActivityLogUpdate = Database['public']['Tables']['activity_log']['Update']

// Extended types with relationships
export interface SponsorWithContacts extends Sponsor {
  contacts?: Contact[]
  tags?: Tag[]
  primary_contact?: Contact
}

export interface SponsorshipWithDetails extends Sponsorship {
  sponsor?: Sponsor
  tier?: SponsorshipTier
  event_passes?: EventPass[]
}

export interface EventWithPasses extends Event {
  passes?: EventPass[]
  attendee_count?: number
}
