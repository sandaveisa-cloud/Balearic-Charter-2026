/**
 * Supabase client for Next.js Server Components
 * Uses @supabase/ssr for proper cookie handling in server components
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server components that can read/write cookies
 * This is used in layouts, pages, and other server components
 * 
 * CRITICAL: Cookie setting must use the correct Next.js 14 cookies API format
 * to ensure sessions persist across requests.
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Log environment variable status (for debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Supabase Server] Environment check:')
    console.log('[Supabase Server] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.log('[Supabase Server] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    console.log('[Supabase Server] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          // CRITICAL FIX: Use Next.js 14 cookies API format: { name, value, ...options }
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing the user session.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          // CRITICAL FIX: Use Next.js 14 cookies API format: { name, value, ...options }
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing the user session.
        }
      },
    },
  })
}
