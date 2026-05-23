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
    // Auto-locale redirect on first visit (no locale_choice cookie yet)
    const localePref = request.cookies.get('locale_choice')
    if (!localePref) {
      const acceptLang = request.headers.get('accept-language') ?? ''
      const primary = acceptLang.split(',')[0].split(';')[0].split('-')[0].toLowerCase()

      // Map browser language to one of our supported locales
      const LOCALE_MAP: Record<string, string> = { fr: 'fr', es: 'es', de: 'de' }
      const detected = LOCALE_MAP[primary] ?? 'en'

      // Strip any existing non-default locale prefix from current path
      let basePath = request.nextUrl.pathname
      for (const code of ['en', 'es', 'de']) {
        if (basePath === `/${code}`) { basePath = '/'; break }
        if (basePath.startsWith(`/${code}/`)) { basePath = basePath.slice(code.length + 1); break }
      }

      // Build target path for the detected locale
      const targetPath = detected === 'fr'
        ? basePath
        : `/${detected}${basePath === '/' ? '' : basePath}`

      const currentPath = request.nextUrl.pathname

      if (targetPath !== currentPath) {
        const url = request.nextUrl.clone()
        url.pathname = targetPath
        const redirectRes = NextResponse.redirect(url)
        redirectRes.cookies.set('locale_choice', detected, { maxAge: 31536000, path: '/', sameSite: 'lax' })
        // Propagate supabase auth cookies
        supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
          redirectRes.cookies.set(name, value, options)
        })
        return redirectRes
      }
    }

    const intlResponse = intlMiddleware(request)

    // Propagate supabase cookies onto the intl response
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      intlResponse.cookies.set(name, value, options)
    })

    // If first visit and already on the right path, stamp the cookie on the intl response
    if (!localePref) {
      const acceptLang = request.headers.get('accept-language') ?? ''
      const primary = acceptLang.split(',')[0].split(';')[0].split('-')[0].toLowerCase()
      const LOCALE_MAP: Record<string, string> = { fr: 'fr', es: 'es', de: 'de' }
      const detected = LOCALE_MAP[primary] ?? 'en'
      intlResponse.cookies.set('locale_choice', detected, { maxAge: 31536000, path: '/', sameSite: 'lax' })
    }

    return intlResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
