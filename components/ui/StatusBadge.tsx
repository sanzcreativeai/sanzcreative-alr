import { cn, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, CLIENT_STATUS_COLORS, CAMPAIGN_STATUS_COLORS } from '@/lib/utils'
import type { LeadStatus, ClientStatus, CampaignStatus } from '@/types'

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span className={cn('badge', LEAD_STATUS_COLORS[status], className)}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}

interface ClientStatusBadgeProps {
  status: ClientStatus
  className?: string
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const labels: Record<ClientStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    disabled: 'Disabled',
  }
  return (
    <span className={cn('badge', CLIENT_STATUS_COLORS[status], className)}>
      {labels[status]}
    </span>
  )
}

interface CampaignStatusBadgeProps {
  status: CampaignStatus
  className?: string
}

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
  const labels: Record<CampaignStatus, string> = {
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    draft: 'Draft',
  }
  return (
    <span className={cn('badge', CAMPAIGN_STATUS_COLORS[status], className)}>
      {labels[status]}
    </span>
  )
}
