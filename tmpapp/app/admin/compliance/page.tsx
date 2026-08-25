'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface TemplateItem {
  id: string
  state_id: string
  form_name: string
  description: string | null
  is_required: boolean
  template_pdf_url: string | null
  required_fields: string[]
  is_active: boolean
  created_at: string
  states?: {
    id: string
    name: string
    abbreviation: string
  }
}

function AdminComplianceContent() {
  const searchParams = useSearchParams()
  const initialSelectedState = searchParams.get('state_id') || 'all'


  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [states, setStates] = useState<{ id: string; name: string; abbreviation: string }[]>([])
  const [selectedState, setSelectedState] = useState<string>(initialSelectedState)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Load states dropdown
  useEffect(() => {
    async function loadStatesList() {
      try {
        const res = await fetch('/api/admin/states')
        if (res.ok) {
          const json = await res.json()
          setStates(json.states || [])
        }
      } catch {}
    }
    loadStatesList()
  }, [])

  // Load templates
  async function loadTemplates() {
    setIsLoading(true)
    setError(null)
    try {
      const url =
        selectedState && selectedState !== 'all'
          ? `/api/admin/compliance?state_id=${selectedState}`
          : '/api/admin/compliance'
      const res = await fetch(url)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to load templates')
      }
      const json = await res.json()
      setTemplates(json.templates || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching templates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [selectedState])

  async function toggleActive(id: string, currentActive: boolean) {
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: !currentActive,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to toggle status')
      }

      setTemplates(
        templates.map((t) => (t.id === id ? { ...t, is_active: !currentActive } : t))
      )
      setSuccessMsg(`Template status changed to ${!currentActive ? 'Active' : 'Inactive'}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle status')
    }
  }

  async function handleDelete(id: string, formName: string) {
    if (!confirm(`Are you sure you want to delete "${formName}"?`)) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/admin/compliance?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete template')
      }

      setSuccessMsg(`Deleted "${formName}" successfully.`)
      setTemplates(templates.filter((t) => t.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Compliance Templates Library
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Configure state-mandated death certificates, burial permits, and cremation authorization forms.
          </p>
        </div>

        <Link
          href={`/admin/compliance/new${selectedState !== 'all' ? `?state_id=${selectedState}` : ''}`}
          className="px-3.5 py-2 rounded bg-[#38BDF8] hover:bg-[#0284C7] text-[#0F172A] text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Add Compliance Template</span>
        </Link>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-[#451A1A] border-l-4 border-[#EF4444] p-3 text-xs text-[#FCA5A5] rounded-r">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-[#064E3B] border-l-4 border-[#10B981] p-3 text-xs text-[#6EE7B7] rounded-r">
          {successMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#1E293B] border border-[#334155] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#94A3B8] uppercase">
            Filter by State:
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] rounded p-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none font-medium min-w-[200px]"
          >
            <option value="all">All States ({templates.length} templates)</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.abbreviation})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#94A3B8] font-mono">
          Showing {templates.length} template{templates.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#94A3B8]">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-xs text-[#94A3B8]">
              No compliance templates found for the selected state.
            </p>
            <Link
              href={`/admin/compliance/new${selectedState !== 'all' ? `?state_id=${selectedState}` : ''}`}
              className="inline-block px-3 py-1.5 rounded bg-[#334155] hover:bg-[#475569] text-xs text-[#38BDF8] font-semibold transition-colors"
            >
              + Create first template
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-[#94A3B8] border-b border-[#334155]">
                <tr>
                  <th className="p-3.5 font-medium">State</th>
                  <th className="p-3.5 font-medium">Form Name &amp; Description</th>
                  <th className="p-3.5 font-medium">Mandatory</th>
                  <th className="p-3.5 font-medium">Required Fields (AI)</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-[#CBD5E1]">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-[#334155]/40 transition-colors">
                    <td className="p-3.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#334155] text-white font-mono text-[11px] font-bold">
                        {t.states?.abbreviation || '??'}
                      </span>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">
                        {t.states?.name}
                      </div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-white text-sm">{t.form_name}</div>
                      {t.description && (
                        <div className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-2">
                          {t.description}
                        </div>
                      )}
                      {t.template_pdf_url && (
                        <div className="mt-1">
                          <a
                            href={t.template_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#38BDF8] hover:underline font-mono"
                          >
                            📄 PDF Template Link &rarr;
                          </a>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          t.is_required
                            ? 'bg-[#78350F] text-[#FBBF24]'
                            : 'bg-[#334155] text-[#94A3B8]'
                        }`}
                      >
                        {t.is_required ? 'Required' : 'Optional'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {Array.isArray(t.required_fields) && t.required_fields.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.required_fields.map((f, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-[#0F172A] border border-[#334155] text-[10px] font-mono text-[#CBD5E1]"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#64748B] text-[11px] italic">No custom fields</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => toggleActive(t.id, t.is_active)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                          t.is_active
                            ? 'bg-[#064E3B] text-[#34D399] hover:bg-[#065F46]'
                            : 'bg-[#451A1A] text-[#F87171] hover:bg-[#581C1C]'
                        }`}
                      >
                        {t.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/compliance/${t.id}/edit`}
                        className="text-[11px] text-[#38BDF8] hover:underline"
                      >
                        Edit
                      </Link>
                      <span className="text-[#475569]">•</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.form_name)}
                        className="text-[11px] text-[#EF4444] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminCompliancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#64748B]">
          Loading Compliance Templates…
        </div>
      }
    >
      <AdminComplianceContent />
    </Suspense>
  )
}

