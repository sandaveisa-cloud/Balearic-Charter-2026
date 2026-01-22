'use client'

import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, Shield, FileText, Scale } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function LegalNotice() {
  const t = useTranslations('legal')

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
          {/* 1. Company Information */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('companyInfo.title')}
              </h2>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-luxury-blue">{t('companyInfo.entity')}:</strong> Fabula Marítima SL
              </p>
              <p>
                <strong className="text-luxury-blue">{t('companyInfo.cif')}:</strong> B44629020
              </p>
              <p>
                <strong className="text-luxury-blue">{t('companyInfo.form')}:</strong> {t('companyInfo.formValue')}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="mb-2">
                  <strong className="text-luxury-blue">{t('companyInfo.contact')}:</strong>
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-luxury-gold" />
                    <a href="mailto:peter.sutter@gmail.com" className="text-luxury-blue hover:text-luxury-gold transition-colors">
                      peter.sutter@gmail.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-luxury-gold" />
                    <a href="tel:+34680957096" className="text-luxury-blue hover:text-luxury-gold transition-colors">
                      +34 680 957 096
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p>
                  <strong className="text-luxury-blue">{t('companyInfo.operatingAreas')}:</strong> {t('companyInfo.operatingAreasValue')}
                </p>
              </div>
            </div>
          </section>

          {/* 2. Maritime Licenses & Compliance */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('maritime.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('maritime.compliance')}</p>
              <p>{t('maritime.requirements')}</p>
              <p>{t('maritime.standards')}</p>
            </div>
          </section>

          {/* 3. Business Activity */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('business.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('business.role')}</p>
              <p>{t('business.responsibility')}</p>
            </div>
          </section>

          {/* 4. Insurance & Liability */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('insurance.title')}
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t('insurance.coverage')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('insurance.liability')}</li>
                <li>{t('insurance.passenger')}</li>
                <li>{t('insurance.vessel')}</li>
                <li>{t('insurance.indemnity')}</li>
              </ul>
              <p className="mt-4">{t('insurance.claims')}</p>
            </div>
          </section>

          {/* 5. Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-luxury-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue">
                {t('ip.title')}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('ip.content')}
            </p>
          </section>
        </div>

        {/* Footer Contact Section */}
        <div className="mt-12 bg-luxury-blue/5 rounded-xl p-8 border border-luxury-gold/20">
          <h3 className="font-serif text-2xl font-bold text-luxury-blue mb-6 text-center">
            {t('footer.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Mail className="w-5 h-5 text-luxury-gold" />
              <a 
                href="mailto:peter.sutter@gmail.com" 
                className="text-luxury-blue hover:text-luxury-gold transition-colors font-semibold"
              >
                peter.sutter@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Phone className="w-5 h-5 text-luxury-gold" />
              <a 
                href="tel:+34680957096" 
                className="text-luxury-blue hover:text-luxury-gold transition-colors font-semibold"
              >
                +34 680 957 096
              </a>
            </div>
          </div>
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
