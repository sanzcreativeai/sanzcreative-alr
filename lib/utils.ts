import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { LeadStatus, ClientStatus, CampaignStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

// Status display helpers
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  follow_up: 'Follow-up',
  converted: 'Converted',
  not_interested: 'Not Interested',
  invalid: 'Invalid',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400 ring-blue-500/20',
  contacted: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/20',
  interested: 'bg-purple-500/15 text-purple-400 ring-purple-500/20',
  follow_up: 'bg-orange-500/15 text-orange-400 ring-orange-500/20',
  converted: 'bg-green-500/15 text-green-400 ring-green-500/20',
  not_interested: 'bg-red-500/15 text-red-400 ring-red-500/20',
  invalid: 'bg-gray-500/15 text-gray-400 ring-gray-500/20',
}

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  active: 'bg-green-500/15 text-green-400 ring-green-500/20',
  inactive: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/20',
  disabled: 'bg-red-500/15 text-red-400 ring-red-500/20',
}

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  active: 'bg-green-500/15 text-green-400 ring-green-500/20',
  paused: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/20',
  completed: 'bg-blue-500/15 text-blue-400 ring-blue-500/20',
  draft: 'bg-gray-500/15 text-gray-400 ring-gray-500/20',
}

export function getWhatsAppUrl(phone: string, message?: string) {
  const cleaned = phone.replace(/[^+\d]/g, '')
  const number = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${text}`
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
