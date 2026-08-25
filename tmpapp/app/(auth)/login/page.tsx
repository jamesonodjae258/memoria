'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPortalPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  
  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Register fields
  const [fullName, setFullName] = useState('')
  const [funeralHomeName, setFuneralHomeName] = useState('')
  const [stateCode, setStateCode] = useState('TX')

  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const setDemoSession = () => {
    document.cookie = 'gp_demo_session=true; path=/; max-age=86400; SameSite=Lax'
    router.push('/dashboard')
    router.refresh()
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsLoading(true)

    try {
      const isPlaceholderEnv =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

      // If placeholder or demo credentials, sign into demo session
      if (isPlaceholderEnv || email === 'director@graceandpeace.com') {
        setDemoSession()
        return
      }

      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(`${authError.message}. If you don't have an account yet, click "Create Account" above or use Quick Demo Mode.`)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setDemoSession()
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          funeralHomeName,
          state: stateCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create staff account.')
        return
      }

      // Try automatic sign in with the new credentials
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSuccessMsg('Account created successfully! You can now sign in.')
        setMode('login')
      }
    } catch {
      setError('An error occurred during registration. You can also explore via Demo Mode.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      {/* Brand & Portal Title */}
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded bg-[#2C221E] text-[#D4C596] font-display text-xl font-semibold flex items-center justify-center mx-auto mb-3 border border-[#1A1310] shadow-sm">
          M
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#2C221E] tracking-tight">
          Memoria Operations Suite
        </h1>
        <p className="text-[#8C7E6E] mt-1 text-xs font-semibold tracking-wider uppercase">
          Staff &amp; Director Portal
        </p>
      </div>


      {/* Auth Card */}
      <div className="card-premium p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF9F7] rounded border border-[#E5E2DC] mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
              setSuccessMsg(null)
            }}
            className={`py-2 rounded transition-all ${
              mode === 'login'
                ? 'bg-white text-[#2C221E] shadow-sm border border-[#E5E2DC]'
                : 'text-[#8C7E6E] hover:text-[#2C221E]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
              setSuccessMsg(null)
            }}
            className={`py-2 rounded transition-all ${
              mode === 'register'
                ? 'bg-white text-[#2C221E] shadow-sm border border-[#E5E2DC]'
                : 'text-[#8C7E6E] hover:text-[#2C221E]'
            }`}
          >
            Create Account
          </button>
        </div>

        {successMsg && (
          <div className="border-l-2 border-[#346538] bg-[#EDF3EC] p-3 text-xs text-[#346538] rounded-r mb-5">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] rounded-r mb-5">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="field-label">
                Staff Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@graceandpeace.com"
                required
                autoComplete="email"
                disabled={isLoading}
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary mt-2 text-xs font-semibold uppercase tracking-wider h-10 w-full"
            >
              {isLoading ? 'Authenticating…' : 'Sign In to Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-fullname" className="field-label">
                Your Full Legal / Professional Name
              </label>
              <input
                id="reg-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Jenkins, LFD"
                required
                disabled={isLoading}
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="reg-fh-name" className="field-label">
                Funeral Home / Mortuary Name
              </label>
              <input
                id="reg-fh-name"
                type="text"
                value={funeralHomeName}
                onChange={(e) => setFuneralHomeName(e.target.value)}
                placeholder="Grace & Peace Chapel"
                required
                disabled={isLoading}
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="reg-email" className="field-label">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@mychapel.com"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="reg-state" className="field-label">
                  State
                </label>
                <input
                  id="reg-state"
                  type="text"
                  maxLength={2}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                  placeholder="TX"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] uppercase text-center focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="field-label">
                Create Secure Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                disabled={isLoading}
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary mt-2 text-xs font-semibold uppercase tracking-wider h-10 w-full"
            >
              {isLoading ? 'Creating Staff Profile…' : 'Register Funeral Home & Director'}
            </button>
          </form>
        )}

        {/* Quick Demo Mode Bypass */}
        <div className="mt-6 pt-5 border-t border-[#E5E2DC] text-center">
          <button
            type="button"
            onClick={setDemoSession}
            className="text-xs font-semibold text-[#A8935D] hover:text-[#2C221E] transition-colors"
          >
            ⚡ Instant Director Demo (1-Click Bypass)
          </button>
        </div>
      </div>

      {/* Return to Home Link */}
      <div className="text-center mt-6">
        <Link href="/" className="text-xs text-[#8C7E6E] hover:text-[#2C221E] transition-colors">
          &larr; Return to Public Home
        </Link>
      </div>
    </div>
  )
}
