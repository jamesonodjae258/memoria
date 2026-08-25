import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    await supabase.auth.signOut()
  } catch {
    // Ignore signout error if unauthenticated
  }

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  const response = NextResponse.redirect(url, { status: 302 })
  response.cookies.set('gp_demo_session', '', { maxAge: 0, path: '/' })
  return response
}
