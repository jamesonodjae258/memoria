# Antigravity Prompt: Align the App With the Landing Page Copy

Paste everything below the line into Antigravity as one prompt. The manual tasks for you (outside the code) are at the end of this file.

---

We are aligning the Memoria app with the landing page copy in `memoria-landing-copy.md`. The copy makes specific promises to funeral homes, and the app must keep every one of them. Read `AGENTS.md` and `memoria-landing-copy.md` before you begin.

Rules for this whole task:
- Work through the steps in order. Stop after each step, list every file you changed, and wait for me to say "approved" before the next one.
- Do not redesign anything. Only change behavior, labels, and the pages named below.
- Do not remove database columns or tables. Hide features with flags instead, so they can return later.
- Do not use contractions or long dashes in any text you add to the interface.
- If a step reveals something that conflicts with these instructions, stop and tell me instead of guessing.

---

## Step 1: Staff must confirm every family email

The copy promises that every message to a family is previewed and confirmed by staff first.

1. Search the whole codebase for anything that sends a family-facing email without a staff click: database triggers, webhooks, cron jobs, server actions, or API routes that fire on case creation or status change. Report what you find, then remove or disable it.
2. Update `/api/communications/send/route.ts`:
   - The family-facing templates (`intake_confirmed`, `obituary_ready`, `service_confirmed`) must require an authenticated staff session AND `confirmed: true` in the request body.
   - A request that uses the `API_SECRET` bearer token must be rejected for those templates. The bearer token path may only be used for internal staff alerts.
   - Return HTTP 403 with a clear message when either condition is missing.
3. In the UI, the "Confirm Send" button is the only thing that sets `confirmed: true`. Preview mode must never send.

Stop. Wait for approval.

---

## Step 2: Verify the funeral home's contact email is used everywhere

The copy promises that families reply straight to the funeral home's own inbox.

Check each item below and report pass or fail for each. Fix only what fails.

- `funeral_homes.contact_email` exists.
- Onboarding step 1 collects it as a required field.
- `sendEmail()` sets the From name to the funeral home's name and `reply_to` to `contact_email`.
- A send is blocked, with a visible message, when `contact_email` is empty.
- Every outcome, success or failure, is written to `communication_logs`.

If the column or the field is missing entirely, stop and tell me, because that means the earlier email fix was never applied.

Stop. Wait for approval.

---

## Step 3: Audit account separation

The copy says each funeral home account is kept separate. Do not rebuild anything. Audit it.

1. Search for every use of `SUPABASE_SERVICE_ROLE_KEY` and list each file. It is allowed only in server-side API routes that must bypass row level security (obituary generation, document generation, communication sending, webhooks, admin routes). List any other use as a defect.
2. Confirm that every page and component that reads `cases`, `documents`, or `communication_logs` uses the server client built with the anon key and the user's session, never the service role.
3. For every API route that uses the service role, confirm it first checks that the signed-in staff member belongs to the funeral home that owns the case. If a route accepts a `case_id` and does not check ownership, fix it.
4. Give me the SQL to confirm that row level security is enabled and policies exist on `cases`, `documents`, `communication_logs`, `funeral_homes`, and `staff_profiles`. I will run it in Supabase.
5. Confirm that signup always creates both a `funeral_homes` row and a `staff_profiles` row, and that a failure in the second does not leave a half-created account.

Stop. Wait for approval. (I will run the two-account test myself using the pre-launch test script.)

---

## Step 4: Rename compliance forms to filing summaries

The copy says Memoria prepares a filing summary and files nothing.

1. Change user-facing labels only. Keep the database values such as `compliance_form` exactly as they are.
   - "Generate Paperwork" and "Generate for case" become "Generate filing summary".
   - "Pre-filled" becomes "Summary ready".
   - Any heading or button that says "compliance form" or "paperwork" becomes "filing summary".
2. On the documents page and on every generated PDF, add this line in plain text near the top: "Prepared for staff review. Confirm current requirements with your state office before filing."
3. Missing fields must appear on screen, in a clear banner, before the download button. The download stays available, but the banner stays visible above it.
4. The navigation label stays "Compliance".

Stop. Wait for approval.

---

## Step 5: Only offer states that are actually loaded

The copy says Texas is live and other states are added on request.

1. Write migration `004_state_requests.sql` creating `state_requests` with: `id`, `user_id`, `funeral_home_id` (nullable), `state_name`, `contact_email`, `status` (default 'new'), `created_at`. Enable row level security. A signed-in user can insert and read only their own rows. Super admins can read and update all rows.
2. In onboarding step 2, list only states that have at least one active compliance template.
3. Add an option "My state is not listed". It asks for the state name, saves a `state_requests` row, and lets the user continue onboarding.
4. If a funeral home has no state with templates, the compliance page shows: "We are adding [State]. We will email you when your forms are ready." Case intake, obituary drafting, and family emails must still work for them.
5. In the admin panel, add a "State requests" page listing every request with its date and status, and a button to mark one as done.

