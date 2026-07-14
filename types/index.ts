// =============================================
// SANZCREATIVE ALR — Core Types
// =============================================

export type UserRole = 'super_admin' | 'client_user'

export type ClientStatus = 'active' | 'inactive' | 'disabled'

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft'

export type Platform = 'facebook' | 'instagram' | 'both'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'follow_up'
  | 'converted'
  | 'not_interested'
  | 'invalid'

export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error'

// ---- Database Row Types ----

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  client_id: string | null
  created_at: string
}

export interface Client {
  id: string
  name: string
  business_category: string
  contact_person: string
  email: string
  phone: string
  status: ClientStatus
  created_at: string
}

export interface Campaign {
  id: string
  client_id: string
  campaign_name: string
  platform: Platform
  meta_page_id: string | null
  meta_form_id: string | null
  status: CampaignStatus
  created_at: string
  // Joined
  client?: Client
  lead_count?: number
}

export interface Lead {
  id: string
  client_id: string
  campaign_id: string | null
  meta_lead_id: string | null
  full_name: string
  phone: string
  email: string | null
  source: string
  raw_form_data: Record<string, string> | null
  status: LeadStatus
  assigned_user_id: string | null
  created_at: string
  updated_at: string
  // Joined
  client?: Client
  campaign?: Campaign
  assigned_user?: Profile
}

export interface LeadNote {
  id: string
  lead_id: string
  user_id: string
  note: string
  created_at: string
  // Joined
  user?: Profile
}

export interface LeadStatusHistory {
  id: string
  lead_id: string
  old_status: LeadStatus | null
  new_status: LeadStatus
  changed_by: string
  created_at: string
  // Joined
  changed_by_user?: Profile
}

export interface MetaConnection {
  id: string
  client_id: string
  meta_page_id: string
  page_name: string
  connection_status: ConnectionStatus
  token_reference: string | null
  created_at: string
  updated_at: string
}

// ---- Dashboard Stats ----

export interface DashboardStats {
  total_clients: number
  total_leads: number
  new_leads: number
  contacted_leads: number
  follow_up_leads: number
  converted_leads: number
  conversion_rate: number
}

export interface LeadsOverTime {
  date: string
  count: number
}

// ---- API Response Types ----

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// ---- Filter Types ----

export interface LeadFilters {
  client_id?: string
  campaign_id?: string
  status?: LeadStatus
  date_from?: string
  date_to?: string
  source?: string
  search?: string
}
