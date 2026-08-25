'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/admin/metrics')
        if (!res.ok) {
          throw new Error('Failed to load metrics')
        }
        const json = await res.json()
        setData(json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching dashboard metrics')
      } finally {
        setIsLoading(false)
      }
    }
    loadMetrics()
  }, [])

  const metrics = data?.metrics || {
    totalHomes: 0,
    activeTrials: 0,
    activePaid: 0,
    pastDue: 0,
    cancelled: 0,
    estimatedMRR: 0,
    totalStates: 0,
    totalTemplates: 0,
  }

  const recentHomes = data?.recentHomes || []

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Overview</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Real-time platform metrics, recurring SaaS revenue, and tenant health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/compliance/new"
            className="px-3.5 py-2 rounded bg-[#38BDF8] hover:bg-[#0284C7] text-[#0F172A] text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Compliance Template</span>
          </Link>
          <Link
            href="/admin/states"
            className="px-3.5 py-2 rounded bg-[#334155] hover:bg-[#475569] text-white text-xs font-semibold transition-colors"
          >
            Manage States
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-[#451A1A] border-l-4 border-[#EF4444] p-3 text-xs text-[#FCA5A5] rounded-r">
          {error}
        </div>
      )}

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated MRR */}
        <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-lg">
          <div className="text-[11px] font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
            Estimated MRR
          </div>
          <div className="text-3xl font-bold text-white mt-2 font-mono">
            {isLoading ? '…' : `$${metrics.estimatedMRR.toLocaleString()}`}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">
            Starter ($399) • Growth ($599)
          </div>
        </div>

        {/* Total Accounts */}
        <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-lg">
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider font-semibold">
            Total Funeral Homes
          </div>
          <div className="text-3xl font-bold text-white mt-2 font-mono">
            {isLoading ? '…' : metrics.totalHomes}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">
            All-time onboarded accounts
          </div>
        </div>

        {/* Active Free Trials */}
        <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-lg">
          <div className="text-[11px] font-mono text-[#F59E0B] uppercase tracking-wider font-semibold">
            Active 30-Day Trials
          </div>
          <div className="text-3xl font-bold text-[#FBBF24] mt-2 font-mono">
            {isLoading ? '…' : metrics.activeTrials}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">
            In evaluation period
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-lg">
          <div className="text-[11px] font-mono text-[#10B981] uppercase tracking-wider font-semibold">
            Active Paid Plans
          </div>
          <div className="text-3xl font-bold text-[#34D399] mt-2 font-mono">
            {isLoading ? '…' : metrics.activePaid}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">
            Paying subscribers
          </div>
        </div>
      </div>

      {/* Secondary Stats & Library Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#94A3B8] uppercase">
              Registered Operating States
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {metrics.totalStates} States
            </div>
          </div>
          <Link
            href="/admin/states"
            className="text-xs text-[#38BDF8] hover:underline font-semibold"
          >
            Configure States &rarr;
          </Link>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#94A3B8] uppercase">
              State Compliance Templates
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {metrics.totalTemplates} Form Templates
            </div>
          </div>
          <Link
            href="/admin/compliance"
            className="text-xs text-[#38BDF8] hover:underline font-semibold"
          >
            Manage Templates &rarr;
          </Link>
        </div>
      </div>

      {/* Recent Accounts Table */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#334155] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Funeral Home Sign-ups</h2>
          <Link
            href="/admin/homes"
            className="text-xs text-[#38BDF8] hover:underline font-semibold"
          >
            View all accounts ({metrics.totalHomes}) &rarr;
          </Link>
        </div>

        {recentHomes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94A3B8]">
            No funeral home accounts created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-[#94A3B8] border-b border-[#334155]">
                <tr>
                  <th className="p-3.5 font-medium">Funeral Home</th>
                  <th className="p-3.5 font-medium">Plan</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-[#CBD5E1]">
                {recentHomes.map((home: any) => (
                  <tr key={home.id} className="hover:bg-[#334155]/40 transition-colors">
                    <td className="p-3.5 font-semibold text-white">
                      {home.name}
                    </td>
                    <td className="p-3.5 uppercase font-mono text-[11px]">
                      {home.subscription_plan || 'starter'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          home.subscription_status === 'active'
                            ? 'bg-[#064E3B] text-[#34D399]'
                            : home.subscription_status === 'trial'
                            ? 'bg-[#78350F] text-[#FBBF24]'
                            : 'bg-[#451A1A] text-[#F87171]'
                        }`}
                      >
                        {home.subscription_status || 'trial'}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#94A3B8]">
                      {new Date(home.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
