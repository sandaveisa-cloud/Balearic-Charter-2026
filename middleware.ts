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
  // STEP 2: 🛑 CRITICAL FIX - Bypass intl middleware for Admin routes
  // Admin is now at /admin (root level), not /[locale]/admin
  // This check MUST run BEFORE intlMiddleware to prevent redirect to /en/admin
  // ============================================================================
  
  // Check if path starts with /admin (root-level admin route)
  if (pathname.startsWith('/admin')) {
    console.log('[Middleware] 🔒 SECURITY: Admin route detected (bypassing i18n):', pathname)
    
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
        
        // Admin uses 'en' locale for login redirect (hardcoded)
        const locale = defaultLocale

        // IMMEDIATE REDIRECT to login - do not allow any admin access
        const loginUrl = new URL(`/${locale}/login`, request.url)
        loginUrl.searchParams.set('redirect', pathname)
        console.log('[Middleware] 🔄 SECURITY REDIRECT to login:', loginUrl.toString())
        return NextResponse.redirect(loginUrl)
      }

      // User is authenticated - log and allow access
      console.log('[Middleware] ✅ SECURITY PASS: User authenticated:', user.email, 'for path:', pathname)
      // Bypass intl middleware completely - return response directly
      return response
    } catch (error) {
      // FAIL SECURE: If ANY error occurs during auth check, block access
      console.error('[Middleware] ⚠️ SECURITY ERROR: Exception during auth check:', error)
      const locale = defaultLocale
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
