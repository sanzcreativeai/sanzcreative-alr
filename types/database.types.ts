/**
 * SANZCREATIVE ALR — Supabase Database Types
 *
 * Auto-generate with:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
 *
 * Manually maintained here for Phase 1.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'super_admin' | 'client_user'
          client_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'super_admin' | 'client_user'
          client_id?: string | null
          created_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: 'super_admin' | 'client_user'
          client_id?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          business_category: string
          contact_person: string
          email: string
          phone: string
          status: 'active' | 'inactive' | 'disabled'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          business_category: string
          contact_person: string
          email: string
          phone: string
          status?: 'active' | 'inactive' | 'disabled'
          created_at?: string
        }
        Update: {
          name?: string
          business_category?: string
          contact_person?: string
          email?: string
          phone?: string
          status?: 'active' | 'inactive' | 'disabled'
        }
      }
      campaigns: {
        Row: {
          id: string
          client_id: string
          campaign_name: string
          platform: 'facebook' | 'instagram' | 'both'
          meta_page_id: string | null
          meta_form_id: string | null
          status: 'active' | 'paused' | 'completed' | 'draft'
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          campaign_name: string
          platform: 'facebook' | 'instagram' | 'both'
          meta_page_id?: string | null
          meta_form_id?: string | null
          status?: 'active' | 'paused' | 'completed' | 'draft'
          created_at?: string
        }
        Update: {
          campaign_name?: string
          platform?: 'facebook' | 'instagram' | 'both'
          meta_page_id?: string | null
          meta_form_id?: string | null
          status?: 'active' | 'paused' | 'completed' | 'draft'
        }
      }
      leads: {
        Row: {
          id: string
          client_id: string
          campaign_id: string | null
          meta_lead_id: string | null
          full_name: string
          phone: string
          email: string | null
          source: string
          raw_form_data: Json | null
          status: 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested' | 'invalid'
          assigned_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          campaign_id?: string | null
          meta_lead_id?: string | null
          full_name: string
          phone: string
          email?: string | null
          source?: string
          raw_form_data?: Json | null
          status?: 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested' | 'invalid'
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested' | 'invalid'
          assigned_user_id?: string | null
          raw_form_data?: Json | null
          updated_at?: string
        }
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          user_id: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id: string
          note: string
          created_at?: string
        }
        Update: never
      }
      lead_status_history: {
        Row: {
          id: string
          lead_id: string
          old_status: string | null
          new_status: string
          changed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          old_status?: string | null
          new_status: string
          changed_by: string
          created_at?: string
        }
        Update: never
      }
      meta_connections: {
        Row: {
          id: string
          client_id: string
          meta_page_id: string
          page_name: string
          connection_status: 'connected' | 'disconnected' | 'pending' | 'error'
          token_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          meta_page_id: string
          page_name: string
          connection_status?: 'connected' | 'disconnected' | 'pending' | 'error'
          token_reference?: string | null
        }
        Update: {
          page_name?: string
          connection_status?: 'connected' | 'disconnected' | 'pending' | 'error'
          token_reference?: string | null
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      is_super_admin: { Returns: boolean }
      my_client_id:   { Returns: string | null }
    }
    Enums: {
      user_role:         'super_admin' | 'client_user'
      client_status:     'active' | 'inactive' | 'disabled'
      campaign_status:   'active' | 'paused' | 'completed' | 'draft'
      platform:          'facebook' | 'instagram' | 'both'
      lead_status:       'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested' | 'invalid'
      connection_status: 'connected' | 'disconnected' | 'pending' | 'error'
    }
  }
}
