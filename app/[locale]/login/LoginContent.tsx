'use client'

import { useState, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { loginAction } from './actions'

export default function LoginContent() {
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  // Admin is now at /admin (root level), not /[locale]/admin
  const redirectPath = searchParams.get('redirect') || '/admin'

  // Use server action with form state (React 18 compatible)
  const [state, formAction] = useFormState(loginAction, null)
  const [isPending, setIsPending] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Track if we've already triggered a redirect to prevent loops
  const [hasRedirected, setHasRedirected] = useState(false)

  // Check if user is already logged in (only once on mount, and only if not submitting)
  useEffect(() => {
    if (hasRedirected || isPending) return // Prevent multiple redirects or conflicts during login
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && !hasRedirected && !isPending) {
          // Ensure we're not redirecting to the login page itself
          const targetPath = redirectPath || '/admin'
          if (targetPath.includes('/login') || targetPath.includes('/signup')) {
            console.log('[Login] Redirect path is login page, using /admin instead')
            setHasRedirected(true)
            // Use longer delay to ensure cookies are fully propagated
            setTimeout(() => {
              window.location.href = '/admin'
            }, 500)
            return
          }
          console.log('[Login] Session found, redirecting to:', targetPath)
          setHasRedirected(true)
          // Use hard navigation to prevent loops
          // Longer delay to ensure cookies are fully propagated before redirect
          setTimeout(() => {
            window.location.href = targetPath
          }, 500)
        }
      } catch (error) {
        console.error('[Login] Error checking session:', error)
      }
    }
    checkSession()
  }, [redirectPath]) // Include redirectPath in dependencies

  // Reset pending state when form action completes (state changes)
  useEffect(() => {
    if (state !== null) {
      setIsPending(false)
    }
  }, [state])

  // Force navigation when login is successful (only once)
  useEffect(() => {
    if (state?.success && !hasRedirected) {
      console.log('[Login] Success state detected, forcing navigation to /admin...')
      setHasRedirected(true)
      // Force hard navigation to bypass any server/middleware conflicts
      // Longer delay to ensure cookies are fully set and propagated before redirect
      // This prevents middleware/layout from not seeing the session cookie
      // Increased delay to 800ms to ensure proper cookie propagation
      setTimeout(() => {
        console.log('[Login] Executing redirect to /admin after cookie propagation delay')
        // Use the redirectPath from URL params, or default to /admin
        const targetPath = redirectPath || '/admin'
        window.location.href = targetPath
      }, 800) // 800ms delay to ensure cookies are fully propagated
    }
  }, [state, hasRedirected, redirectPath])

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-luxury-blue mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        {/* Error Message */}
        {state?.error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form 
          action={formAction}
          onSubmit={() => setIsPending(true)}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all"
              placeholder="admin@example.com"
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all"
              placeholder="Enter your password"
              disabled={isPending}
              name="password"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-luxury-blue to-luxury-gold text-white py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 This is a secure admin area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}
