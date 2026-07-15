'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { ClientStatusBadge } from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import { useClients } from '@/hooks/useClients'
import { formatDate } from '@/lib/utils'
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  Eye,
  Pencil,
  PowerOff,
} from 'lucide-react'
import Link from 'next/link'

type ClientFormData = {
  name: string
  business_category: string
  contact_person: string
  email: string
  phone: string
}

const initialFormData: ClientFormData = {
  name: '',
  business_category: '',
  contact_person: '',
  email: '',
  phone: '',
}

export default function ClientsPage() {
  const { clients, loading, error, createClient } = useClients()

  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ClientFormData>(initialFormData)

  const filtered = clients.filter((client) => {
    const query = search.toLowerCase()

    return (
      !search ||
      client.name?.toLowerCase().includes(query) ||
      client.contact_person?.toLowerCase().includes(query) ||
      client.business_category?.toLowerCase().includes(query)
    )
  })

  function handleInputChange(field: keyof ClientFormData, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function closeModal() {
    setShowAddModal(false)
    setFormData(initialFormData)
    setSaveError(null)
  }

  async function handleSaveClient() {
    if (!formData.name.trim()) {
      setSaveError('Client / Business Name is required.')
      return
    }

    setSaving(true)
    setSaveError(null)

    const { error } = await createClient({
      name: formData.name.trim(),
      business_category: formData.business_category.trim(),
      contact_person: formData.contact_person.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    })

    setSaving(false)

    if (error) {
      setSaveError(error.message)
      return
    }

    closeModal()
  }

  if (loading) {
    return (
      <AppLayout title="Clients" subtitle="Loading clients...">
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-400">Loading clients...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Clients"
      subtitle={`${clients.length} client${clients.length === 1 ? '' : 's'}`}
    >
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

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Database error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No clients found' : 'No clients yet'}
          description={
            search
              ? 'Try a different search term'
              : 'Add your first client to get started'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="card-hover p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400">
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {client.name}
                    </p>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {client.business_category || 'No category'}
                    </p>
                  </div>
                </div>

                <ClientStatusBadge status={client.status} />
              </div>

              <div className="space-y-1.5 mb-4">
                <p className="text-xs text-slate-400">
                  {client.contact_person || 'No contact person'}
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  {client.email || 'No email'}
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  {client.phone || 'No phone'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] text-slate-500">Added</p>
                <p className="text-[10px] text-slate-400">
                  {formatDate(client.created_at)}
                </p>
              </div>

              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/clients/${client.id}`}
                  className="btn-ghost text-xs flex-1 justify-center"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>

                <button className="btn-ghost text-xs flex-1 justify-center">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>

                <button className="btn-ghost text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <PowerOff className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-white mb-1">
              Add New Client
            </h2>

            <p className="text-xs text-slate-500 mb-5">
              Fill in the client details below
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Client / Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. VTK Citroën"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Business Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Automotive Dealership"
                  value={formData.business_category}
                  onChange={(e) =>
                    handleInputChange('business_category', e.target.value)
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.contact_person}
                  onChange={(e) =>
                    handleInputChange('contact_person', e.target.value)
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="email@business.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {saveError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-xs text-red-400">{saveError}</p>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={closeModal}
                disabled={saving}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveClient}
                disabled={saving}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}