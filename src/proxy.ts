import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  // Maintenance mode check (skip admin, maintenance page itself, static files, et utilisateurs connectés)
  if (
    !user &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/maintenance') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.includes('.')
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
