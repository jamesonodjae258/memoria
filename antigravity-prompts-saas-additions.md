# Antigravity Prompts — SaaS Additions
## Sign Up + Onboarding · Admin Panel · State Compliance Library · Stripe Billing

> These prompts extend the existing funeral home build.
> Run these after the original 8 phases are complete.
> Same rules apply: one phase at a time, stop at each review gate.

---

## SESSION KICK-OFF (for this extension)

```
We are continuing the Memoria funeral home AI agent build.
The original 8 phases are complete. We are now adding four new capabilities
to turn this into a proper multi-tenant SaaS:

Phase 9  — Public sign-up + onboarding flow
Phase 10 — Admin panel (James/owner only)
Phase 11 — State compliance library (visible to funeral homes)
Phase 12 — Stripe billing integration

Read AGENTS.md in the repo root before you begin.
The existing stack is: Next.js 14 App Router, Supabase, OpenAI API,
Resend, Twilio, Tailwind CSS, TypeScript.

Three user types now exist:
1. Super Admin (James) — manages compliance templates, views all accounts
2. Funeral Home Owner — signs up, onboards, manages their location and staff
3. Staff — uses the app day to day

Confirm you understand this before I say "begin Phase 9."
```

---

## NEW DATABASE MIGRATIONS (add before Phase 9)

```
Before starting Phase 9, write a new migration file:
/supabase/migrations/002_saas_additions.sql

It must add exactly these:

-- States reference table
CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation CHAR(2) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance form templates per state (managed by James only)
CREATE TABLE compliance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id),
  form_name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  template_pdf_url TEXT,
  required_fields JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Which states each funeral home operates in
CREATE TABLE funeral_home_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funeral_home_id UUID NOT NULL REFERENCES funeral_homes(id) ON DELETE CASCADE,
  state_id UUID NOT NULL REFERENCES states(id),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(funeral_home_id, state_id)
);

-- Add billing fields to existing funeral_homes table
ALTER TABLE funeral_homes
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial','active','past_due','cancelled')),
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter'
    CHECK (subscription_plan IN ('starter','growth','enterprise')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '30 days');

-- Add is_super_admin to staff_profiles
ALTER TABLE staff_profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- RLS for new tables
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_home_states ENABLE ROW LEVEL SECURITY;

-- States: anyone authenticated can read, only super admin can write
CREATE POLICY "states_read_all" ON states FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "states_super_admin_write" ON states FOR ALL USING (
  (SELECT is_super_admin FROM staff_profiles WHERE user_id = auth.uid())
);

-- Compliance templates: authenticated can read active ones, super admin writes
CREATE POLICY "templates_read_active" ON compliance_templates
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);
CREATE POLICY "templates_super_admin_write" ON compliance_templates
  FOR ALL USING (
    (SELECT is_super_admin FROM staff_profiles WHERE user_id = auth.uid())
  );

-- Funeral home states: staff see their own home's states
CREATE POLICY "fhs_own_home" ON funeral_home_states
  FOR ALL USING (
    funeral_home_id = (
      SELECT funeral_home_id FROM staff_profiles WHERE user_id = auth.uid()
    )
  );

Run this migration. Confirm all tables and policies applied correctly before proceeding.
```

---

## PHASE 9 PROMPT — Public Sign Up + Onboarding

```
Begin Phase 9.

We are building the public-facing entry point: sign up, account creation,
and a 4-step onboarding flow for new funeral homes.

Deliverables:

9a — Public marketing entry (simple, not the landing page):
- /app/(public)/page.tsx — a minimal "get started" page if no full
  landing page exists yet. Just logo, one-line description, and two
  buttons: "Create account" and "Log in."
- This is NOT the full landing page — that is a separate HTML file.

9b — Sign-up page:
- /app/(auth)/signup/page.tsx
- Email + password + confirm password
- On success: create Supabase auth user → redirect to /onboarding/step-1
- Show clear validation errors. No silent failures.

9c — Onboarding flow (4 steps, one page per step):
All under /app/onboarding/

Step 1: /app/onboarding/step-1/page.tsx — Funeral home details
  Fields: funeral_home_name, phone, address (street, city, state, zip)
  Save to: funeral_homes table (new row), link to auth.uid()
  Also create staff_profiles row for this user with role="owner"

Step 2: /app/onboarding/step-2/page.tsx — Select primary state
  Show a searchable dropdown or scrollable list of all active states
  from the states table
  Mark selected state as is_primary=true in funeral_home_states
  Staff can select additional states here too (multi-select)

Step 3: /app/onboarding/step-3/page.tsx — Invite staff (optional)
  Simple email input, can add multiple
  Send invitation emails via Resend with a signup link
  Make this skippable: "Skip for now" button at bottom
  Store pending invites in a simple invited_staff table
  (add this table to the migration in this phase)

Step 4: /app/onboarding/step-4/page.tsx — Done screen
  Summary of what was set up
  "Go to dashboard" button → /dashboard
  Show a 30-day trial countdown: "Your free trial ends on [date]"

Onboarding state:
  Track which step the user has completed using a simple onboarding_step
  column on funeral_homes (integer 1–4)
  If a user visits /dashboard without completing onboarding, redirect
  them back to their last incomplete step

Progress indicator:
  Show step progress (1 of 4, 2 of 4...) at top of each step
  Back button on steps 2+ to return to previous step

When done: stop. List every file created or modified. Do not begin Phase 10.
```

