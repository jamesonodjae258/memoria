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

// GET: List compliance templates (optional ?state_id=...)
export async function GET(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const stateId = searchParams.get('state_id')
  const templateId = searchParams.get('id')

  const adminClient = createServiceRoleClient()
  try {
    let query = adminClient
      .from('compliance_templates')
      .select('*, states(id, name, abbreviation)')
      .order('created_at', { ascending: false })

    if (templateId) {
      query = query.eq('id', templateId)
      const { data, error } = await query.maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ template: data })
    }

    if (stateId && stateId !== 'all') {
      query = query.eq('state_id', stateId)
    }

    const { data: templates, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch compliance templates'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST: Create new compliance template
export async function POST(request: NextRequest) {
  const { isAuthorized, userId } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      state_id,
      form_name,
      description,
      is_required = true,
      template_pdf_url,
      required_fields = [],
      is_active = true,
    } = body

    if (!state_id || !form_name?.trim()) {
      return NextResponse.json(
        { error: 'State and Form Name are required.' },
        { status: 400 }
      )
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('compliance_templates')
      .insert({
        state_id,
        form_name: form_name.trim(),
        description: description?.trim() || null,
        is_required: Boolean(is_required),
        template_pdf_url: template_pdf_url?.trim() || null,
        required_fields: Array.isArray(required_fields) ? required_fields : [],
        is_active: Boolean(is_active),
        created_by: userId !== 'demo-admin-id' ? userId : null,
      })
      .select('*, states(id, name, abbreviation)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, template: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create template'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH: Update compliance template
export async function PATCH(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, state_id, form_name, description, is_required, template_pdf_url, required_fields, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const updates: any = { updated_at: new Date().toISOString() }

    if (state_id) updates.state_id = state_id
    if (form_name) updates.form_name = form_name.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (typeof is_required === 'boolean') updates.is_required = is_required
    if (template_pdf_url !== undefined) updates.template_pdf_url = template_pdf_url?.trim() || null
    if (Array.isArray(required_fields)) updates.required_fields = required_fields
    if (typeof is_active === 'boolean') updates.is_active = is_active

    const { data, error } = await adminClient
      .from('compliance_templates')
      .update(updates)
      .eq('id', id)
      .select('*, states(id, name, abbreviation)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, template: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update template'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE: Remove compliance template
export async function DELETE(request: NextRequest) {
  const { isAuthorized } = await verifySuperAdmin(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin only' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { error } = await adminClient.from('compliance_templates').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete template'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
