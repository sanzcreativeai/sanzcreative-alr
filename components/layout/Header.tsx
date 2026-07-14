'use client'

import { Bell, TestTube } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  userName?: string
  userRole?: string
  isDemo?: boolean
}

export default function Header({ title, subtitle, userName = 'Admin', userRole = 'Super Admin', isDemo }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-surface-1/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-white truncate">{title}</h1>
          {isDemo && (
            <span className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
              <TestTube className="w-3 h-3" />
              Demo Mode
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-[11px] font-semibold text-brand-400">
            {getInitials(userName)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-200 leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
