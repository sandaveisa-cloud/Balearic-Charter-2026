/**
 * Supabase client for Next.js Middleware
 * Uses @supabase/ssr for proper cookie handling in middleware
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Create a Supabase client for middleware that can read/write cookies
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return Array.from(request.cookies.entries()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

/**
 * Check if user has an active Supabase session
 * Returns the user if authenticated, null otherwise
 */
export async function getSessionUser(request: NextRequest) {
  try {
    // Create a response object for cookie handling
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createSupabaseMiddlewareClient(request, response)
    
    // Try to get the user from the session
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('[Middleware] Error checking session:', error)
    return null
  }
}
