/**
 * SANZCREATIVE ALR — Clients API
 * GET   — list all clients
 * POST  — create new client (super admin only)
 * PATCH — update client (super admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ProfileRow = {
  role: string
}

type ClientInsert = {
  name: string
  business_category: string
  contact_person: string
  email: string
  phone: string
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

  const search = new URL(request.url).searchParams.get('search')

  let query = supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,contact_person.ilike.%${search}%,business_category.ilike.%${search}%`
    )
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

  // Check super admin
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as ProfileRow | null

  if (profile?.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Forbidden — super admin only' },
      { status: 403 }
    )
  }

  const body = await request.json()

  const {
    name,
    business_category,
    contact_person,
    email,
    phone,
  } = body

  if (!name || !business_category || !contact_person || !email || !phone) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    )
  }

  const clientData: ClientInsert = {
    name,
    business_category,
    contact_person,
    email,
    phone,
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(clientData as never)
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
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json(
      { error: 'id required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}