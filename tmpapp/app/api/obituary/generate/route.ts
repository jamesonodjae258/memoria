import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateObituary, ObituaryLength, ObituaryTone } from '@/lib/openai/obituary'
import { NextRequest, NextResponse } from 'next/server'
import type { CaseRecord } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to generate an obituary.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { case_id, length, tone } = body as {
      case_id: string
      length?: ObituaryLength
      tone?: ObituaryTone
    }

    if (!case_id) {
      return NextResponse.json(
        { error: 'case_id is required.' },
        { status: 400 }
      )
    }

    // 2. Fetch case details server-side using service role
    const serviceClient = createServiceRoleClient()
    const { data: caseData, error: caseError } = await serviceClient
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found.' },
        { status: 404 }
      )
    }

    // 3. Call OpenAI to generate obituary
    const draftContent = await generateObituary(caseData as CaseRecord, {
      length,
      tone,
    })

    // 4. Check if an obituary document already exists for this case
    const { data: existingDoc } = await serviceClient
      .from('documents')
      .select('id, version')
      .eq('case_id', case_id)
      .eq('type', 'obituary')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    let docId: string

    if (existingDoc) {
      // Update existing draft or create new version
      const { data: updatedDoc, error: updateError } = await serviceClient
        .from('documents')
        .update({
          draft_content: draftContent,
          status: 'draft',
          version: (existingDoc.version || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDoc.id)
        .select('id')
        .single()

      if (updateError || !updatedDoc) {
        return NextResponse.json(
          { error: 'Failed to update obituary document.' },
          { status: 500 }
        )
      }
      docId = updatedDoc.id
    } else {
      // Insert new document record
      const { data: newDoc, error: insertError } = await serviceClient
        .from('documents')
        .insert({
          case_id,
          type: 'obituary',
          title: `Obituary - ${caseData.deceased_name}`,
          draft_content: draftContent,
          status: 'draft',
          version: 1,
        })
        .select('id')
        .single()

      if (insertError || !newDoc) {
        return NextResponse.json(
          { error: 'Failed to save obituary document.' },
          { status: 500 }
        )
      }
      docId = newDoc.id
    }

    return NextResponse.json(
      {
        document_id: docId,
        draft_content: draftContent,
      },
      { status: 200 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate obituary'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
