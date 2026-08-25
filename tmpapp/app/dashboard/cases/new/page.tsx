import Link from 'next/link'
import IntakeForm from '@/components/cases/IntakeForm'

export default function NewCasePage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body selection:bg-[#A8935D] selection:text-white flex flex-col">
      {/* Top Header & Breadcrumb Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E5E2DC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav className="text-xs text-[#8C7E6E] flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-[#4D4237] hover:text-[#2C221E] font-medium transition-colors inline-flex items-center gap-1.5"
            >
              &larr; Return to Ledger
            </Link>
            <span className="text-[#D2C9BD]">/</span>
            <span className="text-[#2C221E] font-medium">New Case Intake</span>
          </nav>

          <span className="text-[11px] font-mono text-[#8C7E6E] bg-white border border-[#E5E2DC] px-2.5 py-1 rounded">
            Step-by-Step Wizard
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-1 w-full">
        <div className="mb-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#8C7E6E] text-xs font-semibold uppercase tracking-widest mb-3 border border-[#E5E2DC] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#A8935D]" />
            First-Call Intake
          </div>
          <h1 className="text-3xl font-display font-medium text-[#2C221E] tracking-tight">
            Record New Case Intake
          </h1>
          <p className="text-xs text-[#6B5E50] mt-2 leading-relaxed">
            Record decedent information, next-of-kin contacts, and service preferences from the family&apos;s initial phone call. You can save a draft at any stage.
          </p>
        </div>

        <IntakeForm />
      </main>
    </div>
  )
}
