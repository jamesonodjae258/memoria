import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import FamilyCommunicationSection from '@/components/communications/FamilyCommunicationSection'
import MemorialConstellationCanvas from '@/components/three/MemorialConstellationCanvas'
import StatusBadge from '@/components/cases/StatusBadge'
import type { CaseRecord, CommunicationLog } from '@/types'

export default async function CaseDetailPage({
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
    // Fallback for unconfigured or unreachable Supabase instances
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  )

  if (!user && !isDemoSession && isConfigured) {
    redirect('/login')
  }

  let c: CaseRecord | null = null
  let commsLogs: CommunicationLog[] = []

  if (user) {
    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', params.id)
      .single()

    if (caseData) {
      c = caseData as CaseRecord
      const { data: commsData } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('case_id', params.id)
        .order('created_at', { ascending: false })

      commsLogs = (commsData || []) as CommunicationLog[]
    }
  }

  // Demo fallback case
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body selection:bg-[#A8935D] selection:text-white">
      {/* Top Header & Breadcrumb Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E5E2DC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav className="text-xs text-[#8C7E6E] flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-[#4D4237] hover:text-[#2C221E] font-medium transition-colors inline-flex items-center gap-1.5"
            >
              &larr; Ledger
            </Link>
            <span className="text-[#D2C9BD]">/</span>
            <span className="font-mono text-[#8C7E6E]">CASE-#{c.id.slice(0, 8)}</span>
            <span className="text-[#D2C9BD]">/</span>
            <span className="text-[#2C221E] font-medium truncate max-w-[200px] sm:max-w-none">
              {c.deceased_name}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/cases/${params.id}/obituary`}
              className="btn-secondary !w-auto text-xs px-3.5 py-1.5 h-8 font-semibold"
            >
              Obituary Studio &rarr;
            </Link>
            <Link
              href={`/dashboard/cases/${params.id}/documents`}
              className="btn-secondary !w-auto text-xs px-3.5 py-1.5 h-8 font-semibold"
            >
              Compliance PDFs &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Case Profile Header Card */}
        <div className="bg-white rounded border border-[#E5E2DC] shadow-sm p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="brass-inlay absolute top-0 left-0 right-0" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A8935D]">
                  Case File #{c.id.slice(0, 8)}
                </span>
                <StatusBadge status={c.status} />
              </div>
              <h1 className="text-3xl font-display font-medium text-[#2C221E] tracking-tight">
                {c.deceased_name}
              </h1>
              <p className="text-xs text-[#8C7E6E] font-mono mt-1">
                Intake opened on {new Date(c.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/dashboard/cases/${params.id}/obituary`}
                className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2.5 h-9"
              >
                Draft Obituary &rarr;
              </Link>
              <Link
                href={`/dashboard/cases/${params.id}/documents`}
                className="btn-secondary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2.5 h-9"
              >
                Generate PDFs &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Grid: Case Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Deceased Information Card */}
          <div className="card-premium p-6 relative flex flex-col justify-between">
            <div className="brass-inlay absolute top-0 left-0 right-0" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
                  Vital Statistics
                </h2>
                <span className="text-[10px] font-mono text-[#8C7E6E]">Confidential Record</span>
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                  <dt className="text-[#8C7E6E]">Full Legal Name</dt>
                  <dd className="font-semibold text-[#2C221E]">{c.deceased_name}</dd>
                </div>
                {c.date_of_birth && (
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                    <dt className="text-[#8C7E6E]">Date of Birth</dt>
                    <dd className="text-[#2C221E]">{c.date_of_birth}</dd>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                  <dt className="text-[#8C7E6E]">Date of Passing</dt>
                  <dd className="font-medium text-[#2C221E]">{c.date_of_death}</dd>
                </div>
                {c.place_of_death && (
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                    <dt className="text-[#8C7E6E]">Place of Passing</dt>
                    <dd className="text-[#2C221E] text-right">{c.place_of_death}</dd>
                  </div>
                )}
                {c.occupation && (
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                    <dt className="text-[#8C7E6E]">Occupation</dt>
                    <dd className="text-[#2C221E] text-right">{c.occupation}</dd>
                  </div>
                )}
                {c.additional_notes && (
                  <div className="pt-2">
                    <dt className="text-[#8C7E6E] mb-1">Memories &amp; Personal Notes</dt>
                    <dd className="text-[#4D4237] italic bg-[#FAF9F7] p-3 rounded border border-[#E5E2DC] leading-relaxed">
                      &ldquo;{c.additional_notes}&rdquo;
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Family Contact & Arrangements Card */}
          <div className="space-y-6">
            {/* Family Informant */}
            <div className="card-premium p-6 relative">
              <div className="brass-inlay absolute top-0 left-0 right-0" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
                  Primary Informant
                </h2>
                {c.sms_opt_in ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EDF3EC] text-[#346538] border border-[#346538]/20">
                    SMS Opted-In
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF9F7] text-[#8C7E6E] border border-[#E5E2DC]">
                    Standard Email Only
                  </span>
                )}
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                  <dt className="text-[#8C7E6E]">Contact Name</dt>
                  <dd className="font-semibold text-[#2C221E]">{c.family_contact_name}</dd>
                </div>
                {c.relationship_to_deceased && (
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                    <dt className="text-[#8C7E6E]">Relationship</dt>
                    <dd className="text-[#2C221E]">{c.relationship_to_deceased}</dd>
                  </div>
                )}
                {c.family_contact_email && (
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                    <dt className="text-[#8C7E6E]">Email</dt>
                    <dd className="text-[#2C221E] font-mono">{c.family_contact_email}</dd>
                  </div>
                )}
                {c.family_contact_phone && (
                  <div className="flex justify-between py-1.5">
                    <dt className="text-[#8C7E6E]">Phone</dt>
                    <dd className="text-[#2C221E] font-mono">{c.family_contact_phone}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Service Arrangements */}
            <div className="card-premium p-6 relative">
              <div className="brass-inlay absolute top-0 left-0 right-0" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
                  Service &amp; Memorial Coordinates
                </h2>
                <span className="text-[10px] font-mono text-[#A8935D] uppercase font-bold">
                  {c.service_type || 'Burial'}
                </span>
              </div>

              {c.service_type || c.service_date || c.service_location ? (
                <dl className="space-y-3 text-xs">
                  {c.service_date && (
                    <div className="flex justify-between py-1.5 border-b border-[#E5E2DC]">
                      <dt className="text-[#8C7E6E]">Date &amp; Time</dt>
                      <dd className="font-semibold text-[#2C221E]">
                        {new Date(c.service_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </dd>
                    </div>
                  )}
                  {c.service_location && (
                    <div className="flex justify-between py-1.5">
                      <dt className="text-[#8C7E6E]">Location</dt>
                      <dd className="text-[#2C221E] font-medium text-right">{c.service_location}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-xs text-[#8C7E6E]">
                  No service details recorded yet. The family may still be deciding.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3D Virtual Memorial & Perpetual Flame Card */}
        <div className="bg-white rounded border border-[#E5E2DC] shadow-sm p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="brass-inlay absolute top-0 left-0 right-0" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FAF9F7] text-[#8C7E6E] text-[10px] font-semibold uppercase tracking-wider mb-2 border border-[#E5E2DC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8935D]" />
                3D WebGL Tribute Studio
              </div>
              <h2 className="text-xl font-display font-medium text-[#2C221E]">
                Virtual Memorial Flame &amp; Family Remembrance
              </h2>
              <p className="text-xs text-[#6B5E50] mt-1">
                Interactive real-time 3D candlelight and constellation tribute for {c.deceased_name}.
              </p>
            </div>
          </div>

          <MemorialConstellationCanvas theme="chapel" interactive={true} />
        </div>

        {/* Family Communication Section */}
        <FamilyCommunicationSection caseData={c} initialLogs={commsLogs} />
      </main>
    </div>
  )
}