Stop. Wait for approval.

---

## Step 6: One plan, 30-day trial, no card, manual billing

The copy offers one Founding partner plan at $399 per location per month, a 30-day free trial, and no credit card.

1. Add a flag `BILLING_ENABLED = false` in `lib/features.ts`. Keep all Stripe code in place but unreachable while the flag is off.
2. Signup and onboarding must never ask for a card.
3. When a funeral home is created, set `trial_ends_at` to 30 days from that moment, and `subscription_status` to `trial`.
4. The billing page shows a single card: "Founding partner, $399 per location per month". It shows days left in the trial. In place of a checkout button it shows "Contact us to continue after your trial" as a mailto link using a `CONTACT_EMAIL` environment variable.
5. When a trial has ended and the account is not marked as paying, redirect dashboard routes to the billing page with the message "Your trial has ended. Contact us to continue." The user must be able to see their data is still there, and the billing page must stay reachable.
6. Show a trial banner on the dashboard with the number of days left.
7. In the admin panel, on each funeral home, add four actions. Each must be a server-side route that first confirms the caller is a super admin:
   - Extend trial by 7, 14, or 30 days.
   - Mark as paying (sets `subscription_status` to `active`).
   - Disable account (sets it to `cancelled`).
   - Re-enable account (sets it back to `trial` or `active`).

Stop. Wait for approval.

---

## Step 7: Privacy and Terms pages

The footer links to `/privacy` and `/terms`.

1. Create `/app/(public)/privacy/page.tsx` and `/app/(public)/terms/page.tsx`, with a simple layout in the same fonts and colors as the landing page.
2. Put `COMPANY_NAME`, `CONTACT_EMAIL`, and `LAST_UPDATED` in one constants file and use them in both pages. Do not invent a company address, registration number, or jurisdiction.
3. The privacy page must cover, in plain language: what information is collected (account details, case details, family contact details); that case details are sent to an AI provider only to draft documents; encryption in transit and at rest; that each account is kept separate; how long data is kept and how to request deletion by emailing the contact address; and that staff are responsible for the accuracy of what they enter. Mark the sentence about the AI provider not training on the data with a code comment `TODO: confirm against the provider's current policy`.
4. The terms page must cover: what the service does; that it prepares drafts and summaries and files nothing with any state; that staff must review everything before it reaches a family; that it is not legal advice; the free 30-day trial; manual invoicing after the trial; and how either side can end the arrangement.
5. At the top of the terms file, add a code comment: `TODO: have a qualified person review before launch`.

Stop. Wait for approval.

---

## Step 8: Email only

The copy no longer mentions SMS.

1. Add `SMS_ENABLED = false` in `lib/features.ts`.
2. Hide the SMS and "both" channel options in the send UI.
3. Hide the SMS opt-in field in the intake form. Keep the database column.
4. In `/api/communications/send/route.ts`, reject `sms` and `both` with HTTP 400 while the flag is off.

Stop. Wait for approval.

---

## Step 9: Final checks

1. **Multi-state:** add `MULTI_STATE_ENABLED = false`. While it is off, hide the "add state", "remove state", and "set as primary" controls on the settings page, and hide the state switcher on the compliance page. Show only the funeral home's primary state.
2. **Contact link:** add a visible "Contact us" link to the dashboard navigation or footer, as a mailto using `CONTACT_EMAIL`.
3. **No case data in logs:** search for every `console.log`, `console.error`, and error reporting call. None may print a deceased name, family detail, obituary text, or document content. Log ids and error messages only.
4. **HTTPS:** confirm no hardcoded `http://` URLs for the production site, add `NEXT_PUBLIC_SITE_URL` to `.env.local.example`, and add a `Strict-Transport-Security` header in `next.config.js`.
5. **Environment file:** make sure `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and `MEMORIA_SENDING_EMAIL` are all in `.env.local.example`.

---

## Final checklist

When all nine steps are approved, confirm each line:

- [ ] No family email can be sent without a staff session and `confirmed: true`.
- [ ] Replies go to the funeral home's contact email, and a send is blocked without one.
- [ ] No service role key is used outside the allowed server routes, and every such route checks ownership.
- [ ] Every label says "filing summary", and the review line appears on screen and on every PDF.
- [ ] Onboarding offers only states with loaded templates, and state requests reach the admin panel.
- [ ] One plan, no card, a 30-day trial, and four admin account actions.
- [ ] Privacy and Terms pages exist with the TODO comments in place.
- [ ] SMS and multi-state controls are hidden behind flags.
- [ ] No case data appears in any log.

List every file created or modified. Do not start any other task.

---

## Manual tasks for you (not for Antigravity)

1. Run the two-account test from the pre-launch test script after Step 3 is approved.
2. Confirm your AI provider's current API data policy, then remove the TODO comment on the privacy page.
3. Have someone qualified read the terms page before launch.
4. Set `CONTACT_EMAIL` to an address you check every day, because trial questions and state requests will come to you by hand.
