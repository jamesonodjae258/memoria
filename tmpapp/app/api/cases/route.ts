import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to create a case.' },
        { status: 401 }
      )
    }

    // Get staff profile to find funeral_home_id
    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('funeral_home_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Your staff profile could not be found. Contact your administrator.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields (unless it's a draft)
    if (!body.is_draft) {
      const missing: string[] = []
      if (!body.deceased_name?.trim()) missing.push('deceased name')
      if (!body.date_of_death) missing.push('date of passing')
      if (!body.family_contact_name?.trim()) missing.push('family contact name')

      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Required information is missing: ${missing.join(', ')}.` },
          { status: 400 }
        )
      }
    }

    // Use service role client to insert (bypasses RLS for the insert,
    // but we've verified the user's funeral_home_id above)
    const serviceClient = createServiceRoleClient()

    const { data: newCase, error: insertError } = await serviceClient
      .from('cases')
      .insert({
        funeral_home_id: profile.funeral_home_id,
        created_by: user.id,
        deceased_name: body.deceased_name?.trim() || 'Unnamed — draft',
        date_of_birth: body.date_of_birth || null,
        date_of_death: body.date_of_death || null,
        place_of_death: body.place_of_death?.trim() || null,
        occupation: body.occupation?.trim() || null,
        additional_notes: body.additional_notes?.trim() || null,
        family_contact_name: body.family_contact_name?.trim() || 'Not provided — draft',
        family_contact_email: body.family_contact_email?.trim() || null,
        family_contact_phone: body.family_contact_phone?.trim() || null,
        relationship_to_deceased: body.relationship_to_deceased?.trim() || null,
        service_type: body.service_type || null,
        service_date: body.service_date || null,
        service_location: body.service_location?.trim() || null,
        sms_opt_in: body.sms_opt_in ?? false,
        status: 'intake',
      })
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'The case could not be saved. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: newCase.id }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
