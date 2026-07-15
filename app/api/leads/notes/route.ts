/**
 * SANZCREATIVE ALR — Lead Notes API
 * GET  /api/leads/notes?lead_id=xxx — fetch notes for a lead
 * POST /api/leads/notes             — add a note to a lead
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type LeadNoteInsert = {
  lead_id: string
  user_id: string
  note: string
}

export async function GET(request: NextRequest) {
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

  const leadId = new URL(request.url).searchParams.get('lead_id')

  if (!leadId) {
    return NextResponse.json(
      { error: 'lead_id required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('lead_notes')
    .select(`
      *,
      user:profiles(id, full_name, email)
    `)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
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

  const body = await request.json()

  const { lead_id, note } = body

  if (
    !lead_id ||
    typeof note !== 'string' ||
    !note.trim()
  ) {
    return NextResponse.json(
      { error: 'lead_id and note are required' },
      { status: 400 }
    )
  }

  const noteData: LeadNoteInsert = {
    lead_id,
    user_id: user.id,
    note: note.trim(),
  }

  const { data, error } = await supabase
    .from('lead_notes')
    .insert(noteData as never)
    .select(`
      *,
      user:profiles(id, full_name, email)
    `)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { data },
    { status: 201 }
  )
}