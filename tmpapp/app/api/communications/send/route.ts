import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { sendIntakeConfirmed } from '@/lib/resend/templates/intake-confirmed'
import { sendObituaryReady } from '@/lib/resend/templates/obituary-ready'
import { sendServiceConfirmed } from '@/lib/resend/templates/service-confirmed'
import {
  intakeConfirmedSMS,
  obituaryReadySMS,
  serviceConfirmedSMS,
  sendSMS,
} from '@/lib/twilio/send-sms'
import { NextRequest, NextResponse } from 'next/server'
import type { CaseRecord, FuneralHome } from '@/types'
import { SMS_ENABLED } from '@/lib/features'

export type CommunicationTemplate = 'intake_confirmed' | 'obituary_ready' | 'service_confirmed'

const FAMILY_FACING_TEMPLATES: CommunicationTemplate[] = [
  'intake_confirmed',
  'obituary_ready',
  'service_confirmed',
]

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const isBearerAuth = Boolean(authHeader?.startsWith('Bearer '))
    const bearerToken = isBearerAuth ? authHeader!.replace(/^Bearer\s+/i, '').trim() : null

    const body = await request.json()
    const { case_id, template_name, channel, preview, confirmed } = body as {
      case_id: string
      template_name: CommunicationTemplate
      channel: 'email' | 'sms' | 'both'
      preview?: boolean
      confirmed?: boolean
    }

    if (!case_id || !template_name || !channel) {
      return NextResponse.json(
        { error: 'case_id, template_name, and channel are required.' },
        { status: 400 }
      )
    }

    if (!SMS_ENABLED && (channel === 'sms' || channel === 'both')) {
      return NextResponse.json(
        { error: 'SMS communications are disabled. Please use the email delivery channel.' },
        { status: 400 }
      )
    }

    const isFamilyFacing = FAMILY_FACING_TEMPLATES.includes(template_name)

    // Family-facing templates must never use the bearer token path
    if (isFamilyFacing && isBearerAuth) {
      return NextResponse.json(
        {
          error:
            'Bearer token authorization cannot be used for family communications. An authenticated staff session is required.',
        },
        { status: 403 }
      )
    }

    let staffUserId: string | null = null

    if (isFamilyFacing) {
      // Must require an authenticated staff session
      const supabase = createServerSupabaseClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { error: 'An authenticated staff session is required to send family communications.' },
          { status: 403 }
        )
      }

      staffUserId = user.id

      // In send mode, staff must explicitly provide confirmed: true
      if (!preview && confirmed !== true) {
        return NextResponse.json(
          {
            error:
              'Staff confirmation is required to send family communications. Set confirmed to true in the request body.',
          },
          { status: 403 }
        )
      }
    } else {
      // Non-family internal staff alerts may use the API_SECRET bearer token
      const isApiSecretValid = Boolean(
        process.env.API_SECRET && bearerToken && bearerToken === process.env.API_SECRET
      )
      if (!isApiSecretValid) {
        return NextResponse.json(
          { error: 'Invalid authorization for internal staff alert.' },
          { status: 403 }
        )
      }
    }

    // Fetch case and joined funeral home info
    const serviceClient = createServiceRoleClient()
    const { data: caseData, error: caseError } = await serviceClient
      .from('cases')
      .select('*, funeral_homes(*)')
      .eq('id', case_id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
    }

    const c = caseData as CaseRecord & { funeral_homes: FuneralHome | null }

    // If sent by staff session, verify staff member belongs to the funeral home of this case
    if (staffUserId) {
      const { data: staffProfile } = await serviceClient
        .from('staff_profiles')
        .select('funeral_home_id')
        .eq('user_id', staffUserId)
        .maybeSingle()

      if (!staffProfile || staffProfile.funeral_home_id !== c.funeral_home_id) {
        return NextResponse.json(
          { error: 'You do not have permission to send communications for this case.' },
          { status: 403 }
        )
      }
    }

    const funeralHome = c.funeral_homes
    const funeralHomeName = funeralHome?.name || 'Your Funeral Home'
    const contactEmail = funeralHome?.contact_email?.trim() || null
    const funeralHomePhone = funeralHome?.phone || undefined
    const caseName = c.deceased_name

    // Check that funeral_home.contact_email is configured before sending email
    if (!preview && (channel === 'email' || channel === 'both')) {
      if (!contactEmail) {
        await serviceClient.from('communication_logs').insert({
          case_id,
          channel: 'email',
          recipient: c.family_contact_email || 'Not provided',
          subject: `Communication for ${caseName}`,
          message_content: `Attempted template: ${template_name}`,
          status: 'failed',
          error_message: 'contact_email not configured for this funeral home',
        })

        return NextResponse.json(
          {
            error: 'MISSING_CONTACT_EMAIL',
            message:
              'This funeral home has not set a contact email address. Please add it in Settings before sending family communications.',
          },
          { status: 422 }
        )
      }
    }

    // Format service date for templates
    const formattedServiceDate = c.service_date
      ? new Date(c.service_date).toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Date to be confirmed'
    const serviceLocation = c.service_location || 'Location to be confirmed'
    const serviceType = c.service_type || 'Memorial Service'

    // Render preview content
    let emailRender = { subject: '', text: '', html: '' }
    if (template_name === 'intake_confirmed') {
      emailRender = {
        subject: `We have received your information - ${funeralHomeName}`,
        text: `Dear ${c.family_contact_name},\n\nThank you for trusting ${funeralHomeName} during this time. We have received all the information needed to begin arrangements for ${caseName}, and our team is already at work.\n\nWe will be in touch shortly with the next steps.\n\nWith care,\n${funeralHomeName}`,
        html: `Preview for intake confirmed`,
      }
    } else if (template_name === 'obituary_ready') {
      emailRender = {
        subject: `${caseName}'s obituary draft is ready for your review`,
        text: `Dear ${c.family_contact_name},\n\nWe have prepared a draft obituary for ${caseName} and would love for you to take a look when you are ready. There is no rush.\n\nWith care,\n${funeralHomeName}`,
        html: `Preview for obituary ready`,
      }
    } else if (template_name === 'service_confirmed') {
      emailRender = {
        subject: `Service details confirmed - ${caseName}`,
        text: `Dear ${c.family_contact_name},\n\nThe arrangements for ${caseName} have been confirmed:\nService Type: ${serviceType}\nDate & Time: ${formattedServiceDate}\nLocation: ${serviceLocation}\n\nWith care,\n${funeralHomeName}`,
        html: `Preview for service confirmed`,
      }
    }

    // Render SMS content
    let smsRender = { body: '' }
    if (template_name === 'intake_confirmed') {
      smsRender = intakeConfirmedSMS(caseName, funeralHomeName)
    } else if (template_name === 'obituary_ready') {
      smsRender = obituaryReadySMS(caseName, funeralHomeName)
    } else if (template_name === 'service_confirmed') {
      smsRender = serviceConfirmedSMS(
        caseName,
        formattedServiceDate,
        serviceLocation,
        funeralHomeName
      )
    }

    // PREVIEW MODE: Return rendered message content without sending
    if (preview) {
      return NextResponse.json({
        preview: true,
        email: channel === 'email' || channel === 'both' ? emailRender : null,
        sms: channel === 'sms' || channel === 'both' ? smsRender : null,
        recipient_email: c.family_contact_email,
        recipient_phone: c.family_contact_phone,
        sms_opt_in: c.sms_opt_in,
        contact_email: contactEmail,
        has_contact_email: Boolean(contactEmail),
      })
    }

    // SEND MODE: Perform send operations and log every outcome to communication_logs
    const sendTasks: Promise<{ channel: string; success: boolean; error?: string }>[] = []

    // 1. Email Dispatch Task
    if (channel === 'email' || channel === 'both') {
      sendTasks.push(
        (async () => {
          if (!c.family_contact_email) {
            const errorMsg = 'Family contact email address is not recorded on this case.'
            await serviceClient.from('communication_logs').insert({
              case_id,
              channel: 'email',
              recipient: 'Not provided',
              subject: emailRender.subject,
              message_content: emailRender.text,
              status: 'failed',
              error_message: errorMsg,
            })
            return { channel: 'email', success: false, error: errorMsg }
          }

          if (!contactEmail) {
            const errorMsg = 'contact_email not configured for this funeral home'
            await serviceClient.from('communication_logs').insert({
              case_id,
              channel: 'email',
              recipient: c.family_contact_email,
              subject: emailRender.subject,
              message_content: emailRender.text,
              status: 'failed',
              error_message: errorMsg,
            })
            return { channel: 'email', success: false, error: errorMsg }
          }

          try {
            let result: { success: boolean; messageId?: string; error?: string } = {
              success: false,
              error: 'Unknown template',
            }

            if (template_name === 'intake_confirmed') {
              result = await sendIntakeConfirmed({
                to: c.family_contact_email,
                familyContactName: c.family_contact_name,
                deceasedName: c.deceased_name,
                funeralHomeName,
                funeralHomeReplyTo: contactEmail,
                funeralHomePhone,
              })
            } else if (template_name === 'obituary_ready') {
              const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin || 'http://localhost:3000'
              result = await sendObituaryReady({
                to: c.family_contact_email,
                familyContactName: c.family_contact_name,
                deceasedName: c.deceased_name,
                funeralHomeName,
                funeralHomeReplyTo: contactEmail,
                reviewUrl: `${origin}/dashboard/cases/${case_id}/obituary`,
              })
            } else if (template_name === 'service_confirmed') {
              result = await sendServiceConfirmed({
                to: c.family_contact_email,
                familyContactName: c.family_contact_name,
                deceasedName: c.deceased_name,
                funeralHomeName,
                funeralHomeReplyTo: contactEmail,
                funeralHomePhone,
                serviceDate: formattedServiceDate,
                serviceLocation,
                serviceType,
              })
            }

            if (!result.success) {
              const errMsg = result.error || 'Resend error'
              await serviceClient.from('communication_logs').insert({
                case_id,
                channel: 'email',
                recipient: c.family_contact_email,
                subject: emailRender.subject,
                message_content: emailRender.text,
                status: 'failed',
                error_message: errMsg,
              })
              return { channel: 'email', success: false, error: errMsg }
            }

            await serviceClient.from('communication_logs').insert({
              case_id,
              channel: 'email',
              recipient: c.family_contact_email,
              subject: emailRender.subject,
              message_content: emailRender.text,
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            return { channel: 'email', success: true }
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Email dispatch failed.'
            await serviceClient.from('communication_logs').insert({
              case_id,
              channel: 'email',
              recipient: c.family_contact_email,
              subject: emailRender.subject,
              message_content: emailRender.text,
              status: 'failed',
              error_message: errorMsg,
            })
            return { channel: 'email', success: false, error: errorMsg }
          }
        })()
      )
    }

    // 2. SMS Dispatch Task
    if (channel === 'sms' || channel === 'both') {
      sendTasks.push(
        (async () => {
          try {
            await sendSMS({
              caseData: c,
              body: smsRender.body,
            })

            await serviceClient.from('communication_logs').insert({
              case_id,
              channel: 'sms',
              recipient: c.family_contact_phone || 'Unknown',
              subject: null,
              message_content: smsRender.body,
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            return { channel: 'sms', success: true }
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'SMS dispatch failed.'
            await serviceClient.from('communication_logs').insert({
              case_id,
              channel: 'sms',
              recipient: c.family_contact_phone || 'Not provided',
              subject: null,
              message_content: smsRender.body,
              status: 'failed',
              error_message: errorMsg,
            })
            return { channel: 'sms', success: false, error: errorMsg }
          }
        })()
      )
    }

    const taskResults = await Promise.allSettled(sendTasks)
    const results = taskResults.map((r) =>
      r.status === 'fulfilled'
        ? r.value
        : { channel: 'unknown', success: false, error: 'Task rejected unexpectedly.' }
    )

    // Check if any channel failed
    const failedChannel = results.find((r) => !r.success)
    if (failedChannel) {
      return NextResponse.json(
        {
          error: `Failed to send ${failedChannel.channel} message: ${failedChannel.error}`,
          results,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process communication.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
