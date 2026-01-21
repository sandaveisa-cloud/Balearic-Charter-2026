'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * Server Action for user login
 * This ensures cookies are set correctly on the server response,
 * which the middleware will see on the next request.
 * 
 * Note: prevState parameter is required for useFormState compatibility (React 18)
 */
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      error: 'Email and password are required',
      success: false,
    }
  }

  // Handle sign-in logic in try/catch
  try {
    // Create server-side Supabase client
    const supabase = await createSupabaseServerClient()

    // Sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[Login Action] Sign in error:', error.message)
      return {
        error: error.message || 'Invalid email or password',
        success: false,
      }
    }

    if (!data?.user) {
      console.error('[Login Action] No user data returned')
      return {
        error: 'Login failed: No user data returned. Please try again.',
        success: false,
      }
    }

    console.log('[Login Action] Login successful for user:', data.user.email)
  } catch (err) {
    console.error('[Login Action] Unexpected error:', err)
    return {
      error: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
      success: false,
    }
  }

  // If we reach here, login was successful
  // Revalidate the admin path to ensure fresh data
  revalidatePath('/admin')

  // Server-side redirect to /admin
  // This happens after cookies are set, so middleware will see the session
  // NOTE: redirect() throws a special error to handle navigation, so it must be outside try/catch
  redirect('/admin')
}
