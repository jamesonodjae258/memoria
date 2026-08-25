import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Helper to check super admin authorization
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

// GET: Fetch states with compliance template counts
export async function GET(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  const adminClient = createServiceRoleClient()
  try {
    const { data: states, error } = await adminClient
      .from('states')
      .select('*, compliance_templates(count)')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = (states || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      abbreviation: s.abbreviation,
      is_active: s.is_active,
      created_at: s.created_at,
      template_count: s.compliance_templates?.[0]?.count ?? 0,
    }))

    return NextResponse.json({ states: formatted })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch states'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST: Add new state
export async function POST(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, abbreviation, is_active = true } = body

    if (!name?.trim() || !abbreviation?.trim()) {
      return NextResponse.json(
        { error: 'State name and 2-letter abbreviation are required.' },
        { status: 400 }
      )
    }

    const abbr = abbreviation.trim().toUpperCase()
    if (abbr.length !== 2) {
      return NextResponse.json(
        { error: 'Abbreviation must be exactly 2 characters (e.g. TX, NY).' },
        { status: 400 }
      )
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('states')
      .insert({
        name: name.trim(),
        abbreviation: abbr,
        is_active: Boolean(is_active),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, state: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create state'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH: Update / toggle is_active
export async function PATCH(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, is_active, name, abbreviation } = body

    if (!id) {
      return NextResponse.json({ error: 'State ID is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const updates: any = {}
    if (typeof is_active === 'boolean') updates.is_active = is_active
    if (name) updates.name = name.trim()
    if (abbreviation) updates.abbreviation = abbreviation.trim().toUpperCase()

    const { data, error } = await adminClient
      .from('states')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, state: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update state'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE: Delete state (blocked if templates exist)
export async function DELETE(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'State ID is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()

    // 1. Check if templates exist for this state
    const { count, error: countErr } = await adminClient
      .from('compliance_templates')
      .select('id', { count: 'exact', head: true })
      .eq('state_id', id)

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 })
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete state: ${count} compliance template(s) are attached to this state. Deactivate the state or delete its templates first.`,
        },
        { status: 400 }
      )
    }

    // 2. Delete state
    const { error: deleteErr } = await adminClient.from('states').delete().eq('id', id)
    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete state'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
