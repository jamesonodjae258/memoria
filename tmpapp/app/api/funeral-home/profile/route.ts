import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
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
      .select('role, funeral_home_id, funeral_homes(*)')
      .eq('user_id', userId)
      .maybeSingle()

    if (!profile || !profile.funeral_homes) {
      // Return default or demo profile
      return NextResponse.json({
        profile: {
          role: 'director',
          funeral_home_id: 'demo-home-id',
        },
        funeralHome: {
          id: 'demo-home-id',
          name: 'Memoria Memorial Home',
          phone: '(555) 234-5678',
          address: '100 Memorial Way',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
          subscription_tier: 'trial',
          trial_ends_at: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
        },
      })
    }

    return NextResponse.json({
      profile: {
        role: profile.role,
        funeral_home_id: profile.funeral_home_id,
      },
      funeralHome: profile.funeral_homes,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch facility profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, city, state, zip } = body

    const supabase = createServerSupabaseClient()
    const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      // Unconfigured fallback
    }

    if (!user && !isDemoSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createServiceRoleClient()
    const userId = user?.id || 'demo-owner-id'

    // Verify user role
    const { data: profile } = await adminClient
      .from('staff_profiles')
      .select('role, funeral_home_id')
      .eq('user_id', userId)
      .maybeSingle()

    const role = profile?.role || (isDemoSession ? 'director' : 'staff')
    if (role !== 'owner' && role !== 'director') {
      return NextResponse.json(
        { error: 'Forbidden. Only the Funeral Director or Owner may update facility settings.' },
        { status: 403 }
      )
    }

    const homeId = profile?.funeral_home_id
    if (!homeId || homeId === 'demo-home-id') {
      return NextResponse.json({ success: true, updated: body })
    }

    const updatePayload: Record<string, any> = {}
    if (name?.trim()) updatePayload.name = name.trim()
    if (phone !== undefined) updatePayload.phone = phone.trim()
    if (address !== undefined) updatePayload.address = address.trim()
    if (city !== undefined) updatePayload.city = city.trim()
    if (state !== undefined) updatePayload.state = state.trim().toUpperCase()
    if (zip !== undefined) updatePayload.zip = zip.trim()

    const { data: updatedHome, error: updateError } = await adminClient
      .from('funeral_homes')
      .update(updatePayload)
      .eq('id', homeId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, funeralHome: updatedHome })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update facility profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
