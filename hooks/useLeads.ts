'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadFilters } from '@/types'

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: string | null
  refetch: () => void
  total: number
}

export function useLeads(filters?: LeadFilters): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          client:clients(id, name, business_category),
          campaign:campaigns(id, campaign_name, platform),
          assigned_user:profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (filters?.client_id)   query = query.eq('client_id', filters.client_id)
      if (filters?.campaign_id) query = query.eq('campaign_id', filters.campaign_id)
      if (filters?.status)      query = query.eq('status', filters.status)
      if (filters?.date_from)   query = query.gte('created_at', filters.date_from)
      if (filters?.date_to)     query = query.lte('created_at', filters.date_to)
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query
      if (error) throw error
      setLeads((data as Lead[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return { leads, loading, error, refetch: fetchLeads, total: leads.length }
}

export function useLead(id: string) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!id) return

    async function fetchLead() {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          client:clients(id, name, business_category),
          campaign:campaigns(id, campaign_name, platform),
          assigned_user:profiles(id, full_name, email)
        `)
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setLead(data as Lead)
      setLoading(false)
    }

    fetchLead()
  }, [id])

  return { lead, loading, error }
}
