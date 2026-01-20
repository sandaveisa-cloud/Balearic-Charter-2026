import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always show locale prefix in URL
  localePrefix: 'always'
})

export default function middleware(request: NextRequest) {
  // Handle root path explicitly
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }
  
  // Use the intl middleware for all other paths
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
