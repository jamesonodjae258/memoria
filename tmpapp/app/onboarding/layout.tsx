import Link from 'next/link'

export const metadata = {
  title: 'Onboarding — Memoria Funeral Suite',
  description: 'Setup and configure your funeral home on Memoria.',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col selection:bg-[#A8935D] selection:text-white">
      {/* Top Fixed Header */}
      <header className="px-6 py-4 border-b border-[#E5E2DC] bg-[#F8F7F4]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2C221E] text-[#D4C596] font-display text-base font-semibold flex items-center justify-center border border-[#1A1310] shadow-sm">
              M
            </div>
            <div>
              <span className="font-display font-semibold text-sm text-[#2C221E] tracking-tight block leading-tight">
                Memoria
              </span>
              <span className="text-[9px] uppercase font-bold text-[#8C7E6E] tracking-widest block">
                Account Setup &amp; Onboarding
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#8C7E6E]">
            <span className="hidden sm:inline">Need help? support@memoria.app</span>
            <Link
              href="/login"
              className="text-[#6B5E50] hover:text-[#2C221E] transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#8C7E6E] border-t border-[#E5E2DC]">
        &copy; {new Date().getFullYear()} Memoria Operations Suite • 30-Day Free Trial
      </footer>
    </div>
  )
}
