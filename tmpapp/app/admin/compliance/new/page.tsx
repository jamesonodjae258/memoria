'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function NewComplianceTemplatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultStateId = searchParams.get('state_id') || ''

  const [states, setStates] = useState<{ id: string; name: string; abbreviation: string }[]>([])
  const [stateId, setStateId] = useState(defaultStateId)
  const [formName, setFormName] = useState('')
  const [description, setDescription] = useState('')
  const [isRequired, setIsRequired] = useState(true)
  const [templatePdfUrl, setTemplatePdfUrl] = useState('')
  const [requiredFields, setRequiredFields] = useState<string[]>([
    'deceased_name',
    'date_of_death',
    'place_of_death',
    'informant_name',
  ])
  const [newFieldInput, setNewFieldInput] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load states dropdown
  useEffect(() => {
    async function loadStatesList() {
      try {
        const res = await fetch('/api/admin/states')
        if (res.ok) {
          const json = await res.json()
          setStates(json.states || [])
          if (!stateId && json.states?.length > 0) {
            setStateId(json.states[0].id)
          }
        }
      } catch {}
    }
    loadStatesList()
  }, [])

  const addField = () => {
    if (newFieldInput.trim() && !requiredFields.includes(newFieldInput.trim())) {
      setRequiredFields([...requiredFields, newFieldInput.trim()])
      setNewFieldInput('')
    }
  }

  const removeField = (fieldToRemove: string) => {
    setRequiredFields(requiredFields.filter((f) => f !== fieldToRemove))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!stateId) {
      setError('Please select a state for this compliance template.')
      return
    }

    if (!formName.trim()) {
      setError('Form name is required.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state_id: stateId,
          form_name: formName.trim(),
          description: description.trim(),
          is_required: isRequired,
          template_pdf_url: templatePdfUrl.trim() || null,
          required_fields: requiredFields,
          is_active: true,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create compliance template')
      }

      router.push(`/admin/compliance?state_id=${stateId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create template')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/compliance"
              className="text-xs text-[#94A3B8] hover:text-white transition-colors"
            >
              &larr; Templates Library
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Add State Compliance Template
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-[#451A1A] border-l-4 border-[#EF4444] p-3.5 text-xs text-[#FCA5A5] rounded-r">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-lg space-y-5">
          {/* State Jurisdiction */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              State Jurisdiction *
            </label>
            <select
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              required
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2.5 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
            >
              <option value="">Select State…</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.abbreviation})
                </option>
              ))}
            </select>
          </div>

          {/* Form Name */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              Official Form Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. VS-112 Certificate of Death & Burial Transit Permit"
              required
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2.5 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          {/* Description & Legal Guidance */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              Description &amp; Director Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mandatory state filing required within 10 days of passing prior to disposition or cremation."
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2.5 text-xs text-white focus:border-[#38BDF8] focus:outline-none resize-y"
            />
          </div>

          {/* Mandatory Checkbox / Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              id="is-required"
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0F172A] border-[#334155] text-[#38BDF8] focus:ring-[#38BDF8]"
            />
            <label htmlFor="is-required" className="text-xs text-[#CBD5E1] cursor-pointer">
              <strong className="text-white">Mandatory for all cases in this state</strong> (Automatically flagged on case intake)
            </label>
          </div>

          {/* PDF Template URL */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              Template PDF URL (Supabase Storage or Public Asset)
            </label>
            <input
              type="url"
              value={templatePdfUrl}
              onChange={(e) => setTemplatePdfUrl(e.target.value)}
              placeholder="https://...supabase.co/storage/v1/object/public/templates/tx-vs112.pdf"
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2.5 text-xs text-white font-mono focus:border-[#38BDF8] focus:outline-none"
            />
            <p className="text-[11px] text-[#64748B] mt-1">
              Used when staff download or preview the blank state-issued PDF form.
            </p>
          </div>

          {/* AI Pre-fill Fields list */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              AI Pre-fill Field Tokens
            </label>
            <p className="text-[11px] text-[#64748B] mb-2">
              Case attributes the AI agent should extract and map when generating or auditing this form.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {requiredFields.map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F172A] border border-[#334155] text-xs font-mono text-[#38BDF8]"
                >
                  <span>{field}</span>
                  <button
                    type="button"
                    onClick={() => removeField(field)}
                    className="text-[#94A3B8] hover:text-[#EF4444] text-xs font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFieldInput}
                onChange={(e) => setNewFieldInput(e.target.value)}
                placeholder="Add field name (e.g. physician_license_number)…"
                className="flex-1 bg-[#0F172A] border border-[#334155] rounded p-2 text-xs text-white font-mono focus:border-[#38BDF8] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addField()
                  }
                }}
              />
              <button
                type="button"
                onClick={addField}
                className="px-3 py-2 rounded bg-[#334155] hover:bg-[#475569] text-xs font-semibold text-white transition-colors"
              >
                + Add Token
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/compliance"
            className="text-xs text-[#94A3B8] hover:text-white transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded bg-[#38BDF8] hover:bg-[#0284C7] text-[#0F172A] text-xs font-bold transition-colors"
          >
            {isLoading ? 'Creating Template…' : 'Save Compliance Template'}
          </button>
        </div>
      </form>
    </div>
  )
}
