import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/resend/send-email'

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

    // Get current user's role and home
    const { data: currentProfile } = await adminClient
      .from('staff_profiles')
      .select('role, funeral_home_id, funeral_homes(name)')
      .eq('user_id', userId)
      .maybeSingle()

    const homeId = currentProfile?.funeral_home_id || 'demo-home-id'
    const currentUserRole = currentProfile?.role || (isDemoSession ? 'director' : 'staff')

    if (!homeId || homeId === 'demo-home-id') {
      return NextResponse.json({
        currentUserRole,
        staff: [
          {
            id: 'demo-staff-1',
            full_name: 'Director Jane Miller',
            email: 'director@memoria.app',
            role: 'director',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_current_user: true,
          },
          {
            id: 'demo-staff-2',
            full_name: 'Marcus Vance, LFD',
            email: 'marcus.v@memoria.app',
            role: 'arranger',
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            is_current_user: false,
          },
        ],
        invitations: [
          {
            id: 'demo-invite-1',
            email: 'sarah.care@example.com',
            role: 'staff',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
          },
        ],
      })
    }

    // Fetch real staff members
    const { data: staffList } = await adminClient
      .from('staff_profiles')
      .select('id, user_id, full_name, role, created_at')
      .eq('funeral_home_id', homeId)
      .order('created_at', { ascending: true })

    // Fetch pending invitations
    const { data: inviteList } = await adminClient
      .from('invited_staff')
      .select('id, email, role, status, created_at')
      .eq('funeral_home_id', homeId)
      .order('created_at', { ascending: false })

    const formattedStaff = (staffList || []).map((s) => ({
      ...s,
      is_current_user: s.user_id === userId,
    }))

    return NextResponse.json({
      currentUserRole,
      staff: formattedStaff,
      invitations: inviteList || [],
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch team list'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role = 'staff' } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      // fallback
    }

    if (!user && !isDemoSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createServiceRoleClient()
    const userId = user?.id || 'demo-owner-id'

    const { data: profile } = await adminClient
      .from('staff_profiles')
      .select('role, funeral_home_id, funeral_homes(name)')
      .eq('user_id', userId)
      .maybeSingle()

    const userRole = profile?.role || (isDemoSession ? 'director' : 'staff')
    if (userRole !== 'owner' && userRole !== 'director') {
      return NextResponse.json(
        { error: 'Forbidden. Only the Director can send team invitations.' },
        { status: 403 }
      )
    }

    const homeId = profile?.funeral_home_id
    const homeName = (profile?.funeral_homes as any)?.name || 'Our Funeral Home'

    if (!homeId || homeId === 'demo-home-id') {
      return NextResponse.json({
        success: true,
        invitation: {
          id: `demo-invite-${Date.now()}`,
          email: email.trim().toLowerCase(),
          role,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      })
    }

    // Insert invitation
    const { data: newInvite, error: insertError } = await adminClient
      .from('invited_staff')
      .insert({
        funeral_home_id: homeId,
        email: email.trim().toLowerCase(),
        role,
        invited_by: userId !== 'demo-owner-id' ? userId : null,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Send email via Resend
    try {
      const origin = request.nextUrl.origin || 'http://localhost:3000'
      const signupUrl = `${origin}/signup`

      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: `You've been invited to join ${homeName} on Memoria`,
        text: `Hello,\n\nYou have been invited to join the staff team at ${homeName} as a ${role}.\n\nTo accept this invitation and create your account, visit:\n${signupUrl}\n\nWarm regards,\n${homeName} & Memoria Team`,
        html: `
          <div style="font-family: sans-serif; color: #2A1F1B; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px; border-top: 3px solid #A8935D; background: #FAF9F7;">
            <h2 style="font-size: 20px; font-weight: 600; color: #2C221E; margin-bottom: 12px;">Staff Team Invitation</h2>
            <p style="margin-bottom: 16px;">Hello,</p>
            <p style="margin-bottom: 16px;">You have been invited by your director to join <strong>${homeName}</strong> on <strong>Memoria</strong> with the role of <strong>${role}</strong>.</p>
            <div style="margin: 24px 0;">
              <a href="${signupUrl}" style="background-color: #2C221E; color: #D4C596; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; display: inline-block;">
                Accept Invitation &amp; Register Account
              </a>
            </div>
            <p style="font-size: 12px; color: #8C7E6E; margin-top: 24px;">If you were not expecting this invitation, you may safely ignore this email.</p>
          </div>
        `,
      })
    } catch (mailErr) {
      console.warn('Resend mail warning:', mailErr)
    }

    return NextResponse.json({ success: true, invitation: newInvite })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to invite team member'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inviteId = searchParams.get('invite_id')
    const staffId = searchParams.get('staff_id')

    const supabase = createServerSupabaseClient()
    const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      // fallback
    }

    if (!user && !isDemoSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createServiceRoleClient()
    const userId = user?.id || 'demo-owner-id'

    const { data: profile } = await adminClient
      .from('staff_profiles')
      .select('role, funeral_home_id')
      .eq('user_id', userId)
      .maybeSingle()

    const userRole = profile?.role || (isDemoSession ? 'director' : 'staff')
    if (userRole !== 'owner' && userRole !== 'director') {
      return NextResponse.json(
        { error: 'Forbidden. Only the Director can manage team members.' },
        { status: 403 }
      )
    }

    const homeId = profile?.funeral_home_id
    if (!homeId || homeId === 'demo-home-id') {
      return NextResponse.json({ success: true })
    }

    if (inviteId) {
      await adminClient
        .from('invited_staff')
        .delete()
        .eq('id', inviteId)
        .eq('funeral_home_id', homeId)
    } else if (staffId) {
      // Ensure not deleting self
      await adminClient
        .from('staff_profiles')
        .delete()
        .eq('id', staffId)
        .eq('funeral_home_id', homeId)
        .neq('user_id', userId)
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to remove team member'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
