import Link from 'next/link'

interface OnboardingHeaderProps {
  currentStep: 1 | 2 | 3 | 4
  title: string
  subtitle: string
  backUrl?: string
}

export default function OnboardingHeader({
  currentStep,
  title,
  subtitle,
  backUrl,
}: OnboardingHeaderProps) {
  const steps = [
    { num: 1, label: 'Funeral Home Details' },
    { num: 2, label: 'Operating States' },
    { num: 3, label: 'Team Invitations' },
    { num: 4, label: 'Ready & Complete' },
  ]

  const progressPercent = ((currentStep) / 4) * 100

  return (
    <div className="mb-8">
      {/* Top Bar with Back Button and Step Counter */}
      <div className="flex items-center justify-between mb-4">
        {backUrl ? (
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] transition-colors py-1 px-2 -ml-2 rounded hover:bg-[#EFECE6]"
          >
            <span>&larr;</span>
            <span>Back</span>
          </Link>
        ) : (
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[#8C7E6E]">
            Initial Configuration
          </div>
        )}

        <div className="text-xs font-semibold text-[#8C7E6E]">
          Step <span className="text-[#2C221E] font-bold">{currentStep}</span> of 4
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-[#E5E2DC] h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-[#A8935D] h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pills on wider screens */}
      <div className="hidden sm:grid grid-cols-4 gap-2 mb-8">
        {steps.map((s) => {
          const isCompleted = currentStep > s.num
          const isCurrent = currentStep === s.num
          return (
            <div
              key={s.num}
              className={`p-2.5 rounded border text-xs transition-all ${
                isCurrent
                  ? 'bg-white border-[#A8935D] text-[#2C221E] shadow-sm font-semibold'
                  : isCompleted
                  ? 'bg-[#EFECE6]/60 border-[#DCD7CD] text-[#6B5E50]'
                  : 'bg-[#FAF9F7]/40 border-[#E5E2DC] text-[#B0A393]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                    isCompleted
                      ? 'bg-[#346538] text-white'
                      : isCurrent
                      ? 'bg-[#2C221E] text-[#D4C596]'
                      : 'bg-[#E5E2DC] text-[#8C7E6E]'
                  }`}
                >
                  {isCompleted ? '✓' : s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Step Title and Subtitle */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#2C221E] tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5E50] mt-1.5">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
