'use client'

import { useTranslations } from 'next-intl'
import { FileText, Shield, CreditCard, XCircle, AlertTriangle, Anchor } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function TermsAndConditions() {
  const t = useTranslations('terms')
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
          {/* 1. Charter Provider Info */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('provider.title')}
              </h2>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-luxury-blue">{t('provider.entity')}:</strong> Fabula Marítima SL
              </p>
              <p>
                <strong className="text-luxury-blue">{t('provider.cif')}:</strong> B44629020
              </p>
              <p>
                <strong className="text-luxury-blue">{t('provider.form')}:</strong> {t('provider.formValue')}
              </p>
              <p className="mt-4">
                {t('provider.description')}
              </p>
            </div>
          </section>

          {/* 2. 2026 Regulatory Compliance */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('compliance.title')}
              </h2>
            </div>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div className="border-l-4 border-luxury-blue pl-4">
                <h3 className="font-semibold text-luxury-blue mb-2 flex items-center gap-2">
                  <Anchor className="w-5 h-5" />
                  {t('compliance.flag.title')}
                </h3>
                <p className="mb-2">{t('compliance.flag.description')}</p>
                <p className="text-sm text-gray-600 italic">{t('compliance.flag.note')}</p>
              </div>

              <div className="border-l-4 border-luxury-gold pl-4">
                <h3 className="font-semibold text-luxury-blue mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('compliance.manifest.title')}
                </h3>
                <p className="mb-2">{t('compliance.manifest.description')}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>{t('compliance.manifest.id')}</li>
                  <li>{t('compliance.manifest.nationality')}</li>
                  <li>{t('compliance.manifest.emergency')}</li>
                </ul>
                <p className="text-sm text-gray-600 italic mt-2">{t('compliance.manifest.note')}</p>
              </div>
            </div>
          </section>

          {/* 3. Booking & Payment */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('booking.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('booking.description')}</p>
              
              <div className="bg-luxury-blue/5 rounded-lg p-4 border border-luxury-blue/20">
                <h3 className="font-semibold text-luxury-blue mb-3">{t('booking.deposit.title')}</h3>
                <p className="mb-2">{t('booking.deposit.description')}</p>
                <p className="text-sm text-gray-600">{t('booking.deposit.note')}</p>
              </div>

              <div className="bg-luxury-gold/10 rounded-lg p-4 border border-luxury-gold/20">
                <h3 className="font-semibold text-luxury-blue mb-3">{t('booking.final.title')}</h3>
                <p className="mb-2">{t('booking.final.description')}</p>
                <p className="text-sm text-gray-600">{t('booking.final.note')}</p>
              </div>

              <div className="mt-4">
                <p><strong className="text-luxury-blue">{t('booking.paymentMethods.title')}:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>{t('booking.paymentMethods.bank')}</li>
                  <li>{t('booking.paymentMethods.card')}</li>
                  <li>{t('booking.paymentMethods.transfer')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Cancellation Policy */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('cancellation.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('cancellation.description')}</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 mt-4">
                  <thead>
                    <tr className="bg-luxury-blue text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">{t('cancellation.table.period')}</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">{t('cancellation.table.refund')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-green-50">
                      <td className="border border-gray-300 px-4 py-3">{t('cancellation.table.more30')}</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-green-700">{t('cancellation.table.full')}</td>
                    </tr>
                    <tr className="bg-yellow-50">
                      <td className="border border-gray-300 px-4 py-3">{t('cancellation.table.15to30')}</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-yellow-700">{t('cancellation.table.half')}</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="border border-gray-300 px-4 py-3">{t('cancellation.table.less15')}</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-red-700">{t('cancellation.table.none')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-luxury-blue mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t('cancellation.weather.title')}
                </h3>
                <p>{t('cancellation.weather.description')}</p>
              </div>
            </div>
          </section>

          {/* 5. Safety & Liability */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('safety.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('safety.description')}</p>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-luxury-blue">{t('safety.responsibilities.title')}:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('safety.responsibilities.vessel')}</li>
                  <li>{t('safety.responsibilities.crew')}</li>
                  <li>{t('safety.responsibilities.insurance')}</li>
                  <li>{t('safety.responsibilities.safety')}</li>
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-luxury-blue mb-2">{t('safety.passenger.title')}:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('safety.passenger.follow')}</li>
                  <li>{t('safety.passenger.inform')}</li>
                  <li>{t('safety.passenger.respect')}</li>
                </ul>
              </div>

              <div className="mt-4 bg-luxury-blue/5 rounded-lg p-4 border border-luxury-blue/20">
                <p className="font-semibold text-luxury-blue mb-2">{t('safety.liability.title')}</p>
                <p>{t('safety.liability.description')}</p>
              </div>
            </div>
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
