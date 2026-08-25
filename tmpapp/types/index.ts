// ============================================================
// Funeral Home AI Agent — Shared TypeScript Types
// All interfaces match the Supabase schema in 001_initial_schema.sql
// ============================================================

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled'
export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'

export interface FuneralHome {
  id: string
  name: string
  state: string
  email: string | null
  phone: string | null
  street_address?: string | null
  city?: string | null
  zip?: string | null
  onboarding_step?: number
  subscription_status?: SubscriptionStatus
  subscription_plan?: SubscriptionPlan
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  trial_ends_at?: string | null
  created_at: string
}

export interface InvitedStaff {
  id: string
  funeral_home_id: string
  email: string
  role: string
  invited_by: string | null
  status: 'pending' | 'accepted' | 'expired'
  created_at: string
}


export interface StaffProfile {
  id: string
  user_id: string
  funeral_home_id: string
  full_name: string | null
  role: string
  is_super_admin?: boolean
  created_at: string
}

export interface StateRecord {
  id: string
  name: string
  abbreviation: string
  is_active: boolean
  created_at: string
}

export interface ComplianceTemplate {
  id: string
  state_id: string
  form_name: string
  description: string | null
  is_required: boolean
  template_pdf_url: string | null
  required_fields: any[]
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FuneralHomeState {
  id: string
  funeral_home_id: string
  state_id: string
  is_primary: boolean
  created_at: string
}


export type CaseStatus =
  | 'intake'
  | 'documents_pending'
  | 'family_review'
  | 'approved'
  | 'completed'

export interface CaseRecord {
  id: string
  funeral_home_id: string
  created_by: string

  // Deceased info
  deceased_name: string
  date_of_birth: string | null
  date_of_death: string
  place_of_death: string | null
  occupation: string | null
  additional_notes: string | null

  // Family contact
  family_contact_name: string
  family_contact_email: string | null
  family_contact_phone: string | null
  relationship_to_deceased: string | null

  // Service
  service_type: string | null
  service_date: string | null
  service_location: string | null

  // Communication preferences
  sms_opt_in: boolean

  // Status
  status: CaseStatus

  created_at: string
  updated_at: string
}

export type DocumentType = 'obituary' | 'compliance_form' | 'other'

export type DocumentStatus =
  | 'draft'
  | 'pending_staff_review'
  | 'pending_family_review'
  | 'approved'
  | 'finalized'

export interface Document {
  id: string
  case_id: string
  type: DocumentType
  title: string
  draft_content: string | null
  pdf_url: string | null
  status: DocumentStatus
  version: number
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export type CommunicationChannel = 'email' | 'sms'

export type CommunicationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'

export interface CommunicationLog {
  id: string
  case_id: string
  channel: CommunicationChannel
  recipient: string
  subject: string | null
  message_content: string
  status: CommunicationStatus
  sent_at: string | null
  error_message: string | null
  created_at: string
}

// ============================================================
// Form / API helper types (used in later phases)
// ============================================================

/** Shape used when creating a new case via the intake form */
export type CaseInsert = Omit<CaseRecord, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'funeral_home_id' | 'status'>

/** Shape used when creating a new document record */
export type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at' | 'version' | 'reviewed_by' | 'reviewed_at'>
