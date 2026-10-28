import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      funeral_home_name,
      phone,
      contact_email,
      street_address,
      city,
      state,
      zip,
      full_name,
    } = body

    if (!funeral_home_name || !funeral_home_name.trim()) {
      return NextResponse.json(
        { error: 'Funeral home name is required.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!contact_email || !contact_email.trim() || !emailRegex.test(contact_email.trim())) {
      return NextResponse.json(
        { error: 'A valid public contact email address is required (e.g. info@yourfuneralhome.com).' },
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
      // Unconfigured or network error
    }

    if (!user && !isDemoSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue onboarding.' },
        { status: 401 }
      )
    }

    const adminClient = createServiceRoleClient()
    const userId = user?.id || 'demo-owner-id'

    // 1. Check if staff profile already exists
    let existingHomeId: string | null = null
    const { data: existingProfile } = await adminClient
      .from('staff_profiles')
      .select('id, funeral_home_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingProfile?.funeral_home_id) {
      existingHomeId = existingProfile.funeral_home_id
    }

    let homeId = existingHomeId

    if (homeId) {
      // Update existing funeral home
      await adminClient
        .from('funeral_homes')
        .update({
          name: funeral_home_name.trim(),
          phone: phone?.trim() || null,
          contact_email: contact_email.trim().toLowerCase(),
          street_address: street_address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || 'TX',
          zip: zip?.trim() || null,
          onboarding_step: 2,
        })
        .eq('id', homeId)
    } else {
      // Create new funeral home
      const { data: newHome, error: homeErr } = await adminClient
        .from('funeral_homes')
        .insert({
          name: funeral_home_name.trim(),
          phone: phone?.trim() || null,
          contact_email: contact_email.trim().toLowerCase(),
          street_address: street_address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || 'TX',
          zip: zip?.trim() || null,
          email: user?.email || null,
          subscription_status: 'trial',
          subscription_plan: 'starter',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          onboarding_step: 2,
        })
        .select('id')
        .single()

      if (homeErr) {
        return NextResponse.json({ error: homeErr.message }, { status: 500 })
      }
      homeId = newHome.id

      // Create owner staff profile
      const { error: staffErr } = await adminClient.from('staff_profiles').insert({
        user_id: userId,
        funeral_home_id: homeId,
        full_name: full_name?.trim() || user?.user_metadata?.full_name || 'Owner',
        role: 'owner',
      })

      if (staffErr) {
        // Rollback created funeral home record to prevent leaving an orphaned account
        await adminClient.from('funeral_homes').delete().eq('id', homeId)
        return NextResponse.json({ error: staffErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      funeral_home_id: homeId,
      nextStep: 2,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save Step 1 details'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
