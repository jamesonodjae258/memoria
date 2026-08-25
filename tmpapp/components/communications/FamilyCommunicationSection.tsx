'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { CommunicationLog, CaseRecord } from '@/types'
import type { CommunicationTemplate } from '@/app/api/communications/send/route'

interface FamilyCommunicationSectionProps {
  caseData: CaseRecord
  initialLogs: CommunicationLog[]
}

export default function FamilyCommunicationSection({
  caseData,
  initialLogs,
}: FamilyCommunicationSectionProps) {
  const [logs, setLogs] = useState<CommunicationLog[]>(initialLogs)
  const [template, setTemplate] = useState<CommunicationTemplate>('intake_confirmed')
  const [channel, setChannel] = useState<'email' | 'sms' | 'both'>('email')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const [previewData, setPreviewData] = useState<{
    email?: { subject: string; text: string; html: string } | null
    sms?: { body: string } | null
    recipient_email?: string | null
    recipient_phone?: string | null
    sms_opt_in?: boolean
  } | null>(null)

  async function handlePreview() {
    setIsPreviewing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseData.id,
          template_name: template,
          channel,
          preview: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to render preview.')
        return
      }

      const data = await res.json()
      setPreviewData(data)
    } catch {
      setError('Network error while generating preview.')
    } finally {
      setIsPreviewing(false)
    }
  }

  async function handleConfirmSend() {
    setIsSending(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseData.id,
          template_name: template,
          channel,
          preview: false,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errMsg = data.error || 'Failed to send message.'
        setError(errMsg)
        toast({ type: 'error', title: 'Send Failed', message: errMsg })
      } else {
        setSuccessMessage('Family update sent successfully.')
        toast({ type: 'success', title: 'Message Sent', message: 'Family milestone update delivered and logged.' })
        setPreviewData(null)
      }

      const logsRes = await fetch(`/api/cases/${caseData.id}/comms-log`)
      if (logsRes.ok) {
        const updatedLogs = await logsRes.json()
        setLogs(updatedLogs)
      }
    } catch {
      const errMsg = 'Network error while sending communication.'
      setError(errMsg)
      toast({ type: 'error', title: 'Connection Error', message: errMsg })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Send Family Update Card */}
      <div className="card-premium p-6 sm:p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-display font-medium text-[#2C221E]">
            Family Communications Dispatch
          </h2>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF9F7] text-[#6B5E50] border border-[#E5E2DC]">
            Multi-Channel Hub
          </span>
        </div>
        <p className="text-xs text-[#6B5E50] mb-6">
          Dispatch authenticated SMS and email updates to the family at key milestones. Messages are always previewed before firing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Milestone Selection */}
          <div>
            <label htmlFor="comm-milestone" className="field-label">
              Milestone Message
            </label>
            <select
              id="comm-milestone"
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value as CommunicationTemplate)
                setPreviewData(null)
              }}
              className="field-input cursor-pointer bg-white border border-[#E5E2DC] rounded p-2 text-xs"
            >
              <option value="intake_confirmed">Intake Confirmed (Welcome &amp; Next Steps)</option>
              <option value="obituary_ready">Obituary Ready for Review</option>
              <option value="service_confirmed">Service Details Confirmed</option>
            </select>
          </div>

          {/* Channel Selection */}
          <div>
            <label htmlFor="comm-channel" className="field-label">
              Delivery Channel
            </label>
            <select
              id="comm-channel"
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value as ('email' | 'sms' | 'both'))
                setPreviewData(null)
              }}
              className="field-input cursor-pointer bg-white border border-[#E5E2DC] rounded p-2 text-xs"
            >
              <option value="email">Email Only (Resend)</option>
              <option value="sms">SMS Only (Twilio)</option>
              <option value="both">Both Email &amp; SMS</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] mb-6 rounded-r" role="alert">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="border-l-2 border-[#346538] bg-[#EDF3EC] p-3 text-xs text-[#346538] mb-6 rounded-r">
            {successMessage}
          </div>
        )}

        {/* Live Preview Box */}
        {previewData ? (
          <div className="bg-[#FAF9F7] border border-[#E5E2DC] p-5 rounded space-y-4 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                Dispatch Preview
              </h3>
              <span className="text-[10px] font-mono text-[#8C7E6E]">Ready to transmit</span>
            </div>

            {/* Email Preview */}
            {previewData.email && (
              <div className="bg-white p-4 rounded border border-[#E5E2DC] space-y-2">
                <div className="text-xs font-medium text-[#6B5E50] border-b border-[#E5E2DC] pb-2 flex flex-wrap justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[#2C221E]">To:</span> {previewData.recipient_email || '(No email provided)'}
                  </div>
                  <div>
                    <span className="font-semibold text-[#2C221E]">Subject:</span> {previewData.email.subject}
                  </div>
                </div>
                <div className="text-xs text-[#2C221E] whitespace-pre-wrap pt-1 font-body leading-relaxed">
                  {previewData.email.text}
                </div>
              </div>
            )}

            {/* SMS Preview */}
            {previewData.sms && (
              <div className="bg-white p-4 rounded border border-[#E5E2DC] space-y-2">
                <div className="text-xs font-medium text-[#6B5E50] border-b border-[#E5E2DC] pb-2 flex items-center justify-between">
                  <span>
                    <span className="font-semibold text-[#2C221E]">SMS To:</span> {previewData.recipient_phone || '(No phone provided)'}
                  </span>
                  {!previewData.sms_opt_in && (
                    <span className="text-[#9F2F2D] text-[11px] font-semibold bg-[#FDEBEC] px-2 py-0.5 rounded">
                      Family not opted in
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#2C221E] font-mono bg-[#FAF9F7] p-3 rounded border border-[#E5E2DC]">
                  {previewData.sms.body}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                disabled={isSending}
                className="btn-secondary !w-auto text-xs px-3.5 py-1.5 h-8 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="btn-primary !w-auto text-xs px-4 py-1.5 h-8 font-semibold"
              >
                {isSending ? 'Sending…' : 'Transmit Update →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePreview}
              disabled={isPreviewing}
              className="btn-secondary !w-auto text-xs px-4 py-2 font-semibold"
            >
              {isPreviewing ? 'Generating Preview…' : 'Preview Dispatch →'}
            </button>
          </div>
        )}
      </div>

      {/* Communication Audit Log */}
      <div className="card-premium p-6 sm:p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-display font-medium text-[#2C221E]">
            Transmission &amp; Delivery Audit Log ({logs.length})
          </h3>
          <span className="text-[10px] font-mono text-[#8C7E6E]">Timestamped Records</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-[#8C7E6E] py-6 text-center">
            No communication history recorded for this case yet.
          </p>
        ) : (
          <div className="divide-y divide-[#E5E2DC]">
            {logs.map((log) => (
              <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        log.channel === 'sms'
                          ? 'bg-[#E1F3FE] text-[#1F6C9F]'
                          : 'bg-[#FBF3DB] text-[#956400]'
                      }`}
                    >
                      {log.channel}
                    </span>
                    <span className="text-xs text-[#8C7E6E] font-mono">
                      To: {log.recipient} &bull; {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.subject && (
                    <p className="text-xs font-semibold text-[#2C221E]">{log.subject}</p>
                  )}
                  <p className="text-xs text-[#6B5E50] line-clamp-2 mt-0.5">
                    {log.message_content}
                  </p>
                  {log.error_message && (
                    <p className="text-xs text-[#9F2F2D] mt-1 font-medium">
                      Error: {log.error_message}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${log.status === 'sent' || log.status === 'delivered' ? 'bg-[#EDF3EC] text-[#346538]' : ''}
                      ${log.status === 'failed' ? 'bg-[#FDEBEC] text-[#9F2F2D]' : ''}
                      ${log.status === 'pending' ? 'bg-[#FBF3DB] text-[#956400]' : ''}
                    `}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
