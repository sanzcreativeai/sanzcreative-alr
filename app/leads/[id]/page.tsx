'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { LeadStatusBadge } from '@/components/ui/StatusBadge'
import { DEMO_LEADS, DEMO_NOTES, DEMO_STATUS_HISTORY } from '@/lib/demo-data'
import { formatDateTime, getWhatsAppUrl, LEAD_STATUS_LABELS } from '@/lib/utils'
import {
  ArrowLeft, Phone, MessageCircle, Mail, Calendar,
  Building2, Megaphone, Globe, Clock, Plus, CheckCircle2
} from 'lucide-react'
import type { LeadStatus } from '@/types'
import Link from 'next/link'

const ALL_STATUSES: LeadStatus[] = [
  'new', 'contacted', 'interested', 'follow_up', 'converted', 'not_interested', 'invalid'
]

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lead = DEMO_LEADS.find((l) => l.id === params.id)

  const [status, setStatus] = useState(lead?.status ?? 'new')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState(DEMO_NOTES.filter((n) => n.lead_id === params.id))
  const [statusHistory, setStatusHistory] = useState(DEMO_STATUS_HISTORY.filter((h) => h.lead_id === params.id))
  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)

  if (!lead) {
    return (
      <AppLayout title="Lead not found" isDemo>
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">This lead doesn't exist or was removed.</p>
          <Link href="/leads" className="btn-secondary">← Back to Leads</Link>
        </div>
      </AppLayout>
    )
  }

  function handleStatusChange(newStatus: LeadStatus) {
    if (newStatus === status) return
    setStatusHistory([
      ...statusHistory,
      {
        id: `hist-${Date.now()}`,
        lead_id: lead!.id,
        old_status: status,
        new_status: newStatus,
        changed_by: 'demo-admin',
        created_at: new Date().toISOString(),
      }
    ])
    setStatus(newStatus)
  }

  async function handleAddNote() {
    if (!note.trim()) return
    setSavingNote(true)
    await new Promise((r) => setTimeout(r, 400))
    setNotes([
      ...notes,
      {
        id: `note-${Date.now()}`,
        lead_id: lead!.id,
        user_id: 'demo-admin',
        note: note.trim(),
        created_at: new Date().toISOString(),
      }
    ])
    setNote('')
    setSavingNote(false)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  return (
    <AppLayout title="Lead Detail" subtitle={lead.full_name} isDemo>
      {/* Back */}
      <button onClick={() => router.back()} className="btn-ghost mb-5 text-slate-400">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: main info */}
        <div className="xl:col-span-2 space-y-4">
          {/* Lead header card */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-base font-semibold text-brand-400">
                  {lead.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{lead.full_name}</h2>
                  <LeadStatusBadge status={status} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a
                  href={`tel:${lead.phone}`}
                  className="btn-secondary text-xs"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={getWhatsAppUrl(lead.phone, `Hi ${lead.full_name.split(' ')[0]}, this is SANZCREATIVE reaching out regarding your inquiry.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-500/20 font-medium px-4 py-2 rounded-lg transition-all duration-150 text-xs flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={Mail} label="Email" value={lead.email ?? '—'} />
              <InfoRow icon={Building2} label="Client" value={lead.client?.name ?? '—'} />
              <InfoRow icon={Megaphone} label="Campaign" value={lead.campaign?.campaign_name ?? '—'} />
              <InfoRow icon={Globe} label="Source" value={lead.source} />
              <InfoRow icon={Calendar} label="Received" value={formatDateTime(lead.created_at)} />
            </div>
          </div>

          {/* Form answers */}
          {lead.raw_form_data && Object.keys(lead.raw_form_data).length > 0 && (
            <div className="card p-5">
              <p className="section-title">Form Responses</p>
              <div className="space-y-3">
                {Object.entries(lead.raw_form_data).map(([q, a]) => (
                  <div key={q} className="bg-surface-2 rounded-lg p-3">
                    <p className="text-[11px] text-slate-500 mb-1">{q}</p>
                    <p className="text-sm text-slate-200">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card p-5">
            <p className="section-title">Internal Notes</p>
            <div className="space-y-3 mb-4">
              {notes.length === 0 && (
                <p className="text-xs text-slate-600 italic">No notes yet. Add the first note below.</p>
              )}
              {notes.map((n) => (
                <div key={n.id} className="bg-surface-2 rounded-lg p-3">
                  <p className="text-xs text-slate-300">{n.note}</p>
                  <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(n.created_at)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                rows={2}
                className="input-field flex-1 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!note.trim() || savingNote}
                className="btn-primary self-end whitespace-nowrap"
              >
                {noteSaved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Plus className="w-4 h-4" />}
                {savingNote ? 'Saving…' : noteSaved ? 'Saved!' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: status + history */}
        <div className="space-y-4">
          {/* Change status */}
          <div className="card p-5">
            <p className="section-title">Lead Status</p>
            <div className="space-y-1.5">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 flex items-center justify-between ${
                    status === s
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
                  }`}
                >
                  {LEAD_STATUS_LABELS[s]}
                  {status === s && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Status history */}
          <div className="card p-5">
            <p className="section-title">Status History</p>
            {statusHistory.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No status changes yet.</p>
            ) : (
              <div className="space-y-3">
                {statusHistory.map((h, i) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-1 flex-shrink-0" />
                      {i < statusHistory.length - 1 && <div className="w-px bg-white/[0.08] flex-1 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs text-slate-300">
                        {h.old_status ? `${LEAD_STATUS_LABELS[h.old_status]} → ` : 'Created as '}
                        <span className="text-white font-medium">{LEAD_STATUS_LABELS[h.new_status]}</span>
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{formatDateTime(h.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="text-sm text-slate-200">{value}</p>
      </div>
    </div>
  )
}
