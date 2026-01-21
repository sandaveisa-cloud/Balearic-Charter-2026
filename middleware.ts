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

  // ============================================================================
  // STEP 1: Handle root path explicitly
  // ============================================================================
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // ============================================================================
  // STEP 2: CRITICAL SECURITY CHECK - Admin Route Protection
  // This MUST run BEFORE i18n middleware to catch all admin routes
  // Generic check: Does the pathname include '/admin' anywhere?
  // This catches: /admin, /en/admin, /es/admin, /de/admin, /en/admin/destinations, etc.
  // ============================================================================
  
  const isAdminRoute = pathname.includes('/admin')

  if (isAdminRoute) {
    console.log('[Middleware] 🔒 Admin route detected:', pathname)
    
    try {
      // Check for active Supabase session
      const user = await getSessionUser(request)

      if (!user) {
        console.log('[Middleware] ❌ No session found, redirecting to login')
        
        // Extract locale from pathname
        // Path format: /en/admin, /es/admin, /de/admin, /admin, etc.
        const pathSegments = pathname.split('/').filter(Boolean)
        let locale = defaultLocale
        
        // Check if first segment is a valid locale
        if (pathSegments.length > 0 && locales.includes(pathSegments[0] as any)) {
          locale = pathSegments[0] as typeof defaultLocale
        }

        // Redirect to login page with return URL
        const loginUrl = new URL(`/${locale}/login`, request.url)
        loginUrl.searchParams.set('redirect', pathname)
        console.log('[Middleware] 🔄 Redirecting to:', loginUrl.toString())
        return NextResponse.redirect(loginUrl)
      }

      console.log('[Middleware] ✅ User authenticated:', user.email)
      // User is authenticated - allow access and continue with intl middleware
    } catch (error) {
      // If session check fails, redirect to login for security (fail secure)
      console.error('[Middleware] ⚠️ Error checking session:', error)
      const pathSegments = pathname.split('/').filter(Boolean)
      const locale = (pathSegments.length > 0 && locales.includes(pathSegments[0] as any))
        ? pathSegments[0] as typeof defaultLocale
        : defaultLocale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ============================================================================
  // STEP 3: Continue with i18n middleware for all routes
  // ============================================================================
  return intlMiddleware(request)
}

export const config = {
  // Match ALL routes except static assets and Next.js internals
  matcher: [
    // Match all pathnames except:
    // - _next/static (static files)
    // - _next/image (image optimization)
    // - favicon.ico
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
