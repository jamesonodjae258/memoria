import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export const metadata = {
  title: 'Billing & Subscription | Memoria',
  description: 'Manage your Memoria subscription and view trial status.',
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: { expired?: string }
}) {
  const supabase = createServerSupabaseClient()
  const isDemoSession = cookies().get('gp_demo_session')?.value === 'true'

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    // Supabase fallback
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  )

  if (!user && !isDemoSession && isConfigured) {
    redirect('/login')
  }

  let funeralHomeName = 'Memoria Memorial Home'
  let subscriptionStatus = 'trial'
  let trialEndsAt: string | null = null
  let caseCount = 0
  let isSuperAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('staff_profiles')
      .select('is_super_admin, funeral_homes(name, subscription_status, trial_ends_at)')
      .eq('user_id', user.id)
      .maybeSingle()

    isSuperAdmin = Boolean(profile?.is_super_admin)
    const fh = profile?.funeral_homes as any
    if (fh) {
      funeralHomeName = fh.name || funeralHomeName
      subscriptionStatus = fh.subscription_status || 'trial'
      trialEndsAt = fh.trial_ends_at || null
    }

    const { count } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })

    caseCount = count || 0
  }

  // Calculate days left in trial
  let daysLeft = 30
  let isTrialEnded = false

  if (trialEndsAt) {
    const msRemaining = new Date(trialEndsAt).getTime() - Date.now()
    daysLeft = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
    if (msRemaining <= 0) {
      isTrialEnded = true
    }
  }

  if (subscriptionStatus === 'cancelled') {
    isTrialEnded = true
  }

  const isPaying = subscriptionStatus === 'active'
  const showTrialEndedBanner = Boolean(searchParams?.expired === 'true' || (isTrialEnded && !isPaying))

  const contactEmail =
    process.env.CONTACT_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    'support@memoria.app'

  const mailtoSubject = encodeURIComponent(`Continue Memoria Subscription - ${funeralHomeName}`)
  const mailtoHref = `mailto:${contactEmail}?subject=${mailtoSubject}`

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body flex flex-col">
      <DashboardHeader
        funeralHomeName={funeralHomeName}
        isSuperAdmin={isSuperAdmin}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Trial Ended Alert Banner */}
        {showTrialEndedBanner && (
          <div
            className="border-l-4 border-[#9F2F2D] bg-[#FDEBEC] p-5 rounded-r shadow-xs animate-in fade-in"
            role="alert"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[#9F2F2D]">
                  Your trial has ended. Contact us to continue.
                </h2>
                <p className="text-xs text-[#7F2321] mt-1 leading-relaxed">
                  Your case records, documents, and family logs remain securely saved in your workspace. Reach out to our team to activate full access.
                </p>
              </div>
              <a
                href={mailtoHref}
                className="btn-primary !w-auto text-xs px-4 py-2 font-semibold whitespace-nowrap shrink-0"
              >
                Contact us
              </a>
            </div>
          </div>
        )}

        {/* Header Title */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white text-[#8C7E6E] text-xs font-semibold uppercase tracking-widest mb-2 border border-[#E5E2DC]">
            <span className="w-2 h-2 rounded-full bg-[#A8935D]" />
            Subscription &amp; Licensing
          </div>
          <h1 className="text-3xl font-display font-medium text-[#2C221E] tracking-tight">
            Billing &amp; Location Plan
          </h1>
          <p className="text-xs text-[#6B5E50] mt-1.5 leading-relaxed">
            Simple, transparent pricing for independent funeral homes. No credit card required during setup.
          </p>
        </div>

        {/* Founding Partner Single Plan Card */}
        <div className="card-premium p-8 relative max-w-2xl bg-white border border-[#E5E2DC] rounded-lg shadow-sm">
          <div className="brass-inlay absolute top-0 left-0 right-0" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#A8935D] block mb-1">
                Single Tier Platform
              </span>
              <h2 className="text-2xl font-display font-semibold text-[#2C221E]">
                Founding partner, $399 per location per month
              </h2>
              <p className="text-xs text-[#6B5E50] mt-1">
                Full back office operational automation for your facility.
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              {isPaying ? (
                <span className="inline-block px-3 py-1 rounded bg-[#EDF3EC] text-[#346538] border border-[#346538]/20 font-mono text-xs font-bold uppercase tracking-wider">
                  Active Subscription
                </span>
              ) : isTrialEnded ? (
                <span className="inline-block px-3 py-1 rounded bg-[#FDEBEC] text-[#9F2F2D] border border-[#9F2F2D]/20 font-mono text-xs font-bold uppercase tracking-wider">
                  Trial Concluded
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded bg-[#FAF9F7] text-[#2C221E] border border-[#E5E2DC] font-mono text-xs font-bold">
                  {daysLeft} days left in trial
                </span>
              )}
            </div>
          </div>

          {/* Plan Inclusions */}
          <div className="py-6 space-y-3 text-xs text-[#4D4237]">
            <div className="flex items-center gap-2.5">
              <span className="text-[#346538] font-bold">✓</span>
              <span>Intake record ledger with unlimited deceased case files</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#346538] font-bold">✓</span>
              <span>AI obituary drafting with human review and approval gates</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#346538] font-bold">✓</span>
              <span>State filing summaries and missing required field flagging</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#346538] font-bold">✓</span>
              <span>Family milestone email dispatch previewed by your staff</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#346538] font-bold">✓</span>
              <span>Complete account isolation and database Row Level Security</span>
            </div>
          </div>

          {/* Action Link: Contact us to continue after your trial */}
          <div className="pt-6 border-t border-[#E5E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#6B5E50]">
              Invoicing is handled directly without automated credit card charges.
            </div>

            <a
              href={mailtoHref}
              className="btn-primary !w-auto text-xs px-6 py-3 font-semibold uppercase tracking-wider text-center"
            >
              Contact us to continue after your trial
            </a>
          </div>
        </div>

        {/* Data Preservation Guarantee Box */}
        <div className="bg-[#FAF9F7] border border-[#E5E2DC] rounded-lg p-6 max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C221E]">
            <span className="text-[#A8935D]">🔒</span>
            <span>Your Data Preservation Guarantee</span>
          </div>
          <p className="text-xs text-[#6B5E50] leading-relaxed">
            Your data is preserved in your private database partition. Currently, your account contains{' '}
            <strong className="text-[#2C221E]">{caseCount} case records</strong> for{' '}
            <strong className="text-[#2C221E]">{funeralHomeName}</strong>. If your trial has ended, your records remain intact while you arrange ongoing service.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="text-xs text-[#A8935D] font-semibold underline hover:text-[#2C221E] transition-colors"
            >
              Return to Case Ledger
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
