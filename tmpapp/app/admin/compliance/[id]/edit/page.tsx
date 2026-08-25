'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditComplianceTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [states, setStates] = useState<{ id: string; name: string; abbreviation: string }[]>([])
  const [stateId, setStateId] = useState('')
  const [formName, setFormName] = useState('')
  const [description, setDescription] = useState('')
  const [isRequired, setIsRequired] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [templatePdfUrl, setTemplatePdfUrl] = useState('')
  const [requiredFields, setRequiredFields] = useState<string[]>([])
  const [newFieldInput, setNewFieldInput] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load states and template details
  useEffect(() => {
    async function loadData() {
      try {
        const [statesRes, templateRes] = await Promise.all([
          fetch('/api/admin/states'),
          fetch(`/api/admin/compliance?id=${templateId}`),
        ])

        if (statesRes.ok) {
          const sJson = await statesRes.json()
          setStates(sJson.states || [])
        }

        if (templateRes.ok) {
          const tJson = await templateRes.json()
          const t = tJson.template
          if (t) {
            setStateId(t.state_id)
            setFormName(t.form_name)
            setDescription(t.description || '')
            setIsRequired(t.is_required)
            setIsActive(t.is_active)
            setTemplatePdfUrl(t.template_pdf_url || '')
            setRequiredFields(Array.isArray(t.required_fields) ? t.required_fields : [])
          }
        }
      } catch (err: unknown) {
        setError('Failed to load template details')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [templateId])

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
    setIsSaving(true)

    try {
      const res = await fetch('/api/admin/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: templateId,
          state_id: stateId,
          form_name: formName.trim(),
          description: description.trim(),
          is_required: isRequired,
          is_active: isActive,
          template_pdf_url: templatePdfUrl.trim() || null,
          required_fields: requiredFields,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update template')
      }

      router.push(`/admin/compliance?state_id=${stateId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update template')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-[#94A3B8]">
        Loading template details…
      </div>
    )
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
            Edit Compliance Template
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
              required
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2.5 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              Description &amp; Director Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2.5 text-xs text-white focus:border-[#38BDF8] focus:outline-none resize-y"
            />
          </div>

          {/* Mandatory & Active Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <input
                id="edit-is-required"
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0F172A] border-[#334155] text-[#38BDF8] focus:ring-[#38BDF8]"
              />
              <label htmlFor="edit-is-required" className="text-xs text-[#CBD5E1] cursor-pointer">
                <strong className="text-white">Mandatory Form</strong>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="edit-is-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0F172A] border-[#334155] text-[#38BDF8] focus:ring-[#38BDF8]"
              />
              <label htmlFor="edit-is-active" className="text-xs text-[#CBD5E1] cursor-pointer">
                <strong className="text-white">Active</strong> (Visible to funeral homes)
              </label>
            </div>
          </div>

          {/* PDF Template URL */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              Template PDF URL
            </label>
            <input
              type="url"
              value={templatePdfUrl}
              onChange={(e) => setTemplatePdfUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2.5 text-xs text-white font-mono focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          {/* Dynamic AI tokens */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase block mb-1.5">
              AI Pre-fill Field Tokens
            </label>
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
                placeholder="Add token name…"
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/compliance"
            className="text-xs text-[#94A3B8] hover:text-white transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded bg-[#38BDF8] hover:bg-[#0284C7] text-[#0F172A] text-xs font-bold transition-colors"
          >
            {isSaving ? 'Updating…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
