# AGENTS.md — Funeral Home AI Back-Office Agent
## Antigravity Build Instructions

> This file is the single source of truth for Antigravity.
> Read every section before writing any code.
> Do not skip phases. Do not combine phases. Await review gate before proceeding.

---

## Project Overview

Build a web-based AI back-office agent for independent funeral homes.
The agent automates: case intake, obituary drafting, compliance paperwork pre-fill, and family communication updates.

**Stack:** Next.js 14 (App Router) · Supabase (Postgres + RLS + Auth) · OpenAI API · Resend (email) · Twilio (SMS) · pdf-lib (PDF generation) · Tailwind CSS · TypeScript

**Tone constraint (critical):** This product serves grieving families. Every piece of UI copy, every AI-generated output, and every automated message must be warm, respectful, and human. Never clinical. Never robotic. This applies to both the staff UI and the AI prompts.

---

## Folder Structure

```
/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                  # Case list / staff home
│   │   ├── cases/
│   │   │   ├── new/page.tsx          # New case intake form
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Case detail view
│   │   │       ├── obituary/page.tsx # Obituary draft + approval
│   │   │       └── documents/page.tsx# Compliance paperwork
│   └── api/
│       ├── cases/route.ts
│       ├── obituary/generate/route.ts
│       ├── documents/generate/route.ts
│       └── communications/send/route.ts
├── components/
│   ├── ui/                           # Shared primitives
│   ├── cases/
│   │   ├── CaseCard.tsx
│   │   ├── IntakeForm.tsx
│   │   └── StatusBadge.tsx
│   ├── obituary/
│   │   ├── ObituaryEditor.tsx
│   │   └── ToneControls.tsx
│   └── communications/
│       └── MessagePreview.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── openai/
│   │   ├── obituary.ts               # Prompt + call for obituary generation
│   │   └── paperwork.ts              # Prompt + call for document pre-fill
│   ├── resend/
│   │   └── send-email.ts
│   ├── twilio/
│   │   └── send-sms.ts
│   └── pdf/
│       └── generate-document.ts
├── types/
│   └── index.ts                      # All shared TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── AGENTS.md                         # This file
```

---

## Environment Variables

Antigravity must never hardcode secrets. Use only these env var names:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## Data Model

### Supabase Tables

```sql
-- Cases: one record per deceased person / service
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funeral_home_id UUID NOT NULL REFERENCES funeral_homes(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Deceased info
  deceased_name TEXT NOT NULL,
  date_of_birth DATE,
  date_of_death DATE NOT NULL,
  place_of_death TEXT,
  occupation TEXT,
  additional_notes TEXT, -- free-text family memories

  -- Family contact
  family_contact_name TEXT NOT NULL,
  family_contact_email TEXT,
  family_contact_phone TEXT,
  relationship_to_deceased TEXT,

  -- Service
  service_type TEXT, -- e.g. burial, cremation, memorial
  service_date TIMESTAMPTZ,
  service_location TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'intake'
    CHECK (status IN ('intake','documents_pending','family_review','approved','completed')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents: obituaries + compliance paperwork per case
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('obituary','compliance_form','other')),
  title TEXT NOT NULL,
  draft_content TEXT,         -- raw text draft
  pdf_url TEXT,               -- Supabase Storage URL once generated
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_staff_review','pending_family_review','approved','finalized')),
  version INTEGER DEFAULT 1,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication log: every message sent to families
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','delivered','failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Funeral homes: one record per client business
CREATE TABLE funeral_homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## RLS Policies (Security — implement exactly as written)

```sql
-- Enable RLS on all tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_homes ENABLE ROW LEVEL SECURITY;