---

## PHASE 10 PROMPT — Admin Panel (James Only)

```
Phase 9 is approved. Begin Phase 10.

We are building the super admin panel. Only users where
staff_profiles.is_super_admin = true can access this.
All other users are redirected to /dashboard.

All admin routes live under /app/admin/

10a — Admin auth guard:
Create a middleware or layout check:
/app/admin/layout.tsx
  - Check auth.uid() exists
  - Check staff_profiles.is_super_admin = true for that user
  - If not: redirect to /dashboard immediately
  - No error message — just redirect silently

10b — Admin navigation:
Sidebar with:
  - States (manage state list)
  - Compliance Templates (manage forms per state)
  - Funeral Homes (view all accounts, subscription status)
  - Dashboard (simple summary: total accounts, active trials, MRR)

10c — States management:
/app/admin/states/page.tsx
  - List all states (id, name, abbreviation, is_active, template count)
  - "Add State" button → inline form: name + abbreviation
  - Toggle is_active per state (deactivating hides it from onboarding)
  - Cannot delete states that have existing compliance templates
    (show error if attempted)

10d — Compliance template management:
/app/admin/compliance/page.tsx
  - Filter by state
  - List templates: form_name, description, is_required, is_active
  - "Add Template" → /app/admin/compliance/new/page.tsx
    Fields:
      state_id (dropdown)
      form_name
      description
      is_required (toggle)
      template_pdf_url (text input — URL of uploaded PDF in Supabase Storage)
      required_fields (dynamic list: add/remove field names that AI will pre-fill)
  - Edit existing template: /app/admin/compliance/[id]/edit/page.tsx
  - Toggle is_active per template (deactivated templates no longer appear
    in funeral home compliance views)

10e — Funeral homes list:
/app/admin/homes/page.tsx
  - Table: funeral_home_name, state, owner email, subscription_status,
    subscription_plan, trial_ends_at, created_at
  - Filter by subscription_status
  - Click a row to see that funeral home's details and case count

10f — Admin dashboard summary:
/app/admin/page.tsx
  - Total funeral homes (all time)
  - Active trials count
  - Active paid subscriptions count
  - Estimated MRR (count of active plans × plan price — hardcode prices
    for now: starter=$399, growth=$599)
  - These are computed from the database, not hardcoded values

UI note: admin panel does not need to match the funeral home UI style exactly.
It should be clean, functional, and fast — not polished. This is an internal tool.

When done: stop. List every file created or modified. Do not begin Phase 11.
```

---

## PHASE 11 PROMPT — State Compliance Library (Funeral Home Facing)

```
Phase 10 is approved. Begin Phase 11.

We are building the compliance section that funeral homes see inside their dashboard.
This is separate from the admin panel — it is the consumer-facing compliance interface.

Deliverables:

11a — Compliance section in sidebar:
Add "Compliance" link to the staff dashboard sidebar, between the existing nav items.

11b — Compliance overview page:
/app/dashboard/compliance/page.tsx

  Display:
  - The funeral home's primary state prominently at the top
    (fetched from funeral_home_states where is_primary=true)
  - A state switcher if they have multiple states registered:
    tabs or a dropdown to switch between their states
  - "Manage states" link → step-2 of onboarding flow (reuse it as a settings page)

  For the selected state, show all active compliance templates:
  - Form name
  - Description
  - Whether it is required or optional
  - A "Generate for case" button (see 11c below)

  Group forms by required vs optional.

  Empty state: if no templates exist for this state yet, show:
  "Compliance forms for [State] are being added. Contact us to prioritize your state."

11c — Generate compliance document from a case:
When staff clicks "Generate for case" on a template:
  - Show a modal or slide-out: select which active case to generate for
  - On confirm: POST to /api/documents/generate-compliance/route.ts with:
    { case_id, template_id }
  - API route:
    1. Fetch the case data
    2. Fetch the compliance template (required_fields list)
    3. Call OpenAI to extract and map case fields to required_fields
       (reuse the paperwork.ts logic from Phase 5, pass required_fields
       from the template rather than hardcoding them)
    4. Generate PDF using pdf-lib
    5. Upload to Supabase Storage
    6. Insert into documents table:
       type='compliance_form', title=template.form_name,
       status='draft', pdf_url=storage_url
    7. Return the document id and pdf_url
  - After generation: redirect to /dashboard/cases/[case_id]/documents

11d — State management settings:
/app/dashboard/settings/states/page.tsx
  - Show currently registered states for this funeral home
  - "Add state" → searchable dropdown of all active states
  - "Remove state" (only non-primary states can be removed)
  - "Set as primary" button per state
  - Link from the compliance page under "Manage states"

When done: stop. List every file created or modified. Do not begin Phase 12.
```

