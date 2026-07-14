'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Campaign } from '@/types'

export function useCampaigns(clientId?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('campaigns')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    if (error) setError(error.message)
    else setCampaigns((data as Campaign[]) ?? [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  return { campaigns, loading, error, refetch: fetchCampaigns }
}
