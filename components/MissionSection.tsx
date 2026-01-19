'use client'

import { useTranslations } from 'next-intl'

export default function MissionSection() {
  const t = useTranslations('mission')

  return (
    <section className="py-20 bg-gradient-to-br from-luxury-blue via-luxury-blue/95 to-luxury-blue text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 text-luxury-gold">
            {t('title')}
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed text-gray-100">
            {t('text')}
          </p>
        </div>
      </div>
    </section>
  )
}