---

## PHASE 12 PROMPT — Stripe Billing

```
Phase 11 is approved. Begin Phase 12.

We are adding Stripe billing. Install the Stripe SDK:
npm install stripe @stripe/stripe-js

Add these env vars to .env.local.example:
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_GROWTH_PRICE_ID=

Deliverables:

12a — Stripe customer creation on sign-up:
In the onboarding step-1 API handler (where funeral_home is created):
  - After creating the funeral_home row, create a Stripe customer:
    stripe.customers.create({ email, name: funeral_home_name })
  - Save stripe_customer_id to the funeral_homes row
  - Do this server-side only — never expose the secret key to the client

12b — Pricing/upgrade page:
/app/dashboard/billing/page.tsx
  - Show current plan and trial status
  - Show trial countdown if still in trial (days remaining)
  - Show plan cards: Starter ($399/mo) and Growth ($599/mo)
  - "Upgrade to [plan]" button per card
  - If already on a paid plan, show current plan as active
  - "Manage billing" link → Stripe Customer Portal (see 12d)

12c — Checkout API route:
/api/billing/checkout/route.ts
  - Accept: plan ('starter' | 'growth')
  - Fetch stripe_customer_id from funeral_homes for the current user
  - Create Stripe Checkout session:
    mode: 'subscription'
    customer: stripe_customer_id
    line_items: [{ price: STRIPE_[PLAN]_PRICE_ID, quantity: 1 }]
    success_url: [your-domain]/dashboard/billing?success=true
    cancel_url: [your-domain]/dashboard/billing
  - Return the checkout URL to the client
  - Client redirects to Stripe Checkout

12d — Customer portal route:
/api/billing/portal/route.ts
  - Creates a Stripe Customer Portal session for the current user
  - Returns the portal URL
  - "Manage billing" button on the billing page calls this route and
    redirects to the returned URL

12e — Stripe webhook handler:
/api/webhooks/stripe/route.ts
  - Verify webhook signature using STRIPE_WEBHOOK_SECRET
  - Handle these events:
    checkout.session.completed:
      Update funeral_homes:
        subscription_status = 'active'
        subscription_plan = [plan from metadata]
        stripe_subscription_id = session.subscription
    invoice.payment_failed:
      Update funeral_homes: subscription_status = 'past_due'
    customer.subscription.deleted:
      Update funeral_homes: subscription_status = 'cancelled'

12f — Trial enforcement middleware:
Extend middleware.ts to check subscription_status for /dashboard/* routes:
  - If subscription_status = 'trial' AND trial_ends_at < now():
    Redirect to /dashboard/billing with a "Your trial has ended" message
  - If subscription_status = 'cancelled':
    Redirect to /dashboard/billing with a "Subscription inactive" message
  - All other statuses: allow through normally

12g — Billing status indicator in nav:
In the dashboard layout, show a small indicator if:
  - Trial: "X days left in trial" with a link to /dashboard/billing
  - Past due: "Payment failed — update billing" in red with a link
  - This should be a banner at the top of the dashboard, not a badge
    in the sidebar

Important: Test the webhook locally using the Stripe CLI:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
Document the test command in a comment at the top of the webhook route.

When done: stop. List every file created or modified.
Run through this checklist before declaring Phase 12 complete:
  [ ] Checkout creates a real Stripe session (test mode)
  [ ] Webhook updates database status correctly on payment
  [ ] Trial enforcement redirects correctly after trial expires
  [ ] No Stripe secret key is ever sent to the browser
  [ ] Customer portal link works
```

---

## QUICK REFERENCE — Full Phase Order

| Phase | What gets built |
|---|---|
| 1 | Scaffold + database + RLS |
| 2 | Auth + staff login |
| 3 | Case intake form |
| 4 | AI obituary generation |
| 5 | Compliance paperwork pre-fill + PDF |
| 6 | Family communication (email + SMS) |
| 7 | Staff dashboard |
| 8 | Polish + error handling |
| — | New migration (002_saas_additions.sql) |
| 9 | Public sign-up + 4-step onboarding |
| 10 | Super admin panel (James only) |
| 11 | State compliance library (funeral home facing) |
| 12 | Stripe billing |
