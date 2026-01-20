'use client'

import { useTranslations } from 'next-intl'
import { Cookie, Settings, BarChart, Shield } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function CookiesPolicy() {
  const t = useTranslations('cookies')
  const locale = useLocale()

  return (
    <article className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {t('lastUpdated')} <time dateTime="2026-01">January 2026</time>
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12 space-y-10">
          {/* 1. What are cookies */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('whatAre.title')}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('whatAre.description')}
            </p>
          </section>

          {/* 2. Types of cookies */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <BarChart className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('types.title')}
              </h2>
            </div>
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border-l-4 border-luxury-blue pl-4">
                <h3 className="font-semibold text-luxury-blue mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('types.essential.title')}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('types.essential.description')}
                </p>
              </div>

              {/* Analytical Cookies */}
              <div className="border-l-4 border-luxury-gold pl-4">
                <h3 className="font-semibold text-luxury-blue mb-2 flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  {t('types.analytical.title')}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('types.analytical.description')}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Managing Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('managing.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('managing.description')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('managing.chrome')}</li>
                <li>{t('managing.safari')}</li>
                <li>{t('managing.firefox')}</li>
              </ul>
            </div>
          </section>

          {/* 4. Consent */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('consent.title')}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('consent.description')}
            </p>
          </section>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </article>
  )
}
