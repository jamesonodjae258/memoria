'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  funeralHomeName?: string
  staffName?: string
  isSuperAdmin?: boolean
  pendingFormsCount?: number
}

export default function Sidebar({
  funeralHomeName = 'Memoria Memorial Home',
  staffName = 'Director',
  isSuperAdmin = false,
  pendingFormsCount = 3,
}: SidebarProps) {
  const pathname = usePathname()

  const operationsNav = [
    {
      name: 'Overview & Ledger',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      exact: true,
    },
    {
      name: 'State Compliance',
      href: '/dashboard/compliance',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      badge: pendingFormsCount > 0 ? `${pendingFormsCount}` : undefined,
      badgeColor: 'bg-[#FBF3DB] text-[#956400]',
    },
    {
      name: 'Operating States',
      href: '/dashboard/settings/states',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-64 bg-[#FAF9F7] border-r border-[#E5E2DC] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Top Branding & Facility */}
      <div className="p-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#2C221E] flex items-center justify-center text-[#D4C596] font-display text-base font-semibold border border-[#1A1310] shadow-xs group-hover:bg-[#3F322D] transition-colors shrink-0">
            M
          </div>
          <div className="overflow-hidden">
            <h1 className="font-display text-sm font-semibold text-[#2C221E] tracking-tight truncate leading-tight">
              {funeralHomeName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346538]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6E] truncate">
                Memoria Operations
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Section */}
        <nav className="mt-8 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8C7E6E] block mb-2">
              Operations
            </span>
            <div className="space-y-1">
              {operationsNav.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-[#2C221E] shadow-xs border border-[#E5E2DC] font-bold'
                        : 'text-[#6B5E50] hover:text-[#2C221E] hover:bg-[#F2EFEA]/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-[#A8935D]' : 'text-[#8C7E6E]'}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-[#EDF3EC] text-[#346538]'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Super Admin Section (if admin) */}
          {isSuperAdmin && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] block mb-2 flex items-center gap-1">
                <span>⚡</span>
                <span>Super Admin</span>
              </span>
              <div className="space-y-1">
                <Link
                  href="/admin"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pathname.startsWith('/admin')
                      ? 'bg-[#0F172A] text-[#38BDF8] shadow-xs border border-[#334155]'
                      : 'text-[#6B5E50] hover:text-[#0F172A] hover:bg-[#F2EFEA]/80'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin Panel</span>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom User & Sign Out */}
      <div className="p-4 border-t border-[#E5E2DC] bg-[#FAF9F7]/60">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-[#E5E2DC]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#F2EFEA] border border-[#E5E2DC] text-[#2C221E] font-bold text-xs flex items-center justify-center shrink-0">
              {staffName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-[#2C221E] block truncate leading-tight">
                {staffName}
              </span>
              <span className="text-[10px] text-[#8C7E6E] block truncate">
                Funeral Director
              </span>
            </div>
          </div>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              title="Sign Out"
              className="p-1.5 rounded text-[#8C7E6E] hover:text-[#9F2F2D] hover:bg-[#FDEBEC] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
