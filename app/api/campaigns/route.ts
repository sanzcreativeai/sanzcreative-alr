/**
 * SANZCREATIVE ALR — Campaigns API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ProfileRow = {
  role: string
}

type CampaignInsert = {
  client_id: string
  campaign_name: string
  platform: string
  meta_page_id: string | null
  meta_form_id: string | null
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

  const clientId = new URL(request.url).searchParams.get('client_id')

  let query = supabase
    .from('campaigns')
    .select(`
      *,
      client:clients(id, name, business_category),
      lead_count:leads(count)
    `)
    .order('created_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query

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

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as ProfileRow | null

  if (profile?.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  const body = await request.json()

  const {
    client_id,
    campaign_name,
    platform,
    meta_page_id,
    meta_form_id,
  } = body

  if (!client_id || !campaign_name || !platform) {
    return NextResponse.json(
      {
        error: 'client_id, campaign_name, platform required',
      },
      { status: 400 }
    )
  }

  const campaignData: CampaignInsert = {
    client_id,
    campaign_name,
    platform,
    meta_page_id: meta_page_id || null,
    meta_form_id: meta_form_id || null,
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaignData as never)
    .select()
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