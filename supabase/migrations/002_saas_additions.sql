-- ============================================================
-- Memoria SaaS Additions — Migration 002
-- Migration: 002_saas_additions.sql
-- ============================================================

-- States reference table
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation CHAR(2) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance form templates per state (managed by James only)
CREATE TABLE IF NOT EXISTS compliance_templates (
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
CREATE TABLE IF NOT EXISTS funeral_home_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funeral_home_id UUID NOT NULL REFERENCES funeral_homes(id) ON DELETE CASCADE,
  state_id UUID NOT NULL REFERENCES states(id),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(funeral_home_id, state_id)
);

-- Pending staff invitations
CREATE TABLE IF NOT EXISTS invited_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funeral_home_id UUID NOT NULL REFERENCES funeral_homes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  invited_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add billing & onboarding fields to existing funeral_homes table
ALTER TABLE funeral_homes
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial','active','past_due','cancelled')),
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter'
    CHECK (subscription_plan IN ('starter','growth','enterprise')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS street_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS zip TEXT;

-- Add is_super_admin to staff_profiles
ALTER TABLE staff_profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- RLS for new tables
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_home_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE invited_staff ENABLE ROW LEVEL SECURITY;

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

-- Invited staff: staff see their own home's invites
CREATE POLICY "invited_staff_own_home" ON invited_staff
  FOR ALL USING (
    funeral_home_id = (
      SELECT funeral_home_id FROM staff_profiles WHERE user_id = auth.uid()
    )
  );

