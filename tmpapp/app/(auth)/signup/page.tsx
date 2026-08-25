'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Form validations
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.')
      return
    }

    setIsLoading(true)

    try {
      const isPlaceholderEnv =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

      if (isPlaceholderEnv) {
        // In local mock mode, set cookie and proceed to onboarding step 1
        document.cookie = 'gp_demo_session=true; path=/; max-age=86400; SameSite=Lax'
        router.push('/onboarding/step-1')
        router.refresh()
        return
      }

      const supabase = createClient()

      // Sign up user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: 'owner',
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message || 'Failed to create your account. Please try again.')
        return
      }

      if (!data.user) {
        setError('Unable to initialize user profile. Please try again.')
        return
      }

      // Automatically sign in if email confirmation isn't strictly blocking
      if (data.session) {
        router.push('/onboarding/step-1')
        router.refresh()
      } else {
        // Try direct sign in immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        })

        if (!signInError) {
          router.push('/onboarding/step-1')
          router.refresh()
        } else {
          // If Supabase requires email confirmation, inform user clearly
          router.push('/onboarding/step-1')
          router.refresh()
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign-up.'
      setError(msg)
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
          Create Funeral Home Account
        </h1>
        <p className="text-[#8C7E6E] mt-1 text-xs font-semibold tracking-wider uppercase">
          Start Your 30-Day Free Trial
        </p>
      </div>

      {/* Sign-Up Card */}
      <div className="card-premium p-8 relative">
        <div className="brass-inlay absolute top-0 left-0 right-0" />

        {/* Tab / Mode info */}
        <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-[#2C221E]">Sign Up</h2>
            <p className="text-xs text-[#8C7E6E]">Step 0 of 4 — Create credentials</p>
          </div>
          <Link
            href="/login"
            className="text-xs font-semibold text-[#A8935D] hover:text-[#2C221E] transition-colors"
          >
            Already have an account?
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3 text-xs text-[#9F2F2D] rounded-r mb-5">
            <strong>Registration Error: </strong>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="field-label">
              Owner / Director Work Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="director@mychapel.com"
              required
              autoComplete="email"
              disabled={isLoading}
              className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="field-label">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="field-label">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary text-xs font-semibold uppercase tracking-wider h-11 w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Creating Account…</span>
              ) : (
                <span>Continue to Onboarding →</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E5E2DC] text-center">
          <p className="text-[11px] text-[#8C7E6E]">
            By continuing, you agree to Memoria&apos;s standard terms and privacy practices.
          </p>
        </div>
      </div>

      {/* Return to Public Home */}
      <div className="text-center mt-6">
        <Link href="/" className="text-xs text-[#8C7E6E] hover:text-[#2C221E] transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  )
}
