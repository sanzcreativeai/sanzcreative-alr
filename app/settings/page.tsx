'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import {
  Building2, Users, Link2, Database, User, AlertCircle,
  CheckCircle2, XCircle, Plus, ChevronRight, Shield
} from 'lucide-react'

const TABS = ['Agency', 'Users', 'Meta Integration', 'Database', 'Account'] as const
type Tab = typeof TABS[number]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Agency')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppLayout title="Settings" subtitle="Agency and application settings">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tab nav */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="card p-2">
            {TABS.map((tab) => {
              const icons: Record<Tab, any> = {
                Agency: Building2, Users, 'Meta Integration': Link2, Database, Account: User
              }
              const Icon = icons[tab]
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                    activeTab === tab
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'Agency' && (
            <div className="card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">Agency Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Agency Name</label>
                  <input type="text" defaultValue="SANZCREATIVE" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Website</label>
                  <input type="url" defaultValue="https://sanzcreative.com" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact Email</label>
                  <input type="email" defaultValue="hello@sanzcreative.com" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                  <input type="tel" defaultValue="+91 98765 00000" className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="btn-primary">
                  {saved ? <><CheckCircle2 className="w-4 h-4 text-green-400" /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Users' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white">User Management</h2>
                <button className="btn-primary text-xs">
                  <Plus className="w-3.5 h-3.5" /> Invite User
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Super Admin', email: 'admin@sanzcreative.com', role: 'Super Admin', status: 'active' },
                  { name: 'VTK Manager', email: 'manager@vtkcars.com', role: 'Client User', status: 'active' },
                  { name: 'Harini Nails', email: 'harini@harininails.com', role: 'Client User', status: 'active' },
                ].map((user) => (
                  <div key={user.email} className="flex items-center justify-between bg-surface-2 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-400">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge text-[10px] ${user.role === 'Super Admin' ? 'bg-brand-500/15 text-brand-400 ring-brand-500/20' : 'bg-slate-500/15 text-slate-400 ring-slate-500/20'}`}>
                        {user.role}
                      </span>
                      <button className="btn-ghost text-xs text-slate-500">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Meta Integration' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Meta Integration: Phase 2</p>
                  <p className="text-xs text-amber-500/80 mt-1">
                    Live Meta Lead Ads connection will be set up in Phase 2. The backend API routes are already prepared at{' '}
                    <code className="bg-black/20 px-1 rounded text-amber-400">/api/meta/webhook</code>,{' '}
                    <code className="bg-black/20 px-1 rounded text-amber-400">/api/meta/leads</code>, and{' '}
                    <code className="bg-black/20 px-1 rounded text-amber-400">/api/meta/connect</code>.
                  </p>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-sm font-semibold text-white mb-5">Meta App Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Meta App ID</label>
                    <input type="text" placeholder="Set META_APP_ID in environment variables" disabled className="input-field opacity-50 cursor-not-allowed" />
                    <p className="text-[11px] text-slate-600 mt-1">Set in <code className="text-slate-500">.env.local</code> as <code className="text-slate-500">META_APP_ID</code></p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Webhook Verify Token</label>
                    <input type="text" placeholder="Set META_WEBHOOK_VERIFY_TOKEN in environment variables" disabled className="input-field opacity-50 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-sm font-semibold text-white mb-5">Connected Pages</h2>
                <div className="text-center py-8">
                  <XCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No Meta pages connected</p>
                  <p className="text-xs text-slate-600 mt-1">Connect Meta credentials in environment variables first</p>
                  <button disabled className="btn-primary mt-4 opacity-40 cursor-not-allowed">
                    <Link2 className="w-4 h-4" /> Connect Meta Page
                  </button>
                </div>
              </div>

              {/* API Routes info */}
              <div className="card p-5">
                <p className="section-title">Prepared API Routes</p>
                <div className="space-y-2">
                  {[
                    { method: 'GET/POST', path: '/api/meta/webhook', desc: 'Webhook verification + lead event receiver' },
                    { method: 'POST', path: '/api/meta/leads', desc: 'Retrieve lead data from Meta Graph API' },
                    { method: 'POST', path: '/api/meta/connect', desc: 'Initiate Meta page OAuth connection' },
                  ].map(({ method, path, desc }) => (
                    <div key={path} className="flex items-center gap-3 bg-surface-2 rounded-lg px-3 py-2.5">
                      <span className="text-[10px] font-mono font-bold text-brand-400 bg-brand-600/10 px-1.5 py-0.5 rounded w-16 text-center flex-shrink-0">
                        {method}
                      </span>
                      <code className="text-xs text-slate-300 flex-1">{path}</code>
                      <span className="text-[11px] text-slate-600 hidden sm:block">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Database' && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-white mb-5">Database Status</h2>
              <div className="space-y-3">
                {[
                  { table: 'profiles', desc: 'User accounts and roles', status: 'ready' },
                  { table: 'clients', desc: 'Agency clients', status: 'ready' },
                  { table: 'campaigns', desc: 'Lead ad campaigns', status: 'ready' },
                  { table: 'leads', desc: 'Lead records with Meta data', status: 'ready' },
                  { table: 'lead_notes', desc: 'Internal follow-up notes', status: 'ready' },
                  { table: 'lead_status_history', desc: 'Lead status change log', status: 'ready' },
                  { table: 'meta_connections', desc: 'Meta page OAuth tokens', status: 'ready' },
                ].map(({ table, desc, status }) => (
                  <div key={table} className="flex items-center justify-between bg-surface-2 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs font-mono font-medium text-slate-200">{table}</p>
                      <p className="text-[11px] text-slate-500">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Schema ready
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-300">Row Level Security Enabled</p>
                  <p className="text-[11px] text-blue-500/80 mt-0.5">
                    RLS policies are defined in <code className="text-blue-400">supabase/schema.sql</code>. Super Admins see all data; client users see only their own records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Account' && (
            <div className="card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">Account Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input type="text" defaultValue="SANZCREATIVE Admin" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input type="email" defaultValue="admin@sanzcreative.com" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                <input type="password" placeholder="Leave blank to keep current password" className="input-field" />
              </div>
              <button onClick={handleSave} className="btn-primary">
                {saved ? <><CheckCircle2 className="w-4 h-4 text-green-400" /> Saved!</> : 'Update Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
