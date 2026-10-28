import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    const adminClient = createServiceRoleClient()

    // Fetch states that have at least one active compliance template
    const { data: templates, error } = await adminClient
      .from('compliance_templates')
      .select('state_id, states(id, name, abbreviation, is_active)')
      .eq('is_active', true)

    if (error) {
      // Fallback to Texas if DB is not populated or offline
      return NextResponse.json({
        states: [
          {
            id: 'texas',
            name: 'Texas',
            abbreviation: 'TX',
          },
        ],
      })
    }

    const stateMap = new Map<string, { id: string; name: string; abbreviation: string }>()

    for (const t of templates || []) {
      const s = (t as any).states
      if (s && s.is_active !== false) {
        stateMap.set(s.abbreviation, {
          id: s.id,
          name: s.name,
          abbreviation: s.abbreviation,
        })
      }
    }

    // Default to Texas if no active templates are seeded in database yet
    if (stateMap.size === 0) {
      stateMap.set('TX', {
        id: 'texas',
        name: 'Texas',
        abbreviation: 'TX',
      })
    }

    const states = Array.from(stateMap.values())

    return NextResponse.json({ states })
  } catch {
    // Return Texas fallback on error
    return NextResponse.json({
      states: [
        {
          id: 'texas',
          name: 'Texas',
          abbreviation: 'TX',
        },
      ],
    })
  }
}
