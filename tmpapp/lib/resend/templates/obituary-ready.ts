import { sendEmail } from '../send-email'

interface ObituaryReadyParams {
  to: string
  familyContactName: string
  deceasedName: string
  funeralHomeName: string
  funeralHomeReplyTo: string
  reviewUrl?: string // optional direct link to review the obituary
}

export async function sendObituaryReady(params: ObituaryReadyParams) {
  const {
    to,
    familyContactName,
    deceasedName,
    funeralHomeName,
    funeralHomeReplyTo,
    reviewUrl,
  } = params

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #1A1817; line-height: 1.7;">
      <p style="font-size: 15px; margin-bottom: 24px;">
        Dear ${familyContactName},
      </p>
      <p style="font-size: 15px; margin-bottom: 20px;">
        We have prepared a draft obituary for ${deceasedName} and would love for you to take a look when you are ready.
      </p>
      <p style="font-size: 15px; margin-bottom: 20px;">
        There is no rush. Whenever you have a quiet moment, please review what we have written. If anything needs to be changed — a name, a date, a memory you would like added — simply reply to this email and let us know. We will make it right.
      </p>
      ${
        reviewUrl
          ? `
        <div style="margin: 32px 0;">
          <a href="${reviewUrl}" style="display: inline-block; background: #1A1817; color: #fff; font-family: sans-serif; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 5px; text-decoration: none;">
            Review the obituary
          </a>
        </div>
      `
          : ''
      }
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
    subject: `${deceasedName}'s obituary draft is ready for your review`,
    html,
    funeralHomeName,
    funeralHomeReplyTo,
  })
}
