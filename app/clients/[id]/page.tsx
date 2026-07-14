'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { ClientStatusBadge, LeadStatusBadge } from '@/components/ui/StatusBadge'
import PlatformBadge from '@/components/ui/PlatformBadge'
import Modal from '@/components/ui/Modal'
import { DEMO_CLIENTS, DEMO_LEADS, DEMO_CAMPAIGNS } from '@/lib/demo-data'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft, Phone, Mail, Building2, Calendar,
  UserCircle, Megaphone, Edit2, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

const TABS = ['Overview', 'Leads', 'Campaigns'] as const
type Tab = typeof TABS[number]

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const client = DEMO_CLIENTS.find((c) => c.id === params.id)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [editOpen, setEditOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!client) {
    return (
      <AppLayout title="Client not found" isDemo>
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">This client doesn't exist.</p>
          <Link href="/clients" className="btn-secondary">← Back to Clients</Link>
        </div>
      </AppLayout>
    )
  }

  const clientLeads    = DEMO_LEADS.filter((l) => l.client_id === client.id)
  const clientCampaigns = DEMO_CAMPAIGNS.filter((c) => c.client_id === client.id)
  const converted      = clientLeads.filter((l) => l.status === 'converted').length
  const convRate       = clientLeads.length > 0 ? Math.round((converted / clientLeads.length) * 100) : 0

  return (
    <AppLayout title="Client Detail" subtitle={client.name} isDemo>
      <button onClick={() => router.back()} className="btn-ghost mb-5 text-slate-400">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      {/* Header card */}
      <div className="card p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center text-lg font-bold text-brand-400 flex-shrink-0">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{client.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3 h-3" /> {client.business_category}
              </p>
              <div className="mt-1.5">
                <ClientStatusBadge status={client.status} />
              </div>
            </div>
          </div>
          <button onClick={() => setEditOpen(true)} className="btn-secondary self-start">
            <Edit2 className="w-3.5 h-3.5" /> Edit Client
          </button>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/[0.06]">
          {[
            { label: 'Total Leads', value: clientLeads.length },
            { label: 'Campaigns', value: clientCampaigns.length },
            { label: 'Converted', value: converted },
            { label: 'Conv. Rate', value: `${convRate}%` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-semibold text-white">{value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-1 border border-white/[0.06] p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab
                ? 'bg-brand-600/30 text-brand-300 border border-brand-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="section-title">Contact Information</p>
            <div className="space-y-3">
              <InfoRow icon={UserCircle} label="Contact Person" value={client.contact_person} />
              <InfoRow icon={Mail}       label="Email"          value={client.email} />
              <InfoRow icon={Phone}      label="Phone"          value={client.phone} />
              <InfoRow icon={Calendar}   label="Client Since"   value={formatDate(client.created_at)} />
            </div>
          </div>

          <div className="card p-5">
            <p className="section-title">Lead Status Breakdown</p>
            <div className="space-y-2.5">
              {(['new','contacted','interested','follow_up','converted'] as const).map((s) => {
                const count = clientLeads.filter((l) => l.status === s).length
                const pct = clientLeads.length > 0 ? (count / clientLeads.length) * 100 : 0
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between mb-1">
                      <LeadStatusBadge status={s} />
                      <span className="text-xs text-slate-400">{count}</span>
                    </div>
                    <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Leads' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-sm font-medium text-white">{clientLeads.length} Leads</p>
            <Link href={`/leads?client=${client.id}`} className="text-xs text-brand-400 hover:text-brand-300">
              View in Leads →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Name', 'Phone', 'Campaign', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientLeads.map((lead) => (
                  <tr key={lead.id} className="table-row-hover border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3 text-xs font-medium text-slate-200">{lead.full_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{lead.phone}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[160px] truncate">
                      {lead.campaign?.campaign_name}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(lead.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`}>
                        <LeadStatusBadge status={lead.status} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Campaigns' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-sm font-medium text-white">{clientCampaigns.length} Campaigns</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {clientCampaigns.map((campaign) => (
              <div key={campaign.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{campaign.campaign_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{formatDate(campaign.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={campaign.platform} />
                  <span className="text-sm font-semibold text-white">{campaign.lead_count ?? 0} leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSaved(false) }} title="Edit Client" subtitle={client.name}>
        <div className="space-y-3">
          {[
            { label: 'Business Name', defaultValue: client.name },
            { label: 'Business Category', defaultValue: client.business_category },
            { label: 'Contact Person', defaultValue: client.contact_person },
            { label: 'Email', defaultValue: client.email },
            { label: 'Phone', defaultValue: client.phone },
          ].map(({ label, defaultValue }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              <input type="text" defaultValue={defaultValue} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
            <select defaultValue={client.status} className="input-field">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setEditOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            onClick={() => {
              setSaved(true)
              setTimeout(() => { setEditOpen(false); setSaved(false) }, 1200)
            }}
            className="btn-primary flex-1 justify-center"
          >
            {saved ? <><CheckCircle2 className="w-4 h-4 text-green-400" /> Saved!</> : 'Save Changes'}
          </button>
        </div>
      </Modal>
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
