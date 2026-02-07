'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('notFound')
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-bold text-luxury-blue mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('title')}</h2>
        <p className="text-gray-600 mb-8">{t('description')}</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-luxury-blue px-6 py-3 text-white font-semibold transition-colors hover:bg-luxury-gold hover:text-luxury-blue"
        >
          {t('returnHome')}
        </Link>
      </div>
    </div>
  )
}
