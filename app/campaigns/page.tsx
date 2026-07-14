'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { CampaignStatusBadge } from '@/components/ui/StatusBadge'
import PlatformBadge from '@/components/ui/PlatformBadge'
import EmptyState from '@/components/ui/EmptyState'
import { DEMO_CAMPAIGNS, DEMO_CLIENTS } from '@/lib/demo-data'
import { formatDate } from '@/lib/utils'
import { Megaphone, Plus, Search, Hash, Users, CalendarDays } from 'lucide-react'

export default function CampaignsPage() {
  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = DEMO_CAMPAIGNS.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.campaign_name.toLowerCase().includes(q)
    const matchClient = !filterClient || c.client_id === filterClient
    return matchSearch && matchClient
  })

  return (
    <AppLayout title="Campaigns" subtitle={`${DEMO_CAMPAIGNS.length} campaigns`} isDemo>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search campaigns…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">All Clients</option>
          {DEMO_CLIENTS.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button onClick={() => setShowAddModal(true)} className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Megaphone} title="No campaigns found" description="Try adjusting your search or filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Campaign', 'Client', 'Platform', 'Meta Form ID', 'Leads', 'Status', 'Created'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((campaign) => (
                  <tr key={campaign.id} className="table-row-hover border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand-600/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-3.5 h-3.5 text-brand-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-200">{campaign.campaign_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{campaign.client?.name}</td>
                    <td className="px-4 py-3">
                      <PlatformBadge platform={campaign.platform} />
                    </td>
                    <td className="px-4 py-3">
                      {campaign.meta_form_id ? (
                        <span className="text-xs font-mono text-slate-400">{campaign.meta_form_id}</span>
                      ) : (
                        <span className="text-[11px] text-slate-600 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-white">{campaign.lead_count ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDate(campaign.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-white mb-1">New Campaign</h2>
            <p className="text-xs text-slate-500 mb-5">Set up a new lead ad campaign</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Client</label>
                <select className="input-field">
                  <option value="">Select client…</option>
                  {DEMO_CLIENTS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Campaign Name</label>
                <input type="text" placeholder="e.g. Summer Launch — July 2025" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Platform</label>
                <select className="input-field">
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="both">Facebook + Instagram</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Meta Page ID <span className="text-slate-600">(optional — needed for live integration)</span></label>
                <input type="text" placeholder="e.g. 123456789012345" className="input-field font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Meta Form ID <span className="text-slate-600">(optional — needed for live integration)</span></label>
                <input type="text" placeholder="e.g. 987654321098765" className="input-field font-mono" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button
                onClick={() => {
                  alert('In production, this saves to Supabase. Connect your database to enable.')
                  setShowAddModal(false)
                }}
                className="btn-primary flex-1 justify-center"
              >
                Save Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
