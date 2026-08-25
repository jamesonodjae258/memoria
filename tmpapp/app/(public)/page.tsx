import Link from 'next/link'

export const metadata = {
  title: 'Memoria — Modern AI Suite for Funeral Homes',
  description: 'AI-assisted case intake, obituary drafting, family communications, and state compliance for independent funeral directors.',
}

export default function PublicGetStartedPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between selection:bg-[#A8935D] selection:text-white">
      {/* Top Brand Header */}
      <header className="px-6 py-6 border-b border-[#E5E2DC] bg-[#F8F7F4]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#2C221E] text-[#D4C596] font-display text-lg font-semibold flex items-center justify-center border border-[#1A1310] shadow-sm">
              M
            </div>
            <div>
              <span className="font-display font-semibold text-base text-[#2C221E] tracking-tight block leading-tight">
                Memoria
              </span>
              <span className="text-[9px] uppercase font-bold text-[#8C7E6E] tracking-widest block">
                Funeral Operations Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold uppercase tracking-wider text-[#6B5E50] hover:text-[#2C221E] transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-xs font-semibold uppercase tracking-wider px-4 py-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Minimal Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFECE6] border border-[#DCD7CD] text-[#6B5E50] text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8935D] animate-pulse" />
            Next-Generation Funeral Home Software
          </div>

          {/* Logo Mark Large */}
          <div className="w-16 h-16 rounded-xl bg-[#2C221E] text-[#D4C596] font-display text-3xl font-semibold flex items-center justify-center mx-auto mb-6 border border-[#1A1310] shadow-md">
            M
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2C221E] tracking-tight leading-tight mb-4">
            Memoria Funeral Operations Suite
          </h1>

          {/* One-line Description */}
          <p className="text-sm sm:text-base text-[#6B5E50] leading-relaxed max-w-md mx-auto mb-10">
            Dignified, AI-assisted case management, obituary drafting, automated family communications, and state compliance for modern funeral homes.
          </p>

          {/* Two Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex-1 btn-primary h-12 flex items-center justify-center text-xs font-semibold uppercase tracking-wider shadow-sm"
            >
              Create account →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex-1 btn-secondary h-12 flex items-center justify-center text-xs font-semibold uppercase tracking-wider"
            >
              Log in
            </Link>
          </div>

          {/* 30-Day Free Trial Notice */}
          <p className="text-[11px] text-[#8C7E6E] mt-6">
            Includes 30-day full access free trial • No credit card required to start
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-[#E5E2DC] text-center text-xs text-[#8C7E6E]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Memoria Systems, Inc. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/login" className="hover:text-[#2C221E] transition-colors">
              Director Login
            </Link>
            <span>•</span>
            <Link href="/signup" className="hover:text-[#2C221E] transition-colors">
              New Funeral Home Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
