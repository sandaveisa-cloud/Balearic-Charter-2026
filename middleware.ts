import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from './lib/supabase-middleware'

// Build locale pattern dynamically from config
const localePattern = routing.locales.join('|')
const localeRegex = new RegExp(`^/(${localePattern})(/|$)`)

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Debug logging (reduce noise in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Checking path:', pathname)
  }

  // ============================================================================
  // STEP 1: Skip static files and API routes early
  // ============================================================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files like .ico, .png, .jpg
  ) {
    return NextResponse.next()
  }

  // ============================================================================
  // STEP 2: 🛑 CRITICAL - Admin routes: NO i18n logic, ONLY authentication
  // ============================================================================
  // Check if this is an admin route (without locale prefix)
  const isAdminPage = pathname.startsWith('/admin')
  
  // Also check for locale-prefixed admin routes like /en/admin, /es/admin
  const localePrefixedAdminMatch = pathname.match(new RegExp(`^/(${localePattern})/admin`))
  
  if (localePrefixedAdminMatch) {
    // Redirect /en/admin, /es/admin, etc. to /admin (remove locale prefix)
    const subPath = pathname.replace(new RegExp(`^/(${localePattern})/admin`), '')
    const targetPath = `/admin${subPath}`
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] 🔄 Normalizing locale admin route:', pathname, '→', targetPath)
    }
    return NextResponse.redirect(new URL(targetPath, request.url))
  }
  
  if (isAdminPage) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] 🔒 Admin route detected - bypassing i18n, checking auth only:', pathname)
    }
    
    // Create response object for Supabase client
    // This response will be returned directly, bypassing i18n middleware
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    try {
      // Create Supabase client
      const supabase = createSupabaseMiddlewareClient(request, response)
      
      // First check session to refresh it, then verify user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // CRITICAL: IF NO SESSION - BLOCK ACCESS IMMEDIATELY
      if (sessionError || !session) {
        console.log('[Middleware] ❌ SECURITY BLOCK: No active session found')
        
        const loginUrl = new URL(`/${routing.defaultLocale}/login`, request.url)
        loginUrl.searchParams.set('redirect', '/admin')
        return NextResponse.redirect(loginUrl)
      }

      // Verify user from session
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      // CRITICAL: IF NO USER OR ERROR - BLOCK ACCESS IMMEDIATELY
      if (userError || !user || !user.id) {
        console.log('[Middleware] ❌ SECURITY BLOCK: User verification failed')
        
        const loginUrl = new URL(`/${routing.defaultLocale}/login`, request.url)
        loginUrl.searchParams.set('redirect', '/admin')
        return NextResponse.redirect(loginUrl)
      }

      // User is authenticated - allow access
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] ✅ SECURITY PASS: User authenticated:', user.email)
      }
      
      // Return response immediately - DO NOT let i18n middleware process admin routes
      return response
    } catch (error) {
      // FAIL SECURE: If ANY error occurs during auth check, block access
      console.error('[Middleware] ⚠️ SECURITY ERROR: Exception during auth check:', error)
      const loginUrl = new URL(`/${routing.defaultLocale}/login`, request.url)
      loginUrl.searchParams.set('redirect', '/admin')
      return NextResponse.redirect(loginUrl)
    }
  }

  // ============================================================================
  // STEP 3: Handle root path - redirect to default locale
  // ============================================================================
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, request.url))
  }

  // ============================================================================
  // STEP 4: Check if path already has a valid locale prefix
  // ============================================================================
  const hasLocalePrefix = localeRegex.test(pathname)
  
  // If no locale prefix, redirect to default locale
  if (!hasLocalePrefix) {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}${pathname}`, request.url))
  }

  // ============================================================================
  // STEP 5: Apply i18n middleware for all locale-prefixed routes
  // This handles localized pathnames like /es/sobre-nosotros -> /about
  // ============================================================================
  return intlMiddleware(request)
}

export const config = {
  // Match ALL routes except API, static assets, and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
