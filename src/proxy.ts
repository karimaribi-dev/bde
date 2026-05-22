import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip intl for admin, api, static files
  const isAdminOrStatic =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')

  // --- Supabase session refresh (all routes) ---
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- Maintenance mode (public routes only) ---
  if (
    !user &&
    !isAdminOrStatic &&
    !pathname.startsWith('/maintenance')
  ) {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance')
        .single()

      if (data?.value?.enabled === true) {
        return NextResponse.rewrite(new URL('/maintenance', request.url))
      }
    } catch {
      // En cas d'erreur, ne pas bloquer le site
    }
  }

  // --- Intl routing (public routes only) ---
  if (!isAdminOrStatic) {
    const intlResponse = intlMiddleware(request)

    // Propagate supabase cookies onto the intl response
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      intlResponse.cookies.set(name, value, options)
    })

    return intlResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
