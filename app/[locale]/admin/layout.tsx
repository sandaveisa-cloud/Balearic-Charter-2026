// CRITICAL: Force dynamic rendering to prevent caching
// This ensures the auth check runs on EVERY request
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Server-Side Admin Layout Protection (Layer 2 Security)
 * This runs on the server and cannot be bypassed by client-side manipulation.
 * Even if middleware is bypassed, this layout will block unauthorized access.
 */
export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params
  
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
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // Cookie setting may fail in some contexts (e.g., during redirect)
          // This is expected behavior and can be safely ignored
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        } catch (error) {
          // Cookie removal may fail in some contexts
        }
      },
    },
  })

  // CRITICAL: Check for authenticated user on the server
  const { data: { user }, error } = await supabase.auth.getUser()

  // HARD REDIRECT if no user or error
  if (!user || error) {
    console.log('[AdminLayout] SECURITY BLOCK: No authenticated user found')
    console.log('[AdminLayout] Error:', error?.message || 'No user')
    // CRITICAL FIX: Redirect to /admin (root level) to prevent redirect loops
    // The middleware will handle redirecting /[locale]/admin to /admin anyway
    redirect(`/${locale}/login?redirect=/admin`)
  }

  // User is authenticated - render admin layout
  console.log('[AdminLayout] SECURITY PASS: User authenticated:', user.email)

  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Admin Top Bar with Logout */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
        <span className="font-bold text-lg">Admin Panel</span>
        <LogoutButton locale={locale} />
      </div>
      
      {/* Admin Content */}
      {children}
    </div>
  )
}
