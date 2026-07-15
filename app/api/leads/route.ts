/**
 * SANZCREATIVE ALR — Leads API
 * Server-side Supabase operations for lead management
 * RLS enforced via Supabase — users can only access their permitted data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type LeadUpdate = {
  updated_at: string
  status?: string
  assigned_user_id?: string | null
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

  const { searchParams } = new URL(request.url)

  const clientId = searchParams.get('client_id')
  const campaignId = searchParams.get('campaign_id')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

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

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Leads API] Error fetching leads:', error)

    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

  try {
    const body = await request.json()

    const {
      id,
      status,
      assigned_user_id,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const updates: LeadUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updates.status = status
    }

    if (assigned_user_id !== undefined) {
      updates.assigned_user_id = assigned_user_id || null
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Leads API] Error updating lead:', error)

    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}