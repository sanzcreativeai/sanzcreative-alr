'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  UserCircle,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: UserCircle },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  role?: 'super_admin' | 'client_user'
}

export default function Sidebar({ role = 'super_admin' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const items = role === 'client_user'
    ? NAV_ITEMS.filter((i) => !['Clients', 'Settings'].includes(i.label))
    : NAV_ITEMS

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">SANZCREATIVE</p>
            <p className="text-[10px] font-medium tracking-widest text-brand-400 uppercase">ALR</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-2 mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Navigation
        </p>
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              )}
            >
              <Icon
                className={cn('w-4 h-4 flex-shrink-0', active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-slate-400 hover:text-red-400 hover:bg-red-500/10
                     transition-all duration-150 w-full disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col h-screen bg-surface-1 border-r border-white/[0.06] fixed left-0 top-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-2 border border-white/[0.08] text-slate-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-white/[0.06] z-40">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
