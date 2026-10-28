-- ============================================================
-- Memoria SaaS Additions — Migration 004
-- Migration: 004_state_requests.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS state_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  funeral_home_id UUID REFERENCES funeral_homes(id) ON DELETE SET NULL,
  state_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE state_requests ENABLE ROW LEVEL SECURITY;

-- Signed-in users can insert only their own rows
CREATE POLICY "state_requests_user_insert" ON state_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Signed-in users can read only their own rows
CREATE POLICY "state_requests_user_select" ON state_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Super admins can read all rows
CREATE POLICY "state_requests_super_admin_select" ON state_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- Super admins can update all rows
CREATE POLICY "state_requests_super_admin_update" ON state_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );
