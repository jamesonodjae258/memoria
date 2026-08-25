'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { Document } from '@/types'

interface DocumentListProps {
  caseId: string
  deceasedName: string
  initialDocuments: Document[]
}

export default function DocumentList({
  caseId,
  deceasedName,
  initialDocuments,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [missingFields, setMissingFields] = useState<string[] | null>(() => {
    const compDoc = initialDocuments.find((d) => d.type === 'compliance_form')
    if (compDoc?.draft_content) {
      try {
        const cleaned = compDoc.draft_content
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/, '')
          .replace(/```$/, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        return parsed.missing_fields || []
      } catch {
        return null
      }
    }
    return null
  })

  async function handleGeneratePaperwork() {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      })

      if (!res.ok) {
        const data = await res.json()
        const errMsg = data.error || 'Failed to generate compliance paperwork.'
        setError(errMsg)
        toast({ type: 'error', title: 'Generation Failed', message: errMsg })
        return
      }

      const data = await res.json()
      setDocuments((prev) => [data.document, ...prev.filter((d) => d.id !== data.document.id)])
      setMissingFields(data.missing_fields || [])
      toast({ type: 'success', title: 'Paperwork Generated', message: 'Compliance PDF created and stored.' })
    } catch {
      const errMsg = 'Network error while generating paperwork.'
      setError(errMsg)
      toast({ type: 'error', title: 'Connection Error', message: errMsg })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Prominently Flagged Missing Fields Alert */}
      {missingFields && missingFields.length > 0 && (
        <div className="bg-[#FDEBEC] border-l-4 border-[#9F2F2D] p-6 rounded shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-[#9F2F2D] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              !
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#9F2F2D] uppercase tracking-wider">
                Action Required: Missing Compliance Records ({missingFields.length})
              </h3>
              <p className="text-xs text-[#2C221E] mt-1 leading-relaxed">
                The compliance engine flagged missing mandatory data points in the case record for {deceasedName}. These are highlighted in the pre-filled worksheet:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missingFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-white text-[#9F2F2D] border border-[#9F2F2D]/30"
                  >
                    &bull; {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Header Card */}
      <div className="card-premium p-6 sm:p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-medium text-[#2C221E]">
              Generate &amp; Pre-Fill Official Documents
            </h2>
            <p className="text-xs text-[#6B5E50] mt-1">
              Extracts case intake records into official state certificates and authorization PDFs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGeneratePaperwork}
            disabled={isGenerating}
            className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-5 py-2.5 shadow-sm"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Compiling PDF…
              </>
            ) : (
              'Generate Paperwork →'
            )}
          </button>
        </div>

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] mt-4 rounded-r" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Documents List Card */}
      <div className="card-premium p-6 sm:p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-display font-medium text-[#2C221E]">
            Case Document Records ({documents.length})
          </h3>
          <span className="text-[10px] font-mono text-[#8C7E6E]">PDF Artifacts</span>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-[#8C7E6E] text-xs">
            No compliance documents generated yet. Click &quot;Generate Paperwork&quot; above to create pre-filled PDF forms.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E2DC]">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex flex-wrap items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded bg-[#FAF9F7] border border-[#E5E2DC] flex items-center justify-center shrink-0 text-[#A8935D] font-mono font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2C221E]">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-[#8C7E6E] mt-0.5 font-mono">
                      Type: <span className="capitalize text-[#4D4237]">{doc.type.replace('_', ' ')}</span> &bull; Status: <span className="capitalize text-[#4D4237]">{doc.status.replace('_', ' ')}</span> &bull; v{doc.version}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {doc.pdf_url ? (
                    <a
                      href={doc.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="btn-secondary !w-auto text-xs px-4 py-2 font-semibold inline-flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4 text-[#8C7E6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </a>
                  ) : (
                    <span className="text-xs text-[#8C7E6E] italic">PDF compiling…</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
