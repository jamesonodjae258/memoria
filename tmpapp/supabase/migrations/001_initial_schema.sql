-- ============================================================
-- Funeral Home AI Agent — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- -------------------------------------------------------
-- 1. Funeral Homes
-- -------------------------------------------------------
CREATE TABLE funeral_homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2. Staff Profiles (links auth.users → funeral_homes)
--    Required for RLS policies to scope data per funeral home.
-- -------------------------------------------------------
CREATE TABLE staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  funeral_home_id UUID NOT NULL REFERENCES funeral_homes(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- -------------------------------------------------------
-- 3. Cases (one record per deceased person / service)
-- -------------------------------------------------------
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

  -- Communication preferences
  sms_opt_in BOOLEAN DEFAULT false,

  -- Status
  status TEXT NOT NULL DEFAULT 'intake'
    CHECK (status IN ('intake','documents_pending','family_review','approved','completed')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 4. Documents (obituaries + compliance paperwork per case)
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- 5. Communication Logs (every message sent to families)
-- -------------------------------------------------------
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

-- ============================================================
-- Row Level Security — Non-negotiable
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE funeral_homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- Staff can view their own funeral home
CREATE POLICY "staff_own_funeral_home" ON funeral_homes
  FOR ALL USING (
    id = (
      SELECT funeral_home_id FROM staff_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Staff can view their own profile
CREATE POLICY "staff_own_profile" ON staff_profiles
  FOR ALL USING (
    user_id = auth.uid()
  );

-- Staff can only see cases belonging to their funeral home
CREATE POLICY "staff_own_cases" ON cases
  FOR ALL USING (
    funeral_home_id = (
      SELECT funeral_home_id FROM staff_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Same scope for documents (via case ownership)
CREATE POLICY "staff_own_documents" ON documents
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE funeral_home_id = (
        SELECT funeral_home_id FROM staff_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Same scope for communication logs (via case ownership)
CREATE POLICY "staff_own_comms" ON communication_logs
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE funeral_home_id = (
        SELECT funeral_home_id FROM staff_profiles WHERE user_id = auth.uid()
      )
    )
  );
