'use client'

import { useState } from 'react'
import ToneControls from './ToneControls'
import { useToast } from '@/components/ui/Toast'
import type { ObituaryLength, ObituaryTone } from '@/lib/openai/obituary'
import type { Document } from '@/types'

interface ObituaryEditorProps {
  caseId: string
  initialDocument: Document | null
  deceasedName: string
}

export default function ObituaryEditor({
  caseId,
  initialDocument,
  deceasedName,
}: ObituaryEditorProps) {
  const [document, setDocument] = useState<Document | null>(initialDocument)
  const [draftContent, setDraftContent] = useState<string>(
    initialDocument?.draft_content ?? ''
  )
  const [length, setLength] = useState<ObituaryLength>('standard')
  const [tone, setTone] = useState<ObituaryTone>('warm')

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { toast } = useToast()

  const isApproved =
    document?.status === 'pending_family_review' ||
    document?.status === 'approved' ||
    document?.status === 'finalized'

  async function handleGenerate(overrideLength?: ObituaryLength, overrideTone?: ObituaryTone) {
    setIsGenerating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/obituary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          length: overrideLength ?? length,
          tone: overrideTone ?? tone,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const errMsg = data.error || 'Failed to generate obituary draft.'
        setError(errMsg)
        toast({ type: 'error', title: 'Generation Failed', message: errMsg })
        return
      }

      const data = await res.json()
      setDraftContent(data.draft_content)
      setDocument((prev) =>
        prev
          ? { ...prev, draft_content: data.draft_content, status: 'draft' }
          : ({
              id: data.document_id,
              case_id: caseId,
              type: 'obituary',
              title: `Obituary - ${deceasedName}`,
              draft_content: data.draft_content,
              pdf_url: null,
              status: 'draft',
              version: 1,
              reviewed_by: null,
              reviewed_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Document)
      )
      setSuccessMessage('New draft generated successfully.')
      toast({ type: 'success', title: 'Draft Generated', message: 'New obituary draft created.' })
    } catch {
      const errMsg = 'Network error. Please try again.'
      setError(errMsg)
      toast({ type: 'error', title: 'Connection Error', message: errMsg })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSaveDraft() {
    if (!document) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/obituary/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          draft_content: draftContent,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const errMsg = data.error || 'Failed to save changes.'
        setError(errMsg)
        toast({ type: 'error', title: 'Save Failed', message: errMsg })
        return
      }

      const data = await res.json()
      setDocument(data.document)
      setSuccessMessage('Edits saved to draft.')
      toast({ type: 'success', title: 'Changes Saved', message: 'Obituary draft updated.' })
    } catch {
      const errMsg = 'Network error while saving.'
      setError(errMsg)
      toast({ type: 'error', title: 'Connection Error', message: errMsg })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleApproveDraft() {
    if (!document) return

    setIsApproving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/obituary/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          draft_content: draftContent,
          status: 'pending_family_review',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const errMsg = data.error || 'Failed to approve draft.'
        setError(errMsg)
        toast({ type: 'error', title: 'Approval Failed', message: errMsg })
        return
      }

      const data = await res.json()
      setDocument(data.document)
      setSuccessMessage('Draft approved! The obituary is now marked ready for family review.')
      toast({ type: 'success', title: 'Draft Approved', message: 'Obituary is now marked ready for family review.' })
    } catch {
      const errMsg = 'Network error while approving.'
      setError(errMsg)
      toast({ type: 'error', title: 'Connection Error', message: errMsg })
    } finally {
      setIsApproving(false)
    }
  }

  // Initial state: No draft exists yet
  if (!document && !draftContent && !isGenerating) {
    return (
      <div className="card-premium p-12 text-center max-w-xl mx-auto relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#FAF9F7] border border-[#E5E2DC] mb-4 text-[#A8935D] font-display text-lg font-bold">
          G&amp;P
        </div>
        <h3 className="text-xl font-display font-medium text-[#2C221E] mb-2">
          No Obituary Draft Created Yet
        </h3>
        <p className="text-xs text-[#6B5E50] mb-6 leading-relaxed">
          The AI assistant will synthesize the family memories, vital records, and service details to draft a dignified, bespoke tribute for {deceasedName}.
        </p>

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] text-left mb-6 rounded-r" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-6 py-3"
        >
          Generate Initial Tribute Draft
        </button>

      </div>
    )
  }

  const wordCount = draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-6">
      {/* Tone Controls Header */}
      <ToneControls
        length={length}
        tone={tone}
        onLengthChange={(newLength) => setLength(newLength)}
        onToneChange={(newTone) => setTone(newTone)}
        onRegenerate={() => handleGenerate(length, tone)}
        isGenerating={isGenerating}
        disabled={isApproved}
      />

      {/* Editor Card */}
      <div className="card-premium p-6 sm:p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <label htmlFor="obituary-draft" className="field-label mb-0">
              Obituary Tribute Text
            </label>
            {document?.version && (
              <span className="text-[11px] font-mono text-[#8C7E6E] bg-[#FAF9F7] px-2 py-0.5 rounded border border-[#E5E2DC]">
                v{document.version}
              </span>
            )}
            <span className="text-[11px] font-mono text-[#8C7E6E]">
              {wordCount} words
            </span>
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
              ${isApproved ? 'bg-[#EDF3EC] text-[#346538] border border-[#346538]/20' : 'bg-[#FBF3DB] text-[#956400] border border-[#D4C596]/60'}
            `}
          >
            {isApproved ? 'Approved by Staff' : 'Draft — Pending Approval'}
          </span>
        </div>

        <textarea
          id="obituary-draft"
          rows={14}
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          disabled={isGenerating || isApproved}
          placeholder="Obituary draft will appear here..."
          className="w-full p-4 border border-[#E5E2DC] rounded font-display text-sm text-[#2C221E]
            bg-[#FAF9F7]/50 focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors
            disabled:opacity-80 resize-y leading-relaxed"
        />

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] mt-4 rounded-r" role="alert">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="border-l-2 border-[#346538] bg-[#EDF3EC] p-3 text-xs text-[#346538] mt-4 rounded-r">
            {successMessage}
          </div>
        )}

        {/* Staff Approval Hard Gate Notice */}
        <div className="mt-6 p-4 rounded bg-[#FAF9F7] border border-[#E5E2DC] flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#E5E2DC] text-[#4D4237] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            i
          </div>
          <div className="text-xs text-[#6B5E50] leading-relaxed">
            <span className="font-semibold text-[#2C221E] block mb-0.5">
              Staff Verification &amp; Ethical Guardrail
            </span>
            {isApproved ? (
              'This tribute draft has been reviewed and approved by funeral staff. It is ready for family presentation.'
            ) : (
              'AI-generated tributes must be reviewed, edited if necessary, and explicitly approved by funeral home staff before being released to next-of-kin or publications.'
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5E2DC]">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isGenerating || isSaving || isApproving || isApproved}
            className="btn-secondary !w-auto text-xs px-4 py-2 font-semibold"
          >
            {isSaving ? 'Saving Edits…' : 'Save Edits as Draft'}
          </button>

          {!isApproved ? (
            <button
              type="button"
              onClick={handleApproveDraft}
              disabled={isGenerating || isSaving || isApproving}
              className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-5 py-2"
            >
              {isApproving ? 'Approving…' : 'Approve Draft'}
            </button>

          ) : (
            <div className="flex items-center gap-2 text-[#346538] text-xs font-bold uppercase tracking-wider bg-[#EDF3EC] px-3 py-1.5 rounded border border-[#346538]/20">
              <span>✓</span> Approved for Family Review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
