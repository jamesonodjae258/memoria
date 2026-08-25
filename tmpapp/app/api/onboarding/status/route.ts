import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      // Unconfigured or network fallback
    }

    if (!user && !isDemoSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createServiceRoleClient()
    const userId = user?.id || 'demo-owner-id'

    const { data: profile } = await adminClient
      .from('staff_profiles')
      .select('id, full_name, role, funeral_home_id, is_super_admin, funeral_homes(*)')
      .eq('user_id', userId)
      .maybeSingle()

    const funeralHome = profile?.funeral_homes as any

    let states: any[] = []
    let invitedStaff: any[] = []

    if (funeralHome?.id) {
      const { data: statesData } = await adminClient
        .from('funeral_home_states')
        .select('*, states(*)')
        .eq('funeral_home_id', funeralHome.id)
      states = statesData || []

      const { data: staffData } = await adminClient
        .from('invited_staff')
        .select('*')
        .eq('funeral_home_id', funeralHome.id)
      invitedStaff = staffData || []
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: user?.email || 'director@graceandpeace.com',
      },
      profile: profile || {
        role: 'owner',
        full_name: 'Director',
      },
      funeralHome: funeralHome || {
        name: 'Grace & Peace Chapel',
        state: 'TX',
        onboarding_step: 1,
        subscription_status: 'trial',
        subscription_plan: 'starter',
      },
      states,
      invitedStaff,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
