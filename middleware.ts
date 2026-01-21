import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from './lib/supabase-middleware'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always show locale prefix in URL
  localePrefix: 'always'
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle root path explicitly
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // CRITICAL: Check for admin routes FIRST, before intl middleware
  // This catches: /admin, /en/admin, /es/admin, /de/admin, /en/admin/destinations, etc.
  // Match any path that contains '/admin' (with optional trailing path)
  const isAdminRoute = pathname.includes('/admin')

  if (isAdminRoute) {
    console.log('[Middleware] Admin route detected:', pathname)
    
    // Check for active Supabase session
    const user = await getSessionUser(request)

    if (!user) {
      console.log('[Middleware] No session found, redirecting to login')
      
      // Extract locale from pathname
      // Path format: /en/admin, /es/admin, /de/admin, etc.
      const pathSegments = pathname.split('/').filter(Boolean)
      let locale = defaultLocale
      
      // Check if first segment is a valid locale
      if (pathSegments.length > 0 && locales.includes(pathSegments[0] as any)) {
        locale = pathSegments[0] as typeof defaultLocale
      }

      // Redirect to login page with return URL
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      console.log('[Middleware] Redirecting to:', loginUrl.toString())
      return NextResponse.redirect(loginUrl)
    }

    console.log('[Middleware] User authenticated:', user.email)
    // User is authenticated - allow access
    // Continue with intl middleware
    return intlMiddleware(request)
  }

  // Not an admin route - continue with intl middleware
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames including localized admin routes
  matcher: [
    // Match root path
    '/',
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - files with extensions (e.g. .ico, .png)
    // This includes: /en/admin, /es/admin, /de/admin, etc.
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}
