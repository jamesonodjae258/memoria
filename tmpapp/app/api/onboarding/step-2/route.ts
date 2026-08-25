import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { US_STATES } from '@/lib/constants/states'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { primary_state, additional_states = [] } = body

    if (!primary_state) {
      return NextResponse.json(
        { error: 'Primary operating state is required.' },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue onboarding.' },
        { status: 401 }
      )
    }

    const adminClient = createServiceRoleClient()
    const userId = user?.id || 'demo-owner-id'

    // Get user's funeral home
    const { data: profile } = await adminClient
      .from('staff_profiles')
      .select('funeral_home_id')
      .eq('user_id', userId)
      .maybeSingle()

    const homeId = profile?.funeral_home_id || 'demo-home-id'

    // All chosen state abbreviations
    const uniqueAbbrs = Array.from(
      new Set([primary_state.toUpperCase(), ...additional_states.map((s: string) => s.toUpperCase())])
    )

    // Ensure state records exist in states table
    for (const abbr of uniqueAbbrs) {
      const stateObj = US_STATES.find((s) => s.abbreviation === abbr) || {
        name: abbr,
        abbreviation: abbr,
      }

      // Check if state exists
      const { data: existingState } = await adminClient
        .from('states')
        .select('id')
        .eq('abbreviation', abbr)
        .maybeSingle()

      let stateId = existingState?.id

      if (!stateId) {
        const { data: insertedState } = await adminClient
          .from('states')
          .insert({
            name: stateObj.name,
            abbreviation: abbr,
            is_active: true,
          })
          .select('id')
          .single()
        stateId = insertedState?.id
      }

      if (stateId && homeId) {
        const isPrimary = abbr === primary_state.toUpperCase()
        // Upsert funeral_home_states
        await adminClient
          .from('funeral_home_states')
          .upsert(
            {
              funeral_home_id: homeId,
              state_id: stateId,
              is_primary: isPrimary,
            },
            { onConflict: 'funeral_home_id,state_id' }
          )
      }
    }

    // Update funeral_homes record
    if (homeId && homeId !== 'demo-home-id') {
      await adminClient
        .from('funeral_homes')
        .update({
          state: primary_state.toUpperCase(),
          onboarding_step: 3,
        })
        .eq('id', homeId)
    }

    return NextResponse.json({
      success: true,
      nextStep: 3,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save Step 2 state selections'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
