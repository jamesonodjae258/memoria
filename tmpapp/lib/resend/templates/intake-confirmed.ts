import { sendEmail } from '../send-email'

interface IntakeConfirmedParams {
  to: string
  familyContactName: string
  deceasedName: string
  funeralHomeName: string
  funeralHomeReplyTo: string
  funeralHomePhone?: string
}

export async function sendIntakeConfirmed(params: IntakeConfirmedParams) {
  const {
    to,
    familyContactName,
    deceasedName,
    funeralHomeName,
    funeralHomeReplyTo,
    funeralHomePhone,
  } = params

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #1A1817; line-height: 1.7;">
      <p style="font-size: 15px; margin-bottom: 24px;">
        Dear ${familyContactName},
      </p>
      <p style="font-size: 15px; margin-bottom: 20px;">
        Thank you for trusting ${funeralHomeName} during this time. We have received all the information needed to begin arrangements for ${deceasedName}, and our team is already at work.
      </p>
      <p style="font-size: 15px; margin-bottom: 20px;">
        We will be in touch shortly with the next steps. In the meantime, please do not hesitate to reach out if you have any questions or if there is anything at all we can help with.
      </p>
      ${
        funeralHomePhone
          ? `
        <p style="font-size: 15px; margin-bottom: 32px;">
          You can reach us directly at <strong>${funeralHomePhone}</strong>, or simply reply to this email.
        </p>
      `
          : `
        <p style="font-size: 15px; margin-bottom: 32px;">
          Simply reply to this email and we will get back to you promptly.
        </p>
      `
      }
      <p style="font-size: 15px; color: #7A766F;">
        With care,<br />
        <strong style="color: #1A1817;">${funeralHomeName}</strong>
      </p>
      <hr style="border: none; border-top: 1px solid #E6E1D8; margin: 32px 0;" />
      <p style="font-size: 12px; color: #B0A090; line-height: 1.6;">
        This message was sent on behalf of ${funeralHomeName}. To reply, simply respond to this email - your message will go directly to the funeral home team.
      </p>
    </div>
  `

  return sendEmail({
    to,
    subject: `We have received your information - ${funeralHomeName}`,
    html,
    funeralHomeName,
    funeralHomeReplyTo,
  })
}
