/**
 * SANZCREATIVE ALR — Meta Lead Retrieval
 *
 * Phase 2: This route retrieves full lead data from Meta Graph API
 * using a leadgen_id received from the webhook.
 *
 * Flow:
 *  1. Webhook receives leadgen_id
 *  2. This route calls Meta Graph API to get full lead data
 *  3. Lead is mapped to a client/campaign using meta_form_id
 *  4. Lead is saved to Supabase (deduplication via meta_lead_id)
 */

import { NextRequest, NextResponse } from 'next/server'
// import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Validate the request is from our own backend (not public)
  const authHeader = request.headers.get('authorization')
  const internalSecret = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!internalSecret || authHeader !== `Bearer ${internalSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { leadgen_id, form_id, page_id } = body

  if (!leadgen_id || !form_id || !page_id) {
    return NextResponse.json({ error: 'Missing required fields: leadgen_id, form_id, page_id' }, { status: 400 })
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const graphVersion = process.env.META_GRAPH_API_VERSION || 'v21.0'

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: 'Meta API credentials not configured. Set META_APP_ID and META_APP_SECRET.' },
      { status: 503 }
    )
  }

  try {
    // TODO (Phase 2): Look up the page access token for this page_id from meta_connections table
    // const supabase = await createAdminClient()
    // const { data: connection } = await supabase
    //   .from('meta_connections')
    //   .select('*')
    //   .eq('meta_page_id', page_id)
    //   .eq('connection_status', 'connected')
    //   .single()
    //
    // if (!connection) {
    //   return NextResponse.json({ error: 'No connected Meta page found for page_id: ' + page_id }, { status: 404 })
    // }
    //
    // const pageAccessToken = await decryptToken(connection.token_reference)
    //
    // const metaResponse = await fetch(
    //   `https://graph.facebook.com/${graphVersion}/${leadgen_id}?access_token=${pageAccessToken}`
    // )
    // const leadData = await metaResponse.json()
    //
    // Map fields from leadData.field_data array to a flat object
    // Store in Supabase leads table with deduplication check on meta_lead_id

    return NextResponse.json(
      {
        status: 'not_implemented',
        message: 'Phase 2: Meta Graph API integration pending. Configure Meta credentials and connect a page first.',
        received: { leadgen_id, form_id, page_id },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Meta Leads] Error fetching from Meta API:', error)
    return NextResponse.json({ error: 'Failed to retrieve lead from Meta' }, { status: 500 })
  }
}
