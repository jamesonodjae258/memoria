import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import CaseDashboardClient from '@/components/cases/CaseDashboardClient'
import { getDemoCases } from '@/lib/demo-cases'
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

  // 1 & 2. Fetch staff profile, funeral home, and cases concurrently (RLS scoped)
  let funeralHomeName = 'Grace & Peaceful Memorial Home'
  let staffName = 'Sarah Jenkins (Director)'
  let cases: CaseRecord[] = []
  let documentsMap: Record<string, Document[]> = {}

  if (user) {
    if (!isDemoSession) {
      const [profileRes, casesRes] = await Promise.all([
        supabase
          .from('staff_profiles')
          .select('*, funeral_homes(*)')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      const profile = profileRes.data
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
      cases = (casesRes.data || []) as CaseRecord[]
    } else {
      const { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })

      cases = (casesData || []) as CaseRecord[]
    }

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

  // Fallback demo cases ONLY for unauthenticated demo bypass mode or unconfigured preview instances
  if (cases.length === 0 && (isDemoSession || !isConfigured)) {
    cases = getDemoCases()
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
