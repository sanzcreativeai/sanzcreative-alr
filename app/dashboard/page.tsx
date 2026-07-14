import AppLayout from '@/components/layout/AppLayout'
import StatCard from '@/components/dashboard/StatCard'
import { LeadStatusBadge } from '@/components/ui/StatusBadge'
import {
  Users, UserCheck, TrendingUp, Phone,
  Megaphone, Activity, BarChart2, RefreshCw,
  AlertCircle, CheckCircle2
} from 'lucide-react'
import { DEMO_STATS, DEMO_LEADS, DEMO_LEADS_OVER_TIME } from '@/lib/demo-data'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const recentLeads = DEMO_LEADS.slice(0, 6)

  return (
    <AppLayout title="Dashboard" subtitle="Overview of all leads and activity" isDemo>
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Clients" value={DEMO_STATS.total_clients} icon={Users} color="blue" />
        <StatCard label="Total Leads" value={DEMO_STATS.total_leads} icon={Activity} color="purple" trend={{ value: 18, label: 'vs last month' }} />
        <StatCard label="New Leads" value={DEMO_STATS.new_leads} icon={UserCheck} color="blue" />
        <StatCard label="Contacted" value={DEMO_STATS.contacted_leads} icon={Phone} color="yellow" />
        <StatCard label="Follow-up" value={DEMO_STATS.follow_up_leads} icon={RefreshCw} color="orange" />
        <StatCard label="Converted" value={DEMO_STATS.converted_leads} icon={CheckCircle2} color="green" />
        <StatCard label="Conversion Rate" value={`${DEMO_STATS.conversion_rate}%`} icon={TrendingUp} color="green" trend={{ value: 2.4, label: 'vs last month' }} />
        <StatCard label="Campaigns" value={5} icon={Megaphone} color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Leads over time chart (simplified visual) */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-white">Leads Over Time</p>
              <p className="text-xs text-slate-500">Last 12 weeks</p>
            </div>
            <BarChart2 className="w-4 h-4 text-slate-500" />
          </div>
          {/* Simple bar chart */}
          <div className="flex items-end gap-1.5 h-36">
            {DEMO_LEADS_OVER_TIME.map((d, i) => {
              const max = Math.max(...DEMO_LEADS_OVER_TIME.map(x => x.count))
              const pct = (d.count / max) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-brand-600/70 hover:bg-brand-500/90 rounded-t transition-all duration-200 group-hover:scale-105"
                      style={{ height: `${pct * 1.3}px` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-3 text-xs text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {d.count}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2">
            {DEMO_LEADS_OVER_TIME.filter((_, i) => i % 3 === 0).map((d) => (
              <span key={d.date} className="text-[10px] text-slate-600">{d.date}</span>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card p-5">
          <p className="text-sm font-medium text-white mb-1">By Status</p>
          <p className="text-xs text-slate-500 mb-5">Lead distribution</p>
          <div className="space-y-3">
            {[
              { status: 'new' as const, count: 47, pct: 18 },
              { status: 'contacted' as const, count: 89, pct: 35 },
              { status: 'interested' as const, count: 56, pct: 22 },
              { status: 'follow_up' as const, count: 34, pct: 13 },
              { status: 'converted' as const, count: 31, pct: 12 },
            ].map(({ status, count, pct }) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <LeadStatusBadge status={status} />
                  <span className="text-xs text-slate-400 font-medium">{count}</span>
                </div>
                <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card mt-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-medium text-white">Recent Leads</p>
          <Link href="/leads" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Name', 'Client', 'Campaign', 'Source', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="table-row-hover border-b border-white/[0.04] last:border-0">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-slate-200 font-medium text-xs">{lead.full_name}</p>
                      <p className="text-slate-500 text-[11px]">{lead.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{lead.client?.name}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 max-w-[160px] truncate">{lead.campaign?.campaign_name}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{lead.source}</td>
                  <td className="px-5 py-3 text-[11px] text-slate-500 whitespace-nowrap">{formatDateTime(lead.created_at)}</td>
                  <td className="px-5 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meta integration status */}
      <div className="mt-4 flex items-start gap-3 bg-surface-1 border border-white/[0.06] rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-white">Meta Integration: Not Connected</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Live Facebook and Instagram Lead Ads will appear here automatically once the Meta webhook is connected.{' '}
            <Link href="/settings" className="text-brand-400 hover:text-brand-300">Configure in Settings →</Link>
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
