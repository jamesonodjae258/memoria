import OpenAI from 'openai'
import type { CaseRecord } from '@/types'

const apiKey = process.env.OPENAI_API_KEY || process.env.AGENTROUTER_API_KEY || process.env.OPENROUTER_API_KEY || 'dummy_key_for_dev'
const baseURL = process.env.OPENAI_BASE_URL || process.env.AGENTROUTER_BASE_URL || process.env.OPENROUTER_BASE_URL || undefined
const DEFAULT_MODEL = process.env.OPENAI_MODEL || process.env.AGENTROUTER_MODEL || 'gpt-4o'

const openai = new OpenAI({
  apiKey,
  baseURL: baseURL || undefined,
})

export interface PaperworkSummary {
  full_legal_name: string
  date_of_birth: string
  date_of_death: string
  place_of_death: string
  occupation: string
  next_of_kin_name: string
  next_of_kin_relationship: string
  next_of_kin_contact: string
  service_type: string
  service_date: string
  missing_fields: string[]
}

/**
 * Fallback extractor when AI provider is unreachable or unconfigured
 */
function extractFallbackPaperwork(caseData: CaseRecord): PaperworkSummary {
  const missing: string[] = []

  const check = (val?: string | null, name?: string) => {
    if (!val || val.trim() === '' || val.toLowerCase().includes('not provided')) {
      if (name) missing.push(name)
      return ''
    }
    return val
  }

  const full_legal_name = check(caseData.deceased_name, 'Full Legal Name')
  const date_of_birth = check(caseData.date_of_birth, 'Date of Birth')
  const date_of_death = check(caseData.date_of_death, 'Date of Death')
  const place_of_death = check(caseData.place_of_death, 'Place of Death')
  const occupation = check(caseData.occupation, 'Occupation')
  const next_of_kin_name = check(caseData.family_contact_name, 'Next of Kin Name')
  const next_of_kin_relationship = check(caseData.relationship_to_deceased, 'Next of Kin Relationship')
  const next_of_kin_contact = check(caseData.family_contact_phone || caseData.family_contact_email, 'Next of Kin Contact')
  const service_type = check(caseData.service_type, 'Service Type')
  const service_date = check(caseData.service_date, 'Service Date')

  return {
    full_legal_name,
    date_of_birth,
    date_of_death,
    place_of_death,
    occupation,
    next_of_kin_name,
    next_of_kin_relationship,
    next_of_kin_contact,
    service_type,
    service_date,
    missing_fields: missing,
  }
}

/**
 * Extract and organize compliance paperwork fields from case intake data.
 * Supports custom fields defined on state compliance templates.
 */
export async function generatePaperworkSummary(
  caseData: CaseRecord,
  customFields?: string[],
  formName?: string
): Promise<string> {
  const fieldsToExtract =
    customFields && customFields.length > 0
      ? customFields
      : [
          'full_legal_name',
          'date_of_birth',
          'date_of_death',
          'place_of_death',
          'occupation',
          'next_of_kin_name',
          'next_of_kin_relationship',
          'next_of_kin_contact',
          'service_type',
          'service_date',
        ]

  const fieldsTemplate: Record<string, string> = {}
  fieldsToExtract.forEach((f) => {
    fieldsTemplate[f] = ''
  })

  const prompt = `
You are an administrative assistant helping a funeral home pre-fill official compliance paperwork (${formName || 'State Compliance Form'}).
Extract and organize the requested fields from the case data below.
Output ONLY a valid JSON object matching the template — no explanation, no markdown, no extra text.

Template structure:
${JSON.stringify({ ...fieldsTemplate, missing_fields: [] }, null, 2)}

Case data:
${JSON.stringify(caseData, null, 2)}
  `.trim()

  try {
    if (!apiKey || apiKey === 'dummy_key_for_dev' || apiKey.includes('placeholder')) {
      throw new Error('No valid AI API key provided.')
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 600,
    })

    const raw = response.choices[0].message.content ?? '{}'
    return raw
  } catch (error) {
    console.warn('[Paperwork AI] Provider request failed, using structured case fallback:', error)
    
    // Build structured fallback
    const fallback: Record<string, any> = { ...extractFallbackPaperwork(caseData) }
    const missing: string[] = []

    fieldsToExtract.forEach((fieldKey) => {
      if (!fallback[fieldKey]) {
        // Map common field names
        if (fieldKey.includes('deceased') || fieldKey.includes('name')) {
          fallback[fieldKey] = caseData.deceased_name || ''
        } else if (fieldKey.includes('death') && fieldKey.includes('date')) {
          fallback[fieldKey] = caseData.date_of_death || ''
        } else if (fieldKey.includes('birth') || fieldKey.includes('dob')) {
          fallback[fieldKey] = caseData.date_of_birth || ''
        } else if (fieldKey.includes('place') || fieldKey.includes('location')) {
          fallback[fieldKey] = caseData.place_of_death || caseData.service_location || ''
        } else if (fieldKey.includes('kin') || fieldKey.includes('contact') || fieldKey.includes('informant')) {
          fallback[fieldKey] = caseData.family_contact_name || ''
        } else {
          fallback[fieldKey] = ''
          missing.push(fieldKey.replace(/_/g, ' '))
        }
      }
    })

    fallback.missing_fields = missing
    return JSON.stringify(fallback)
  }
}


