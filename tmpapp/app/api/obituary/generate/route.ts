import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateObituary, ObituaryLength, ObituaryTone } from '@/lib/openai/obituary'
import { getDemoCaseById } from '@/lib/demo-cases'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { CaseRecord } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'
    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    )

    // 1. Authenticate user or check demo session
    const supabase = createServerSupabaseClient()
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      // Graceful fallback for demo/unconfigured Supabase
    }

    if (!user && !isDemoSession && isConfigured) {
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

    // 2. Fetch case details (from Supabase or demo dataset)
    let caseData: CaseRecord | null = null

    if (user && isConfigured) {
      const serviceClient = createServiceRoleClient()
      const { data, error: caseError } = await serviceClient
        .from('cases')
        .select('*')
        .eq('id', case_id)
        .single()

      if (!caseError && data) {
        caseData = data as CaseRecord
      }
    }

    if (!caseData) {
      caseData = getDemoCaseById(case_id)
    }

    // 3. Call AI engine to generate obituary
    const draftContent = await generateObituary(caseData, {
      length,
      tone,
    })

    // If demo session or unconfigured, return generated draft directly
    if (isDemoSession || !isConfigured || !user) {
      return NextResponse.json(
        {
          document_id: `demo-doc-${case_id}`,
          draft_content: draftContent,
        },
        { status: 200 }
      )
    }

    const serviceClient = createServiceRoleClient()

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
