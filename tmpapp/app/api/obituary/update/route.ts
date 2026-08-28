import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'
    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    )

    const supabase = createServerSupabaseClient()
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      // Graceful fallback
    }

    if (!user && !isDemoSession && isConfigured) {
      return NextResponse.json(
        { error: 'You must be signed in.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { document_id, draft_content, status } = body as {
      document_id: string
      draft_content?: string
      status?: 'draft' | 'pending_staff_review' | 'pending_family_review' | 'approved' | 'finalized'
    }

    if (!document_id) {
      return NextResponse.json(
        { error: 'document_id is required.' },
        { status: 400 }
      )
    }

    if (isDemoSession || !isConfigured || !user) {
      return NextResponse.json({
        document: {
          id: document_id,
          case_id: 'test_case_demo',
          type: 'obituary',
          draft_content: draft_content || '',
          status: status || 'draft',
          version: 1,
          updated_at: new Date().toISOString(),
        },
      })
    }

    const serviceClient = createServiceRoleClient()

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (draft_content !== undefined) {
      updatePayload.draft_content = draft_content
    }

    if (status) {
      updatePayload.status = status
      updatePayload.reviewed_by = user.id
      updatePayload.reviewed_at = new Date().toISOString()
    }

    const { data: updatedDoc, error: updateError } = await serviceClient
      .from('documents')
      .update(updatePayload)
      .eq('id', document_id)
      .select('*')
      .single()

    if (updateError || !updatedDoc) {
      return NextResponse.json(
        { error: 'Failed to update document.' },
        { status: 500 }
      )
    }

    // Also update case status if document is approved / pending family review
    if (status === 'pending_family_review') {
      await serviceClient
        .from('cases')
        .update({ status: 'family_review', updated_at: new Date().toISOString() })
        .eq('id', updatedDoc.case_id)
    }

    return NextResponse.json({ document: updatedDoc })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong while updating the document.' },
      { status: 500 }
    )
  }
}
