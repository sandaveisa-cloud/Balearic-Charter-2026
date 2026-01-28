'use client'

import { useTranslations } from 'next-intl'
import { Camera, Users } from 'lucide-react'
import OptimizedImage from './OptimizedImage'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface HappyGuestsGalleryProps {
  images?: string[]
  destinationName: string
  locale: string
}

export default function HappyGuestsGallery({ images, destinationName, locale }: HappyGuestsGalleryProps) {
  const t = useTranslations('destinations')

  if (!images || !Array.isArray(images) || images.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-br from-luxury-blue/5 via-white to-luxury-gold/5">
      <div className="container mx-auto px-4">
        {/* Virsraksts */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-luxury-gold" />
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue">
              {t('happyGuests') || 'Happy Guests'}
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('happyGuestsDescription') || `See what our guests are saying about their experience in ${destinationName}`}
          </p>
        </div>

        {/* LABOJUMS: Vienāds Grid izkārtojums visiem */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((imageUrl, index) => {
            const optimizedUrl = getOptimizedImageUrl(imageUrl, {
              width: 800,
              quality: 85,
              format: 'webp',
            })

            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
              >
                {/* LABOJUMS: Fiksēts augstums (h-80) visām bildēm vienāds */}
                <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-luxury-blue/20 to-luxury-gold/20">
                  {optimizedUrl ? (
                    <OptimizedImage
                      src={optimizedUrl}
                      alt={`Happy guest in ${destinationName} - Photo ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      objectFit="cover"
                      className="group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-luxury-blue/30" />
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5" />
                        <span className="font-semibold">{destinationName}</span>
                      </div>
                      <p className="text-sm text-white/90">
                        {t('guestExperience') || 'Unforgettable moments'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            {t('joinOurGuests') || 'Join our happy guests and create your own unforgettable memories'}
          </p>
        </div>
      </div>
    </section>
  )
}