import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DocumentList from '@/components/documents/DocumentList'
import type { CaseRecord, Document } from '@/types'

export default async function CaseDocumentsPage({
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
  let documents: Document[] = []

  if (user) {
    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', params.id)
      .single()

    if (caseData) {
      c = caseData as CaseRecord
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', params.id)
        .order('created_at', { ascending: false })

      documents = (docsData || []) as Document[]
    }
  }

  // Demo fallback
  if (!c) {
    const now = new Date()
    c = {
      id: params.id || 'test_case_demo',
      funeral_home_id: 'demo-home-id',
      created_by: 'demo-user-id',
      deceased_name: 'Margaret Helen Thompson',
      date_of_birth: '1942-05-14',
      date_of_death: '2026-07-18',
      place_of_death: 'St. Jude Memorial Hospital, Austin, TX',
      occupation: 'Elementary School Teacher for 35 years',
      additional_notes: 'Loved gardening, baking peach cobbler, and spending time with her 4 grandchildren.',
      family_contact_name: 'Robert Thompson',
      family_contact_email: 'family.thompson@example.com',
      family_contact_phone: '+15550192834',
      relationship_to_deceased: 'Son',
      service_type: 'burial',
      service_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Grace Community Chapel',
      sms_opt_in: true,
      status: 'documents_pending',
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
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
            <span className="text-[#2C221E] font-medium">Compliance &amp; Documents</span>
          </nav>

          <span className="text-[11px] font-mono text-[#A8935D] bg-white border border-[#E5E2DC] px-2.5 py-1 rounded font-bold">
            PDF Engine
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-1 w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white text-[#8C7E6E] text-xs font-semibold uppercase tracking-widest mb-2 border border-[#E5E2DC]">
            <span className="w-2 h-2 rounded-full bg-[#A8935D]" />
            State Compliance &amp; Vital Worksheets
          </div>
          <h1 className="text-3xl font-display font-medium text-[#2C221E] tracking-tight">
            Compliance &amp; Documents — {c.deceased_name}
          </h1>
          <p className="text-xs text-[#6B5E50] mt-1.5 leading-relaxed">
            Generate pre-filled legal authorizations, track missing intake fields, and download PDF documents.
          </p>
        </div>

        <DocumentList
          caseId={params.id}
          deceasedName={c.deceased_name}
          initialDocuments={documents}
        />
      </main>
    </div>
  )
}
