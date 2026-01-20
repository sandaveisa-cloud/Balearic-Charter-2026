'use client'

import React from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-6xl font-bold text-luxury-blue mb-4">Error</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 mb-6">Error ID: {error.digest}</p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="inline-block rounded-lg bg-luxury-blue px-6 py-3 text-white font-semibold transition-colors hover:bg-luxury-gold hover:text-luxury-blue"
              >
                Try Again
              </button>
              <Link
                href="/en"
                className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-semibold transition-colors hover:bg-gray-50"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
