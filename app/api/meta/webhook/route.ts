/**
 * SANZCREATIVE ALR — Meta Webhook Handler
 *
 * Phase 2: This route will receive real-time lead notifications from Meta.
 *
 * Flow:
 *  GET  — Webhook verification (Meta calls this to confirm the endpoint)
 *  POST — Lead event payload from Meta (leadgen object type)
 *
 * Currently: Verification token check is scaffolded but the live Meta app is not connected.
 * The POST handler stores incoming payloads for inspection but does not process real leads yet.
 */

import { NextRequest, NextResponse } from 'next/server'

// GET: Webhook verification handshake
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN

  if (!verifyToken) {
    return NextResponse.json(
      { error: 'Webhook verify token not configured. Set META_WEBHOOK_VERIFY_TOKEN in environment variables.' },
      { status: 503 }
    )
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Meta Webhook] Verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  console.warn('[Meta Webhook] Verification failed — token mismatch')
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST: Receive lead events from Meta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[Meta Webhook] Received payload:', JSON.stringify(body, null, 2))

    // Validate the payload structure
    if (body.object !== 'page') {
      return NextResponse.json({ error: 'Unexpected object type' }, { status: 400 })
    }

    // TODO (Phase 2): Process each entry
    // for (const entry of body.entry) {
    //   for (const change of entry.changes) {
    //     if (change.field === 'leadgen') {
    //       const leadgenId = change.value.leadgen_id
    //       const formId    = change.value.form_id
    //       const pageId    = change.value.page_id
    //       await processMetaLead({ leadgenId, formId, pageId })
    //     }
    //   }
    // }

    // Acknowledge receipt to Meta immediately (within 5s requirement)
    return NextResponse.json({ status: 'received' }, { status: 200 })
  } catch (error) {
    console.error('[Meta Webhook] Error processing payload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
