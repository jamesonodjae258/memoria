import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ObituaryEditor from '@/components/obituary/ObituaryEditor'
import { getDemoCaseById, getDemoDocumentForCase } from '@/lib/demo-cases'
import type { CaseRecord, Document } from '@/types'

export default async function CaseObituaryPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()
  const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    // Fallback for unreachable Supabase instances
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  )

  if (!user && !isDemoSession && isConfigured) {
    redirect('/login')
  }

  let c: CaseRecord | null = null
  let document: Document | null = null

  if (user) {
    const [caseRes, docRes] = await Promise.all([
      supabase
        .from('cases')
        .select('*')
        .eq('id', params.id)
        .maybeSingle(),
      supabase
        .from('documents')
        .select('*')
        .eq('case_id', params.id)
        .eq('type', 'obituary')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (caseRes.data) {
      c = caseRes.data as CaseRecord
    }
    if (docRes.data) {
      document = docRes.data as Document
    }
  }

  // Demo fallback
  if (!c) {
    c = getDemoCaseById(params.id)
    if (!document) {
      document = getDemoDocumentForCase(params.id)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body selection:bg-[#A8935D] selection:text-white flex flex-col">
      {/* Top Header & Breadcrumb Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E5E2DC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav className="text-xs text-[#8C7E6E] flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-[#4D4237] hover:text-[#2C221E] font-medium transition-colors"
            >
              Ledger
            </Link>
            <span className="text-[#D2C9BD]">/</span>
            <Link
              href={`/dashboard/cases/${params.id}`}
              className="text-[#4D4237] hover:text-[#2C221E] font-medium transition-colors"
            >
              {c.deceased_name}
            </Link>
            <span className="text-[#D2C9BD]">/</span>
            <span className="text-[#2C221E] font-medium">AI Obituary Studio</span>
          </nav>

          <span className="text-[11px] font-mono text-[#A8935D] bg-white border border-[#E5E2DC] px-2.5 py-1 rounded font-bold">
            Draft Studio
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-1 w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white text-[#8C7E6E] text-xs font-semibold uppercase tracking-widest mb-2 border border-[#E5E2DC]">
            <span className="w-2 h-2 rounded-full bg-[#A8935D]" />
            Generative Tribute Engine
          </div>
          <h1 className="text-3xl font-display font-medium text-[#2C221E] tracking-tight">
            Obituary Studio — {c.deceased_name}
          </h1>
          <p className="text-xs text-[#6B5E50] mt-1.5 leading-relaxed">
            Generate, customize tone and length, refine phrasing, and approve the official tribute before dispatching to the family or publishing.
          </p>
        </div>

        <ObituaryEditor
          caseId={params.id}
          initialDocument={document}
          deceasedName={c.deceased_name}
        />
      </main>
    </div>
  )
}
