import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: logs, error: logsError } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('case_id', params.id)
      .order('created_at', { ascending: false })

    if (logsError) {
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    return NextResponse.json(logs || [])
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
