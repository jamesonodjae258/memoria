'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './landing.module.css'

export default function LandingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible)
            entry.target.setAttribute('data-visible', 'true')
          }
        })
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      const reveals = containerRef.current.querySelectorAll(`.${styles.reveal}`)
      reveals.forEach((el) => observer.observe(el))
    }

    return () => observer.disconnect()
  }, [])

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  const faqItems = [
    {
      q: 'Does anything reach a family without my staff approving it?',
      a: 'No. Every draft and every message needs approval from your team before it goes anywhere. Memoria prepares the material. Your staff make every decision a family sees.',
      delayClass: '',
    },
    {
      q: 'Does Memoria file anything with the state for us?',
      a: 'No. Memoria prepares summaries for your team to review. Your staff file the official forms as they do today.',
      delayClass: styles['reveal-delay-1'],
    },
    {
      q: 'How does the obituary draft work?',
      a: 'When you create a case, Memoria uses the intake details (name, dates, occupation, family notes) to write a first draft. Your team edits it in the app and approves it before it is shared. It is a starting point, and your staff always have the final word.',
      delayClass: styles['reveal-delay-2'],
    },
    {
      q: 'What if my state is not available yet?',
      a: 'Tell us your state at signup. We add state forms on request, and we will tell you plainly how long yours will take before you commit.',
      delayClass: styles['reveal-delay-3'],
    },
    {
      q: 'We work across two states. Can Memoria handle that?',
      a: 'Multi-state support is on our list. If you work across state lines, tell us and we will prioritize it.',
      delayClass: styles['reveal-delay-4'],
    },
    {
      q: 'How long does setup take?',
      a: 'Setup is a short onboarding form. There is no migration or implementation project, and we will help you run your first case if you want us to.',
      delayClass: styles['reveal-delay-5'],
    },
    {
      q: "Is our families' information safe?",
      a: 'Data is encrypted in transit and at rest, and each funeral home account is kept separate from every other account. Case details are sent to an AI provider only to draft documents, and that provider does not use them to train its models. Our privacy policy explains this in full.',
      delayClass: '',
    },
  ]

  return (
    <div ref={containerRef} className={styles.wrapper}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles['nav-inner']}>
          <Link href="/" className={styles['nav-logo']}>
            Memoria<span></span>
          </Link>
          <ul className={styles['nav-links']}>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#compliance">Compliance</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>
          <div className={styles['nav-cta']}>
            <Link href="/login" className={styles['btn-login']}>
              Log in
            </Link>
            <Link href="/signup" className={styles['btn-primary']}>
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="hero" className={styles.hero}>
          <div className={styles.container}>
            <div className={`${styles['hero-eyebrow']} ${styles.reveal}`}>
              Built for independent funeral homes
            </div>
            <h1 className={`${styles['hero-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
              Your paperwork is drafted before the family leaves the room.
            </h1>
            <p className={`${styles['hero-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
              Memoria takes the details from one intake conversation and turns them into an obituary draft, a state filing summary, and clear updates for the family. Your team reviews and approves everything. Nothing is sent without you.
            </p>
            <div className={`${styles.reveal} ${styles['reveal-delay-3']}`}>
              <div className={styles['hero-actions']}>
                <Link href="/signup" className={styles['btn-primary']}>
                  Start free trial
                </Link>
                <a href="#how" className={styles['btn-secondary']}>
                  See how it works
                </a>
              </div>
              <p className={styles['hero-note']}>30 days free. No credit card required.</p>
            </div>

            {/* Application Mockup Preview */}
            <div className={`${styles['app-window']} ${styles.reveal} ${styles['reveal-delay-4']}`}>
              <div className={styles['window-chrome']}>
                <div className={styles['window-dots']}>
                  <div className={styles['window-dot']}></div>
                  <div className={styles['window-dot']}></div>
                  <div className={styles['window-dot']}></div>
                </div>
                <div className={styles['window-title-bar']}>Memoria - Active Cases</div>
              </div>
              <div className={styles['window-body']}>
                <div className={styles['window-sidebar']}>
                  <div className={styles['sidebar-org']}>
                    <div className={styles['sidebar-org-name']}>Reeves &amp; Sons</div>
                    <div className={styles['sidebar-org-sub']}>Funeral Home · Texas</div>
                  </div>
                  <div className={`${styles['sidebar-nav-item']} ${styles.active}`}>
                    <div className={`${styles['sidebar-icon']} ${styles.active}`}></div>
                    Active Cases
                  </div>
                  <div className={styles['sidebar-nav-item']}>
                    <div className={`${styles['sidebar-icon']} ${styles.sage}`}></div>
                    Obituaries
                  </div>
                  <div className={styles['sidebar-nav-item']}>
                    <div className={styles['sidebar-icon']}></div>
                    Compliance
                  </div>
                  <div className={styles['sidebar-nav-item']}>
                    <div className={styles['sidebar-icon']}></div>
                    Communications
                  </div>
                  <div className={styles['sidebar-nav-item']}>
                    <div className={styles['sidebar-icon']}></div>
                    Settings
                  </div>
                </div>
                <div className={styles['window-main']}>
                  <div className={styles['window-main-header']}>
                    <div>
                      <div className={styles['window-main-title']}>Active Cases</div>
                      <div className={styles['window-main-sub']}>3 open · 1 awaiting your review</div>
                    </div>
                    <button className={styles['btn-mini']}>+ New Case</button>
                  </div>
                  <table className={styles['case-table']}>
                    <thead>
                      <tr>
                        <th>Deceased</th>
                        <th>Service Date</th>
                        <th>Status</th>
                        <th>Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className={styles['case-name']}>Thomas Adeyemi</div>
                          <div className={styles['case-family']}>Contact: Grace Adeyemi</div>
                        </td>
                        <td>Aug 28, 2026</td>
                        <td>
                          <span className={`${styles['status-badge']} ${styles['status-pending']}`}>
                            Documents Pending
                          </span>
                        </td>
                        <td style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                          Obituary review
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className={styles['case-name']}>Margaret O&apos;Brien</div>
                          <div className={styles['case-family']}>Contact: Patrick O&apos;Brien</div>
                        </td>
                        <td>Sep 2, 2026</td>
                        <td>
                          <span className={`${styles['status-badge']} ${styles['status-family']}`}>
                            Family Review
                          </span>
                        </td>
                        <td style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                          Awaiting sign-off
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className={styles['case-name']}>James Witherspoon</div>
                          <div className={styles['case-family']}>Contact: Delia Witherspoon</div>
                        </td>
                        <td>Sep 5, 2026</td>
                        <td>
                          <span className={`${styles['status-badge']} ${styles['status-intake']}`}>
                            Intake
                          </span>
                        </td>
                        <td style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                          Generate documents
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className={styles['ai-draft-strip']}>
                    <div className={styles['ai-dot']}>
                      <div className={styles['ai-dot-inner']}></div>
                    </div>
                    <div className={styles['ai-strip-content']}>
                      <div className={styles['ai-strip-label']}>
                        Obituary Draft Ready · Thomas Adeyemi
                      </div>
                      <div className={styles['ai-strip-text']}>
                        Thomas Adeyemi, beloved husband and father of three, passed peacefully on August 22nd.
                        A retired civil engineer, Thomas was known for his quiet generosity and his Sunday morning
                        breakfasts that somehow fed the whole street...
                      </div>
                      <div className={styles['ai-strip-actions']}>
                        <button className={`${styles['ai-action']} ${styles['ai-action-approve']}`}>
                          Approve draft
                        </button>
                        <button className={`${styles['ai-action']} ${styles['ai-action-edit']}`}>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section (three columns) */}
        <section id="problem" className={styles.pain}>
          <div className={styles.container}>
            <div className={styles['pain-grid']}>
              <div className={`${styles['pain-item']} ${styles.reveal}`}>
                <div className={styles['pain-before']}>The old way</div>
                <div className={styles['pain-headline']}>Intake, typed up twice</div>
                <div className={styles['pain-desc']}>
                  A long phone call, handwritten notes, then the same details retyped into several places.
                </div>
                <div className={styles['pain-after']}>With Memoria, you enter everything once. Every document starts from that single record.</div>
              </div>
              <div className={`${styles['pain-item']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['pain-before']}>The old way</div>
                <div className={styles['pain-headline']}>Obituaries written from a blank page</div>
                <div className={styles['pain-desc']}>
                  The same structure every time (name, dates, survivors), written under pressure while the family waits.
                </div>
                <div className={styles['pain-after']}>With Memoria, you get a first draft in minutes. Your team edits it instead of starting from nothing.</div>
              </div>
              <div className={`${styles['pain-item']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['pain-before']}>The old way</div>
                <div className={styles['pain-headline']}>State forms filled in by hand</div>
                <div className={styles['pain-desc']}>
                  The same intake data copied onto each form, one field at a time.
                </div>
                <div className={styles['pain-after']}>With Memoria, a filing summary is prepared from the same record. Texas is live today.</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className={`${styles.section} ${styles.how}`}>
          <div className={styles.container}>
            <div className={`${styles['section-eyebrow']} ${styles.reveal}`}>How it works</div>
            <h2 className={`${styles['section-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
              From the first call to filed paperwork, with far less retyping.
            </h2>
            <p className={`${styles['section-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
              Memoria works beside your team. Your staff make every decision. Memoria handles the repetitive drafting.
            </p>
            <div className={styles['steps-grid']}>
              <div className={`${styles.step} ${styles.reveal}`}>
                <div className={styles['step-num']}>01</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>A family contacts you.</div>
                <div className={styles['step-desc']}>
                  Your team opens a new case and fills in the intake form once.
                </div>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['step-num']}>02</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>Memoria prepares the drafts.</div>
                <div className={styles['step-desc']}>
                  An obituary draft and a state filing summary are created from the intake details, ready for review.
                </div>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['step-num']}>03</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>Your team reviews and approves.</div>
                <div className={styles['step-desc']}>
                  Nothing reaches a family until a member of your staff has read it and approved it.
                </div>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles['reveal-delay-3']}`}>
                <div className={styles['step-num']}>04</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>The family stays informed.</div>
                <div className={styles['step-desc']}>
                  Updates go out at key points, previewed and confirmed by your team first.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`${styles.section} ${styles.features}`}>
          <div className={styles.container}>
            <div className={`${styles['section-eyebrow']} ${styles.reveal}`}>Features</div>
            <h2 className={`${styles['section-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
              What your back office needs, and nothing it does not.
            </h2>
            <div className={styles.bento}>
              {/* Feature 1 */}
              <div className={`${styles['bento-card']} ${styles['bento-1']} ${styles.reveal}`}>
                <div className={styles['bento-tag']}>Feature</div>
                <div className={styles['bento-title']}>Obituary drafts</div>
                <div className={styles['bento-desc']}>
                  Memoria uses the dates, occupation, and family notes from intake to write a warm, dignified first draft. Your team changes what needs changing and approves the final version.
                </div>
                <div className={styles['bento-visual']}>
                  <div className={styles['obit-preview']}>
                    &ldquo;Eleanor Grace Holloway, a devoted schoolteacher and tireless gardener, passed peacefully on August 19th surrounded by her family. For thirty-two years she taught third grade at Millbrook Elementary, where former students still return to share the lives she helped shape...&rdquo;
                  </div>
                  <div className={styles['obit-badge']}>
                    <div className={styles['obit-badge-dot']}></div>AI draft · Awaiting staff review
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className={`${styles['bento-card']} ${styles['bento-2']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['bento-tag']}>Feature</div>
                <div className={styles['bento-title']}>One view of every case</div>
                <div className={styles['bento-desc']}>
                  See which cases are open, which are waiting on your review, and which services are coming up, without searching through email or spreadsheets.
                </div>
              </div>

              {/* Feature 3 */}
              <div className={`${styles['bento-card']} ${styles['bento-3']} ${styles.reveal}`}>
                <div className={styles['bento-tag']}>Feature</div>
                <div className={styles['bento-title']}>Family updates by email</div>
                <div className={styles['bento-desc']}>
                  Key moments trigger clear, plain messages sent in your funeral home&apos;s name. Families reply straight to your own inbox. Your team previews every message before it goes.
                </div>
                <div className={styles['comm-timeline']}>
                  <div className={styles['comm-item']}>
                    <div className={`${styles['comm-dot']} ${styles.sent}`}></div>
                    <div className={styles['comm-text']}>Intake confirmed - family welcomed</div>
                    <div className={styles['comm-time']}>Aug 22</div>
                  </div>
                  <div className={styles['comm-item']}>
                    <div className={`${styles['comm-dot']} ${styles.sent}`}></div>
                    <div className={styles['comm-text']}>Obituary draft shared for review</div>
                    <div className={styles['comm-time']}>Aug 22</div>
                  </div>
                  <div className={styles['comm-item']}>
                    <div className={`${styles['comm-dot']} ${styles.sent}`}></div>
                    <div className={styles['comm-text']}>Service details confirmed</div>
                    <div className={styles['comm-time']}>Aug 23</div>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className={`${styles['bento-card']} ${styles['bento-4']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['bento-tag']}>Feature</div>
                <div className={styles['bento-title']}>State filing summaries</div>
                <div className={styles['bento-desc']}>
                  Texas is live today. Your intake data fills a summary for each form, and missing fields are flagged before you file, not after. More states are added on request.
                </div>
              </div>

              {/* Feature 5 */}
              <div className={`${styles['bento-card']} ${styles['bento-5']} ${styles.reveal}`}>
                <div className={styles['bento-tag']}>Feature</div>
                <div className={styles['bento-title']}>Staff approval built in</div>
                <div className={styles['bento-desc']}>
                  Every draft and every message needs a person on your team to approve it. Memoria prepares. You decide.
                </div>
              </div>

              {/* Feature 6 */}
              <div className={`${styles['bento-card']} ${styles['bento-6']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['bento-tag']}>Feature</div>
                <div className={styles['bento-title']}>Private by design</div>
                <div className={styles['bento-desc']}>
                  Each funeral home account is kept separate. Your staff see your cases and no one else&apos;s.
                </div>
              </div>

              {/* Feature 7 */}
              <div className={`${styles['bento-card']} ${styles['bento-7']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['bento-tag']}>Feature</div>
                <div className={styles['bento-title']}>Start with one case</div>
                <div className={styles['bento-desc']}>
                  There is no migration and no long setup. Create your account, choose your state, and run a first case with help from us if you want it.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section id="compliance" className={`${styles.section} ${styles.compliance}`}>
          <div className={styles.container}>
            <div className={styles['compliance-grid']}>
              <div className={`${styles['compliance-visual']} ${styles.reveal}`}>
                <div className={styles['comp-header']}>
                  Compliance Library
                  <div className={styles['comp-state-select']}>Texas ▾</div>
                </div>
                <div className={styles['comp-body']}>
                  <div className={styles['comp-form-list']}>
                    <div className={styles['comp-form-item']}>
                      <div className={styles['comp-check']}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className={styles['comp-form-name']}>Death Certificate Worksheet</div>
                      <div className={styles['comp-form-status']}>Summary ready</div>
                    </div>
                    <div className={styles['comp-form-item']}>
                      <div className={styles['comp-check']}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className={styles['comp-form-name']}>Burial Transit Permit</div>
                      <div className={styles['comp-form-status']}>Summary ready</div>
                    </div>
                    <div className={styles['comp-form-item']}>
                      <div className={styles['comp-check-empty']}></div>
                      <div className={styles['comp-form-name']}>Cremation Authorization Form</div>
                      <div className={`${styles['comp-form-status']} ${styles.missing}`}>2 fields missing</div>
                    </div>
                    <div className={styles['comp-form-item']}>
                      <div className={styles['comp-check']}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className={styles['comp-form-name']}>Family Authorization Statement</div>
                      <div className={styles['comp-form-status']}>Summary ready</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['section-eyebrow']}>State compliance library</div>
                <h2 className={styles['section-headline']}>
                  Every state has different rules.<br />Memoria keeps the forms organized.
                </h2>
                <div className={styles['compliance-points']}>
                  <div>
                    <div className={styles['comp-point-title']}>Choose your state at signup.</div>
                    <div className={styles['comp-point-desc']}>
                      Memoria loads the forms for your state. Texas is available now. If your state is not listed yet, tell us and we will add it.
                    </div>
                  </div>
                  <div>
                    <div className={styles['comp-point-title']}>Intake data fills a filing summary.</div>
                    <div className={styles['comp-point-desc']}>
                      What your staff collects at intake fills a prepared summary for each form, so nothing is retyped. Your team reviews it before anything is filed.
                    </div>
                  </div>
                  <div>
                    <div className={styles['comp-point-title']}>Missing fields are flagged.</div>
                    <div className={styles['comp-point-desc']}>
                      If a required detail was not collected, Memoria shows you before you download, not after you have submitted.
                    </div>
                  </div>
                  <div>
                    <div className={styles['comp-point-title']}>Maintained by us.</div>
                    <div className={styles['comp-point-desc']}>
                      Forms are added and updated by our team, so you do not manage templates. Always confirm current requirements with your state office before filing.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Band (three short statements) */}
        <section id="trust" className={styles.proof}>
          <div className={styles.container}>
            <div className={styles['proof-grid']}>
              <div className={`${styles['proof-item']} ${styles.reveal}`}>
                <div className={styles['proof-num']}>Texas<span>.</span></div>
                <div className={styles['proof-divider']}></div>
                <div className={styles['proof-label']}>State forms live today. More states added on request.</div>
              </div>
              <div className={`${styles['proof-item']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['proof-num']}>Always<span>.</span></div>
                <div className={styles['proof-divider']}></div>
                <div className={styles['proof-label']}>AI drafts are reviewed by your team before they reach a family.</div>
              </div>
              <div className={`${styles['proof-item']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['proof-num']}>30 days<span>.</span></div>
                <div className={styles['proof-divider']}></div>
                <div className={styles['proof-label']}>Free pilot, no credit card. Run real cases before you pay.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className={`${styles.section} ${styles.pricing}`}>
          <div className={styles.container}>
            <div style={{ textAlign: 'center' }}>
              <div className={`${styles['section-eyebrow']} ${styles.reveal}`}>Pricing</div>
              <h2 className={`${styles['section-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                Simple pricing. No per-seat charges.
              </h2>
              <p className={`${styles['section-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`} style={{ margin: '0 auto' }}>
                Priced per location, not per user. Add your whole team without the bill changing.
              </p>
            </div>
            <div className={styles['pricing-single-wrap']}>
              <div className={`${styles['pricing-card-single']} ${styles.reveal}`}>
                <div className={styles['pricing-plan']}>Founding partner</div>
                <div className={styles['pricing-price']}>$399</div>
                <div className={styles['pricing-period']}>per location per month, after a free 30-day pilot</div>
                <ul className={styles['pricing-features']}>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Unlimited cases
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Obituary drafting, reviewed by your team
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Family emails sent in your funeral home&apos;s name
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Texas filing summaries
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Setup help from the founder
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className={styles['btn-primary']}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start free trial
                </Link>
                <div className={styles['pricing-note']} style={{ textAlign: 'center' }}>
                  30 days free. No credit card required. Other states on request.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className={`${styles.section} ${styles.faq}`}>
          <div className={styles.container}>
            <div style={{ textAlign: 'center' }}>
              <div className={`${styles['section-eyebrow']} ${styles.reveal}`}>Questions</div>
              <h2 className={`${styles['section-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                Straightforward answers
              </h2>
            </div>
            <div className={styles['faq-list']}>
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index
                return (
                  <div
                    key={index}
                    className={`${styles['faq-item']} ${isOpen ? styles.open : ''} ${styles.reveal} ${item.delayClass}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className={styles['faq-question']}
                      aria-expanded={isOpen}
                    >
                      {item.q}
                      <span className={styles['faq-toggle']}>+</span>
                    </button>
                    <div className={styles['faq-answer']}>
                      {item.a}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section id="cta" className={`${styles.section} ${styles.cta}`}>
          <div className={styles.container}>
            <div className={`${styles['cta-eyebrow']} ${styles.reveal}`}>
              For the people who show up when it is hardest.
            </div>
            <h2 className={`${styles['cta-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
              Give your team more time for the work only they can do.
            </h2>
            <p className={`${styles['cta-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
              The paperwork does not need your best people. Memoria handles the drafting so they can stay with the families who need them.
            </p>
            <div className={`${styles['cta-actions']} ${styles.reveal} ${styles['reveal-delay-3']}`}>
              <Link href="/signup" className={styles['btn-primary']}>
                Start free trial
              </Link>
              <Link href="/signup" className={styles['btn-secondary']}>
                Book a demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles['footer-inner']}>
            <div>
              <Link href="/" className={styles['footer-logo']}>
                Memoria<span></span>
              </Link>
              <div className={styles['footer-tagline']}>
                Case paperwork for independent funeral homes.
              </div>
            </div>
            <div className={styles['footer-links']}>
              <div>
                <div className={styles['footer-col-title']}>Product</div>
                <ul className={styles['footer-col-links']}>
                  <li>
                    <a href="#features">Features</a>
                  </li>
                  <li>
                    <a href="#compliance">Compliance</a>
                  </li>
                  <li>
                    <a href="#pricing">Pricing</a>
                  </li>
                </ul>
              </div>
              <div>
                <div className={styles['footer-col-title']}>Company</div>
                <ul className={styles['footer-col-links']}>
                  <li>
                    <Link href="/privacy">Privacy</Link>
                  </li>
                  <li>
                    <Link href="/terms">Terms</Link>
                  </li>
                  <li>
                    <a href="mailto:support@memoria.app">Contact</a>
                  </li>
                </ul>
              </div>
              <div>
                <div className={styles['footer-col-title']}>Support</div>
                <ul className={styles['footer-col-links']}>
                  <li>
                    <Link href="/signup">Book a demo</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles['footer-bottom']}>
            <span>© 2026 Memoria. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
