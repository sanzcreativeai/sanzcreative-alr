import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: 'default' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'red'
}

const COLOR_MAP = {
  default: { bg: 'bg-slate-500/10', icon: 'text-slate-400', ring: 'ring-slate-500/20' },
  blue:    { bg: 'bg-blue-500/10',  icon: 'text-blue-400',  ring: 'ring-blue-500/20' },
  green:   { bg: 'bg-green-500/10', icon: 'text-green-400', ring: 'ring-green-500/20' },
  yellow:  { bg: 'bg-yellow-500/10',icon: 'text-yellow-400',ring: 'ring-yellow-500/20' },
  orange:  { bg: 'bg-orange-500/10',icon: 'text-orange-400',ring: 'ring-orange-500/20' },
  purple:  { bg: 'bg-purple-500/10',icon: 'text-purple-400',ring: 'ring-purple-500/20' },
  red:     { bg: 'bg-red-500/10',   icon: 'text-red-400',   ring: 'ring-red-500/20' },
}

export default function StatCard({ label, value, icon: Icon, trend, color = 'default' }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center ring-1', c.bg, c.ring)}>
          <Icon className={cn('w-4 h-4', c.icon)} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium',
            trend.value >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-white mb-0.5">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {trend && <p className="text-[10px] text-slate-600 mt-0.5">{trend.label}</p>}
    </div>
  )
}
