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
  console.log('Middleware checking path:', pathname)

  // ============================================================================
  // STEP 1: Handle root path explicitly
  // ============================================================================
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // ============================================================================
  // STEP 2: CRITICAL SECURITY CHECK - Admin Route Protection
  // This MUST run BEFORE i18n middleware to catch all admin routes
  // ============================================================================
  
  // Check: Does the path include '/admin'?
  const isAdminRoute = pathname.includes('/admin')

  if (isAdminRoute) {
    console.log('[Middleware] 🔒 Admin route detected:', pathname)
    
    try {
      // Create response object for Supabase client
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })

      // Create Supabase client
      const supabase = createSupabaseMiddlewareClient(request, response)
      
      // Check for active user session
      const { data: { user }, error } = await supabase.auth.getUser()

      // IF NO USER: Redirect immediately to login
      if (error || !user) {
        console.log('[Middleware] ❌ No user found, redirecting to login')
        
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
      return intlMiddleware(request)
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
