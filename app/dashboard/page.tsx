'use client'

import { useEffect, useMemo, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import StatCard from '@/components/dashboard/StatCard'
import { LeadStatusBadge } from '@/components/ui/StatusBadge'
import {
  Users,
  UserCheck,
  TrendingUp,
  Phone,
  Megaphone,
  Activity,
  BarChart2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { LeadStatus } from '@/types'
import Link from 'next/link'

type DashboardStats = {
  total_clients: number
  total_leads: number
  new_leads: number
  contacted_leads: number
  follow_up_leads: number
  converted_leads: number
  conversion_rate: number
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

type Campaign = {
  id: string
  client_id: string
  campaign_name: string
}

type LeadsOverTimeItem = {
  date: string
  count: number
}

const EMPTY_STATS: DashboardStats = {
  total_clients: 0,
  total_leads: 0,
  new_leads: 0,
  contacted_leads: 0,
  follow_up_leads: 0,
  converted_leads: 0,
  conversion_rate: 0,
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [leads, setLeads] = useState<Lead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)

        const [
          statsResponse,
          leadsResponse,
          campaignsResponse,
        ] = await Promise.all([
          fetch('/api/dashboard/stats', {
            cache: 'no-store',
          }),
          fetch('/api/leads', {
            cache: 'no-store',
          }),
          fetch('/api/campaigns', {
            cache: 'no-store',
          }),
        ])

        if (!statsResponse.ok) {
          const data = await statsResponse.json().catch(() => null)

          throw new Error(
            data?.error ||
              `Failed to load dashboard stats (${statsResponse.status})`
          )
        }

        if (!leadsResponse.ok) {
          const data = await leadsResponse.json().catch(() => null)

          throw new Error(
            data?.error ||
              `Failed to load leads (${leadsResponse.status})`
          )
        }

        if (!campaignsResponse.ok) {
          const data = await campaignsResponse.json().catch(() => null)

          throw new Error(
            data?.error ||
              `Failed to load campaigns (${campaignsResponse.status})`
          )
        }

        const statsData = await statsResponse.json()
        const leadsData = await leadsResponse.json()
        const campaignsData = await campaignsResponse.json()

        const loadedStats: DashboardStats =
          statsData?.data ?? statsData ?? EMPTY_STATS

        const loadedLeads: Lead[] = Array.isArray(leadsData)
          ? leadsData
          : Array.isArray(leadsData?.data)
            ? leadsData.data
            : Array.isArray(leadsData?.leads)
              ? leadsData.leads
              : []

        const loadedCampaigns: Campaign[] = Array.isArray(campaignsData)
          ? campaignsData
          : Array.isArray(campaignsData?.data)
            ? campaignsData.data
            : Array.isArray(campaignsData?.campaigns)
              ? campaignsData.campaigns
              : []

        setStats({
          total_clients: Number(loadedStats.total_clients ?? 0),
          total_leads: Number(loadedStats.total_leads ?? 0),
          new_leads: Number(loadedStats.new_leads ?? 0),
          contacted_leads: Number(loadedStats.contacted_leads ?? 0),
          follow_up_leads: Number(loadedStats.follow_up_leads ?? 0),
          converted_leads: Number(loadedStats.converted_leads ?? 0),
          conversion_rate: Number(loadedStats.conversion_rate ?? 0),
        })

        setLeads(loadedLeads)
        setCampaigns(loadedCampaigns)
      } catch (err) {
        console.error(
          '[Dashboard] Failed to load dashboard data:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const recentLeads = useMemo(() => {
    return [...leads]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 6)
  }, [leads])

  const statusBreakdown = useMemo(() => {
    const statuses: LeadStatus[] = [
      'new',
      'contacted',
      'interested',
      'follow_up',
      'converted',
    ]

    return statuses.map((status) => {
      const count = leads.filter(
        (lead) => lead.status === status
      ).length

      const pct =
        leads.length > 0
          ? Math.round((count / leads.length) * 100)
          : 0

      return {
        status,
        count,
        pct,
      }
    })
  }, [leads])

  const leadsOverTime = useMemo<LeadsOverTimeItem[]>(() => {
    const weeks: LeadsOverTimeItem[] = []

    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now)

      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - start.getDay() - i * 7)

      const end = new Date(start)
      end.setDate(end.getDate() + 7)

      const count = leads.filter((lead) => {
        const createdAt = new Date(lead.created_at)

        return createdAt >= start && createdAt < end
      }).length

      weeks.push({
        date: start.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        }),
        count,
      })
    }

    return weeks
  }, [leads])

  const maxLeadCount = Math.max(
    ...leadsOverTime.map((item) => item.count),
    1
  )

  if (loading) {
    return (
      <AppLayout
        title="Dashboard"
        subtitle="Loading your live dashboard..."
      >
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-brand-400 animate-spin mb-3" />

          <p className="text-sm text-slate-400">
            Loading real data from Supabase...
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Overview of all leads and activity"
    >
      {/* Error Message */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm font-medium text-red-400">
            {error}
          </p>

          <p className="text-xs text-red-300/70 mt-1">
            Check your Supabase connection, API routes, authentication,
            and RLS policies.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Clients"
          value={stats.total_clients}
          icon={Users}
          color="blue"
        />

        <StatCard
          label="Total Leads"
          value={stats.total_leads}
          icon={Activity}
          color="purple"
        />

        <StatCard
          label="New Leads"
          value={stats.new_leads}
          icon={UserCheck}
          color="blue"
        />

        <StatCard
          label="Contacted"
          value={stats.contacted_leads}
          icon={Phone}
          color="yellow"
        />

        <StatCard
          label="Follow-up"
          value={stats.follow_up_leads}
          icon={RefreshCw}
          color="orange"
        />

        <StatCard
          label="Converted"
          value={stats.converted_leads}
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          label="Conversion Rate"
          value={`${stats.conversion_rate}%`}
          icon={TrendingUp}
          color="green"
        />

        <StatCard
          label="Campaigns"
          value={campaigns.length}
          icon={Megaphone}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Leads Over Time */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-white">
                Leads Over Time
              </p>

              <p className="text-xs text-slate-500">
                Last 12 weeks
              </p>
            </div>

            <BarChart2 className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-end gap-1.5 h-36">
            {leadsOverTime.map((item, index) => {
              const pct =
                (item.count / maxLeadCount) * 100

              const barHeight =
                item.count === 0
                  ? 4
                  : Math.max((pct / 100) * 130, 8)

              return (
                <div
                  key={`${item.date}-${index}`}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div className="relative w-full h-[130px] flex items-end">
                    <div
                      className="w-full bg-brand-600/70 hover:bg-brand-500/90 rounded-t transition-all duration-200 group-hover:scale-105"
                      style={{
                        height: `${barHeight}px`,
                      }}
                    />

                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-surface-3 text-xs text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.count}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between mt-2">
            {leadsOverTime
              .filter((_, index) => index % 3 === 0)
              .map((item) => (
                <span
                  key={item.date}
                  className="text-[10px] text-slate-600"
                >
                  {item.date}
                </span>
              ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="card p-5">
          <p className="text-sm font-medium text-white mb-1">
            By Status
          </p>

          <p className="text-xs text-slate-500 mb-5">
            Lead distribution
          </p>

          <div className="space-y-3">
            {statusBreakdown.map(
              ({ status, count, pct }) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <LeadStatusBadge status={status} />

                    <span className="text-xs text-slate-400 font-medium">
                      {count}
                    </span>
                  </div>

                  <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card mt-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-medium text-white">
            Recent Leads
          </p>

          <Link
            href="/leads"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-400">
              No leads yet
            </p>

            <p className="text-xs text-slate-600 mt-1">
              New leads will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {[
                    'Name',
                    'Client',
                    'Campaign',
                    'Source',
                    'Date',
                    'Status',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {recentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="table-row-hover border-b border-white/[0.04] last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-slate-200 font-medium text-xs">
                          {lead.full_name || 'Unnamed Lead'}
                        </p>

                        <p className="text-slate-500 text-[11px]">
                          {lead.phone || '—'}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-400">
                      {lead.client?.name || '—'}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-400 max-w-[160px] truncate">
                      {lead.campaign?.campaign_name || '—'}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-500">
                      {lead.source || '—'}
                    </td>

                    <td className="px-5 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(lead.created_at)}
                    </td>

                    <td className="px-5 py-3">
                      <LeadStatusBadge
                        status={lead.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Meta Integration Status */}
      <div className="mt-4 flex items-start gap-3 bg-surface-1 border border-white/[0.06] rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />

        <div>
          <p className="text-sm font-medium text-white">
            Meta Integration: Not Connected
          </p>

          <p className="text-xs text-slate-500 mt-0.5">
            Live Facebook and Instagram Lead Ads will appear here
            automatically once the Meta webhook is connected.{' '}

            <Link
              href="/settings"
              className="text-brand-400 hover:text-brand-300"
            >
              Configure in Settings →
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  )
}