'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DashboardStats } from '@/types'

type LeadStatusRow = {
  status: string | null
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)

      try {
        const [clientsResult, leadsResult] = await Promise.all([
          supabase
            .from('clients')
            .select('id', { count: 'exact', head: true }),

          supabase
            .from('leads')
            .select('status'),
        ])

        if (clientsResult.error) {
          throw clientsResult.error
        }

        if (leadsResult.error) {
          throw leadsResult.error
        }

        const leads = (leadsResult.data ?? []) as LeadStatusRow[]

        const total = leads.length

        const byStatus = (status: string) =>
          leads.filter((lead) => lead.status === status).length

        const converted = byStatus('converted')

        setStats({
          total_clients: clientsResult.count ?? 0,
          total_leads: total,
          new_leads: byStatus('new'),
          contacted_leads: byStatus('contacted'),
          follow_up_leads: byStatus('follow_up'),
          converted_leads: converted,
          conversion_rate:
            total > 0
              ? Math.round((converted / total) * 1000) / 10
              : 0,
        })
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load stats'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
  }
}