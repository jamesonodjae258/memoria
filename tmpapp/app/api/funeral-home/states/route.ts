import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { US_STATES } from '@/lib/constants/states'

async function getFuneralHomeContext(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {}

  if (!user && !isDemoSession) {
    return { error: 'Unauthorized', status: 401 }
  }

  const adminClient = createServiceRoleClient()
  const userId = user?.id || 'demo-owner-id'

  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('funeral_home_id, role, is_super_admin')
    .eq('user_id', userId)
    .maybeSingle()

  const homeId = profile?.funeral_home_id || 'demo-home-id'
  return { adminClient, homeId, userId }
}

// GET: Fetch funeral home's registered states + all available states
export async function GET(request: NextRequest) {
  const ctx = await getFuneralHomeContext(request)
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const { adminClient, homeId } = ctx

  try {
    // 1. Fetch registered states for this funeral home
    const { data: registered, error } = await adminClient
      .from('funeral_home_states')
      .select('*, states(*)')
      .eq('funeral_home_id', homeId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 2. Fetch all active states in system
    const { data: allStates } = await adminClient
      .from('states')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    const formattedRegistered = (registered || []).map((r: any) => ({
      id: r.id,
      state_id: r.state_id,
      is_primary: Boolean(r.is_primary),
      name: r.states?.name || 'State',
      abbreviation: r.states?.abbreviation || '??',
      created_at: r.created_at,
    }))

    return NextResponse.json({
      registeredStates: formattedRegistered,
      allStates: allStates || US_STATES,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch states'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST: Add state to funeral home
export async function POST(request: NextRequest) {
  const ctx = await getFuneralHomeContext(request)
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const { adminClient, homeId } = ctx

  try {
    const body = await request.json()
    const { state_id, abbreviation } = body

    let targetStateId = state_id

    if (!targetStateId && abbreviation) {
      // Find state by abbreviation
      const { data: s } = await adminClient
        .from('states')
        .select('id')
        .eq('abbreviation', abbreviation.toUpperCase())
        .maybeSingle()
      targetStateId = s?.id
    }

    if (!targetStateId) {
      return NextResponse.json({ error: 'State ID is required' }, { status: 400 })
    }

    // Upsert into funeral_home_states
    const { data, error } = await adminClient
      .from('funeral_home_states')
      .upsert(
        {
          funeral_home_id: homeId,
          state_id: targetStateId,
          is_primary: false,
        },
        { onConflict: 'funeral_home_id,state_id' }
      )
      .select('*, states(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, registeredState: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to add state'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH: Set primary state
export async function PATCH(request: NextRequest) {
  const ctx = await getFuneralHomeContext(request)
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const { adminClient, homeId } = ctx

  try {
    const body = await request.json()
    const { state_id } = body

    if (!state_id) {
      return NextResponse.json({ error: 'state_id is required' }, { status: 400 })
    }

    // Reset all states for this home to is_primary = false
    await adminClient
      .from('funeral_home_states')
      .update({ is_primary: false })
      .eq('funeral_home_id', homeId)

    // Set selected state to is_primary = true
    await adminClient
      .from('funeral_home_states')
      .update({ is_primary: true })
      .eq('funeral_home_id', homeId)
      .eq('state_id', state_id)

    // Also update funeral_homes.state
    const { data: s } = await adminClient
      .from('states')
      .select('abbreviation')
      .eq('id', state_id)
      .maybeSingle()

    if (s?.abbreviation) {
      await adminClient
        .from('funeral_homes')
        .update({ state: s.abbreviation })
        .eq('id', homeId)
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update primary state'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE: Remove state (non-primary only)
export async function DELETE(request: NextRequest) {
  const ctx = await getFuneralHomeContext(request)
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const { adminClient, homeId } = ctx

  try {
    const { searchParams } = new URL(request.url)
    const stateId = searchParams.get('state_id')

    if (!stateId) {
      return NextResponse.json({ error: 'state_id is required' }, { status: 400 })
    }

    // Check if state is primary
    const { data: current } = await adminClient
      .from('funeral_home_states')
      .select('is_primary')
      .eq('funeral_home_id', homeId)
      .eq('state_id', stateId)
      .maybeSingle()

    if (current?.is_primary) {
      return NextResponse.json(
        { error: 'Cannot remove your primary operating state. Set another state as primary first.' },
        { status: 400 }
      )
    }

    const { error: delErr } = await adminClient
      .from('funeral_home_states')
      .delete()
      .eq('funeral_home_id', homeId)
      .eq('state_id', stateId)

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete state'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
