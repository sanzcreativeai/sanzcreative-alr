'use client'

import { useEffect, useMemo, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { LeadStatusBadge } from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import { formatDateTime, LEAD_STATUS_LABELS } from '@/lib/utils'
import {
  Search,
  Filter,
  UserCircle,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react'
import type { LeadStatus } from '@/types'
import Link from 'next/link'

const ALL_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'interested',
  'follow_up',
  'converted',
  'not_interested',
  'invalid',
]

type Client = {
  id: string
  name: string
}

type Campaign = {
  id: string
  client_id: string
  campaign_name: string
}

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
  client?: {
    name: string
  } | null
  campaign?: {
    campaign_name: string
  } | null
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterCampaign, setFilterCampaign] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [leadsResponse, clientsResponse, campaignsResponse] =
          await Promise.all([
            fetch('/api/leads', { cache: 'no-store' }),
            fetch('/api/clients', { cache: 'no-store' }),
            fetch('/api/campaigns', { cache: 'no-store' }),
          ])

        if (!leadsResponse.ok) {
          const data = await leadsResponse.json().catch(() => null)
          throw new Error(data?.error || 'Failed to load leads')
        }

        if (!clientsResponse.ok) {
          const data = await clientsResponse.json().catch(() => null)
          throw new Error(data?.error || 'Failed to load clients')
        }

        if (!campaignsResponse.ok) {
          const data = await campaignsResponse.json().catch(() => null)
          throw new Error(data?.error || 'Failed to load campaigns')
        }

        const leadsData = await leadsResponse.json()
        const clientsData = await clientsResponse.json()
        const campaignsData = await campaignsResponse.json()

        setLeads(Array.isArray(leadsData) ? leadsData : leadsData.leads ?? [])
        setClients(
          Array.isArray(clientsData) ? clientsData : clientsData.clients ?? []
        )
        setCampaigns(
          Array.isArray(campaignsData)
            ? campaignsData
            : campaignsData.campaigns ?? []
        )
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load leads'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.trim().toLowerCase()

      const matchSearch =
        !q ||
        lead.full_name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.email?.toLowerCase().includes(q) ?? false)

      const matchClient =
        !filterClient || lead.client_id === filterClient

      const matchCampaign =
        !filterCampaign || lead.campaign_id === filterCampaign

      const matchStatus =
        !filterStatus || lead.status === filterStatus

      return (
        matchSearch &&
        matchClient &&
        matchCampaign &&
        matchStatus
      )
    })
  }, [
    leads,
    search,
    filterClient,
    filterCampaign,
    filterStatus,
  ])

  const filteredCampaigns = useMemo(() => {
    if (!filterClient) return campaigns

    return campaigns.filter(
      (campaign) => campaign.client_id === filterClient
    )
  }, [campaigns, filterClient])

  const hasFilters = Boolean(
    filterClient || filterCampaign || filterStatus
  )

  function clearFilters() {
    setFilterClient('')
    setFilterCampaign('')
    setFilterStatus('')
  }

  function handleClientFilterChange(clientId: string) {
    setFilterClient(clientId)
    setFilterCampaign('')
  }

  if (loading) {
    return (
      <AppLayout title="Leads" subtitle="Loading leads...">
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-brand-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">
            Loading leads from database...
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Leads"
      subtitle={`${filtered.length} leads`}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />

          <input
            type="text"
            placeholder="Search by name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${
            hasFilters
              ? 'border-brand-500/40 text-brand-400'
              : ''
          }`}
        >
          <Filter className="w-4 h-4" />

          Filters

          {hasFilters && (
            <span className="w-4 h-4 bg-brand-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {
                [
                  filterClient,
                  filterCampaign,
                  filterStatus,
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Client */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Client
              </label>

              <select
                value={filterClient}
                onChange={(e) =>
                  handleClientFilterChange(e.target.value)
                }
                className="input-field"
              >
                <option value="">All Clients</option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Campaign
              </label>

              <select
                value={filterCampaign}
                onChange={(e) =>
                  setFilterCampaign(e.target.value)
                }
                className="input-field"
              >
                <option value="">All Campaigns</option>

                {filteredCampaigns.map((campaign) => (
                  <option
                    key={campaign.id}
                    value={campaign.id}
                  >
                    {campaign.campaign_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Status
              </label>

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
                className="input-field"
              >
                <option value="">All Statuses</option>

                {ALL_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {LEAD_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 btn-ghost text-xs text-slate-500"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={UserCircle}
            title="No leads found"
            description={
              leads.length === 0
                ? 'No leads have been received yet'
                : 'Try adjusting your search or filters'
            }
            action={
              hasFilters || search ? (
                <button
                  onClick={() => {
                    setSearch('')
                    clearFilters()
                  }}
                  className="btn-secondary text-xs"
                >
                  Clear all
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[
                    'Lead',
                    'Client',
                    'Campaign',
                    'Source',
                    'Date & Time',
                    'Status',
                    '',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => {
                      window.location.href = `/leads/${lead.id}`
                    }}
                    className="table-row-hover border-b border-white/[0.04] last:border-0 group cursor-pointer"
                  >
                    {/* Lead */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-200 font-medium text-xs">
                          {lead.full_name}
                        </p>

                        <p className="text-slate-500 text-[11px]">
                          {lead.phone}
                        </p>

                        {lead.email && (
                          <p className="text-slate-600 text-[10px]">
                            {lead.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {lead.client?.name ||
                        clients.find(
                          (client) =>
                            client.id === lead.client_id
                        )?.name ||
                        '—'}
                    </td>

                    {/* Campaign */}
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px]">
                      <span className="truncate block">
                        {lead.campaign?.campaign_name ||
                          campaigns.find(
                            (campaign) =>
                              campaign.id ===
                              lead.campaign_id
                          )?.campaign_name ||
                          '—'}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 text-[11px] text-slate-500">
                      {lead.source || '—'}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(lead.created_at)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <LeadStatusBadge
                        status={lead.status}
                      />
                    </td>

                    {/* View */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${lead.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost text-xs py-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-600 text-center mt-3">
          Showing {filtered.length} of {leads.length} leads
        </p>
      )}
    </AppLayout>
  )
}