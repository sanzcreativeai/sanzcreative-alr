'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { ClientStatusBadge } from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import { DEMO_CLIENTS, DEMO_LEADS, DEMO_CAMPAIGNS } from '@/lib/demo-data'
import { formatDate } from '@/lib/utils'
import { Users, Plus, Search, Phone, Mail, Building2, Eye, Pencil, PowerOff } from 'lucide-react'
import Link from 'next/link'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = DEMO_CLIENTS.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_person.toLowerCase().includes(search.toLowerCase()) ||
    c.business_category.toLowerCase().includes(search.toLowerCase())
  )

  function getClientStats(clientId: string) {
    return {
      leads: DEMO_LEADS.filter((l) => l.client_id === clientId).length,
      campaigns: DEMO_CAMPAIGNS.filter((c) => c.client_id === clientId).length,
    }
  }

  return (
    <AppLayout title="Clients" subtitle={`${DEMO_CLIENTS.length} clients`} isDemo>
      {/* Toolbar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="Try a different search term"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const stats = getClientStats(client.id)
            return (
              <div key={client.id} className="card-hover p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{client.name}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" /> {client.business_category}
                      </p>
                    </div>
                  </div>
                  <ClientStatusBadge status={client.status} />
                </div>

                <div className="space-y-1.5 mb-4">
                  <p className="text-xs text-slate-400">{client.contact_person}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> {client.email}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {client.phone}
                  </p>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex-1 text-center">
                    <p className="text-base font-semibold text-white">{stats.leads}</p>
                    <p className="text-[10px] text-slate-500">Leads</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-base font-semibold text-white">{stats.campaigns}</p>
                    <p className="text-[10px] text-slate-500">Campaigns</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-slate-500">Added</p>
                    <p className="text-[10px] text-slate-400">{formatDate(client.created_at)}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/clients/${client.id}`} className="btn-ghost text-xs flex-1 justify-center">
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                  <button className="btn-ghost text-xs flex-1 justify-center">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button className="btn-ghost text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <PowerOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-white mb-1">Add New Client</h2>
            <p className="text-xs text-slate-500 mb-5">Fill in the client details below</p>

            <div className="space-y-3">
              {[
                { label: 'Client / Business Name', placeholder: 'e.g. VTK Citroën' },
                { label: 'Business Category', placeholder: 'e.g. Automotive Dealership' },
                { label: 'Contact Person', placeholder: 'Full name' },
                { label: 'Email Address', placeholder: 'email@business.com' },
                { label: 'Phone Number', placeholder: '+91 XXXXX XXXXX' },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <input type="text" placeholder={placeholder} className="input-field" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('In production, this would save to Supabase. Connect your database to enable.')
                  setShowAddModal(false)
                }}
                className="btn-primary flex-1 justify-center"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
