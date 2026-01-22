'use client'

import { useTranslations } from 'next-intl'
import { Shield, Database, Lock, Mail, FileText } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function PrivacyPolicy() {
  const t = useTranslations('privacy')

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
          {/* 1. Data Controller */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('dataController.title')}
              </h2>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-luxury-blue">{t('dataController.entity')}:</strong> Fabula Marítima SL
              </p>
              <p>
                <strong className="text-luxury-blue">{t('dataController.cif')}:</strong> B44629020
              </p>
              <p>
                <strong className="text-luxury-blue">{t('dataController.email')}:</strong>{' '}
                <a href="mailto:peter.sutter@gmail.com" className="text-luxury-blue hover:text-luxury-gold transition-colors">
                  peter.sutter@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* 2. Data Collection */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('dataCollection.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('dataCollection.description')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('dataCollection.name')}</li>
                <li>{t('dataCollection.email')}</li>
                <li>{t('dataCollection.phone')}</li>
                <li>{t('dataCollection.identification')}</li>
              </ul>
            </div>
          </section>

          {/* 3. Purpose */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('purpose.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('purpose.description')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('purpose.bookings')}</li>
                <li>{t('purpose.payments')}</li>
                <li>{t('purpose.support')}</li>
              </ul>
            </div>
          </section>

          {/* 4. Data Retention */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('retention.title')}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('retention.description')}
            </p>
          </section>

          {/* 5. User Rights */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('rights.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('rights.description')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('rights.access')}</li>
                <li>{t('rights.rectification')}</li>
                <li>{t('rights.erasure')}</li>
                <li>{t('rights.portability')}</li>
              </ul>
              <p className="mt-4">
                {t('rights.contact')}{' '}
                <a href="mailto:peter.sutter@gmail.com" className="text-luxury-blue hover:text-luxury-gold transition-colors font-semibold">
                  peter.sutter@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* 6. Security */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('security.title')}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('security.description')}
            </p>
          </section>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </article>
  )
}
