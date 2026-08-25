'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  onOpenNewCaseModal?: () => void
}

export default function TopBar({
  searchQuery,
  onSearchChange,
  onOpenNewCaseModal,
}: TopBarProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('global-case-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E5E2DC] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7E6E]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="global-case-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search active cases, decedents, next of kin…"
            className="w-full bg-[#F8F7F4] border border-[#E5E2DC] rounded-lg pl-9 pr-14 py-2 text-xs text-[#2C221E] placeholder:text-[#8C7E6E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#8C7E6E] bg-white border border-[#E5E2DC] rounded shadow-2xs">
              {isClient && navigator.userAgent.includes('Mac') ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EDF3EC] text-[#346538] text-[11px] font-semibold border border-[#D5E5D4]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#346538] animate-pulse" />
          <span>System Online</span>
        </div>

        {onOpenNewCaseModal ? (
          <button
            type="button"
            onClick={onOpenNewCaseModal}
            className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2 h-9 flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Case Intake</span>
          </button>
        ) : (
          <Link
            href="/dashboard/cases/new"
            className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2 h-9 flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Case Intake</span>
          </Link>
        )}
      </div>
    </header>
  )
}
