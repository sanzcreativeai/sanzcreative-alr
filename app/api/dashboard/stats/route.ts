/**
 * SANZCREATIVE ALR — Dashboard Stats API
 * Returns aggregated stats for the dashboard.
 * RLS ensures super admin gets all, client users get own.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type LeadStatusRow = {
  status: string | null
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const [clientsResult, leadsResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true }),

    supabase
      .from('leads')
      .select('status'),
  ])

  if (clientsResult.error) {
    return NextResponse.json(
      { error: clientsResult.error.message },
      { status: 500 }
    )
  }

  if (leadsResult.error) {
    return NextResponse.json(
      { error: leadsResult.error.message },
      { status: 500 }
    )
  }

  const leads = (leadsResult.data ?? []) as LeadStatusRow[]

  const total = leads.length

  const byStatus = (status: string): number => {
    return leads.filter((lead) => lead.status === status).length
  }

  const converted = byStatus('converted')

  return NextResponse.json({
    data: {
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
    },
  })
}