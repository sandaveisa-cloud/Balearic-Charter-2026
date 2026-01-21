'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import OptimizedImage from './OptimizedImage'
import { Anchor, ArrowRight } from 'lucide-react'

interface Destination {
  id: string
  title: string // Primary field from database
  name?: string // Optional legacy field (code uses fallback: name || title)
  slug: string
  image_url?: string | null
  description?: string | null
  description_en?: string | null
  description_es?: string | null
  description_de?: string | null
  boat_access_only?: boolean
}

interface LuxuryDestinationsGridProps {
  destinations?: Destination[]
}

export default function LuxuryDestinationsGrid({ destinations = [] }: LuxuryDestinationsGridProps) {
  const locale = useLocale()
  const t = useTranslations('destinations')

  // Default destinations if none provided
  const defaultDestinations: Destination[] = [
    {
      id: 'ibiza',
      title: 'Ibiza',
      name: 'Ibiza',
      slug: 'ibiza',
      boat_access_only: true,
    },
    {
      id: 'formentera',
      title: 'Formentera',
      name: 'Formentera',
      slug: 'formentera',
      boat_access_only: true,
    },
    {
      id: 'mallorca',
      title: 'Mallorca',
      name: 'Mallorca',
      slug: 'mallorca',
      boat_access_only: false,
    },
    {
      id: 'menorca',
      title: 'Menorca',
      name: 'Menorca',
      slug: 'menorca',
      boat_access_only: true,
    },
    {
      id: 'costa-blanca',
      title: 'Costa Blanca',
      name: 'Costa Blanca',
      slug: 'costa-blanca',
      boat_access_only: false,
    },
  ]

  const displayDestinations = destinations.length > 0 ? destinations : defaultDestinations

  const getDestinationInfo = (destination: Destination) => {
    const name = (destination.name || '').toLowerCase()
    // Map destination names to translation keys
    const keyMap: Record<string, string> = {
      'ibiza': 'ibiza',
      'formentera': 'formentera',
      'mallorca': 'mallorca',
      'menorca': 'menorca',
      'costa blanca': 'costaBlanca',
      'costa-blanca': 'costaBlanca',
    }
    const key = keyMap[name] || name.replace(/\s+/g, '').replace(/-/g, '')
    
    // Get localized description from database with fallback to translations
    const getLocalizedDescription = (): string => {
      // Try database columns first (description_en, description_es, description_de)
      switch (locale) {
        case 'es':
          if (destination.description_es) return destination.description_es
          break
        case 'de':
          if (destination.description_de) return destination.description_de
          break
        case 'en':
        default:
          if (destination.description_en) return destination.description_en
          break
      }
      
      // Fallback to legacy description field
      if (destination.description) return destination.description
      
      // Fallback to translation keys
      return t(`${key}.description`) || ''
    }
    
    return {
      title: t(`${key}.title`) || destination.name || 'Destination',
      description: getLocalizedDescription(),
      imageUrl: destination.image_url || null,
    }
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-luxury-blue mb-6">
            {t('title')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {displayDestinations.map((destination) => {
            const { title, description, imageUrl } = getDestinationInfo(destination)
            const destinationSlug = destination.slug || destination.id

            return (
              <div
                key={destination.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-luxury-gold/30"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-luxury-blue/20 to-luxury-gold/20">
                  {imageUrl ? (
                    <OptimizedImage
                      src={imageUrl}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      objectFit="cover"
                      aspectRatio="16/9"
                      loading="lazy"
                      quality={85}
                      className="group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Anchor className="w-24 h-24 text-luxury-blue/30" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Boat Access Only Badge */}
                  {destination.boat_access_only && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-luxury-gold/95 backdrop-blur-sm rounded-full border border-white/30">
                      <Anchor className="w-4 h-4 text-white" />
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        {t('boatAccessOnly')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-luxury-blue mb-4">
                    {title}
                  </h3>
                  
                  <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-3">
                    {description}
                  </p>

                  {/* Explore Routes Button */}
                  <Link
                    href={`/${locale}/destinations/${destinationSlug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 shadow-md hover:shadow-lg group/button"
                  >
                    <span>{t('exploreRoutes')}</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/button:translate-x-1" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
