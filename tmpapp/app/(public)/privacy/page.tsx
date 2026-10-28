import Link from 'next/link'
import styles from '../landing/landing.module.css'
import { COMPANY_NAME, CONTACT_EMAIL, LAST_UPDATED } from '@/lib/constants/legal'

export const metadata = {
  title: `Privacy Policy | ${COMPANY_NAME}`,
  description: `How ${COMPANY_NAME} protects family and case data for independent funeral homes.`,
}

export default function PrivacyPage() {
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
        <div className={styles['section-eyebrow']}>Trust and Privacy</div>
        <h1 className={styles['section-headline']} style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: '24px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '15px', marginBottom: '40px' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--ink-mid)', fontSize: '15px', lineHeight: '1.7' }}>
          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              1. Overview
            </h2>
            <p>
              {COMPANY_NAME} provides back office workflow tools for independent funeral homes. We recognize the sensitive nature of your work and treat all information with care, dignity, and confidentiality.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              2. Information We Collect
            </h2>
            <p style={{ marginBottom: '12px' }}>
              We collect three categories of information to provide the service:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Account details:</strong> Funeral home business name, staff names, work email addresses, and telephone numbers.
              </li>
              <li>
                <strong>Case details:</strong> Names of deceased persons, dates of birth and passing, place of passing, occupation, service preferences, and notes recorded during intake.
              </li>
              <li>
                <strong>Family contact details:</strong> Names of primary family contacts, email addresses, telephone numbers, and relationships to the deceased.
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              3. AI Processing and Document Drafting
            </h2>
            <p style={{ marginBottom: '12px' }}>
              Case details are sent to our AI provider only to draft documents, including obituary drafts and state filing summaries.
            </p>
            {/* TODO: confirm against the provider's current policy */}
            <p>
              Data submitted through our API integrations is not used by our AI provider to train machine learning models. The AI engine is used solely to generate initial drafts for your staff to review. Nothing is sent to a family or filed with any government office without explicit staff review and approval.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              4. Account Separation and Encryption
            </h2>
            <p style={{ marginBottom: '12px' }}>
              Each funeral home account is kept separate. Database records are strictly partitioned using PostgreSQL Row Level Security so that staff members can only access records belonging to their own funeral home.
            </p>
            <p>
              All information is encrypted in transit using Transport Layer Security protocols and encrypted at rest in our secure database infrastructure. Access to production systems is restricted to authorized personnel under least privilege principles.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              5. Data Retention and Deletion
            </h2>
            <p>
              We retain case records and account information for as long as your account remains open, so that your team can access past records when needed. You may request permanent deletion of your data at any time by emailing <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--ink)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>. Upon receiving your request, we will remove your records from our systems.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              6. Staff Responsibility
            </h2>
            <p>
              Staff members are responsible for the accuracy of all information entered into the system. {COMPANY_NAME} does not verify public records or validate factual statements entered during intake calls or consultations.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontFamily: 'Instrument Serif, serif', color: 'var(--ink)', marginBottom: '10px' }}>
              7. Contact Us
            </h2>
            <p>
              If you have any questions regarding our security architecture or data privacy practices, please contact us directly at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--ink)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>.
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
