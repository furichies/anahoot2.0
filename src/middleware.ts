import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes logic
  if (!user && (pathname.startsWith('/host') || pathname.startsWith('/play'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Check role from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      // Allow host routes only for profesor
      if (pathname.startsWith('/host') && profile.role !== 'profesor') {
        const url = request.nextUrl.clone()
        url.pathname = '/play'
        return NextResponse.redirect(url)
      }
      
      // Allow play routes only for alumno
      if (pathname.startsWith('/play') && profile.role !== 'alumno') {
        const url = request.nextUrl.clone()
        url.pathname = '/host'
        return NextResponse.redirect(url)
      }

      // If on auth page but already logged in, redirect to correct dashboard
      if (pathname === '/auth' || pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = profile.role === 'profesor' ? '/host' : '/play'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
