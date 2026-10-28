import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function verifySuperAdmin() {
  const isDemoAdmin = cookies().get('gp_admin_session')?.value === 'true'
  if (isDemoAdmin) return { authorized: true, isDemo: true }

  const supabase = createServerSupabaseClient()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    return { authorized: false }
  }

  if (!user) return { authorized: false }

  const adminClient = createServiceRoleClient()
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || !profile.is_super_admin) {
    return { authorized: false }
  }

  return { authorized: true, isDemo: false }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySuperAdmin()
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { home_id, action, days = 30 } = body

    if (!home_id || !action) {
      return NextResponse.json(
        { error: 'home_id and action are required.' },
        { status: 400 }
      )
    }

    const adminClient = createServiceRoleClient()

    // Fetch funeral home
    const { data: home, error: fetchErr } = await adminClient
      .from('funeral_homes')
      .select('*')
      .eq('id', home_id)
      .maybeSingle()

    if (fetchErr || !home) {
      if (auth.isDemo) {
        return NextResponse.json({ success: true, action, simulated: true })
      }
      return NextResponse.json({ error: 'Funeral home not found.' }, { status: 404 })
    }

    let updates: Record<string, any> = {}

    switch (action) {
      case 'extend_trial': {
        const extensionDays = Number(days) === 7 ? 7 : Number(days) === 14 ? 14 : 30
        const currentTrial = home.trial_ends_at ? new Date(home.trial_ends_at) : null
        const baseDate = currentTrial && currentTrial.getTime() > Date.now() ? currentTrial : new Date()
        const newTrialEnd = new Date(baseDate.getTime() + extensionDays * 24 * 60 * 60 * 1000).toISOString()

        updates = {
          trial_ends_at: newTrialEnd,
          subscription_status: 'trial',
        }
        break
      }

      case 'mark_paying': {
        updates = {
          subscription_status: 'active',
        }
        break
      }

      case 'disable': {
        updates = {
          subscription_status: 'cancelled',
        }
        break
      }

      case 're_enable': {
        // If they had a future trial, resume trial; otherwise restore to trial with 30 days
        const hasFutureTrial = home.trial_ends_at && new Date(home.trial_ends_at).getTime() > Date.now()
        updates = {
          subscription_status: 'trial',
          trial_ends_at: hasFutureTrial
            ? home.trial_ends_at
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const { data: updatedHome, error: updateErr } = await adminClient
      .from('funeral_homes')
      .update(updates)
      .eq('id', home_id)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action,
      funeral_home: updatedHome,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update funeral home subscription.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
