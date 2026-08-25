import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { PaperworkSummary } from '@/lib/openai/paperwork'

export interface PDFGenerationResult {
  pdfUrl: string
  missingFields: string[]
  paperworkData: PaperworkSummary
}

/**
 * Generates a pre-filled compliance PDF document using pdf-lib,
 * highlights missing fields in red/orange, uploads to Supabase Storage ('documents' bucket),
 * and returns the public URL and missing fields.
 */
export async function generateCompliancePDF(
  caseId: string,
  summaryJsonString: string,
  formTitle?: string,
  stateName?: string
): Promise<PDFGenerationResult> {
  // Parse JSON from 5a
  let data: any
  try {
    // Strip markdown code fences if model returned ```json ... ```
    const cleanedJson = summaryJsonString
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '')
      .trim()
    data = JSON.parse(cleanedJson)
  } catch {
    data = {
      full_legal_name: '',
      date_of_birth: '',
      date_of_death: '',
      place_of_death: '',
      occupation: '',
      next_of_kin_name: '',
      next_of_kin_relationship: '',
      next_of_kin_contact: '',
      service_type: '',
      service_date: '',
      missing_fields: ['Failed to parse structured paperwork data'],
    }
  }

  const missingFieldsSet = new Set(
    (data.missing_fields || []).map((f: string) => f.toLowerCase())
  )

  // Create PDF Document
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Standard Letter (8.5 x 11 inches)
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Colors
  const walnutDark = rgb(0.16, 0.12, 0.1) // #2A1F1B
  const brassColor = rgb(0.66, 0.58, 0.36) // #A8935D
  const grayText = rgb(0.4, 0.4, 0.4)
  const alertRed = rgb(0.85, 0.2, 0.2) // Highlight for missing fields
  const alertBg = rgb(0.98, 0.92, 0.92)

  let y = height - 50

  // Header
  const titleText = formTitle ? formTitle.toUpperCase() : 'FUNERAL HOME COMPLIANCE & INTAKE RECORD'
  page.drawText(titleText.substring(0, 50), {
    x: 50,
    y,
    size: 14,
    font: fontBold,
    color: walnutDark,
  })

  if (stateName) {
    page.drawText(`Jurisdiction: ${stateName.toUpperCase()}`, {
      x: width - 220,
      y,
      size: 10,
      font: fontBold,
      color: brassColor,
    })
  }

  y -= 8
  // Brass accent line
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: brassColor,
  })


  y -= 25
  page.drawText(`Generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`, {
    x: 50,
    y,
    size: 9,
    font: fontRegular,
    color: grayText,
  })

  // Missing Fields Banner if any
  if (data.missing_fields && data.missing_fields.length > 0) {
    y -= 35
    const bannerHeight = Math.max(30, 15 + data.missing_fields.length * 12)
    page.drawRectangle({
      x: 50,
      y: y - bannerHeight + 15,
      width: width - 100,
      height: bannerHeight,
      color: alertBg,
      borderColor: alertRed,
      borderWidth: 1,
    })

    page.drawText('ATTENTION: MISSING REQUIRED COMPLIANCE FIELDS', {
      x: 60,
      y: y,
      size: 10,
      font: fontBold,
      color: alertRed,
    })

    y -= 14
    page.drawText(
      `The following fields require manual staff completion: ${data.missing_fields.join(', ')}`,
      {
        x: 60,
        y,
        size: 9,
        font: fontRegular,
        color: alertRed,
      }
    )
    y -= (bannerHeight - 20)
  } else {
    y -= 15
  }

  // Field sections
  const sections: {
    title: string
    fields: { label: string; key: keyof PaperworkSummary; value: string }[]
  }[] = [
    {
      title: 'DECEASED INDIVIDUAL INFORMATION',
      fields: [
        { label: 'Full Legal Name', key: 'full_legal_name', value: data.full_legal_name },
        { label: 'Date of Birth', key: 'date_of_birth', value: data.date_of_birth },
        { label: 'Date of Passing', key: 'date_of_death', value: data.date_of_death },
        { label: 'Place of Passing', key: 'place_of_death', value: data.place_of_death },
        { label: 'Occupation', key: 'occupation', value: data.occupation },
      ],
    },
    {
      title: 'NEXT OF KIN / INFORMANT INFORMATION',
      fields: [
        { label: 'Next of Kin Name', key: 'next_of_kin_name', value: data.next_of_kin_name },
        { label: 'Relationship', key: 'next_of_kin_relationship', value: data.next_of_kin_relationship },
        { label: 'Contact Details', key: 'next_of_kin_contact', value: data.next_of_kin_contact },
      ],
    },
    {
      title: 'ARRANGEMENT & SERVICE DETAILS',
      fields: [
        { label: 'Service Type', key: 'service_type', value: data.service_type },
        { label: 'Service Date', key: 'service_date', value: data.service_date },
      ],
    },
  ]

  for (const section of sections) {
    y -= 25
    page.drawText(section.title, {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: walnutDark,
    })

    y -= 6
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 0.5,
      color: grayText,
    })

    y -= 18

    for (const field of section.fields) {
      const isMissing =
        !field.value ||
        field.value.trim() === '' ||
        field.value.toLowerCase().includes('not provided') ||
        field.value.toLowerCase().includes('missing') ||
        missingFieldsSet.has(field.key.toLowerCase()) ||
        missingFieldsSet.has(field.label.toLowerCase())

      const displayVal = isMissing ? '[ MISSING - Action Required ]' : field.value

      page.drawText(`${field.label}:`, {
        x: 60,
        y,
        size: 9.5,
        font: fontBold,
        color: isMissing ? alertRed : walnutDark,
      })

      page.drawText(displayVal, {
        x: 210,
        y,
        size: 9.5,
        font: isMissing ? fontBold : fontRegular,
        color: isMissing ? alertRed : walnutDark,
      })

      if (isMissing) {
        // Draw warning box around missing value
        page.drawRectangle({
          x: 205,
          y: y - 3,
          width: 250,
          height: 14,
          borderColor: alertRed,
          borderWidth: 0.8,
        })
      }

      y -= 18
    }
  }

  // Footer Signoff section
  y -= 30
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: walnutDark,
  })

  y -= 25
  page.drawText('STAFF VERIFICATION & APPROVAL', {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: walnutDark,
  })

  y -= 25
  page.drawText('Staff Signature: ___________________________    Date: _______________', {
    x: 50,
    y,
    size: 9.5,
    font: fontRegular,
    color: walnutDark,
  })

  // Output PDF bytes
  const pdfBytes = await pdfDoc.save()

  // Upload to Supabase Storage
  const supabaseService = createServiceRoleClient()
  const fileName = `case_${caseId}_compliance_${Date.now()}.pdf`

  const { error: uploadError } = await supabaseService.storage
    .from('documents')
    .upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    })

  let publicUrl = ''

  if (uploadError) {
    // If storage bucket is not configured yet, fallback to data URI or public path placeholder
    console.error('Supabase Storage upload error:', uploadError)
    publicUrl = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`
  } else {
    const { data: urlData } = supabaseService.storage
      .from('documents')
      .getPublicUrl(fileName)
    publicUrl = urlData.publicUrl
  }

  return {
    pdfUrl: publicUrl,
    missingFields: data.missing_fields || [],
    paperworkData: data,
  }
}
