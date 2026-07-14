/**
 * SANZCREATIVE ALR — Lead Status History API
 * GET  /api/leads/status-history?lead_id=xxx  — fetch history for a lead
 * POST /api/leads/status-history              — record a status change
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leadId = new URL(request.url).searchParams.get('lead_id')
  if (!leadId) return NextResponse.json({ error: 'lead_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('lead_status_history')
    .select('*, changed_by_user:profiles(id, full_name, email)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lead_id, old_status, new_status } = await request.json()
  if (!lead_id || !new_status) {
    return NextResponse.json({ error: 'lead_id and new_status are required' }, { status: 400 })
  }

  // Update the lead status + record history atomically
  const [updateResult, historyResult] = await Promise.all([
    supabase.from('leads').update({ status: new_status, updated_at: new Date().toISOString() }).eq('id', lead_id),
    supabase.from('lead_status_history').insert({
      lead_id,
      old_status: old_status ?? null,
      new_status,
      changed_by: user.id,
    }).select().single(),
  ])

  if (updateResult.error) return NextResponse.json({ error: updateResult.error.message }, { status: 500 })
  if (historyResult.error) return NextResponse.json({ error: historyResult.error.message }, { status: 500 })

  return NextResponse.json({ data: historyResult.data }, { status: 201 })
}
