// TODO: have a qualified person review before launch

import Link from 'next/link'
import styles from '../landing/landing.module.css'
import { COMPANY_NAME, CONTACT_EMAIL, LAST_UPDATED } from '@/lib/constants/legal'

export const metadata = {
  title: `Terms of Service | ${COMPANY_NAME}`,
  description: `Terms of service for ${COMPANY_NAME} back office software for independent funeral homes.`,
}

export default function TermsPage() {
  return (
    <div className={styles.wrapper} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className={styles.nav}>
        <div className={styles['nav-inner']}>
          <Link href="/" className={styles['nav-logo']}>
            {COMPANY_NAME}<span></span>
          </Link>
          <div className={styles['nav-cta']}>
            <Link href="/" className={styles['btn-login']}>
              Back to Home
            </Link>
            <Link href="/signup" className={styles['btn-primary']}>
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '780px', margin: '0 auto', width: '100%' }}>
        <div className={styles['section-eyebrow']}>Legal Agreement</div>
        <h1 className={styles['section-headline']} style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: '24px' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '15px', marginBottom: '40px' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--ink-mid)', fontSize: '15px', lineHeight: '1.7' }}>
          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              1. What the Service Does
            </h2>
            <p>
              {COMPANY_NAME} provides operational back office software designed for independent funeral homes. The service assists your staff with case intake organization, obituary drafting, state filing summaries, and family milestone updates.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              2. Drafts and Filing Summaries - No State Filing
            </h2>
            <p style={{ marginBottom: '12px' }}>
              {COMPANY_NAME} prepares initial drafts and filing summaries only. {COMPANY_NAME} files nothing with any state office, municipal authority, or vital statistics department.
            </p>
            <p>
              Your licensed funeral directors and administrative staff remain solely responsible for verifying the legal accuracy of all information, completing required state forms, and submitting official filings directly to appropriate authorities.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              3. Mandatory Staff Review
            </h2>
            <p>
              Every AI draft, document summary, and communication message must be reviewed and approved by a member of your staff before it reaches a family or third party. {COMPANY_NAME} never sends messages to families without explicit staff confirmation.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              4. Not Legal Advice
            </h2>
            <p>
              {COMPANY_NAME} is an operational software platform and does not provide legal, regulatory, or medical advice. State funeral compliance rules vary by jurisdiction and change over time. Your organization must rely on qualified legal counsel and state regulatory authorities for legal and regulatory guidance.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              5. Free 30-Day Trial
            </h2>
            <p>
              Eligible funeral homes may evaluate {COMPANY_NAME} through a free 30-day trial without entering credit card information. Your account will have access to all core features during the trial period.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              6. Manual Invoicing After the Trial
            </h2>
            <p>
              Following the 30-day trial, service continues on the Founding Partner plan at $399 per location per month. Invoicing is handled manually through direct invoice or bank payment. We do not place automatic charges on credit cards without your prior written agreement.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              7. Termination of the Arrangement
            </h2>
            <p>
              Either party may end the arrangement at any time by sending written notice by email to <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--ink)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>. Upon termination, your staff will retain access to view and export existing case records, and recurring fees will cease at the end of the current monthly period.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              8. Contact
            </h2>
            <p>
              For legal inquiries or questions regarding these terms, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--ink)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className={styles.footer} style={{ marginTop: 'auto' }}>
        <div className={styles.container}>
          <div className={styles['footer-bottom']} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <span>© 2026 {COMPANY_NAME}. All rights reserved.</span>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
