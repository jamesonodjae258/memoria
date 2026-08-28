'use client'

import type { ObituaryLength, ObituaryTone } from '@/lib/openai/obituary'

interface ToneControlsProps {
  length: ObituaryLength
  tone: ObituaryTone
  onLengthChange: (length: ObituaryLength) => void
  onToneChange: (tone: ObituaryTone) => void
  onRegenerate: () => void
  isGenerating: boolean
  disabled?: boolean
}

export default function ToneControls({
  length,
  tone,
  onLengthChange,
  onToneChange,
  onRegenerate,
  isGenerating,
  disabled = false,
}: ToneControlsProps) {
  return (
    <div className="bg-white p-5 rounded border border-[#E5E2DC] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Length selector */}
        <div className="min-w-0">
          <span className="field-label mb-2">Tribute Length</span>
          <div className="flex flex-wrap rounded p-1 bg-[#FAF9F7] border border-[#E5E2DC] gap-1 text-xs">
            {(['short', 'standard', 'long'] as ObituaryLength[]).map((l) => (
              <button
                key={l}
                type="button"
                disabled={disabled || isGenerating}
                onClick={() => onLengthChange(l)}
                className={`tab-btn capitalize focus-ring ${length === l ? 'tab-active' : 'tab-inactive'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Tone selector */}
        <div className="min-w-0">
          <span className="field-label mb-2">Narrative Tone</span>
          <div className="flex flex-wrap rounded p-1 bg-[#FAF9F7] border border-[#E5E2DC] gap-1 text-xs">
            {(['formal', 'warm'] as ObituaryTone[]).map((t) => (
              <button
                key={t}
                type="button"
                disabled={disabled || isGenerating}
                onClick={() => onToneChange(t)}
                className={`tab-btn capitalize focus-ring ${tone === t ? 'tab-active' : 'tab-inactive'}`}
              >
                {t === 'formal' ? 'Formal' : 'Warm / Celebratory'}
              </button>
            ))}
          </div>
        </div>

        {/* Regenerate Action */}
        <div className="self-end">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={disabled || isGenerating}
            className="btn-secondary !w-auto text-xs px-3.5 py-1.5 h-8 font-semibold inline-flex items-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Regenerating…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#8C7E6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate Draft
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
