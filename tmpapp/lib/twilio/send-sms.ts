import twilio from 'twilio'
import type { CaseRecord } from '@/types'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export interface SMSTemplateResult {
  body: string
}

/**
 * Short SMS versions of the milestone messages.
 */
export function intakeConfirmedSMS(caseName: string, funeralHomeName: string): SMSTemplateResult {
  return {
    body: `${funeralHomeName}: We are here to support your family with arrangements for ${caseName}. Please call or text us anytime if you need guidance.`,
  }
}

export function obituaryReadySMS(caseName: string, funeralHomeName: string): SMSTemplateResult {
  return {
    body: `${funeralHomeName}: An initial obituary draft for ${caseName} is ready for your review whenever you are comfortable.`,
  }
}

export function serviceConfirmedSMS(
  caseName: string,
  serviceDate: string,
  serviceLocation: string,
  funeralHomeName: string
): SMSTemplateResult {
  return {
    body: `${funeralHomeName}: Service for ${caseName} confirmed for ${serviceDate} at ${serviceLocation}. We are preparing everything with care.`,
  }
}

/**
 * Send SMS using Twilio.
 * Enforces rule: SMS ONLY sends if family_contact_phone exists AND case.sms_opt_in is true.
 */
export async function sendSMS({
  caseData,
  body,
}: {
  caseData: CaseRecord
  body: string
}) {
  // Check conditions
  if (!caseData.family_contact_phone || caseData.family_contact_phone.trim() === '') {
    throw new Error('Cannot send SMS: Family contact phone number is missing.')
  }

  if (!caseData.sms_opt_in) {
    throw new Error('Cannot send SMS: Family has not opted in to SMS communications.')
  }

  // Handle mock send if Twilio credentials are missing in dev
  if (!client || !twilioPhoneNumber) {
    return {
      success: true,
      sid: `mock_sms_${Date.now()}`,
      note: 'Twilio credentials not configured — simulated SMS send.',
    }
  }

  const message = await client.messages.create({
    body,
    from: twilioPhoneNumber,
    to: caseData.family_contact_phone,
  })

  return {
    success: true,
    sid: message.sid,
  }
}
