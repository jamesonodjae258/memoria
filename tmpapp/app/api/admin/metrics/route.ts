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

  const adminClient = createServiceRoleClient()

  try {
    const { data: homes, error } = await adminClient
      .from('funeral_homes')
      .select('id, name, subscription_status, subscription_plan, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const allHomes = homes || []
    const totalHomes = allHomes.length

    const activeTrials = allHomes.filter((h) => h.subscription_status === 'trial').length
    const activePaid = allHomes.filter((h) => h.subscription_status === 'active').length
    const pastDue = allHomes.filter((h) => h.subscription_status === 'past_due').length
    const cancelled = allHomes.filter((h) => h.subscription_status === 'cancelled').length

    // MRR calculation based on active plans
    // Pricing: starter=$399, growth=$599, enterprise=$999
    const planPrices: Record<string, number> = {
      starter: 399,
      growth: 599,
      enterprise: 999,
    }

    const estimatedMRR = allHomes
      .filter((h) => h.subscription_status === 'active')
      .reduce((sum, h) => {
        const plan = (h.subscription_plan || 'starter').toLowerCase()
        return sum + (planPrices[plan] || 399)
      }, 0)

    // Also get total states & total templates count
    const { count: totalStates } = await adminClient
      .from('states')
      .select('id', { count: 'exact', head: true })

    const { count: totalTemplates } = await adminClient
      .from('compliance_templates')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      metrics: {
        totalHomes,
        activeTrials,
        activePaid,
        pastDue,
        cancelled,
        estimatedMRR,
        totalStates: totalStates ?? 0,
        totalTemplates: totalTemplates ?? 0,
      },
      recentHomes: allHomes.slice(0, 5),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to compute metrics'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
