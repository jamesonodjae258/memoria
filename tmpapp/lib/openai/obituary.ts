import OpenAI from 'openai'
import type { CaseRecord } from '@/types'

const apiKey = process.env.OPENAI_API_KEY || process.env.AGENTROUTER_API_KEY || process.env.OPENROUTER_API_KEY || 'dummy_key_for_dev'
const baseURL = process.env.OPENAI_BASE_URL || process.env.AGENTROUTER_BASE_URL || process.env.OPENROUTER_BASE_URL || undefined
const DEFAULT_MODEL = process.env.OPENAI_MODEL || process.env.AGENTROUTER_MODEL || 'gpt-4o'

const openai = new OpenAI({
  apiKey,
  baseURL: baseURL || undefined,
})

/**
 * Length and tone options for obituary generation.
 * Used by the UI's tone controls on regeneration (Phase 4c).
 */
export type ObituaryLength = 'short' | 'standard' | 'long'
export type ObituaryTone = 'formal' | 'warm'

/**
 * Generate an obituary draft from case intake data.
 *
 * - Temperature 0.7: warmth needed for this kind of writing.
 * - The output is always a draft — it requires staff approval before
 *   it can be shared with the family (enforced in the database status flow).
 * - Never invents facts. Missing fields are omitted gracefully.
 */
export async function generateObituary(
  caseData: CaseRecord,
  options?: {
    length?: ObituaryLength
    tone?: ObituaryTone
  }
): Promise<string> {
  const lengthGuidance = {
    short: 'Length: Keep it brief — approximately 100–150 words.',
    standard: 'Length: 150–250 words unless additional_notes suggest a longer tribute is appropriate.',
    long: 'Length: A fuller tribute — approximately 300–400 words. Draw on every detail the family shared.',
  }

  const toneGuidance = {
    formal: 'Tone: Dignified and formal, befitting a traditional memorial.',
    warm: 'Tone: Respectful, warm, human. Never clinical. Never robotic.',
  }

  const selectedLength = lengthGuidance[options?.length ?? 'standard']
  const selectedTone = toneGuidance[options?.tone ?? 'warm']

  const prompt = `
You are a compassionate writer helping a funeral home draft an obituary.
Use the information below to write a warm, dignified obituary in the third person.
${selectedTone}
${selectedLength}
Do not invent facts. If a field is empty, omit it gracefully — do not make up details.

Deceased: ${caseData.deceased_name}
Date of Birth: ${caseData.date_of_birth ?? 'not provided'}
Date of Death: ${caseData.date_of_death}
Occupation: ${caseData.occupation ?? 'not provided'}
Service Type: ${caseData.service_type ?? 'not provided'}
Family notes / memories: ${caseData.additional_notes ?? 'none provided'}

Write only the obituary text. No preamble. No explanation. No quotation marks.
  `.trim()

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('placeholder')) {
      throw new Error('No valid OpenAI API key configured. Using local template generator.')
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    })

    return response.choices[0].message.content ?? ''
  } catch (error) {
    console.warn('[Obituary AI] OpenAI request failed or unconfigured, using fallback generation:', error)

    const dobFormatted = caseData.date_of_birth
      ? `born on ${new Date(caseData.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      : 'dearly loved'
    const dodFormatted = new Date(caseData.date_of_death).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const occText = caseData.occupation ? ` who served for many years as a ${caseData.occupation}` : ''
    const notesText = caseData.additional_notes ? ` ${caseData.additional_notes}` : ''
    const familyText = caseData.family_contact_name ? ` ${caseData.deceased_name} is fondly remembered by ${caseData.family_contact_name}${caseData.relationship_to_deceased ? ` (${caseData.relationship_to_deceased})` : ''} and a community of relatives and friends.` : ''

    return `${caseData.deceased_name}, ${dobFormatted}, peacefully passed away on ${dodFormatted}.${occText}.${notesText}${familyText} A memorial service will be held at ${caseData.service_location || 'the chapel'} to celebrate a life filled with dignity, love, and cherished memories.`
  }
}

