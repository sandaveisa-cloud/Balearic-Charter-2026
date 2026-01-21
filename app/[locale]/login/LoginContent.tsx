'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase'

export default function LoginContent() {
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  // Admin is now at /admin (root level), not /[locale]/admin
  const redirectPath = searchParams.get('redirect') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(redirectPath)
      }
    }
    checkSession()
  }, [router, redirectPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    console.log('[Login] Login attempt started for:', email)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // Handle Supabase auth errors
      if (signInError) {
        console.error('[Login] Login failed:', signInError.message)
        const errorMessage = signInError.message || 'Invalid email or password'
        setError(errorMessage)
        setIsLoading(false)
        // Also show alert for visibility
        alert(`Login failed: ${errorMessage}`)
        return
      }

      // Check if we have a user
      if (!data?.user) {
        console.error('[Login] Login failed: No user data returned')
        const errorMessage = 'Login failed: No user data returned. Please try again.'
        setError(errorMessage)
        setIsLoading(false)
        alert(errorMessage)
        return
      }

      // Login successful
      console.log('[Login] Login successful for user:', data.user.email)
      setMessage('Login successful! Redirecting...')
      
      // CRITICAL: Always reset loading state, even on success
      // This prevents the spinner from hanging if redirect fails
      setIsLoading(false)

      // Force redirect to /admin (root level, not localized)
      // First refresh to update server cookies/middleware state
      router.refresh()
      
      // Then redirect after a short delay to ensure refresh completes
      setTimeout(() => {
        const finalRedirectPath = redirectPath || '/admin'
        console.log('[Login] Redirecting to:', finalRedirectPath)
        router.push(finalRedirectPath)
      }, 300)

    } catch (err) {
      // Catch any unexpected errors
      console.error('[Login] Unexpected error:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      setIsLoading(false)
      alert(`Login error: ${errorMessage}`)
    }
  }

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
        {error && (
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
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-green-700">{message}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all"
              placeholder="admin@example.com"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-luxury-blue to-luxury-gold text-white py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
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
