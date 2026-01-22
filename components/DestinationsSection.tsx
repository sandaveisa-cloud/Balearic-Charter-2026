'use client'

import { useState } from 'react'
import OptimizedImage from './OptimizedImage'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

interface Destination {
  id: string
  title: string // Primary field from database
  name?: string // Optional legacy field (code uses fallback: name || title)
  region?: string | null
  description: string | null
  description_en?: string | null
  description_es?: string | null
  description_de?: string | null
  image_urls?: string[] | null // Primary field: JSONB array of image URLs
  youtube_video_url?: string | null
  slug?: string
  order_index: number
  is_active: boolean
}

interface DestinationsSectionProps {
  destinations: Destination[]
}

interface DestinationCardProps {
  destinationName: string
  region: string | null | undefined
  description: string
  imageUrl: string | null
  destinationSlug: string
  locale: string
  t: (key: string) => string
}

function DestinationCard({
  destinationName,
  region,
  description,
  imageUrl,
  destinationSlug,
  locale,
  t,
}: DestinationCardProps) {
  // Extract first 2-3 sentences for highlights (premium magazine style)
  const getHighlights = (text: string): string => {
    if (!text) return ''
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    return sentences.slice(0, 2).join('. ').trim() + (sentences.length > 2 ? '...' : '')
  }

  const highlights = getHighlights(description)

  return (
    <Link
      href={`/${locale}/destinations/${destinationSlug}`}
      className="group relative block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-luxury-gold/50"
    >
      {/* Image Container - Premium Magazine Style */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={destinationName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            objectFit="cover"
            aspectRatio="4/3"
            loading="lazy"
            quality={90}
            className="group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-luxury-blue/10 to-luxury-gold/10">
            <span className="text-3xl font-serif font-bold text-gray-400">{destinationName}</span>
          </div>
        )}
        
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent group-hover:from-black/5 transition-all duration-500" />
      </div>

      {/* Content - Clean and Elegant */}
      <div className="p-6 md:p-8">
        {/* Region Badge - Subtle */}
        {region && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-luxury-gold/10 text-luxury-gold text-xs font-semibold uppercase tracking-wider rounded-full border border-luxury-gold/20">
              {region}
            </span>
          </div>
        )}

        {/* Destination Name - Elegant Typography */}
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] mb-4 group-hover:text-luxury-blue transition-colors duration-300">
          {destinationName}
        </h3>

        {/* Highlights - Short and Premium */}
        {highlights && (
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
            {highlights}
          </p>
        )}

        {/* Explore Link - Elegant CTA */}
        <div className="inline-flex items-center gap-2 text-luxury-blue font-semibold text-sm uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
          <span>{t('exploreRoutes') || 'Explore'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
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

  // Get image URL from image_urls array (first image)
  const getDestinationImage = (destination: Destination): string | null => {
    if (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0) {
      return destination.image_urls[0]
    }
    return null
  }

  // Get localized description - use description_en/es/de columns (not description_i18n)
  const getLocalizedDescription = (destination: Destination): string => {
    // Use description_en, description_es, description_de columns (not description_i18n JSONB)
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
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header - Elegant and Minimal */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-4 md:mb-6">
            {t('title') || 'Exclusive Destinations'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle') || 'Discover the Mediterranean\'s most captivating coastlines and hidden gems'}
          </p>
        </div>

        {/* Premium Grid Layout - Clean and Elegant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {activeDestinations.map((destination) => {
            const destinationImage = getDestinationImage(destination)
            const imageUrl = destinationImage || null
            const destinationName = getDestinationName(destination)
            const description = getLocalizedDescription(destination)
            const destinationSlug = destination.slug || destination.id

            return (
              <DestinationCard
                key={destination.id}
                destinationName={destinationName}
                region={destination.region}
                description={description}
                imageUrl={imageUrl}
                destinationSlug={destinationSlug}
                locale={locale}
                t={t}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
