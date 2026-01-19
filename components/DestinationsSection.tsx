'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUtils'

interface Destination {
  id: string
  name?: string
  title?: string // Legacy field
  region?: string | null
  description: string | null
  description_en?: string | null
  description_es?: string | null
  description_de?: string | null
  image_url?: string | null
  image_urls?: string[] // Legacy field
  slug?: string
  order_index: number
  is_active: boolean
}

interface DestinationsSectionProps {
  destinations: Destination[]
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  const locale = useLocale()
  const t = useTranslations('destinations')

  // Filter active destinations and sort by order_index
  const activeDestinations = destinations
    .filter((dest) => dest.is_active)
    .sort((a, b) => a.order_index - b.order_index)

  if (activeDestinations.length === 0) {
    return null
  }

  // Get destination name (support both new 'name' and legacy 'title')
  const getDestinationName = (destination: Destination): string => {
    return destination.name || destination.title || 'Destination'
  }

  // Get image URL (support both new 'image_url' and legacy 'image_urls')
  const getDestinationImage = (destination: Destination): string | null => {
    if (destination.image_url) {
      return destination.image_url
    }
    if (destination.image_urls && destination.image_urls.length > 0) {
      return destination.image_urls[0]
    }
    return null
  }

  // Get localized description
  const getLocalizedDescription = (destination: Destination): string => {
    switch (locale) {
      case 'es':
        return destination.description_es || destination.description || ''
      case 'de':
        return destination.description_de || destination.description || ''
      default:
        return destination.description_en || destination.description || ''
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-luxury-blue mb-6">
            {t('title') || 'Discover Our Destinations'}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle') || 'Explore the stunning coastlines and hidden gems of the Mediterranean'}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeDestinations.map((destination) => {
            const destinationImage = getDestinationImage(destination)
            const imageUrl = destinationImage
              ? getImageUrl(destinationImage, {
                  width: 1200,
                  quality: 85,
                  format: 'webp',
                })
              : null
            const destinationName = getDestinationName(destination)
            const description = getLocalizedDescription(destination)
            const destinationSlug = destination.slug || destination.id

            return (
              <div
                key={destination.id}
                className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Container with Dark Overlay */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={destinationName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 transition-all duration-500" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue via-luxury-blue/80 to-luxury-gold flex items-center justify-center">
                      <span className="text-white text-4xl font-serif font-bold">{destinationName}</span>
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                    {/* Region Badge */}
                    {destination.region && (
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                          {destination.region}
                        </span>
                      </div>
                    )}

                    {/* Destination Name */}
                    <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                      {destinationName}
                    </h3>

                    {/* Description */}
                    {description && (
                      <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 line-clamp-3 drop-shadow-md">
                        {description}
                      </p>
                    )}

                    {/* View Details Button */}
                    <Link
                      href={`/${locale}/destinations/${destinationSlug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-blue font-semibold rounded-lg hover:bg-white hover:text-luxury-blue transition-all duration-300 transform group-hover:translate-x-2 shadow-lg hover:shadow-xl w-fit"
                    >
                      <span>{t('viewDetails') || 'View Details'}</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {/* Decorative Corner Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-luxury-gold/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Optional: View All Link */}
        {activeDestinations.length > 6 && (
          <div className="text-center mt-12">
            <Link
              href={`/${locale}/destinations`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>{t('viewAll') || 'View All Destinations'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
