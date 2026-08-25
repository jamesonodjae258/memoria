import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {}

  if (!user && !isDemoSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const queryStateId = searchParams.get('state_id')

  const adminClient = createServiceRoleClient()
  const userId = user?.id || 'demo-owner-id'

  try {
    // 1. Fetch user's funeral home and registered states
    const { data: profile } = await adminClient
      .from('staff_profiles')
      .select('funeral_home_id, is_super_admin, funeral_homes(id, name, state)')
      .eq('user_id', userId)
      .maybeSingle()

    const homeId = profile?.funeral_home_id || 'demo-home-id'
    const funeralHome = profile?.funeral_homes as any

    // 2. Fetch registered states for this home
    const { data: homeStates } = await adminClient
      .from('funeral_home_states')
      .select('*, states(*)')
      .eq('funeral_home_id', homeId)

    const registeredStates = (homeStates || []).map((hs: any) => ({
      id: hs.id,
      state_id: hs.state_id,
      is_primary: Boolean(hs.is_primary),
      name: hs.states?.name || funeralHome?.state || 'Texas',
      abbreviation: hs.states?.abbreviation || funeralHome?.state || 'TX',
    }))

    // Determine target state ID
    let activeStateId = queryStateId
    let activeStateName = ''
    let activeStateAbbr = ''

    if (activeStateId) {
      const match = registeredStates.find((s) => s.state_id === activeStateId)
      if (match) {
        activeStateName = match.name
        activeStateAbbr = match.abbreviation
      }
    } else {
      const primary = registeredStates.find((s) => s.is_primary) || registeredStates[0]
      activeStateId = primary?.state_id
      activeStateName = primary?.name || 'Texas'
      activeStateAbbr = primary?.abbreviation || 'TX'
    }

    // If no states found in DB yet, fallback to TX
    if (!activeStateId) {
      const { data: txState } = await adminClient
        .from('states')
        .select('id, name, abbreviation')
        .eq('abbreviation', 'TX')
        .maybeSingle()
      activeStateId = txState?.id
      activeStateName = txState?.name || 'Texas'
      activeStateAbbr = txState?.abbreviation || 'TX'
    }

    // 3. Fetch active compliance templates for the active state
    let templates: any[] = []
    if (activeStateId) {
      const { data: tList } = await adminClient
        .from('compliance_templates')
        .select('*, states(name, abbreviation)')
        .eq('state_id', activeStateId)
        .eq('is_active', true)
        .order('is_required', { ascending: false })

      templates = tList || []
    }

    // Fallback standard templates if DB templates haven't been seeded yet
    if (templates.length === 0 && activeStateAbbr === 'TX') {
      templates = [
        {
          id: 'demo_template_tx_1',
          state_id: activeStateId || 'tx-id',
          form_name: 'Texas VS-112 Certificate of Death & Burial Transit Permit',
          description: 'Mandatory state vital statistics record required for all deaths prior to final disposition or transport.',
          is_required: true,
          is_active: true,
          required_fields: ['deceased_name', 'date_of_death', 'place_of_death', 'informant_name', 'physician_license'],
          template_pdf_url: null,
        },
        {
          id: 'demo_template_tx_2',
          state_id: activeStateId || 'tx-id',
          form_name: 'Texas Cremation Authorization & Disposition Affidavit',
          description: 'Legal authorization executed by authorizing next of kin certifying identity and non-radioactive pacemaker removal.',
          is_required: true,
          is_active: true,
          required_fields: ['deceased_name', 'date_of_death', 'next_of_kin_name', 'relationship', 'pacemaker_declared'],
          template_pdf_url: null,
        },
        {
          id: 'demo_template_tx_3',
          state_id: activeStateId || 'tx-id',
          form_name: 'Affidavit of Heirship / Property Release for Personal Effects',
          description: 'Optional document executed when releasing jewelry, military medals, or personal effects to family.',
          is_required: false,
          is_active: true,
          required_fields: ['deceased_name', 'claimant_name', 'relationship', 'effects_inventory'],
          template_pdf_url: null,
        },
      ]
    }

    // 4. Fetch active cases for this funeral home (to populate "Generate for case" modal)
    const { data: casesList } = await adminClient
      .from('cases')
      .select('id, deceased_name, status, service_date, created_at')
      .eq('funeral_home_id', homeId)
      .neq('status', 'completed')
      .order('created_at', { ascending: false })

    const activeCases = (casesList || []).length > 0 ? casesList : [
      {
        id: 'test_case_demo',
        deceased_name: 'Margaret Helen Thompson',
        status: 'documents_pending',
      },
      {
        id: 'demo_case_2',
        deceased_name: 'Arthur James Pendelton',
        status: 'intake',
      },
    ]

    return NextResponse.json({
      activeState: {
        id: activeStateId,
        name: activeStateName,
        abbreviation: activeStateAbbr,
      },
      registeredStates,
      templates,
      activeCases,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch compliance library'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
