import { sendEmail } from '../send-email'

interface ServiceConfirmedParams {
  to: string
  familyContactName: string
  deceasedName: string
  funeralHomeName: string
  funeralHomeReplyTo: string
  funeralHomePhone?: string
  serviceDate: string // pre-formatted: "September 2, 2026 at 8:35 PM"
  serviceLocation: string
  serviceType: string // "Burial" or "Cremation" or "Memorial Service"
}

export async function sendServiceConfirmed(params: ServiceConfirmedParams) {
  const {
    to,
    familyContactName,
    deceasedName,
    funeralHomeName,
    funeralHomeReplyTo,
    funeralHomePhone,
    serviceDate,
    serviceLocation,
    serviceType,
  } = params

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #1A1817; line-height: 1.7;">
      <p style="font-size: 15px; margin-bottom: 24px;">
        Dear ${familyContactName},
      </p>
      <p style="font-size: 15px; margin-bottom: 28px;">
        The arrangements for ${deceasedName} have been confirmed. Here is a summary of the service details:
      </p>

      <div style="background: #F8F6F2; border-left: 3px solid #6B8F6E; border-radius: 4px; padding: 20px 24px; margin-bottom: 28px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-size: 13px; color: #7A766F; padding: 6px 0; font-family: sans-serif; width: 140px;">Service type</td>
            <td style="font-size: 14px; color: #1A1817; padding: 6px 0; font-weight: 500;">${serviceType}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #7A766F; padding: 6px 0; font-family: sans-serif;">Date and time</td>
            <td style="font-size: 14px; color: #1A1817; padding: 6px 0; font-weight: 500;">${serviceDate}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #7A766F; padding: 6px 0; font-family: sans-serif;">Location</td>
            <td style="font-size: 14px; color: #1A1817; padding: 6px 0; font-weight: 500;">${serviceLocation}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 15px; margin-bottom: 20px;">
        If you have any questions before the service, please do not hesitate to reach out. ${
          funeralHomePhone
            ? `You can call us at <strong>${funeralHomePhone}</strong> or reply to this email.`
            : `Simply reply to this email and we will respond promptly.`
        }
      </p>

      <p style="font-size: 15px; color: #7A766F;">
        With care,<br />
        <strong style="color: #1A1817;">${funeralHomeName}</strong>
      </p>
      <hr style="border: none; border-top: 1px solid #E6E1D8; margin: 32px 0;" />
      <p style="font-size: 12px; color: #B0A090; line-height: 1.6;">
        This message was sent on behalf of ${funeralHomeName}. Replying to this email goes directly to the funeral home team.
      </p>
    </div>
  `

  return sendEmail({
    to,
    subject: `Service details confirmed - ${deceasedName}`,
    html,
    funeralHomeName,
    funeralHomeReplyTo,
  })
}
