'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'


interface ComplianceTemplateItem {
  id: string
  state_id: string
  form_name: string
  description: string | null
  is_required: boolean
  template_pdf_url: string | null
  required_fields: string[]
  is_active: boolean
  states?: {
    name: string
    abbreviation: string
  }
}

interface RegisteredState {
  id: string
  state_id: string
  is_primary: boolean
  name: string
  abbreviation: string
}

interface ActiveCaseOption {
  id: string
  deceased_name: string
  status: string
}

function ComplianceLibraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryStateId = searchParams.get('state_id')


  const [registeredStates, setRegisteredStates] = useState<RegisteredState[]>([])
  const [activeState, setActiveState] = useState<{ id: string; name: string; abbreviation: string } | null>(null)
  const [templates, setTemplates] = useState<ComplianceTemplateItem[]>([])
  const [activeCases, setActiveCases] = useState<ActiveCaseOption[]>([])
  const [funeralHomeName, setFuneralHomeName] = useState('Memoria Memorial Home')
  const [staffName, setStaffName] = useState('Director')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate modal state
  const [selectedTemplate, setSelectedTemplate] = useState<ComplianceTemplateItem | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  async function loadComplianceData(targetStateId?: string) {
    setIsLoading(true)
    setError(null)
    try {
      const url = targetStateId
        ? `/api/compliance/templates?state_id=${targetStateId}`
        : '/api/compliance/templates'
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to load state compliance library')
      }
      const json = await res.json()
      setRegisteredStates(json.registeredStates || [])
      setActiveState(json.activeState || null)
      setTemplates(json.templates || [])
      setActiveCases(json.activeCases || [])
      if (json.activeCases?.length > 0 && !selectedCaseId) {
        setSelectedCaseId(json.activeCases[0].id)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching compliance data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComplianceData(queryStateId || undefined)
  }, [queryStateId])

  // Fetch staff profile branding
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/onboarding/status')
        if (res.ok) {
          const json = await res.json()
          if (json.funeralHome?.name) setFuneralHomeName(json.funeralHome.name)
          if (json.profile?.full_name) setStaffName(json.profile.full_name)
          if (json.profile?.is_super_admin) setIsSuperAdmin(true)
        }
      } catch {}
    }
    loadStatus()
  }, [])

  const handleStateTabChange = (stateId: string) => {
    loadComplianceData(stateId)
  }

  const openGenerateModal = (template: ComplianceTemplateItem) => {
    setSelectedTemplate(template)
    setGenerateError(null)
    if (activeCases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(activeCases[0].id)
    }
  }

  async function handleConfirmGenerate() {
    if (!selectedCaseId || !selectedTemplate) return
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch('/api/documents/generate-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: selectedCaseId,
          template_id: selectedTemplate.id,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate document')
      }

      router.push(`/dashboard/cases/${selectedCaseId}/documents`)
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed')
      setIsGenerating(false)
    }
  }

  const requiredTemplates = templates.filter((t) => t.is_required)
  const optionalTemplates = templates.filter((t) => !t.is_required)

  const primaryState = registeredStates.find((s) => s.is_primary) || registeredStates[0]

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body flex flex-col selection:bg-[#A8935D] selection:text-white">
      <DashboardHeader
        funeralHomeName={funeralHomeName}
        staffName={staffName}
        isSuperAdmin={isSuperAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white text-[#8C7E6E] text-[11px] font-semibold uppercase tracking-wider mb-2 border border-[#E5E2DC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8935D]" />
              Regulatory Compliance Library
            </div>
            <h1 className="text-3xl font-display font-semibold text-[#2C221E] tracking-tight">
              State Compliance &amp; Legal Forms
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E50] mt-1">
              State-mandated death certificates, permits, and affidavits pre-populated by Memoria AI.
            </p>
          </div>

          <Link
            href="/dashboard/settings/states"
            className="btn-secondary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2.5 h-10 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>⚙️</span>
            <span>Manage Operating States</span>
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-4 text-xs text-[#9F2F2D] rounded-r">
            {error}
          </div>
        )}

        {/* Primary State Callout & State Switcher */}
        <div className="card-premium p-6 relative">
          <div className="brass-inlay absolute top-0 left-0 right-0" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6E] block">
                Primary Licensed Jurisdiction
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-xl font-display font-semibold text-[#2C221E]">
                  {primaryState?.name || 'Texas'} ({primaryState?.abbreviation || 'TX'})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#EDF3EC] text-[#346538] text-[10px] font-bold uppercase font-mono">
                  Primary State
                </span>
              </div>
            </div>

            {/* State Tabs if multiple registered */}
            {registeredStates.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8C7E6E] font-medium hidden sm:inline">
                  Viewing State:
                </span>
                <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F7] rounded border border-[#E5E2DC] overflow-x-auto">
                  {registeredStates.map((st) => {
                    const isSelected = activeState?.id === st.state_id || activeState?.abbreviation === st.abbreviation
                    return (
                      <button
                        key={st.state_id}
                        type="button"
                        onClick={() => handleStateTabChange(st.state_id)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#2C221E] text-[#D4C596] shadow-sm font-bold'
                            : 'text-[#6B5E50] hover:text-[#2C221E]'
                        }`}
                      >
                        {st.name} ({st.abbreviation})
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Templates Display */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#8C7E6E]">
            Loading compliance templates…
          </div>
        ) : templates.length === 0 ? (
          /* Empty State as requested */
          <div className="card-premium p-12 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F7] border border-[#E5E2DC] text-[#A8935D] text-2xl flex items-center justify-center mx-auto">
              📜
            </div>
            <h3 className="font-display text-lg font-semibold text-[#2C221E]">
              Forms in Preparation
            </h3>
            <p className="text-xs sm:text-sm text-[#6B5E50] max-w-md mx-auto leading-relaxed">
              Compliance forms for <strong>{activeState?.name || 'this state'}</strong> are being added. Contact us to prioritize your state.
            </p>
            <div className="pt-2">
              <a
                href="mailto:support@memoria.app?subject=State%20Compliance%20Request"
                className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-5 py-2.5 inline-block"
              >
                Request State Forms &rarr;
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Required Forms Section */}
            {requiredTemplates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9F2F2D]" />
                    <h2 className="font-display text-lg font-semibold text-[#2C221E]">
                      Mandatory State Filings ({requiredTemplates.length})
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#8C7E6E]">
                    Required for every service in {activeState?.abbreviation}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="card-premium p-5 flex flex-col justify-between space-y-4 border-l-4 border-l-[#A8935D]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-[#2C221E] leading-snug">
                            {template.form_name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FBF3DB] text-[#956400] shrink-0 font-mono">
                            Mandatory
                          </span>
                        </div>

                        {template.description && (
                          <p className="text-xs text-[#6B5E50] leading-relaxed">
                            {template.description}
                          </p>
                        )}

                        {Array.isArray(template.required_fields) && template.required_fields.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] uppercase font-bold text-[#8C7E6E] tracking-wider block mb-1">
                              AI Pre-filled Fields ({template.required_fields.length}):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {template.required_fields.map((f, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-[#FAF9F7] border border-[#E5E2DC] text-[10px] font-mono text-[#6B5E50]"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
                        {template.template_pdf_url ? (
                          <a
                            href={template.template_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#A8935D] hover:underline font-medium"
                          >
                            Blank PDF Preview &rarr;
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#8C7E6E]">Dynamic Generator</span>
                        )}

                        <button
                          type="button"
                          onClick={() => openGenerateModal(template)}
                          className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2"
                        >
                          Generate for Case &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional / Ancillary Forms Section */}
            {optionalTemplates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B5E50]" />
                    <h2 className="font-display text-lg font-semibold text-[#2C221E]">
                      Conditional &amp; Ancillary Forms ({optionalTemplates.length})
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#8C7E6E]">
                    Optional based on disposition type or family requests
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optionalTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="card-premium p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-[#2C221E] leading-snug">
                            {template.form_name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAF9F7] border border-[#E5E2DC] text-[#8C7E6E] shrink-0 font-mono">
                            Optional
                          </span>
                        </div>

                        {template.description && (
                          <p className="text-xs text-[#6B5E50] leading-relaxed">
                            {template.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
                        {template.template_pdf_url ? (
                          <a
                            href={template.template_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#A8935D] hover:underline font-medium"
                          >
                            Blank PDF Preview &rarr;
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#8C7E6E]">Dynamic Generator</span>
                        )}

                        <button
                          type="button"
                          onClick={() => openGenerateModal(template)}
                          className="btn-secondary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2"
                        >
                          Generate for Case &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 11c — Generate for Case Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E2DC] w-full max-w-lg rounded-lg p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="brass-inlay absolute top-0 left-0 right-0" />

            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              disabled={isGenerating}
              className="absolute top-4 right-4 text-[#8C7E6E] hover:text-[#2C221E] text-base font-bold"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8935D] block">
                AI Compliance Generator
              </span>
              <h2 className="text-lg font-display font-semibold text-[#2C221E] tracking-tight mt-0.5">
                {selectedTemplate.form_name}
              </h2>
              <p className="text-xs text-[#6B5E50] mt-1">
                Select the case you want to generate and pre-populate this official document for.
              </p>
            </div>

            {generateError && (
              <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] rounded-r">
                {generateError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="field-label">
                  Select Active Case Intake *
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] font-medium focus:bg-white focus:border-[#A8935D] focus:outline-none"
                >
                  {activeCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.deceased_name} (Status: {c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#FAF9F7] p-3.5 rounded border border-[#E5E2DC] text-xs text-[#6B5E50] space-y-1.5">
                <div className="font-semibold text-[#2C221E] flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>Automated Field Mapping:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Memoria will extract legal names, dates, place of death, next-of-kin, and vital records from the case file to compose this PDF.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E5E2DC]">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                disabled={isGenerating}
                className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] py-2 px-3"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmGenerate}
                disabled={isGenerating || !selectedCaseId}
                className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-6 py-2.5 flex items-center gap-2"
              >
                {isGenerating ? (
                  <span>Generating Compliance PDF…</span>
                ) : (
                  <span>Generate &amp; Open Document &rarr;</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ComplianceLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center text-xs text-[#8C7E6E]">
          Loading Compliance Library…
        </div>
      }
    >
      <ComplianceLibraryContent />
    </Suspense>
  )
}