-- Staff can only see cases belonging to their funeral home
CREATE POLICY "staff_own_cases" ON cases
  FOR ALL USING (
    funeral_home_id = (
      SELECT funeral_home_id FROM staff_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Same scope for documents and comms (via case ownership)
CREATE POLICY "staff_own_documents" ON documents
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE funeral_home_id = (
        SELECT funeral_home_id FROM staff_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "staff_own_comms" ON communication_logs
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE funeral_home_id = (
        SELECT funeral_home_id FROM staff_profiles WHERE user_id = auth.uid()
      )
    )
  );
```

**RLS is non-negotiable. Do not skip or defer this.**

---

## Build Phases

### ⚠️ Phase Rules
- Complete each phase fully before starting the next.
- At the end of each phase: stop, list what was built, and wait for human review + approval.
- Do not combine phases even if they seem small.
- If a phase has an ambiguity, surface it at the start of that phase — do not guess.

---

### Phase 1 — Project Setup + Database
**Goal:** Repo scaffolded, Supabase connected, schema migrated, environment configured.

Tasks:
1. Scaffold Next.js 14 with App Router, TypeScript, Tailwind CSS
2. Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `openai`, `resend`, `twilio`, `pdf-lib`, `@radix-ui/react-*` (for accessible UI primitives)
3. Create `/lib/supabase/client.ts` (browser client) and `/lib/supabase/server.ts` (server/RSC client)
4. Write `/supabase/migrations/001_initial_schema.sql` with the full schema above (all 4 tables + RLS policies)
5. Create `/types/index.ts` with TypeScript interfaces matching every table
6. Set up `.env.local.example` with all env var names (no values)

**Review gate:** Confirm Supabase connects, migration runs, types are exported correctly.

---

### Phase 2 — Auth + Staff Login
**Goal:** Supabase Auth working, staff can log in, sessions persist across routes.

Tasks:
1. Build `/app/(auth)/login/page.tsx` — email + password login form using Supabase Auth
2. Implement auth middleware (`middleware.ts`) protecting all `/dashboard/*` routes
3. Redirect unauthenticated users to `/login`; redirect authenticated users away from `/login`
4. Create a `staff_profiles` table migration linking `auth.users` → `funeral_homes` (needed for RLS)
5. Session handled via `@supabase/ssr` cookie strategy — no JWT decoding in client

UI: Clean, minimal login screen. No hero image. Centered card. Funeral home name at top as placeholder logo area.

**Review gate:** Login works, protected routes redirect correctly, session persists on refresh.

---

### Phase 3 — Case Intake Form
**Goal:** Staff can create a new case by filling in the intake form. Record saves to Supabase.

Tasks:
1. Build `/app/dashboard/cases/new/page.tsx` with `IntakeForm.tsx` component
2. Form fields (all from data model): deceased info, family contact, service preferences, additional notes (free-text memories)
3. On submit: POST to `/api/cases/route.ts` → insert into `cases` table → redirect to new case detail page
4. Validate required fields client-side before submit (deceased_name, date_of_death, family_contact_name minimum)
5. Show loading state during submission. Show clear error if submission fails.

UI rules:
- Multi-step form preferred (3 steps: Deceased Info → Family Contact → Service Details) — reduces cognitive load for staff during emotional intake calls
- Progress indicator at top
- "Save as Draft" option at each step

**Review gate:** Form submits, record appears in Supabase, redirect works, validation prevents empty required fields.

---

### Phase 4 — AI Obituary Generation
**Goal:** After intake, staff can trigger AI obituary generation, review the draft, and approve it.

Tasks:

**4a — OpenAI prompt (write this first, review before wiring UI):**

File: `/lib/openai/obituary.ts`

```typescript
export async function generateObituary(caseData: CaseRecord): Promise<string> {
  const prompt = `
You are a compassionate writer helping a funeral home draft an obituary.
Use the information below to write a warm, dignified obituary in the third person.
Tone: Respectful, warm, human. Never clinical. Never robotic.
Length: 150–250 words unless additional_notes suggest a longer tribute is appropriate.
Do not invent facts. If a field is empty, omit it gracefully — do not make up details.

Deceased: ${caseData.deceased_name}
Date of Birth: ${caseData.date_of_birth ?? 'not provided'}
Date of Death: ${caseData.date_of_death}
Occupation: ${caseData.occupation ?? 'not provided'}
Service Type: ${caseData.service_type ?? 'not provided'}
Family notes / memories: ${caseData.additional_notes ?? 'none provided'}

Write only the obituary text. No preamble. No explanation. No quotation marks.
  `.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  return response.choices[0].message.content ?? '';
}
```

**4b — API route:** `/api/obituary/generate/route.ts`
- Accept `case_id` in request body
- Fetch case from Supabase (server-side, service role)
- Call `generateObituary()`
- Insert result into `documents` table with `type = 'obituary'`, `status = 'draft'`
- Return document id + draft content

**4c — UI:**
- `/app/dashboard/cases/[id]/obituary/page.tsx`
- Show "Generate Obituary" button if no draft exists
- Show draft in an editable textarea once generated
- Tone controls: Short / Standard / Long + Formal / Warm toggles (append to prompt on regeneration)
- "Approve Draft" button → updates document status to `pending_family_review`
- Staff cannot send to family without approving first (hard gate)

**Review gate:** Obituary generates from real intake data, editable in UI, approval updates database status correctly.

---

### Phase 5 — Compliance Paperwork Pre-fill
**Goal:** Agent pre-fills a standard compliance document template using case intake data.

Tasks:

**5a — OpenAI prompt:** `/lib/openai/paperwork.ts`

```typescript
export async function generatePaperworkSummary(caseData: CaseRecord): Promise<string> {
  const prompt = `
You are an administrative assistant helping a funeral home pre-fill compliance paperwork.
Extract and organize the following fields from the case data below.
Output ONLY a valid JSON object — no explanation, no markdown, no extra text.

Required fields:
{
  "full_legal_name": "",
  "date_of_birth": "",
  "date_of_death": "",
  "place_of_death": "",
  "occupation": "",
  "next_of_kin_name": "",
  "next_of_kin_relationship": "",
  "next_of_kin_contact": "",
  "service_type": "",
  "service_date": "",
  "missing_fields": []  // list any required fields not available in the intake data
}

Case data:
${JSON.stringify(caseData, null, 2)}
  `.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 500,
  });

  return response.choices[0].message.content ?? '{}';
}
```

**5b — PDF generation:** `/lib/pdf/generate-document.ts`
- Use `pdf-lib` to create a pre-filled document from the JSON output above
- Highlight `missing_fields` in red/orange so staff immediately sees what needs manual completion
- Upload generated PDF to Supabase Storage → store URL in `documents.pdf_url`

**5c — UI:** `/app/dashboard/cases/[id]/documents/page.tsx`
- List all documents for this case
- "Generate Paperwork" button → triggers generation
- Download button for each generated PDF
- Missing fields flagged prominently — not buried

**Review gate:** Paperwork generates as a real downloadable PDF, missing fields are visible, PDF uploads to Supabase Storage.

---

### Phase 6 — Family Communication Automation
**Goal:** Status update emails and SMS send automatically at key case milestones, with staff preview before send.

Tasks:

**6a — Email:** `/lib/resend/send-email.ts`

Templates needed (write as React Email components or plain HTML strings):
- `intake_confirmed`: "Thank you for trusting us with your family. Here's what happens next..."
- `obituary_ready`: "Your obituary draft is ready for your review. Please take a look when you're ready..."
- `service_confirmed`: "Your service details have been confirmed. Here is a summary..."

All templates: warm, compassionate, signed with funeral home name. Never feels automated.

**6b — SMS:** `/lib/twilio/send-sms.ts`
- Shorter version of same milestones
- SMS sends only if family_contact_phone exists AND family has opted in (track opt-in on the case record)

**6c — API route:** `/api/communications/send/route.ts`
- Accept: `case_id`, `template_name`, `channel` ('email' | 'sms' | 'both')
- Preview mode: return rendered message without sending (used by UI to show staff before send)
- Send mode: send + log to `communication_logs` table
- On failed send: log error to `communication_logs.error_message`, do NOT fail silently

**6d — UI:**
- Add "Send Update" section to case detail page
- Staff selects which milestone update to send
- Preview is shown before confirm
- Staff must click "Confirm Send" — no auto-send without preview (hard rule)
- Communication log visible on case detail page (sent, delivered, failed statuses)

**Review gate:** Email sends, SMS sends (if configured), both log to database, failed sends surface as visible errors not silent failures.

---

### Phase 7 — Staff Dashboard (Case List)
**Goal:** Staff can see all active cases, their status, and what's pending action.

Tasks:
1. `/app/dashboard/page.tsx` — case list view
2. Fetch cases scoped to current staff's `funeral_home_id` via RLS
3. Display: case card per active case showing deceased name, family contact, current status, days since intake, what's pending (e.g. "Obituary awaiting approval")
4. Filter by status (All / Active / Pending Review / Completed)
5. Search by deceased name or family contact name
6. "New Case" button → `/dashboard/cases/new`

UI:
- Table or card grid (cards preferred on mobile)
- Status badges color-coded: intake (grey) / documents pending (yellow) / family review (blue) / approved (green) / completed (dark grey)
- Overdue indicator if service date is within 48 hours and documents not yet approved

**Review gate:** Dashboard loads real cases, filters work, RLS prevents cross-funeral-home data leakage (test with two separate accounts).

---

### Phase 8 — Polish + Error Handling
**Goal:** The product is stable, handles edge cases gracefully, and is ready for a real pilot.

Tasks:
1. Global error boundary — no raw crash screens visible to staff
2. Toast notifications for all async actions (success and failure)
3. Loading skeletons on all data-fetching pages (no blank flashes)
4. Empty states for: no cases yet, no documents generated, no communications sent
5. Mobile-responsive layout — staff may use this on a tablet during intake
6. Review every piece of UI copy for tone — nothing should feel cold or software-y
7. Run through a complete end-to-end test case manually:
   - Create case → generate obituary → approve → generate paperwork → send family update → mark complete

**Review gate:** End-to-end test passes without errors. UI is usable on a tablet. No console errors.

---

## What Antigravity Cannot Build (Do Manually)

| Task | Why | How |
|---|---|---|
| Zapier/Make automation flows | No-code UI, not code | Set up in Zapier dashboard after build |
| Twilio number provisioning | Account setup | Via Twilio console |
| Resend domain verification | DNS config | Via Resend dashboard |
| Supabase Storage bucket creation | Console step | Create `documents` bucket in Supabase dashboard, set to private |
| State-specific compliance form templates | Legal/domain knowledge | Source from that state's funeral director association |

---

## Coding Conventions

- TypeScript strict mode — no `any` unless explicitly justified with a comment
- All Supabase calls server-side (API routes or Server Components) — never expose service role key to client
- All OpenAI calls server-side only — never call OpenAI from the browser
- Every async operation has a loading state and an error state in the UI
- No `console.log` in production paths — use structured error objects
- Tailwind only for styling — no inline styles, no CSS modules
- Components are small and single-purpose — if a component file exceeds ~150 lines, split it

---

## AI Prompt Rules (Cross-Cutting)

All OpenAI/Claude API calls in this project must follow these rules:

1. **Temperature:** Obituary = 0.7 (warmth needed). Paperwork/JSON extraction = 0 (precision needed).
2. **System prompt always sets tone context** — the model must know it's operating in a funeral home context before it sees any data.
3. **JSON outputs:** prompt must say "return ONLY valid JSON, no markdown, no explanation." Parse with try/catch — never assume the model returns valid JSON.
4. **No hallucination in compliance docs** — paperwork prompts explicitly say "do not invent data; if a field is missing, mark it as missing."
5. **All outputs are drafts** — no AI output goes to a family without staff review. This is enforced in the database status flow, not just the UI.

---

## Done Definition

The build is complete when:
- [ ] All 8 phases have passed their review gates
- [ ] A test case can be created end-to-end: intake → obituary → paperwork → family comms → complete
- [ ] RLS confirmed with a two-account test (no cross-funeral-home data visible)
- [ ] No AI output reaches a family without staff approval (verified in the status flow)
- [ ] All failed sends surface as visible errors, never silent
- [ ] UI is usable on a tablet without horizontal scrolling
