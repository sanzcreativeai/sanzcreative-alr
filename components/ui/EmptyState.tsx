import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-white/[0.07] flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-500 max-w-xs mb-4">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
