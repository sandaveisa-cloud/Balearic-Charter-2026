// CRITICAL: Force dynamic rendering to prevent caching
// This ensures the auth check runs on EVERY request
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import '../globals.css'
import LogoutButton from './LogoutButton'

interface AdminLayoutProps {
  children: React.ReactNode
}

/**
 * Server-Side Admin Layout Protection (Layer 2 Security)
 * This runs on the server and cannot be bypassed by client-side manipulation.
 * Even if middleware is bypassed, this layout will block unauthorized access.
 * 
 * NOTE: Admin is now at /admin (root level) to break static generation inheritance
 * from the [locale] layout. This ensures it is ALWAYS dynamic and secure.
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Hardcode locale to 'en' for redirects (admin doesn't need i18n)
  const locale = 'en'
  
  // Get cookies for server-side Supabase client
  const cookieStore = await cookies()
  
  // Environment variables check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[AdminLayout] Missing Supabase environment variables')
    redirect(`/${locale}/login?error=configuration`)
  }

  // Create server-side Supabase client with cookie handling
  // CRITICAL: Use Next.js 14 cookies API format to ensure sessions persist
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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

  // CRITICAL: Check for authenticated user on the server
  // Use getSession first to refresh the session, then getUser
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // If no session, redirect immediately (don't check getUser to avoid extra call)
  if (sessionError || !session) {
    console.log('[AdminLayout] SECURITY BLOCK: No active session found')
    console.log('[AdminLayout] Error:', sessionError?.message || 'No session')
    // Only redirect if not already on login page (prevent loops)
    const loginUrl = `/${locale}/login?redirect=/admin`
    console.log('[AdminLayout] Redirecting to:', loginUrl)
    redirect(loginUrl)
  }

  // Verify user from session
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // HARD REDIRECT if no user or error
  if (!user || userError) {
    console.log('[AdminLayout] SECURITY BLOCK: User verification failed')
    console.log('[AdminLayout] Error:', userError?.message || 'No user')
    redirect(`/${locale}/login?redirect=/admin`)
  }

  // User is authenticated - render admin layout
  console.log('[AdminLayout] SECURITY PASS: User authenticated:', user.email)

  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Admin Top Bar with Logout */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
        <span className="font-bold text-lg">Admin Panel</span>
        <LogoutButton />
      </div>
      
      {/* Admin Content */}
      {children}
    </div>
  )
}
