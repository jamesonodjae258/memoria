import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import {
  intakeConfirmedTemplate,
  obituaryReadyTemplate,
  serviceConfirmedTemplate,
  sendEmail,
} from '@/lib/resend/send-email'
import {
  intakeConfirmedSMS,
  obituaryReadySMS,
  serviceConfirmedSMS,
  sendSMS,
} from '@/lib/twilio/send-sms'
import { NextRequest, NextResponse } from 'next/server'
import type { CaseRecord, FuneralHome } from '@/types'

export type CommunicationTemplate = 'intake_confirmed' | 'obituary_ready' | 'service_confirmed'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to send communications.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { case_id, template_name, channel, preview } = body as {
      case_id: string
      template_name: CommunicationTemplate
      channel: 'email' | 'sms' | 'both'
      preview?: boolean
    }

    if (!case_id || !template_name || !channel) {
      return NextResponse.json(
        { error: 'case_id, template_name, and channel are required.' },
        { status: 400 }
      )
    }

    // Fetch case and funeral home info
    const serviceClient = createServiceRoleClient()
    const { data: caseData, error: caseError } = await serviceClient
      .from('cases')
      .select('*, funeral_homes(*)')
      .eq('id', case_id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
    }

    const c = caseData as CaseRecord & { funeral_homes: FuneralHome }
    const funeralHomeName = c.funeral_homes?.name || 'Your Funeral Home'
    const caseName = c.deceased_name

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

    // Render Email content
    let emailRender = { subject: '', text: '', html: '' }
    if (template_name === 'intake_confirmed') {
      emailRender = intakeConfirmedTemplate(caseName, funeralHomeName)
    } else if (template_name === 'obituary_ready') {
      emailRender = obituaryReadyTemplate(caseName, funeralHomeName)
    } else if (template_name === 'service_confirmed') {
      emailRender = serviceConfirmedTemplate(
        caseName,
        formattedServiceDate,
        serviceLocation,
        funeralHomeName
      )
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
      })
    }

    // SEND MODE: Perform send operations & log to communication_logs in parallel
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
          try {
            await sendEmail({
              to: c.family_contact_email,
              subject: emailRender.subject,
              html: emailRender.html,
              text: emailRender.text,
            })

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
