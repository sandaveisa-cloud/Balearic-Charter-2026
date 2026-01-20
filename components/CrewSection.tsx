'use client'

import Image from 'next/image'
import OptimizedImage from './OptimizedImage'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText } from '@/lib/i18nUtils'
import type { CrewMember } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface CrewSectionProps {
  crew: CrewMember[]
}

export default function CrewSection({ crew }: CrewSectionProps) {
  const t = useTranslations('crew')
  
  if (crew.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {crew.map((member) => {
            const imageUrl = getOptimizedImageUrl(member.image_url, {
              width: 800,
              quality: 80,
              format: 'webp',
            })

            return (
              <div key={member.id} className="text-center">
                {imageUrl ? (
                  <div className="mb-6 aspect-square max-w-xs mx-auto overflow-hidden rounded-full relative">
                    <OptimizedImage
                      src={imageUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 200px, 300px"
                      objectFit="cover"
                      aspectRatio="1/1"
                      loading="lazy"
                      quality={80}
                    />
                  </div>
                ) : (
                  <div className="mb-6 aspect-square max-w-xs mx-auto rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
                    <span className="text-white text-3xl font-serif">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}

                <h3 className="font-serif text-2xl font-bold text-luxury-blue mb-1">
                  {member.name}
                </h3>
                <p className="text-luxury-gold font-semibold mb-4">{member.role}</p>
                {(() => {
                  // Use JSONB i18n with fallback to legacy bio field
                  // Note: bio_i18n would need to be added to CrewMember type if implemented
                  const bio = member.bio || ''
                  return bio ? (
                    <p className="text-gray-600">{bio}</p>
                  ) : null
                })()}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
