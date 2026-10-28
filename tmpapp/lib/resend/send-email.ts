import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// The verified sending domain for Memoria
// Using resend's default onboarding address until custom domain is verified
// Replace MEMORIA_SENDING_EMAIL in .env once domain is verified
const SENDING_EMAIL = process.env.MEMORIA_SENDING_EMAIL ?? 'onboarding@resend.dev'

interface SendEmailParams {
  to: string                 // family's email address
  subject: string
  html: string
  funeralHomeName: string    // used as the display name in From field
  funeralHomeReplyTo: string // funeral home's contact_email - families reply here
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, funeralHomeName, funeralHomeReplyTo } = params

  // Validate that we have the required fields before attempting send
  if (!to || !funeralHomeReplyTo) {
    return {
      success: false,
      error: 'Missing recipient email or funeral home contact email'
    }
  }

  try {
    const result = await resend.emails.send({
      // Family sees the funeral home name, not "Memoria"
      from: `${funeralHomeName} <${SENDING_EMAIL}>`,
      to: [to],
      // Critical: families reply to the funeral home's actual email
      // not to Memoria's sending address
      replyTo: funeralHomeReplyTo,
      subject,
      html,
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    return { success: false, error: message }
  }
}
