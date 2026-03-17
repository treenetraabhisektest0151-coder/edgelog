'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth }  from '@/context/AuthContext'
import { useStore } from '@/context/TradeStore'
import {
  LayoutDashboard, BookOpen, BarChart3, CalendarDays,
  Newspaper, Images, Settings, LogOut, TrendingUp, Menu, X,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/journal',   label: 'Journal',    icon: BookOpen },
  { href: '/analytics', label: 'Analytics',  icon: BarChart3 },
  { href: '/calendar',  label: 'Calendar',   icon: CalendarDays },
  { href: '/news',      label: 'News',       icon: Newspaper },
  { href: '/gallery',   label: 'Gallery',    icon: Images },
  { href: '/settings',  label: 'Settings',   icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, authLoading, logOut } = useAuth()
  const { subscribe, unsubscribe }             = useStore()
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
  }, [user, authLoading])

  useEffect(() => {
    if (user) { subscribe(user.uid); return () => unsubscribe() }
  }, [user?.uid])

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gold-500/12 border border-gold-500/28 flex items-center justify-center shrink-0">
          <TrendingUp size={17} className="text-gold" />
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-lg leading-tight gradient-text font-display tracking-tight">EdgeLog</p>
          <p className="text-[10px] text-muted font-mono">PRO · Free Tier</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`nav-link ${pathname.startsWith(href) ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold-500/18 border border-gold-500/28 flex items-center justify-center font-bold text-gold text-xs shrink-0">
            {(profile?.displayName || user.email || 'T')[0].toUpperCase()}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-semibold text-white/88 truncate">{profile?.displayName || 'Trader'}</p>
            <p className="text-[11px] text-muted truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logOut(); router.push('/auth') }}
          className="nav-link w-full !text-red-400/65 hover:!text-red-400 hover:!bg-red-500/10">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex relative z-[1]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-white/[0.055] bg-black/15 backdrop-blur-sm sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-56 bg-night-100 border-r border-white/[0.055] h-full">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-3 p-1.5 text-muted hover:text-white">
              <X size={18} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.055] bg-black/10">
          <button onClick={() => setOpen(true)} className="p-1.5 text-muted hover:text-white">
            <Menu size={21} />
          </button>
          <span className="font-bold text-lg gradient-text font-display">EdgeLog</span>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
