import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key')

export interface EmailTemplateResult {
  subject: string
  text: string
  html: string
}

/**
 * Template 1: Intake Confirmation
 * Warm, compassionate, explains next steps. Signed with funeral home name.
 */
export function intakeConfirmedTemplate(
  caseName: string,
  funeralHomeName: string
): EmailTemplateResult {
  const subject = `We are here for you — ${caseName}`
  const text = `Dear Family,

Thank you for trusting us with the arrangements for ${caseName}. We know how heavy these moments are, and we want to assure you that our entire staff is here to guide and support you through every step.

Over the next few days, we will help gather necessary details, prepare paperwork, and assist in honoring ${caseName}'s memory with dignity and care.

Please take all the time you need. If you have any immediate questions or thoughts, you can reach us at any time.

With warmth and respect,
${funeralHomeName}`

  const html = `
    <div font-family: sans-serif; color: #2A1F1B; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border-top: 3px solid #A8935D;">
      <h2 style="font-size: 20px; font-weight: 500; color: #2A1F1B; margin-bottom: 16px;">We are here for you</h2>
      <p style="margin-bottom: 16px;">Dear Family,</p>
      <p style="margin-bottom: 16px;">Thank you for trusting us with the arrangements for <strong>${caseName}</strong>. We know how heavy these moments are, and we want to assure you that our entire staff is here to guide and support you through every step.</p>
      <p style="margin-bottom: 16px;">Over the next few days, we will help gather necessary details, prepare paperwork, and assist in honoring ${caseName}'s memory with dignity and care.</p>
      <p style="margin-bottom: 24px;">Please take all the time you need. If you have any immediate questions or thoughts, you can reach us at any time.</p>
      <p style="margin-bottom: 4px;">With warmth and respect,</p>
      <p style="font-weight: 600; color: #2A1F1B; margin-top: 0;">${funeralHomeName}</p>
    </div>
  `

  return { subject, text, html }
}

/**
 * Template 2: Obituary Ready for Review
 * Gentle nudge that the draft is ready for family review.
 */
export function obituaryReadyTemplate(
  caseName: string,
  funeralHomeName: string
): EmailTemplateResult {
  const subject = `A draft of ${caseName}'s obituary is ready for your review`
  const text = `Dear Family,

We have prepared a initial draft of the obituary for ${caseName}. When you feel ready, please take a moment to review it.

You can share any edits, additions, or personal memories you would like us to include. There is no rush — we want to make sure every word reflects ${caseName}'s life exactly as your family wishes.

Warmly,
${funeralHomeName}`

  const html = `
    <div style="font-family: sans-serif; color: #2A1F1B; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border-top: 3px solid #A8935D;">
      <h2 style="font-size: 20px; font-weight: 500; color: #2A1F1B; margin-bottom: 16px;">Obituary Draft Ready for Review</h2>
      <p style="margin-bottom: 16px;">Dear Family,</p>
      <p style="margin-bottom: 16px;">We have prepared an initial draft of the obituary for <strong>${caseName}</strong>. When you feel ready, please take a moment to review it.</p>
      <p style="margin-bottom: 24px;">You can share any edits, additions, or personal memories you would like us to include. There is no rush — we want to make sure every word reflects ${caseName}'s life exactly as your family wishes.</p>
      <p style="margin-bottom: 4px;">Warmly,</p>
      <p style="font-weight: 600; color: #2A1F1B; margin-top: 0;">${funeralHomeName}</p>
    </div>
  `

  return { subject, text, html }
}

/**
 * Template 3: Service Confirmed
 * Service details summary.
 */
export function serviceConfirmedTemplate(
  caseName: string,
  serviceDate: string,
  serviceLocation: string,
  funeralHomeName: string
): EmailTemplateResult {
  const subject = `Confirmed service details for ${caseName}`
  const text = `Dear Family,

We are writing to confirm the arrangements for ${caseName}'s service:

Date & Time: ${serviceDate}
Location: ${serviceLocation}

We are taking care of all necessary preparations so that the service runs peacefully and smoothly. Please let us know if any details need adjustment.

With sincere care,
${funeralHomeName}`

  const html = `
    <div style="font-family: sans-serif; color: #2A1F1B; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border-top: 3px solid #A8935D;">
      <h2 style="font-size: 20px; font-weight: 500; color: #2A1F1B; margin-bottom: 16px;">Service Details Confirmed</h2>
      <p style="margin-bottom: 16px;">Dear Family,</p>
      <p style="margin-bottom: 16px;">We are writing to confirm the arrangements for <strong>${caseName}</strong>'s service:</p>
      <div style="background-color: #F5F4F1; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong>Date &amp; Time:</strong> ${serviceDate}</p>
        <p style="margin: 0;"><strong>Location:</strong> ${serviceLocation}</p>
      </div>
      <p style="margin-bottom: 24px;">We are taking care of all necessary preparations so that the service runs peacefully and smoothly. Please let us know if any details need adjustment.</p>
      <p style="margin-bottom: 4px;">With sincere care,</p>
      <p style="font-weight: 600; color: #2A1F1B; margin-top: 0;">${funeralHomeName}</p>
    </div>
  `

  return { subject, text, html }
}

/**
 * Send email using Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  if (!process.env.RESEND_API_KEY) {
    // Return mock success if API key is not configured
    return {
      success: true,
      id: `mock_email_${Date.now()}`,
      note: 'Resend API key not configured — simulated send.',
    }
  }

  const response = await resend.emails.send({
    from: 'Funeral Home <onboarding@resend.dev>',
    to: [to],
    subject,
    html,
    text,
  })

  if (response.error) {
    throw new Error(response.error.message || 'Failed to send email via Resend')
  }

  return {
    success: true,
    id: response.data?.id,
  }
}
