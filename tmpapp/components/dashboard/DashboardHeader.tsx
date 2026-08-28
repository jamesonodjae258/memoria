'use client'

import { useState } from 'react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0 min-w-0">
              <div className="w-8 h-8 rounded bg-[#2C221E] flex items-center justify-center text-[#D4C596] font-display text-sm font-semibold border border-[#1A1310] group-hover:bg-[#3F322D] transition-colors shrink-0">
                M
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="font-display text-sm font-semibold text-[#2C221E] tracking-tight block leading-none truncate max-w-[170px] sm:max-w-xs">
                  {funeralHomeName}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#8C7E6E] tracking-wider block mt-0.5 whitespace-nowrap">
                  Staff Portal
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
                    className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#A8935D] ${
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

          {/* Right utility items (Desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isSuperAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F172A] text-[#38BDF8] text-[11px] font-mono font-bold hover:bg-[#1E293B] transition-colors border border-[#334155] whitespace-nowrap shrink-0"
              >
                <span>⚡</span>
                <span>Super Admin</span>
              </Link>
            )}

            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-[#E5E2DC] text-xs text-[#6B5E50] whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#346538] shrink-0" />
              <span className="font-medium text-[#2C221E]">{staffName}</span>
            </div>

            <form action="/api/auth/signout" method="POST" className="shrink-0">
              <button
                type="submit"
                className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] transition-colors px-2.5 py-1.5 rounded hover:bg-[#E5E2DC]/50 whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#A8935D]"
              >
                Sign Out
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded border border-[#E5E2DC] bg-white text-[#2C221E] hover:bg-[#FAF9F7] focus-visible:ring-2 focus-visible:ring-[#A8935D]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E5E2DC] space-y-2 animate-fade-in-up">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-[#E5E2DC] text-xs text-[#6B5E50] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#346538]" />
              <span className="font-medium text-[#2C221E]">{staffName}</span>
            </div>

            <nav className="flex flex-col gap-1 text-xs font-semibold">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded transition-colors ${
                      isActive
                        ? 'bg-white text-[#2C221E] font-bold border border-[#E5E2DC]'
                        : 'text-[#6B5E50] hover:text-[#2C221E] hover:bg-white/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <form action="/api/auth/signout" method="POST" className="pt-2 border-t border-[#E5E2DC]">
              <button
                type="submit"
                className="w-full text-left text-xs font-semibold text-[#9F2F2D] hover:bg-[#FDEBEC] px-3 py-2 rounded transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
