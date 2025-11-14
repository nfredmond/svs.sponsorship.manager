export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sponsors: {
        Row: {
          id: string
          organization_name: string
          contact_person_name: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          website: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
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
        }
        Insert: {
          id?: string
          user_id?: string | null
          action_type: string
          table_name?: string | null
          record_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action_type?: string
          table_name?: string | null
          record_id?: string | null
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

