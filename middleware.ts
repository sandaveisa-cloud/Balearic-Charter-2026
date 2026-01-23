import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from './lib/supabase-middleware'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Use 'as-needed' to avoid double prefixes when router.push('/') is called
  // This allows the router to handle locale prefixes correctly
  localePrefix: 'as-needed'
})

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Debug logging
  console.log('[Middleware] Checking path:', pathname)

  // ============================================================================
  // STEP 1: Handle root path explicitly
  // ============================================================================
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // ============================================================================
  // STEP 2: 🛑 CRITICAL - Admin routes: NO i18n logic, ONLY authentication
  // ============================================================================
  // 1. Definējam, vai šis ir admin pieprasījums
  const isAdminPage = pathname.startsWith('/admin') || pathname.includes('/admin')
  
  // 2. Ja tas ir admin, mēs veicam TIKAI autentifikāciju
  if (isAdminPage) {
    console.log('[Middleware] 🔒 Admin route detected - bypassing i18n, checking auth only:', pathname)
    
    // CRITICAL: Normalize /[locale]/admin to /admin to prevent redirect loops
    if (/^\/(en|es|de)\/admin/.test(pathname)) {
      const subPath = pathname.replace(/^\/(en|es|de)\/admin/, '')
      const targetPath = `/admin${subPath}`
      console.log('[Middleware] 🔄 Normalizing locale admin route:', pathname, '→', targetPath)
      return NextResponse.redirect(new URL(targetPath, request.url))
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
        console.log('[Middleware] Error:', sessionError?.message || 'No session')
        
        const loginUrl = new URL(`/${defaultLocale}/login`, request.url)
        loginUrl.searchParams.set('redirect', '/admin')
        console.log('[Middleware] 🔄 Redirecting to login:', loginUrl.toString())
        return NextResponse.redirect(loginUrl)
      }

      // Verify user from session
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      // CRITICAL: IF NO USER OR ERROR - BLOCK ACCESS IMMEDIATELY
      if (userError || !user || !user.id) {
        console.log('[Middleware] ❌ SECURITY BLOCK: User verification failed')
        console.log('[Middleware] Error:', userError?.message || 'No user')
        
        const loginUrl = new URL(`/${defaultLocale}/login`, request.url)
        loginUrl.searchParams.set('redirect', '/admin')
        console.log('[Middleware] 🔄 Redirecting to login:', loginUrl.toString())
        return NextResponse.redirect(loginUrl)
      }

      // User is authenticated - log and allow access
      console.log('[Middleware] ✅ SECURITY PASS: User authenticated:', user.email)
      
      // CRITICAL: Return response immediately - DO NOT let i18n middleware process this
      // This prevents next-intl from trying to add/remove locale prefixes
      return response
    } catch (error) {
      // FAIL SECURE: If ANY error occurs during auth check, block access
      console.error('[Middleware] ⚠️ SECURITY ERROR: Exception during auth check:', error)
      const loginUrl = new URL(`/${defaultLocale}/login`, request.url)
      loginUrl.searchParams.set('redirect', '/admin')
      console.log('[Middleware] 🔄 FAIL-SECURE REDIRECT to login:', loginUrl.toString())
      return NextResponse.redirect(loginUrl)
    }
  }

  // ============================================================================
  // STEP 3: Continue with i18n middleware for all NON-admin routes
  // ============================================================================
  // EXCLUDE login/signup routes from admin checks (but still apply i18n)
  const isLoginRoute = pathname.includes('/login') || pathname.includes('/signup')
  if (isLoginRoute) {
    console.log('[Middleware] Login/signup route detected:', pathname)
    return intlMiddleware(request)
  }

  // All other routes: apply i18n middleware
  return intlMiddleware(request)
}

export const config = {
  // Match ALL routes except API, static assets, and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
