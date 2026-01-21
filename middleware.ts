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

  // Check if this is an admin route (any path containing /admin)
  const isAdminRoute = pathname.includes('/admin')

  if (isAdminRoute) {
    // Check for active Supabase session
    const user = await getSessionUser(request)

    if (!user) {
      // No session - redirect to login
      // Extract locale from pathname or use default
      const pathSegments = pathname.split('/').filter(Boolean)
      const locale = pathSegments[0] && locales.includes(pathSegments[0] as any)
        ? pathSegments[0]
        : defaultLocale

      // Redirect to login page with return URL
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // User is authenticated - allow access
    // Continue with intl middleware
    return intlMiddleware(request)
  }

  // Not an admin route - continue with intl middleware
  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match root path
    '/',
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - files with extensions (e.g. .ico, .png)
    // Note: admin routes are now inside [locale], so they're included
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}
