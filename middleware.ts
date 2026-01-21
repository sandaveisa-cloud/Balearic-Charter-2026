import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from './lib/supabase-middleware'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always show locale prefix in URL
  localePrefix: 'always'
})

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Debug logging for Vercel
  console.log('[Middleware] Checking path:', pathname)

  // ============================================================================
  // STEP 1: Handle root path explicitly
  // ============================================================================
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // ============================================================================
  // STEP 2: CRITICAL SECURITY CHECK - Admin Route Protection
  // STRICT: Block ANY path containing '/admin' if no session exists
  // This MUST run BEFORE i18n middleware to catch all admin routes
  // ============================================================================
  
  // Strict check: Does the path include '/admin' anywhere?
  // This catches: /admin, /en/admin, /es/admin, /de/admin, /en/admin/destinations, etc.
  const isAdminRoute = pathname.toLowerCase().includes('/admin')

  if (isAdminRoute) {
    console.log('[Middleware] 🔒 SECURITY: Admin route detected:', pathname)
    
    try {
      // Create response object for Supabase client
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })

      // Create Supabase client
      const supabase = createSupabaseMiddlewareClient(request, response)
      
      // Check for active user session - STRICT CHECK
      const { data: { user }, error } = await supabase.auth.getUser()

      // CRITICAL: IF NO USER OR ERROR - BLOCK ACCESS IMMEDIATELY
      if (error || !user || !user.id) {
        console.log('[Middleware] ❌ SECURITY BLOCK: No authenticated user found for admin route')
        console.log('[Middleware] Error:', error?.message || 'No user')
        
        // Extract locale from pathname
        const pathSegments = pathname.split('/').filter(Boolean)
        let locale = defaultLocale
        
        // Check if first segment is a valid locale
        if (pathSegments.length > 0 && locales.includes(pathSegments[0] as any)) {
          locale = pathSegments[0] as typeof defaultLocale
        }

        // IMMEDIATE REDIRECT to login - do not allow any admin access
        const loginUrl = new URL(`/${locale}/login`, request.url)
        loginUrl.searchParams.set('redirect', pathname)
        console.log('[Middleware] 🔄 SECURITY REDIRECT to login:', loginUrl.toString())
        return NextResponse.redirect(loginUrl)
      }

      // User is authenticated - log and allow access
      console.log('[Middleware] ✅ SECURITY PASS: User authenticated:', user.email, 'for path:', pathname)
      // Continue with intl middleware
      return intlMiddleware(request)
    } catch (error) {
      // FAIL SECURE: If ANY error occurs during auth check, block access
      console.error('[Middleware] ⚠️ SECURITY ERROR: Exception during auth check:', error)
      const pathSegments = pathname.split('/').filter(Boolean)
      const locale = (pathSegments.length > 0 && locales.includes(pathSegments[0] as any))
        ? pathSegments[0] as typeof defaultLocale
        : defaultLocale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      console.log('[Middleware] 🔄 FAIL-SECURE REDIRECT to login:', loginUrl.toString())
      return NextResponse.redirect(loginUrl)
    }
  }

  // ============================================================================
  // STEP 3: Continue with i18n middleware for all non-admin routes
  // ============================================================================
  return intlMiddleware(request)
}

export const config = {
  // Match ALL routes except API, static assets, and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
