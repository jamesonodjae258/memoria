# Memoria — Modern AI Suite for Funeral Homes

Memoria is an AI-assisted operational platform tailored for modern and independent funeral homes. It streamlines case intake, obituary drafting with multiple narrative tones, automated family communication logging, and state-specific regulatory compliance.

---

## 🌟 Key Features

- **Public Marketing & Sign-Up**: Smooth account onboarding with an intuitive 4-step wizard.
- **Case Ledger & Arrangement Workspace**: Complete intake lifecycle from initial call to memorial services.
- **AI Obituary Drafting**: Generates nuanced obituaries across traditional, celebratory, and poetic tones.
- **State Regulatory Compliance**: Jurisdiction-specific filings (vital statistics, death certificates, transit/cremation permits) pre-populated via AI and rendered with `pdf-lib`.
- **Super Admin Operations Panel**: Multi-tenant visibility, states registry, compliance template builder, and computed MRR metrics.
- **Multi-Tenant Row-Level Security (RLS)**: Enforced isolation across all funeral homes and staff accounts.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI / LLM**: OpenAI API / AgentRouter
- **Communications**: Resend (Email) & Twilio (SMS)
- **PDF Generation**: `pdf-lib`

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
cd tmpapp
npm install
```

### 2. Configure Environment
Copy `.env.local.example` to `.env.local` inside `tmpapp` and provide your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_ai_key
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### 3. Run Migrations
Execute the SQL migrations found under `supabase/migrations/`:
1. `001_initial_schema.sql`
2. `002_saas_additions.sql`

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.
