/**
 * SANZCREATIVE ALR — Meta Page Connection
 *
 * Phase 2: This route handles the OAuth flow to connect a client's
 * Facebook page and associate it with a campaign in SANZCREATIVE ALR.
 *
 * Flow:
 *  1. Admin clicks "Connect Meta Page" for a client
 *  2. This route returns the Meta OAuth URL
 *  3. After OAuth, Meta redirects to /api/meta/connect/callback
 *  4. Callback exchanges code for a page access token
 *  5. Token is stored securely in meta_connections table
 *  6. Webhook subscription is registered for the page
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')

  if (!clientId) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
  }

  const metaAppId = process.env.META_APP_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!metaAppId) {
    return NextResponse.json(
      { error: 'META_APP_ID not configured. Add it to your environment variables.' },
      { status: 503 }
    )
  }

  // TODO (Phase 2): Generate and store a state token for CSRF protection
  const state = Buffer.from(JSON.stringify({ client_id: clientId, ts: Date.now() })).toString('base64')

  const oauthUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  oauthUrl.searchParams.set('client_id', metaAppId)
  oauthUrl.searchParams.set('redirect_uri', `${appUrl}/api/meta/connect/callback`)
  oauthUrl.searchParams.set('scope', 'pages_manage_ads,pages_read_engagement,leads_retrieval')
  oauthUrl.searchParams.set('state', state)

  return NextResponse.json({
    status: 'not_implemented',
    message: 'Phase 2: Configure META_APP_ID and META_APP_SECRET to enable page connection.',
    oauth_url_preview: oauthUrl.toString(),
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: 'not_implemented',
    message: 'Phase 2: Meta page connection is pending.',
  })
}
