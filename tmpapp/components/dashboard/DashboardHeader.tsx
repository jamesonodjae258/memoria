'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardHeaderProps {
  funeralHomeName?: string
  staffName?: string
  isSuperAdmin?: boolean
}

export default function DashboardHeader({
  funeralHomeName = 'Memoria Memorial Home',
  staffName = 'Director',
  isSuperAdmin = false,
}: DashboardHeaderProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Active Cases Ledger', href: '/dashboard' },
    { label: 'State Compliance Library', href: '/dashboard/compliance' },
    { label: 'Director Settings & Team', href: '/dashboard/settings' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E5E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Facility */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded bg-[#2C221E] flex items-center justify-center text-[#D4C596] font-display text-sm font-semibold border border-[#1A1310] group-hover:bg-[#3F322D] transition-colors shrink-0">
                M
              </div>
              <div className="overflow-hidden">
                <span className="font-display text-sm font-semibold text-[#2C221E] tracking-tight block leading-none truncate max-w-[200px] sm:max-w-xs">
                  {funeralHomeName}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#8C7E6E] tracking-wider block mt-0.5 whitespace-nowrap">
                  Memoria Staff Portal
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold shrink-0">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-[#2C221E] shadow-sm border border-[#E5E2DC]'
                        : 'text-[#6B5E50] hover:text-[#2C221E] hover:bg-[#EFECE6]/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-3 shrink-0">
            {isSuperAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F172A] text-[#38BDF8] text-[11px] font-mono font-bold hover:bg-[#1E293B] transition-colors border border-[#334155] whitespace-nowrap shrink-0"
              >
                <span>⚡</span>
                <span>Super Admin</span>
              </Link>
            )}

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-[#E5E2DC] text-xs text-[#6B5E50] whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#346538] shrink-0" />
              <span className="font-medium text-[#2C221E]">{staffName}</span>
            </div>

            <form action="/api/auth/signout" method="POST" className="shrink-0">
              <button
                type="submit"
                className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] transition-colors px-2.5 py-1.5 rounded hover:bg-[#E5E2DC]/50 whitespace-nowrap shrink-0"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>


        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center gap-1 py-2 border-t border-[#E5E2DC] overflow-x-auto text-xs font-semibold">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#2C221E] border border-[#E5E2DC]'
                    : 'text-[#6B5E50]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
