import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import CaseDashboardClient from '@/components/cases/CaseDashboardClient'
import type { CaseRecord, Document } from '@/types'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    // Graceful fallback for unconfigured or unreachable Supabase instances
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  )

  // Redirect to login only if Supabase is configured AND neither user nor demo session is present
  if (!user && !isDemoSession && isConfigured) {
    redirect('/login')
  }

  // 1. Fetch staff profile & funeral home (RLS scoped)
  let funeralHomeName = 'Grace & Peaceful Memorial Home'
  let staffName = 'Sarah Jenkins (Director)'

  if (user && !isDemoSession) {
    const { data: profile } = await supabase
      .from('staff_profiles')
      .select('*, funeral_homes(*)')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || !profile.funeral_homes) {
      // User has registered auth credentials but has not completed Step 1
      redirect('/onboarding/step-1')
    }

    const currentStep = profile.funeral_homes?.onboarding_step ?? 1
    if (currentStep < 4) {
      redirect(`/onboarding/step-${currentStep}`)
    }

    funeralHomeName = profile.funeral_homes?.name ?? funeralHomeName
    staffName = profile.full_name ?? user.email ?? staffName
  }


  // 2. Fetch cases (RLS automatically restricts to staff member's funeral_home_id)
  let cases: CaseRecord[] = []
  let documentsMap: Record<string, Document[]> = {}

  if (user) {
    const { data: casesData } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })

    cases = (casesData || []) as CaseRecord[]

    const caseIds = cases.map((c) => c.id)
    if (caseIds.length > 0) {
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .in('case_id', caseIds)

      if (docsData) {
        documentsMap = (docsData as Document[]).reduce((acc, doc) => {
          if (!acc[doc.case_id]) acc[doc.case_id] = []
          acc[doc.case_id].push(doc)
          return acc
        }, {} as Record<string, Document[]>)
      }
    }
  }

  // Fallback demo cases if database is empty or unconfigured
  if (cases.length === 0) {
    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    const in5days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()

    cases = [
      {
        id: 'test_case_demo',
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
        service_date: in24h,
        service_location: 'Grace Community Chapel',
        sms_opt_in: true,
        status: 'documents_pending',
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: 'demo_case_2',
        funeral_home_id: 'demo-home-id',
        created_by: 'demo-user-id',
        deceased_name: 'Arthur James Pendelton',
        date_of_birth: '1938-11-20',
        date_of_death: '2026-07-19',
        place_of_death: 'Austin, TX',
        occupation: 'Architect',
        additional_notes: 'Passionate about woodworking and classical jazz music.',
        family_contact_name: 'Eleanor Pendelton',
        family_contact_email: 'eleanor.p@example.com',
        family_contact_phone: '+15550198822',
        relationship_to_deceased: 'Daughter',
        service_type: 'cremation',
        service_date: in5days,
        service_location: 'Memorial Gardens',
        sms_opt_in: false,
        status: 'intake',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
    ]
  }

  return (
    <CaseDashboardClient
      cases={cases}
      documentsMap={documentsMap}
      funeralHomeName={funeralHomeName}
      staffName={staffName}
    />
  )
}
