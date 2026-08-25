'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

interface DashboardShellProps {
  children: React.ReactNode
  funeralHomeName?: string
  staffName?: string
  isSuperAdmin?: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  onOpenNewCaseModal?: () => void
}

export default function DashboardShell({
  children,
  funeralHomeName = 'Memoria Memorial Home',
  staffName = 'Director',
  isSuperAdmin = false,
  searchQuery,
  onSearchChange,
  onOpenNewCaseModal,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body flex selection:bg-[#A8935D] selection:text-white">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          funeralHomeName={funeralHomeName}
          staffName={staffName}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          funeralHomeName={funeralHomeName}
          staffName={staffName}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="flex items-center">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-4 text-[#8C7E6E] hover:text-[#2C221E] bg-white border-b border-[#E5E2DC]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <TopBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onOpenNewCaseModal={onOpenNewCaseModal}
            />
          </div>
        </div>

        {/* Canvas Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-8">
          {children}
        </main>
      </div>
    </div>
  )
}
