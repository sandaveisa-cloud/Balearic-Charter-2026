'use client'

import React from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-6xl font-bold text-red-600 mb-4">Error</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">A critical error occurred</h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'An unexpected error occurred. Please refresh the page.'}
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 mb-6">Error ID: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="inline-block rounded-lg bg-luxury-blue px-6 py-3 text-white font-semibold transition-colors hover:bg-luxury-gold hover:text-luxury-blue"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
