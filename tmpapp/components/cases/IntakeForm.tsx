'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import type { CaseInsert } from '@/types'

const STEPS = [
  { key: 'deceased', label: 'About Deceased', number: '01' },
  { key: 'family', label: 'Family Contact', number: '02' },
  { key: 'service', label: 'Service Details', number: '03' },
] as const

type FormData = CaseInsert & { sms_opt_in: boolean }

const EMPTY_FORM: FormData = {
  deceased_name: '',
  date_of_birth: null,
  date_of_death: '',
  place_of_death: null,
  occupation: null,
  additional_notes: null,
  family_contact_name: '',
  family_contact_email: null,
  family_contact_phone: null,
  relationship_to_deceased: null,
  service_type: null,
  service_date: null,
  service_location: null,
  sms_opt_in: false,
}

export default function IntakeForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  function update(field: keyof FormData, value: string | boolean | null) {
    setForm((prev) => ({ ...prev, [field]: value || null }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validateStep(stepIndex: number): boolean {
    const newErrors: Record<string, string> = {}

    if (stepIndex === 0) {
      if (!form.deceased_name?.trim()) {
        newErrors.deceased_name = 'Full legal name of the deceased is required'
      }
      if (!form.date_of_death) {
        newErrors.date_of_death = 'Date of passing is required'
      }
    }

    if (stepIndex === 1) {
      if (!form.family_contact_name?.trim()) {
        newErrors.family_contact_name = 'A family contact name is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function saveDraft() {
    setIsSavingDraft(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, is_draft: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        const errMsg = data.error || 'Could not save draft. Please try again.'
        setSubmitError(errMsg)
        toast({ type: 'error', title: 'Draft Not Saved', message: errMsg })
        return
      }

      const { id } = await res.json()
      toast({ type: 'success', title: 'Draft Saved', message: 'Case saved as draft.' })
      router.push(`/dashboard/cases/${id}`)
    } catch {
      const errMsg = 'Unable to reach the server. Please check your connection.'
      setSubmitError(errMsg)
      toast({ type: 'error', title: 'Connection Error', message: errMsg })
    } finally {
      setIsSavingDraft(false)
    }
  }

  async function handleSubmit() {
    if (!validateStep(0) || !validateStep(1)) {
      if (!form.deceased_name?.trim() || !form.date_of_death) {
        setStep(0)
      } else if (!form.family_contact_name?.trim()) {
        setStep(1)
      }
      toast({ type: 'error', title: 'Validation Required', message: 'Please complete required fields.' })
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, is_draft: false }),
      })

      if (!res.ok) {
        const data = await res.json()
        const errMsg = data.error || 'Could not create the case. Please try again.'
        setSubmitError(errMsg)
        toast({ type: 'error', title: 'Submission Failed', message: errMsg })
        return
      }

      const { id } = await res.json()
      toast({ type: 'success', title: 'Case Created', message: 'Intake case recorded successfully.' })
      router.push(`/dashboard/cases/${id}`)
    } catch {
      const errMsg = 'Unable to reach the server. Please check your connection.'
      setSubmitError(errMsg)
      toast({ type: 'error', title: 'Connection Error', message: errMsg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isWorking = isSubmitting || isSavingDraft

  return (
    <div className="max-w-2xl mx-auto">
      {/* Wizard Progress Nav */}
      <nav className="mb-8" aria-label="Form progress">
        <ol className="grid grid-cols-3 gap-3 p-1.5 bg-white border border-[#E5E2DC] rounded shadow-sm">
          {STEPS.map((s, i) => {
            const isActive = step === i
            const isCompleted = step > i
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`w-full py-2.5 px-3 rounded text-left transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#2C221E] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-[#FAF9F7] text-[#2C221E] hover:bg-[#E5E2DC]/60'
                      : 'bg-transparent text-[#8C7E6E] hover:bg-[#FAF9F7]'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-mono block ${isActive ? 'text-[#D4C596]' : 'text-[#8C7E6E]'}`}>
                      STEP {s.number}
                    </span>
                    <span className="text-xs font-semibold block truncate">
                      {s.label}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-xs font-bold text-[#346538]">✓</span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Form Card */}
      <div className="card-premium p-6 sm:p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />

        {/* Step 1: Deceased Info */}
        {step === 0 && (
          <fieldset className="space-y-6 animate-fade-in-up" disabled={isWorking}>
            <div className="border-b border-[#E5E2DC] pb-4">
              <h2 className="text-xl font-display font-medium text-[#2C221E]">
                Vital Statistics &amp; Background
              </h2>
              <p className="text-xs text-[#6B5E50] mt-1">
                Essential records for official state certificates and tribute preparation.
              </p>
            </div>

            <div>
              <label htmlFor="deceased-name" className="field-label">
                Full Legal Name <span className="text-[#9F2F2D]">*</span>
              </label>
              <input
                id="deceased-name"
                type="text"
                value={form.deceased_name}
                onChange={(e) => update('deceased_name', e.target.value)}
                placeholder="e.g. Eleanor Mary Vance"
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
              {errors.deceased_name && (
                <p className="text-[#9F2F2D] text-xs mt-1.5">{errors.deceased_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date-of-birth" className="field-label">
                  Date of Birth
                </label>
                <input
                  id="date-of-birth"
                  type="date"
                  value={form.date_of_birth ?? ''}
                  onChange={(e) => update('date_of_birth', e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="date-of-death" className="field-label">
                  Date of Passing <span className="text-[#9F2F2D]">*</span>
                </label>
                <input
                  id="date-of-death"
                  type="date"
                  value={form.date_of_death}
                  onChange={(e) => update('date_of_death', e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
                {errors.date_of_death && (
                  <p className="text-[#9F2F2D] text-xs mt-1.5">{errors.date_of_death}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="place-of-death" className="field-label">
                Place of Passing
              </label>
              <input
                id="place-of-death"
                type="text"
                value={form.place_of_death ?? ''}
                onChange={(e) => update('place_of_death', e.target.value)}
                placeholder="Hospital name, residence address, or city"
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="occupation" className="field-label">
                Occupation / Life&apos;s Work
              </label>
              <input
                id="occupation"
                type="text"
                value={form.occupation ?? ''}
                onChange={(e) => update('occupation', e.target.value)}
                placeholder="e.g. Professor of Literature for 30 years"
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="additional-notes" className="field-label">
                Memories, Passions &amp; Family Notes
              </label>
              <textarea
                id="additional-notes"
                rows={4}
                value={form.additional_notes ?? ''}
                onChange={(e) => update('additional_notes', e.target.value)}
                placeholder="Notes shared by the family — hobbies, favorite memories, values, surviving family. These details power the AI obituary writer."
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors resize-none leading-relaxed"
              />
            </div>
          </fieldset>
        )}

        {/* Step 2: Family Contact */}
        {step === 1 && (
          <fieldset className="space-y-6 animate-fade-in-up" disabled={isWorking}>
            <div className="border-b border-[#E5E2DC] pb-4">
              <h2 className="text-xl font-display font-medium text-[#2C221E]">
                Primary Family Informant
              </h2>
              <p className="text-xs text-[#6B5E50] mt-1">
                The primary next-of-kin coordinating arrangements and approving legal drafts.
              </p>
            </div>

            <div>
              <label htmlFor="family-contact-name" className="field-label">
                Contact Name <span className="text-[#9F2F2D]">*</span>
              </label>
              <input
                id="family-contact-name"
                type="text"
                value={form.family_contact_name}
                onChange={(e) => update('family_contact_name', e.target.value)}
                placeholder="e.g. Sarah Vance"
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
              {errors.family_contact_name && (
                <p className="text-[#9F2F2D] text-xs mt-1.5">{errors.family_contact_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="relationship" className="field-label">
                Relationship to Deceased
              </label>
              <input
                id="relationship"
                type="text"
                value={form.relationship_to_deceased ?? ''}
                onChange={(e) => update('relationship_to_deceased', e.target.value)}
                placeholder="e.g. Daughter, Spouse, Sibling"
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="family-email" className="field-label">
                  Email Address
                </label>
                <input
                  id="family-email"
                  type="email"
                  value={form.family_contact_email ?? ''}
                  onChange={(e) => update('family_contact_email', e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="family-phone" className="field-label">
                  Mobile / Phone Number
                </label>
                <input
                  id="family-phone"
                  type="tel"
                  value={form.family_contact_phone ?? ''}
                  onChange={(e) => update('family_contact_phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {form.family_contact_phone && (
              <div className="p-3 bg-[#FAF9F7] border border-[#E5E2DC] rounded">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sms_opt_in}
                    onChange={(e) => update('sms_opt_in', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E5E2DC] text-[#2C221E] focus:ring-[#A8935D]"
                  />
                  <span className="text-xs text-[#4D4237]">
                    <strong className="text-[#2C221E]">SMS Notification Consent:</strong> The family has agreed to receive milestone SMS notifications regarding service schedules and document links.
                  </span>
                </label>
              </div>
            )}
          </fieldset>
        )}

        {/* Step 3: Service Details */}
        {step === 2 && (
          <fieldset className="space-y-6 animate-fade-in-up" disabled={isWorking}>
            <div className="border-b border-[#E5E2DC] pb-4">
              <h2 className="text-xl font-display font-medium text-[#2C221E]">
                Service &amp; Disposition Preferences
              </h2>
              <p className="text-xs text-[#6B5E50] mt-1">
                Optional initial arrangements. These can be modified as the family finalizes their plans.
              </p>
            </div>

            <div>
              <label htmlFor="service-type" className="field-label">
                Disposition / Service Type
              </label>
              <select
                id="service-type"
                value={form.service_type ?? ''}
                onChange={(e) => update('service_type', e.target.value)}
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">Pending Family Decision</option>
                <option value="burial">Traditional Burial</option>
                <option value="cremation">Cremation Service</option>
                <option value="memorial">Memorial Service</option>
                <option value="graveside">Graveside Service</option>
                <option value="celebration_of_life">Celebration of Life</option>
                <option value="other">Other Disposition</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="service-date" className="field-label">
                  Service Date &amp; Time
                </label>
                <input
                  id="service-date"
                  type="datetime-local"
                  value={form.service_date ?? ''}
                  onChange={(e) => update('service_date', e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="service-location" className="field-label">
                  Chapel or Venue Location
                </label>
                <input
                  id="service-location"
                  type="text"
                  value={form.service_location ?? ''}
                  onChange={(e) => update('service_location', e.target.value)}
                  placeholder="e.g. St. Jude's Chapel / Main Sanctuary"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </fieldset>
        )}

        {submitError && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] mt-6 rounded-r" role="alert">
            {submitError}
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E2DC]">
          <div>
            {step > 0 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isWorking}
                className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] transition-colors disabled:opacity-50"
              >
                &larr; Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={isWorking}
              className="btn-secondary !w-auto text-xs px-4 py-2 font-semibold"
            >
              {isSavingDraft ? 'Saving Draft…' : 'Save as Draft'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isWorking}
                className="btn-primary !w-auto text-xs px-5 py-2 font-semibold"
              >
                Continue &rarr;
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isWorking}
                className="btn-primary !w-auto text-xs px-5 py-2 font-semibold"
              >
                {isSubmitting ? 'Creating Case Record…' : 'Finalize & Open Case →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
