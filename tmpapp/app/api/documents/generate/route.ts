import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generatePaperworkSummary } from '@/lib/openai/paperwork'
import { generateCompliancePDF } from '@/lib/pdf/generate-document'
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
        { error: 'You must be signed in to generate paperwork.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { case_id } = body as { case_id: string }

    if (!case_id) {
      return NextResponse.json(
        { error: 'case_id is required.' },
        { status: 400 }
      )
    }

    // 2. Fetch case data
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

    // 3. Call 5a: generatePaperworkSummary()
    const summaryJsonString = await generatePaperworkSummary(caseData as CaseRecord)

    // 4. Call 5b: generateCompliancePDF()
    const pdfResult = await generateCompliancePDF(case_id, summaryJsonString)

    // 5. Insert document record into `documents` table
    const { data: docRecord, error: insertError } = await serviceClient
      .from('documents')
      .insert({
        case_id,
        type: 'compliance_form',
        title: `Compliance Form - ${caseData.deceased_name}`,
        draft_content: summaryJsonString,
        pdf_url: pdfResult.pdfUrl,
        status: 'draft',
        version: 1,
      })
      .select('*')
      .single()

    if (insertError || !docRecord) {
      return NextResponse.json(
        { error: 'Failed to record document in database.' },
        { status: 500 }
      )
    }

    // Update case status to documents_pending if currently intake
    if (caseData.status === 'intake') {
      await serviceClient
        .from('cases')
        .update({ status: 'documents_pending', updated_at: new Date().toISOString() })
        .eq('id', case_id)
    }

    return NextResponse.json(
      {
        document: docRecord,
        pdf_url: pdfResult.pdfUrl,
        missing_fields: pdfResult.missingFields,
        paperwork_data: pdfResult.paperworkData,
      },
      { status: 200 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Paperwork generation failed.'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
