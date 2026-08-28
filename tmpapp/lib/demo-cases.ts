import type { CaseRecord, Document } from '@/types'

export function getDemoCases(): CaseRecord[] {
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  const in5days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'test_case_demo',
      funeral_home_id: 'demo-home-id',
      created_by: 'demo-user-id',
      deceased_name: 'Margaret Helen Thompson',
      date_of_birth: '1942-05-14',
      date_of_death: '2026-07-18',
      place_of_death: 'St. Jude Memorial Hospital, Austin, TX',
      occupation: 'Elementary School Teacher for 35 years',
      additional_notes: 'Loved gardening, baking peach cobbler, and spending time with her 4 grandchildren.',
      family_contact_name: 'Robert Thompson',
      family_contact_email: 'family.thompson@example.com',
      family_contact_phone: '+15550192834',
      relationship_to_deceased: 'Son',
      service_type: 'burial',
      service_date: in24h,
      service_location: 'Grace Community Chapel',
      sms_opt_in: true,
      status: 'documents_pending',
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo_case_2',
      funeral_home_id: 'demo-home-id',
      created_by: 'demo-user-id',
      deceased_name: 'Arthur James Pendelton',
      date_of_birth: '1938-11-20',
      date_of_death: '2026-07-19',
      place_of_death: 'Austin, TX',
      occupation: 'Architect & Veteran',
      additional_notes: 'Passionate about woodworking, classical jazz music, and designing community libraries.',
      family_contact_name: 'Eleanor Pendelton',
      family_contact_email: 'eleanor.p@example.com',
      family_contact_phone: '+15550198822',
      relationship_to_deceased: 'Daughter',
      service_type: 'cremation',
      service_date: in5days,
      service_location: 'Memorial Gardens Chapel',
      sms_opt_in: false,
      status: 'intake',
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'demo_case_3',
      funeral_home_id: 'demo-home-id',
      created_by: 'demo-user-id',
      deceased_name: 'Eleanor Davis Vance',
      date_of_birth: '1950-03-08',
      date_of_death: '2026-07-20',
      place_of_death: 'Cedar Park, TX',
      occupation: 'Botanist & Author',
      additional_notes: 'Pioneered native wildflower preservation and inspired generations of botanists.',
      family_contact_name: 'David Vance',
      family_contact_email: 'david.vance@example.com',
      family_contact_phone: '+15550193344',
      relationship_to_deceased: 'Husband',
      service_type: 'memorial',
      service_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Hill Country Sanctuary',
      sms_opt_in: true,
      status: 'family_review',
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
  ]
}

export function getDemoCaseById(id: string): CaseRecord {
  const cases = getDemoCases()
  const found = cases.find((c) => c.id === id)
  if (found) return found

  return {
    ...cases[0],
    id,
  }
}

export function getDemoDocumentForCase(caseId: string): Document | null {
  if (caseId === 'test_case_demo') {
    return {
      id: 'demo-doc-1',
      case_id: 'test_case_demo',
      type: 'obituary',
      title: 'Obituary - Margaret Helen Thompson',
      draft_content:
        'Margaret Helen Thompson, aged 84, of Austin, Texas, passed away peacefully surrounded by her loved ones on July 18, 2026. Born on May 14, 1942, Margaret dedicated 35 fulfilling years to educating elementary students with patience, kindness, and joy.\n\nShe is fondly remembered for her radiant garden, her famous peach cobbler, and her devoted love for her four grandchildren. A funeral service will be held at Grace Community Chapel.',
      pdf_url: null,
      status: 'draft',
      version: 1,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  return null
}
