import { createServiceRoleClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, funeralHomeName, state = 'TX' } = body

    if (!email || !password || !fullName || !funeralHomeName) {
      return NextResponse.json(
        { error: 'Email, password, full name, and funeral home name are required.' },
        { status: 400 }
      )
    }

    const adminClient = createServiceRoleClient()

    // 1. Create user in Supabase Auth
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        funeral_home_name: funeralHomeName,
      },
    })

    if (userError) {
      // If user already exists or other auth error
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    const userId = userData.user.id

    // 2. Create funeral home
    const { data: homeData, error: homeError } = await adminClient
      .from('funeral_homes')
      .insert({
        name: funeralHomeName,
        state: state || 'TX',
        email: email,
      })
      .select()
      .single()

    if (homeError) {
      return NextResponse.json({ error: homeError.message }, { status: 500 })
    }

    // 3. Create staff profile linking user and funeral home
    const { error: profileError } = await adminClient.from('staff_profiles').insert({
      user_id: userId,
      funeral_home_id: homeData.id,
      full_name: fullName,
      role: 'director',
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Staff director account created successfully.',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
