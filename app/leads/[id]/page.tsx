'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { LeadStatusBadge } from '@/components/ui/StatusBadge'
import {
  formatDateTime,
  getWhatsAppUrl,
  LEAD_STATUS_LABELS,
} from '@/lib/utils'
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Building2,
  Megaphone,
  Globe,
  Clock,
  Plus,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { LeadStatus } from '@/types'

const ALL_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'interested',
  'follow_up',
  'converted',
  'not_interested',
  'invalid',
]

type Lead = {
  id: string
  client_id: string
  campaign_id: string | null
  full_name: string
  phone: string
  email: string | null
  source: string | null
  status: LeadStatus
  created_at: string
  updated_at?: string
  raw_form_data?: Record<string, unknown> | null

  client?: {
    id?: string
    name: string
    business_category?: string
  } | null

  campaign?: {
    id?: string
    campaign_name: string
    platform?: string
  } | null
}

type LeadNote = {
  id: string
  lead_id: string
  user_id: string
  note: string
  created_at: string

  user?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

type StatusHistory = {
  id: string
  lead_id: string
  old_status: LeadStatus | null
  new_status: LeadStatus
  changed_by: string
  created_at: string

  changed_by_user?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()

  // IMPORTANT FIX:
  // Always guarantee that leadId is a string.
  const leadId: string =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0] ?? ''
        : ''

  const [lead, setLead] = useState<Lead | null>(null)
  const [status, setStatus] = useState<LeadStatus>('new')

  const [notes, setNotes] = useState<LeadNote[]>([])
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])

  const [note, setNote] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [savingStatus, setSavingStatus] =
    useState<LeadStatus | null>(null)

  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)

  useEffect(() => {
    if (!leadId) {
      setLoading(false)
      return
    }

    async function fetchLeadData() {
      try {
        setLoading(true)
        setError(null)

        const encodedLeadId = encodeURIComponent(leadId)

        const [
          leadsResponse,
          notesResponse,
          historyResponse,
        ] = await Promise.all([
          fetch('/api/leads', {
            cache: 'no-store',
          }),

          fetch(
            `/api/leads/notes?lead_id=${encodedLeadId}`,
            {
              cache: 'no-store',
            }
          ),

          fetch(
            `/api/leads/status-history?lead_id=${encodedLeadId}`,
            {
              cache: 'no-store',
            }
          ),
        ])

        if (!leadsResponse.ok) {
          const data = await leadsResponse
            .json()
            .catch(() => null)

          throw new Error(
            data?.error ||
              `Failed to load lead (${leadsResponse.status})`
          )
        }

        const leadsData = await leadsResponse.json()

        const loadedLeads: Lead[] = Array.isArray(leadsData)
          ? leadsData
          : Array.isArray(leadsData?.data)
            ? leadsData.data
            : Array.isArray(leadsData?.leads)
              ? leadsData.leads
              : []

        const foundLead =
          loadedLeads.find(
            (item) => item.id === leadId
          ) ?? null

        if (!foundLead) {
          setLead(null)
          return
        }

        setLead(foundLead)
        setStatus(foundLead.status)

        if (notesResponse.ok) {
          const notesData = await notesResponse.json()

          const loadedNotes: LeadNote[] = Array.isArray(notesData)
            ? notesData
            : Array.isArray(notesData?.data)
              ? notesData.data
              : Array.isArray(notesData?.notes)
                ? notesData.notes
                : []

          setNotes(loadedNotes)
        } else {
          console.error(
            '[Lead Detail] Failed to load notes'
          )
        }

        if (historyResponse.ok) {
          const historyData =
            await historyResponse.json()

          const loadedHistory: StatusHistory[] =
            Array.isArray(historyData)
              ? historyData
              : Array.isArray(historyData?.data)
                ? historyData.data
                : Array.isArray(historyData?.history)
                  ? historyData.history
                  : []

          setStatusHistory(loadedHistory)
        } else {
          console.error(
            '[Lead Detail] Failed to load status history'
          )
        }
      } catch (err) {
        console.error(
          '[Lead Detail] Failed to load data:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load lead'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchLeadData()
  }, [leadId])

  async function handleStatusChange(
    newStatus: LeadStatus
  ) {
    if (!lead) {
      return
    }

    if (newStatus === status) {
      return
    }

    if (savingStatus) {
      return
    }

    const oldStatus = status

    try {
      setSavingStatus(newStatus)
      setError(null)

      const response = await fetch(
        '/api/leads/status-history',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lead_id: lead.id,
            old_status: oldStatus,
            new_status: newStatus,
          }),
        }
      )

      const result = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          result?.error ||
            `Failed to update status (${response.status})`
        )
      }

      setStatus(newStatus)

      setLead((currentLead) =>
        currentLead
          ? {
              ...currentLead,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : currentLead
      )

      if (result?.data) {
        setStatusHistory((currentHistory) => [
          ...currentHistory,
          result.data,
        ])
      } else {
        await refreshStatusHistory()
      }
    } catch (err) {
      console.error(
        '[Lead Detail] Failed to update status:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update lead status'
      )
    } finally {
      setSavingStatus(null)
    }
  }

  async function refreshStatusHistory() {
    if (!leadId) {
      return
    }

    try {
      const encodedLeadId = encodeURIComponent(leadId)

      const response = await fetch(
        `/api/leads/status-history?lead_id=${encodedLeadId}`,
        {
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()

      const loadedHistory: StatusHistory[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.history)
              ? data.history
              : []

      setStatusHistory(loadedHistory)
    } catch (err) {
      console.error(
        '[Lead Detail] Failed to refresh status history:',
        err
      )
    }
  }

  async function handleAddNote() {
    if (!lead) {
      return
    }

    if (!note.trim()) {
      return
    }

    if (savingNote) {
      return
    }

    try {
      setSavingNote(true)
      setNoteSaved(false)
      setError(null)

      const response = await fetch(
        '/api/leads/notes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lead_id: lead.id,
            note: note.trim(),
          }),
        }
      )

      const result = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          result?.error ||
            `Failed to save note (${response.status})`
        )
      }

      if (result?.data) {
        setNotes((currentNotes) => [
          result.data,
          ...currentNotes,
        ])
      }

      setNote('')
      setNoteSaved(true)

      setTimeout(() => {
        setNoteSaved(false)
      }, 2000)
    } catch (err) {
      console.error(
        '[Lead Detail] Failed to save note:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save note'
      )
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) {
    return (
      <AppLayout
        title="Lead Detail"
        subtitle="Loading lead..."
      >
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-brand-400 animate-spin mb-3" />

          <p className="text-sm text-slate-400">
            Loading lead details...
          </p>
        </div>
      </AppLayout>
    )
  }

  if (!lead) {
    return (
      <AppLayout title="Lead not found">
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">
            This lead does not exist or you do not
            have permission to view it.
          </p>

          <Link
            href="/leads"
            className="btn-secondary"
          >
            ← Back to Leads
          </Link>
        </div>
      </AppLayout>
    )
  }

  const firstName =
    lead.full_name
      ?.trim()
      .split(' ')
      .filter(Boolean)[0] || 'there'

  const initials =
    lead.full_name
      ?.split(' ')
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'

  return (
    <AppLayout
      title="Lead Detail"
      subtitle={lead.full_name}
    >
      {/* Error Message */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />

          <div>
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="btn-ghost mb-5 text-slate-400"
      >
        <ArrowLeft className="w-4 h-4" />

        Back to Leads
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Side */}
        <div className="xl:col-span-2 space-y-4">
          {/* Lead Header Card */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-base font-semibold text-brand-400">
                  {initials}
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    {lead.full_name}
                  </h2>

                  <LeadStatusBadge
                    status={status}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <a
                  href={`tel:${lead.phone}`}
                  className="btn-secondary text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />

                  Call
                </a>

                <a
                  href={getWhatsAppUrl(
                    lead.phone,
                    `Hi ${firstName}, this is SANZCREATIVE reaching out regarding your inquiry.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-500/20 font-medium px-4 py-2 rounded-lg transition-all duration-150 text-xs flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" />

                  WhatsApp
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                icon={Phone}
                label="Phone"
                value={lead.phone || '—'}
              />

              <InfoRow
                icon={Mail}
                label="Email"
                value={lead.email ?? '—'}
              />

              <InfoRow
                icon={Building2}
                label="Client"
                value={lead.client?.name ?? '—'}
              />

              <InfoRow
                icon={Megaphone}
                label="Campaign"
                value={
                  lead.campaign?.campaign_name ?? '—'
                }
              />

              <InfoRow
                icon={Globe}
                label="Source"
                value={lead.source ?? '—'}
              />

              <InfoRow
                icon={Calendar}
                label="Received"
                value={formatDateTime(
                  lead.created_at
                )}
              />
            </div>
          </div>

          {/* Form Responses */}
          {lead.raw_form_data &&
            Object.keys(lead.raw_form_data).length > 0 && (
              <div className="card p-5">
                <p className="section-title">
                  Form Responses
                </p>

                <div className="space-y-3">
                  {Object.entries(
                    lead.raw_form_data
                  ).map(([question, answer]) => (
                    <div
                      key={question}
                      className="bg-surface-2 rounded-lg p-3"
                    >
                      <p className="text-[11px] text-slate-500 mb-1">
                        {question}
                      </p>

                      <p className="text-sm text-slate-200">
                        {typeof answer === 'string'
                          ? answer
                          : JSON.stringify(answer)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Notes */}
          <div className="card p-5">
            <p className="section-title">
              Internal Notes
            </p>

            <div className="space-y-3 mb-4">
              {notes.length === 0 && (
                <p className="text-xs text-slate-600 italic">
                  No notes yet. Add the first note below.
                </p>
              )}

              {notes.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-2 rounded-lg p-3"
                >
                  <p className="text-xs text-slate-300">
                    {item.note}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <p className="text-[10px] text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />

                      {formatDateTime(
                        item.created_at
                      )}
                    </p>

                    {item.user?.full_name && (
                      <p className="text-[10px] text-slate-600">
                        by {item.user.full_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="Add a note…"
                rows={2}
                className="input-field flex-1 resize-none"
              />

              <button
                type="button"
                onClick={handleAddNote}
                disabled={
                  !note.trim() || savingNote
                }
                className="btn-primary self-end whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {noteSaved ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : savingNote ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}

                {savingNote
                  ? 'Saving…'
                  : noteSaved
                    ? 'Saved!'
                    : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-4">
          {/* Change Status */}
          <div className="card p-5">
            <p className="section-title">
              Lead Status
            </p>

            <div className="space-y-1.5">
              {ALL_STATUSES.map(
                (statusOption) => (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        statusOption
                      )
                    }
                    disabled={
                      savingStatus !== null
                    }
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 flex items-center justify-between disabled:opacity-60 ${
                      status === statusOption
                        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                        : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
                    }`}
                  >
                    <span>
                      {
                        LEAD_STATUS_LABELS[
                          statusOption
                        ]
                      }
                    </span>

                    {savingStatus === statusOption ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                    ) : status === statusOption ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                    ) : null}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="card p-5">
            <p className="section-title">
              Status History
            </p>

            {statusHistory.length === 0 ? (
              <p className="text-xs text-slate-600 italic">
                No status changes yet.
              </p>
            ) : (
              <div className="space-y-3">
                {statusHistory.map(
                  (historyItem, index) => (
                    <div
                      key={historyItem.id}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1 flex-shrink-0" />

                        {index <
                          statusHistory.length - 1 && (
                          <div className="w-px bg-white/[0.08] flex-1 mt-1" />
                        )}
                      </div>

                      <div className="pb-3">
                        <p className="text-xs text-slate-300">
                          {historyItem.old_status
                            ? `${
                                LEAD_STATUS_LABELS[
                                  historyItem.old_status
                                ]
                              } → `
                            : 'Created as '}

                          <span className="text-white font-medium">
                            {
                              LEAD_STATUS_LABELS[
                                historyItem.new_status
                              ]
                            }
                          </span>
                        </p>

                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {formatDateTime(
                            historyItem.created_at
                          )}
                        </p>

                        {historyItem
                          .changed_by_user
                          ?.full_name && (
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            by{' '}
                            {
                              historyItem
                                .changed_by_user
                                .full_name
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>

      <div>
        <p className="text-[11px] text-slate-500">
          {label}
        </p>

        <p className="text-sm text-slate-200">
          {value}
        </p>
      </div>
    </div>
  )
}