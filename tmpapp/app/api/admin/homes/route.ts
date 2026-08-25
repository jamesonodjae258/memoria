import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function verifySuperAdmin(request: NextRequest) {
  const isDemoAdmin = cookies().get('gp_admin_session')?.value === 'true'
  if (isDemoAdmin) return { isAuthorized: true, userId: 'demo-admin-id' }

  const supabase = createServerSupabaseClient()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {}

  if (!user) return { isAuthorized: false, userId: null }

  const adminClient = createServiceRoleClient()
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.is_super_admin) {
    return { isAuthorized: true, userId: user.id }
  }

  return { isAuthorized: false, userId: user.id }
}

export async function GET(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  const adminClient = createServiceRoleClient()

  try {
    let query = adminClient
      .from('funeral_homes')
      .select('*, staff_profiles(user_id, full_name, role), cases(count)')
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('subscription_status', statusFilter)
    }

    const { data: homes, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = (homes || []).map((h: any) => {
      const ownerStaff = h.staff_profiles?.find((sp: any) => sp.role === 'owner' || sp.role === 'director')
      return {
        id: h.id,
        name: h.name,
        state: h.state,
        street_address: h.street_address,
        city: h.city,
        zip: h.zip,
        phone: h.phone,
        email: h.email || '—',
        owner_name: ownerStaff?.full_name || 'Owner',
        staff_count: h.staff_profiles?.length || 0,
        case_count: h.cases?.[0]?.count ?? 0,
        subscription_status: h.subscription_status || 'trial',
        subscription_plan: h.subscription_plan || 'starter',
        trial_ends_at: h.trial_ends_at,
        created_at: h.created_at,
      }
    })

    return NextResponse.json({ homes: formatted })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch funeral homes'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
