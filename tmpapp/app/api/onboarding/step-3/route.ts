import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/resend/send-email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emails = [], skipped = false } = body

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
      .select('funeral_home_id, funeral_homes(name, contact_email)')
      .eq('user_id', userId)
      .maybeSingle()

    const homeId = profile?.funeral_home_id || 'demo-home-id'
    const homeName = (profile?.funeral_homes as any)?.name || 'Our Funeral Home'
    const replyTo = (profile?.funeral_homes as any)?.contact_email || 'info@graceandpeaceful.com'

    const validEmails = (emails as string[])
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'))

    if (!skipped && validEmails.length > 0 && homeId) {
      for (const email of validEmails) {
        // Insert into invited_staff
        await adminClient.from('invited_staff').insert({
          funeral_home_id: homeId,
          email,
          role: 'staff',
          invited_by: userId !== 'demo-owner-id' ? userId : null,
          status: 'pending',
        })

        // Send email via Resend
        try {
          const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin || 'http://localhost:3000'
          const signupUrl = `${origin}/signup`
          
          await sendEmail({
            to: email,
            subject: `You are invited to join ${homeName} on Memoria`,
            html: `
              <div style="font-family: sans-serif; color: #2A1F1B; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px; border-top: 3px solid #A8935D; background: #FAF9F7;">
                <h2 style="font-size: 20px; font-weight: 600; color: #2C221E; margin-bottom: 12px;">Staff Team Invitation</h2>
                <p style="margin-bottom: 16px;">Hello,</p>
                <p style="margin-bottom: 16px;">You have been invited by your director to join <strong>${homeName}</strong> on <strong>Memoria</strong>.</p>
                <div style="margin: 24px 0;">
                  <a href="${signupUrl}" style="background-color: #2C221E; color: #D4C596; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; display: inline-block;">
                    Accept Invitation &amp; Create Password &rarr;
                  </a>
                </div>
                <p style="font-size: 12px; color: #8C7E6E; margin-top: 24px;">If you did not expect this invitation, you can ignore this email.</p>
              </div>
            `,
            funeralHomeName: homeName,
            funeralHomeReplyTo: replyTo,
          })
        } catch (mailErr) {
          console.warn('Resend email notice:', (mailErr as Error)?.message || 'Send failed')
        }
      }
    }

    // Update funeral_homes step to 4 (completed / review)
    if (homeId && homeId !== 'demo-home-id') {
      await adminClient
        .from('funeral_homes')
        .update({ onboarding_step: 4 })
        .eq('id', homeId)
    }

    return NextResponse.json({
      success: true,
      invitedCount: validEmails.length,
      nextStep: 4,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process staff invitations'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
