import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isPlaceholderEnv =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  // Skip auth if Supabase is not configured (allows UI preview during development)
  if (isPlaceholderEnv) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isDemoSession = request.cookies.get('gp_demo_session')?.value === 'true'
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isSignupPage = request.nextUrl.pathname === '/signup'
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')

  // If demo session is active, permit dashboard/onboarding access
  if (isDemoSession) {
    if (isLoginPage || isSignupPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Verify JWT with Supabase
  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (err) {
    console.error('Supabase auth check failed:', err)
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Unauthenticated users trying to access dashboard → redirect to login
  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Unauthenticated users trying to access onboarding → redirect to signup
  if (!user && isOnboardingRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/signup'
    return NextResponse.redirect(url)
  }

  // Unauthenticated users trying to access admin → redirect to dashboard
  if (!user && isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }


  // Authenticated users on login/signup page → redirect to dashboard / onboarding
  if (user && (isLoginPage || isSignupPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}


export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
