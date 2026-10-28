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

export async function GET(_request: NextRequest) {
  try {
    const auth = await verifySuperAdmin()
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized. Super admin access required.' }, { status: 403 })
    }

    const adminClient = createServiceRoleClient()
    const { data: requests, error } = await adminClient
      .from('state_requests')
      .select('*, funeral_homes(name)')
      .order('created_at', { ascending: false })

    if (error) {
      // Fallback empty list or mock list in demo mode
      if (auth.isDemo) {
        return NextResponse.json({
          requests: [
            {
              id: 'demo-req-1',
              state_name: 'Oklahoma',
              contact_email: 'director@oklahomacare.com',
              status: 'new',
              created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
              funeral_homes: { name: 'Oakridge Mortuary' },
            },
            {
              id: 'demo-req-2',
              state_name: 'Louisiana',
              contact_email: 'contact@bayoufunerals.com',
              status: 'done',
              created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
              funeral_homes: { name: 'Pelican Memorial Chapel' },
            },
          ],
        })
      }
      return NextResponse.json({ requests: [] })
    }

    return NextResponse.json({ requests: requests || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch state requests.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySuperAdmin()
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized. Super admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required.' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { error } = await adminClient
      .from('state_requests')
      .update({ status })
      .eq('id', id)

    if (error && !auth.isDemo) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update state request.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
