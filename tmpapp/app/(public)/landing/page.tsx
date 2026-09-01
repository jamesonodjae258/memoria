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
      q: 'Does anything send to a family without my staff approving it?',
      a: 'No. Every AI-generated document — obituary, compliance form, or family communication — requires explicit staff approval before it goes anywhere. The AI prepares drafts. Your team makes every decision that reaches a family.',
      delayClass: '',
    },
    {
      q: 'How does the obituary drafting actually work?',
      a: 'When a case is created, Memoria uses the intake data — name, dates, occupation, family notes — to generate a first draft. Your staff edits it in the app and approves it before sharing with the family. The draft is a starting point, not a final product. Staff always have the last word.',
      delayClass: styles['reveal-delay-1'],
    },
    {
      q: "What if my state's compliance forms are not in the library yet?",
      a: 'Contact us. We add new state templates regularly and can prioritize your state if you need it for onboarding. Enterprise plans include custom compliance template support.',
      delayClass: styles['reveal-delay-2'],
    },
    {
      q: 'We operate across two states. Can Memoria handle that?',
      a: 'Yes. On the Growth and Enterprise plans you can add multiple states to your account. Each case is associated with a state, and Memoria pulls the right compliance forms automatically based on that.',
      delayClass: styles['reveal-delay-3'],
    },
    {
      q: 'How long does setup take?',
      a: 'Most funeral homes are running their first case in Memoria the same afternoon they sign up. There is no migration, no lengthy configuration, and no implementation project. You sign up, onboard your team, select your state, and start.',
      delayClass: styles['reveal-delay-4'],
    },
    {
      q: 'Is family data secure?',
      a: 'Yes. All data is encrypted at rest and in transit. Staff can only see cases belonging to their location — there is no cross-account data access. Family and deceased personal information is never used for model training or shared with third parties.',
      delayClass: styles['reveal-delay-5'],
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

      {/* Main Content Wrapper */}
      <main>
        {/* Hero Section */}
        <section id="hero" className={styles.hero}>
          <div className={styles.container}>
            <div className={`${styles['hero-eyebrow']} ${styles.reveal}`}>
              Built for independent funeral homes
            </div>
            <h1 className={`${styles['hero-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
              Your paperwork is done<br />before the family <em>leaves the room.</em>
            </h1>
            <p className={`${styles['hero-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
              Memoria is a back-office AI agent that handles case intake, obituary drafting,
              state compliance paperwork, and family communication — so your team can stay
              focused on the people in front of them.
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
              <p className={styles['hero-note']}>30-day free trial. No credit card required.</p>
            </div>

            <div className={`${styles['app-window']} ${styles.reveal} ${styles['reveal-delay-4']}`}>
              <div className={styles['window-chrome']}>
                <div className={styles['window-dots']}>
                  <div className={styles['window-dot']}></div>
                  <div className={styles['window-dot']}></div>
                  <div className={styles['window-dot']}></div>
                </div>
                <div className={styles['window-title-bar']}>Memoria — Active Cases</div>
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

        {/* Pain Points Section */}
        <section id="pain" className={styles.pain}>
          <div className={styles.container}>
            <div className={styles['pain-grid']}>
              <div className={`${styles['pain-item']} ${styles.reveal}`}>
                <div className={styles['pain-before']}>The old way</div>
                <div className={styles['pain-headline']}>45-minute intake calls, typed up afterward</div>
                <div className={styles['pain-desc']}>
                  Every case starts the same way — a phone call, handwritten notes, then re-typing everything into three different places.
                </div>
                <div className={styles['pain-after']}>Memoria captures it once. Everything else follows.</div>
              </div>
              <div className={`${styles['pain-item']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['pain-before']}>The old way</div>
                <div className={styles['pain-headline']}>Obituaries drafted from scratch, under pressure</div>
                <div className={styles['pain-desc']}>
                  Your staff writes the same structure for every case — name, dates, survivors — while families wait and grief doesn&apos;t slow down.
                </div>
                <div className={styles['pain-after']}>First draft in under 3 minutes. Staff edits, not writes.</div>
              </div>
              <div className={`${styles['pain-item']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['pain-before']}>The old way</div>
                <div className={styles['pain-headline']}>State compliance forms filled by hand, every time</div>
                <div className={styles['pain-desc']}>
                  Different states, different forms, same intake data — re-entered for each document with no automation in sight.
                </div>
                <div className={styles['pain-after']}>Memoria knows your state&apos;s requirements and pre-fills them.</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className={`${styles.section} ${styles.how}`}>
          <div className={styles.container}>
            <div className={`${styles['section-eyebrow']} ${styles.reveal}`}>How it works</div>
            <h2 className={`${styles['section-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
              From first call to filed paperwork,<br />without the manual work
            </h2>
            <p className={`${styles['section-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
              Memoria runs alongside your team. Staff still makes every decision — the AI handles everything that doesn&apos;t need a human decision.
            </p>
            <div className={styles['steps-grid']}>
              <div className={`${styles.step} ${styles.reveal}`}>
                <div className={styles['step-num']}>01</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>Family contacts your funeral home</div>
                <div className={styles['step-desc']}>
                  Staff opens a new case in Memoria. The intake form captures every detail once — no re-entry later.
                </div>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['step-num']}>02</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>AI drafts all documents immediately</div>
                <div className={styles['step-desc']}>
                  Obituary, compliance paperwork, and family update messages are generated from the intake data — ready for staff review in minutes.
                </div>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['step-num']}>03</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>Staff reviews and approves</div>
                <div className={styles['step-desc']}>
                  Nothing goes to the family without a human sign-off. Staff edits drafts, approves documents, and confirms communications.
                </div>
              </div>
              <div className={`${styles.step} ${styles.reveal} ${styles['reveal-delay-3']}`}>
                <div className={styles['step-num']}>04</div>
                <div className={styles['step-icon-wrap']}>
                  <div className={styles['step-icon-inner']}></div>
                </div>
                <div className={styles['step-title']}>Family stays informed, automatically</div>
                <div className={styles['step-desc']}>
                  Status updates send at key milestones. The family always knows where things stand — without your staff making manual calls.
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
              Everything your back office needs.<br />Nothing it doesn&apos;t.
            </h2>
            <div className={styles.bento}>
              <div className={`${styles['bento-card']} ${styles['bento-1']} ${styles.reveal}`}>
                <div className={styles['bento-tag']}>Obituary drafting</div>
                <div className={styles['bento-title']}>A first draft in the time it takes to make coffee</div>
                <div className={styles['bento-desc']}>
                  Memoria takes the intake data — dates, occupation, family notes — and generates a warm, dignified first draft. Staff edits from a strong starting point instead of a blank page.
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
              <div className={`${styles['bento-card']} ${styles['bento-2']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['bento-tag']}>Staff dashboard</div>
                <div className={styles['bento-title']}>Every open case, one view</div>
                <div className={styles['bento-desc']}>
                  See what&apos;s active, what&apos;s pending your review, and which service dates are approaching — without digging through email or spreadsheets.
                </div>
                <div className={styles['stat-large']}>
                  0<span style={{ color: 'var(--sage)' }}>.</span>
                </div>
                <div className={styles['stat-label']}>Missed family updates since you started using Memoria</div>
              </div>
              <div className={`${styles['bento-card']} ${styles['bento-3']} ${styles.reveal}`}>
                <div className={styles['bento-tag']}>Family communication</div>
                <div className={styles['bento-title']}>Updates that feel personal, sent automatically</div>
                <div className={styles['bento-desc']}>
                  Key milestones trigger warm, plain-language messages to the family — by email or SMS. Staff previews before anything sends.
                </div>
                <div className={styles['comm-timeline']}>
                  <div className={styles['comm-item']}>
                    <div className={`${styles['comm-dot']} ${styles.sent}`}></div>
                    <div className={styles['comm-text']}>Intake confirmed — family welcomed</div>
                    <div className={styles['comm-time']}>Aug 22 · 2:14pm</div>
                  </div>
                  <div className={styles['comm-item']}>
                    <div className={`${styles['comm-dot']} ${styles.sent}`}></div>
                    <div className={styles['comm-text']}>Obituary draft shared for review</div>
                    <div className={styles['comm-time']}>Aug 22 · 4:01pm</div>
                  </div>
                  <div className={styles['comm-item']}>
                    <div className={`${styles['comm-dot']} ${styles.sent}`}></div>
                    <div className={styles['comm-text']}>Service details confirmed</div>
                    <div className={styles['comm-time']}>Aug 23 · 10:22am</div>
                  </div>
                  <div className={styles['comm-item']}>
                    <div className={styles['comm-dot']}></div>
                    <div className={styles['comm-text']}>Post-service check-in (scheduled)</div>
                    <div className={styles['comm-time']}>Aug 29</div>
                  </div>
                </div>
              </div>
              <div className={`${styles['bento-card']} ${styles['bento-4']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['bento-tag']}>State compliance</div>
                <div className={styles['bento-title']}>Pre-filled paperwork for your state, every time</div>
                <div className={styles['bento-desc']}>
                  Memoria knows your state&apos;s required forms and pre-fills them from intake data. Missing fields are flagged before you file — not after.
                </div>
                <div className={styles['state-list']}>
                  <div className={`${styles['state-pill']} ${styles.active}`}>TX</div>
                  <div className={`${styles['state-pill']} ${styles.active}`}>CA</div>
                  <div className={`${styles['state-pill']} ${styles.active}`}>FL</div>
                  <div className={styles['state-pill']}>NY</div>
                  <div className={styles['state-pill']}>GA</div>
                  <div className={styles['state-pill']}>OH</div>
                  <div className={styles['state-pill']}>IL</div>
                  <div className={styles['state-pill']}>PA</div>
                  <div className={styles['state-pill']}>NC</div>
                  <div className={styles['state-pill']}>AZ</div>
                  <div className={styles['state-pill']}>+ 40 more</div>
                </div>
              </div>
              <div className={`${styles['bento-card']} ${styles['bento-5']} ${styles.reveal}`}>
                <div className={styles['bento-tag']}>Human-first</div>
                <div className={styles['bento-title']}>Nothing reaches a family without your approval</div>
                <div className={styles['bento-desc']}>
                  Every document and message requires explicit staff sign-off. The AI prepares; your team decides.
                </div>
              </div>
              <div className={`${styles['bento-card']} ${styles['bento-6']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['bento-tag']}>Multi-location</div>
                <div className={styles['bento-title']}>Built for chains and independents alike</div>
                <div className={styles['bento-desc']}>
                  Each location runs independently with its own staff and cases. Owners see across all locations.
                </div>
              </div>
              <div className={`${styles['bento-card']} ${styles['bento-7']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['bento-tag']}>Fast start</div>
                <div className={styles['bento-title']}>Live in one afternoon</div>
                <div className={styles['bento-desc']}>
                  No migration, no long setup. Sign up, onboard your team, and run your first case the same day.
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
                      <div className={styles['comp-form-status']}>Pre-filled</div>
                    </div>
                    <div className={styles['comp-form-item']}>
                      <div className={styles['comp-check']}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className={styles['comp-form-name']}>Burial Transit Permit</div>
                      <div className={styles['comp-form-status']}>Pre-filled</div>
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
                      <div className={styles['comp-form-status']}>Pre-filled</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['section-eyebrow']}>State compliance library</div>
                <h2 className={styles['section-headline']}>
                  Every state has different rules.<br />Memoria keeps track.
                </h2>
                <div className={styles['compliance-points']}>
                  <div>
                    <div className={styles['comp-point-title']}>Select your state during onboarding</div>
                    <div className={styles['comp-point-desc']}>
                      Memoria loads the required forms for your state automatically. If you operate across state lines, add additional states at any time.
                    </div>
                  </div>
                  <div>
                    <div className={styles['comp-point-title']}>Forms pre-fill from intake data</div>
                    <div className={styles['comp-point-desc']}>
                      The data your staff collects during intake populates every required field across all compliance documents — without re-entry.
                    </div>
                  </div>
                  <div>
                    <div className={styles['comp-point-title']}>Missing fields flagged before you file</div>
                    <div className={styles['comp-point-desc']}>
                      If a required field is missing from the intake, Memoria flags it on the document before you download — not after you&apos;ve submitted.
                    </div>
                  </div>
                  <div>
                    <div className={styles['comp-point-title']}>Templates managed centrally</div>
                    <div className={styles['comp-point-desc']}>
                      As regulations change, Memoria&apos;s compliance library is updated. You do not manage templates — you just use them.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof / Numbers Section */}
        <section id="proof" className={styles.proof}>
          <div className={styles.container}>
            <div className={styles['proof-grid']}>
              <div className={`${styles['proof-item']} ${styles.reveal}`}>
                <div className={styles['proof-num']}>8<span>min</span></div>
                <div className={styles['proof-divider']}></div>
                <div className={styles['proof-label']}>Average intake-to-documents time</div>
                <div className={styles['proof-sub']}>Down from 45+ minutes</div>
              </div>
              <div className={`${styles['proof-item']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={styles['proof-num']}>0<span>.</span></div>
                <div className={styles['proof-divider']}></div>
                <div className={styles['proof-label']}>AI outputs sent to families without staff approval</div>
                <div className={styles['proof-sub']}>Human review is non-negotiable</div>
              </div>
              <div className={`${styles['proof-item']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['proof-num']}>50<span>+</span></div>
                <div className={styles['proof-divider']}></div>
                <div className={styles['proof-label']}>US states covered in the compliance library</div>
                <div className={styles['proof-sub']}>Including multi-state operators</div>
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
                Simple pricing.<br />No per-seat surprises.
              </h2>
              <p className={`${styles['section-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`} style={{ margin: '0 auto' }}>
                Priced per location, not per user. Add your whole team without watching the bill go up.
              </p>
            </div>
            <div className={styles['pricing-grid']}>
              <div className={`${styles['pricing-card']} ${styles.reveal}`}>
                <div className={styles['pricing-plan']}>Starter</div>
                <div className={styles['pricing-price']}>$399</div>
                <div className={styles['pricing-period']}>per location / month</div>
                <ul className={styles['pricing-features']}>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Unlimited cases
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    AI obituary drafting
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Family communication automation
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    1 state compliance library
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={styles['pricing-check']}></div>
                    Multi-state support
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={styles['pricing-check']}></div>
                    Multi-location dashboard
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className={styles['btn-secondary']}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start free trial
                </Link>
                <div className={styles['pricing-note']}>30 days free. No credit card required.</div>
              </div>
              <div className={`${styles['pricing-card']} ${styles.featured} ${styles.reveal} ${styles['reveal-delay-1']}`}>
                <div className={`${styles['pricing-plan']} ${styles.sage}`}>Growth · Most Popular</div>
                <div className={styles['pricing-price']}>$599</div>
                <div className={styles['pricing-period']}>per location / month</div>
                <ul className={styles['pricing-features']}>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Everything in Starter
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Multi-state compliance library
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Multi-location dashboard
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    SMS family communications
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Staff roles and permissions
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Priority support
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className={styles['btn-primary']}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start free trial
                </Link>
                <div className={styles['pricing-note']}>30 days free. No credit card required.</div>
              </div>
              <div className={`${styles['pricing-card']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
                <div className={styles['pricing-plan']}>Enterprise</div>
                <div className={styles['pricing-price']} style={{ fontSize: '36px', marginTop: '8px' }}>
                  Custom
                </div>
                <div className={styles['pricing-period']}>for chains and groups</div>
                <ul className={styles['pricing-features']}>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Everything in Growth
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Unlimited locations
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Custom compliance templates
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Dedicated onboarding
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    SLA and uptime guarantee
                  </li>
                  <li className={styles['pricing-feature']}>
                    <div className={`${styles['pricing-check']} ${styles.on}`}></div>
                    Custom integrations
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className={styles['btn-secondary']}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Book a call
                </Link>
                <div className={styles['pricing-note']}>Volume discounts available for 5+ locations.</div>
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

        {/* Final CTA Section */}
        <section id="cta" className={`${styles.section} ${styles.cta}`}>
          <div className={styles.container}>
            <div className={`${styles['cta-eyebrow']} ${styles.reveal}`}>
              For the people who show up when it&apos;s hardest
            </div>
            <h2 className={`${styles['cta-headline']} ${styles.reveal} ${styles['reveal-delay-1']}`}>
              Give your team time to do<br />what only they can do.
            </h2>
            <p className={`${styles['cta-sub']} ${styles.reveal} ${styles['reveal-delay-2']}`}>
              The paperwork does not need your best people. Memoria handles it, so they can focus on the families who need them.
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
                Back-office AI for independent funeral homes
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
                    <a href="#compliance">Compliance Library</a>
                  </li>
                  <li>
                    <a href="#pricing">Pricing</a>
                  </li>
                  <li>
                    <a href="#">Changelog</a>
                  </li>
                </ul>
              </div>
              <div>
                <div className={styles['footer-col-title']}>Company</div>
                <ul className={styles['footer-col-links']}>
                  <li>
                    <a href="#">About</a>
                  </li>
                  <li>
                    <a href="#">Privacy</a>
                  </li>
                  <li>
                    <a href="#">Terms</a>
                  </li>
                  <li>
                    <a href="#">Contact</a>
                  </li>
                </ul>
              </div>
              <div>
                <div className={styles['footer-col-title']}>Support</div>
                <ul className={styles['footer-col-links']}>
                  <li>
                    <a href="#">Documentation</a>
                  </li>
                  <li>
                    <Link href="/signup">Book a demo</Link>
                  </li>
                  <li>
                    <a href="#">Status</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles['footer-bottom']}>
            <span>© 2026 Memoria. All rights reserved.</span>
            <span>Built for independent funeral homes worldwide.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
