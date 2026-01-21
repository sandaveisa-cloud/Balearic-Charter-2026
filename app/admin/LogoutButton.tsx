'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Logout Button for Admin Panel
 * Hardcodes locale to 'en' since admin doesn't need i18n
 */
export default function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const locale = 'en' // Hardcode to 'en' for admin

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Call the logout API route
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Redirect to login page
        router.push(`/${locale}/login`)
        router.refresh()
      } else {
        console.error('[LogoutButton] Logout failed')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('[LogoutButton] Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 px-4 py-2 rounded text-sm font-medium transition-colors"
    >
      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
    </button>
  )
}
