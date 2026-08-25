import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export const metadata = {
  title: 'Memoria Super Admin Panel',
  description: 'Internal platform administration, state templates, and tenant oversight.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDemoAdmin = cookies().get('gp_admin_session')?.value === 'true'

  if (!isDemoAdmin) {
    const supabase = createServerSupabaseClient()
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      // Supabase unreachable or unconfigured
    }

    if (!user) {
      redirect('/dashboard')
    }

    const adminClient = createServiceRoleClient()
    const { data: profile } = await adminClient
      .from('staff_profiles')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || !profile.is_super_admin) {
      // Silently redirect non-super admins to /dashboard
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0] flex flex-col md:flex-row font-body selection:bg-[#38BDF8] selection:text-[#0F172A]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#38BDF8] text-[#0F172A] font-bold text-sm flex items-center justify-center font-mono">
                SA
              </div>
              <div>
                <div className="font-bold text-sm text-white tracking-tight">Memoria Admin</div>
                <div className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-wider">
                  Super Admin (James)
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded text-[#CBD5E1] hover:text-white hover:bg-[#334155] transition-colors"
            >
              <span className="text-base">📊</span>
              <span>Overview &amp; MRR</span>
            </Link>

            <Link
              href="/admin/states"
              className="flex items-center gap-3 px-3 py-2.5 rounded text-[#CBD5E1] hover:text-white hover:bg-[#334155] transition-colors"
            >
              <span className="text-base">🗺️</span>
              <span>States Registry</span>
            </Link>

            <Link
              href="/admin/compliance"
              className="flex items-center gap-3 px-3 py-2.5 rounded text-[#CBD5E1] hover:text-white hover:bg-[#334155] transition-colors"
            >
              <span className="text-base">📜</span>
              <span>Compliance Templates</span>
            </Link>

            <Link
              href="/admin/homes"
              className="flex items-center gap-3 px-3 py-2.5 rounded text-[#CBD5E1] hover:text-white hover:bg-[#334155] transition-colors"
            >
              <span className="text-base">🏢</span>
              <span>Funeral Homes &amp; Plans</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Utility Bar */}
        <div className="p-4 border-t border-[#334155] space-y-2 text-xs">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#334155] hover:bg-[#475569] text-white text-xs font-semibold transition-colors"
          >
            <span>&larr;</span>
            <span>Exit to User Dashboard</span>
          </Link>
          <div className="text-[10px] text-[#64748B] text-center">
            Memoria v2.4 • Admin Environment
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0F172A]">
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
