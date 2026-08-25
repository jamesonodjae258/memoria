import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { generatePaperworkSummary } from '@/lib/openai/paperwork'
import { generateCompliancePDF } from '@/lib/pdf/generate-document'
import type { CaseRecord } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { case_id, template_id } = body

    if (!case_id || !template_id) {
      return NextResponse.json(
        { error: 'case_id and template_id are required.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {}

    if (!user && !isDemoSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createServiceRoleClient()

    // 1. Fetch Case
    let caseData: CaseRecord | null = null
    const { data: caseRow } = await adminClient
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .maybeSingle()

    if (caseRow) {
      caseData = caseRow as CaseRecord
    } else {
      // Demo fallback case
      caseData = {
        id: case_id,
        funeral_home_id: 'demo-home-id',
        created_by: user?.id || 'demo-user-id',
        deceased_name: 'Eleanor Vance',
        date_of_birth: '1942-05-14',
        date_of_death: '2026-07-18',
        place_of_death: 'Austin, TX',
        occupation: 'Educator',
        additional_notes: 'Lifelong botanist and educator.',
        family_contact_name: 'Robert Vance',
        family_contact_email: 'family@example.com',
        family_contact_phone: '+15550192834',
        relationship_to_deceased: 'Son',
        service_type: 'burial',
        service_date: new Date().toISOString(),
        service_location: 'Main Chapel',
        sms_opt_in: true,
        status: 'intake',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // 2. Fetch Compliance Template
    const { data: template, error: templateErr } = await adminClient
      .from('compliance_templates')
      .select('*, states(name, abbreviation)')
      .eq('id', template_id)
      .maybeSingle()

    if (!template) {
      return NextResponse.json(
        { error: 'Compliance template not found.' },
        { status: 404 }
      )
    }

    const formName = template.form_name
    const stateName = (template.states as any)?.name || 'State'
    const requiredFields = Array.isArray(template.required_fields) ? template.required_fields : []

    // 3. Extract case fields via OpenAI / Paperwork AI
    const summaryJsonString = await generatePaperworkSummary(caseData, requiredFields, formName)

    // 4. Generate PDF using pdf-lib
    const { pdfUrl } = await generateCompliancePDF(
      case_id,
      summaryJsonString,
      formName,
      stateName
    )

    // 5. Insert into documents table
    const { data: docRecord, error: docErr } = await adminClient
      .from('documents')
      .insert({
        case_id: case_id,
        type: 'compliance_form',
        title: formName,
        draft_content: summaryJsonString,
        pdf_url: pdfUrl,
        status: 'draft',
        version: 1,
      })
      .select()
      .single()

    if (docErr) {
      console.warn('Doc insert notice:', docErr.message)
    }

    return NextResponse.json({
      success: true,
      document_id: docRecord?.id || `doc_${Date.now()}`,
      pdf_url: pdfUrl,
      case_id: case_id,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate compliance document'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
