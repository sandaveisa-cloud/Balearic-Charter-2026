'use client'

import { Suspense } from 'react'
import LoginContent from './LoginContent'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-blue via-blue-900 to-luxury-gold flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  )
}
