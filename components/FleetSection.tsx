'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Ruler, Users, BedDouble, Ship, Sparkles } from 'lucide-react'
import type { Fleet } from '@/types/database'
import OptimizedImage from './OptimizedImage'
import TrustBar from './TrustBar'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { getDescriptionForLocaleWithTextColumns } from '@/lib/i18nUtils'

interface FleetSectionProps {
  fleet: Fleet[]
}

export default function FleetSection({ fleet }: FleetSectionProps) {
  const t = useTranslations('fleet')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('[FleetSection] Fleet data received:', {
      count: fleet?.length || 0,
      filtered: fleet?.filter(y => {
        const showOnHome = (y as any)?.show_on_home
        return y?.is_active !== false && (showOnHome === undefined || showOnHome === true)
      }).length || 0
    })
  }, [fleet])

  // Filter yachts: show_on_home is true (or undefined/not set), and is_active is true
  const visibleYachts = (fleet || []).filter(yacht => {
    if (!yacht || !yacht.id) return false
    if (yacht.is_active === false) return false
    const showOnHome = (yacht as any)?.show_on_home
    // If show_on_home exists, it must be true; if undefined, allow it
    if (showOnHome !== undefined && showOnHome !== true) return false
    return true
  })

  // Safety check: Return null if no yachts to display
  if (!fleet || fleet.length === 0 || visibleYachts.length === 0) {
    return null
  }

  return (
    <section id="fleet" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading yachts...</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {visibleYachts.map((yacht) => {
            try {
              // Safe data handling: Check if extras exists before mapping
              const yachtExtras = Array.isArray(yacht.extras) ? yacht.extras : []
              
              // Safe data handling: Check if specs exists
              const specs = yacht.specs || yacht.technical_specs || null

              // Localized description: Use description_${locale} with fallback to description_en
              const descriptionKey = `description_${locale}` as keyof Fleet
              const localizedDescription = 
                (yacht[descriptionKey] as string) || 
                yacht.description_en || 
                yacht.description || 
                ''

              const imageUrl = getOptimizedImageUrl(yacht.main_image_url, {
                width: 1200,
                quality: 80,
                format: 'webp',
              })
              const hasError = imageErrors[yacht.id]
              const showImage = imageUrl && !hasError

              return (
                <div
                  key={yacht.id}
                  className="group relative overflow-hidden rounded-lg bg-white shadow-lg border border-gray-200 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Image Section */}
                  {showImage ? (
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <OptimizedImage
                        src={imageUrl}
                        alt={yacht.name || 'Yacht'}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        objectFit="cover"
                        aspectRatio="4/3"
                        loading="lazy"
                        quality={80}
                        onError={() => {
                          setImageErrors(prev => ({ ...prev, [yacht.id]: true }))
                        }}
                      />
                      {/* Refit Badge */}
                      {yacht.recently_refitted && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-luxury-gold to-yellow-400 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 z-10">
                          <Sparkles className="w-4 h-4" />
                          Refit 2024
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
                      <div className="text-center text-white">
                        <Ship className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm font-medium">{yacht.name || 'Yacht'}</p>
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title and Year */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-2xl font-bold text-luxury-blue">
                        {yacht.name || 'Yacht'}
                      </h3>
                      {yacht.year && (
                        <span className="text-luxury-gold font-semibold">{yacht.year}</span>
                      )}
                    </div>

                    {/* Trust Bar */}
                    <TrustBar variant="compact" />

                    {/* Description */}
                    {localizedDescription && (
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                        {localizedDescription}
                      </p>
                    )}

                    {/* Specs Grid: passengers, cabins, length */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      {yacht.capacity && (
                        <div className="text-center">
                          <Users className="w-5 h-5 text-luxury-gold mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Passengers</p>
                          <p className="text-sm font-semibold text-gray-900">{yacht.capacity}</p>
                        </div>
                      )}
                      {yacht.cabins && (
                        <div className="text-center">
                          <BedDouble className="w-5 h-5 text-luxury-gold mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Cabins</p>
                          <p className="text-sm font-semibold text-gray-900">{yacht.cabins}</p>
                        </div>
                      )}
                      {yacht.length && (
                        <div className="text-center">
                          <Ruler className="w-5 h-5 text-luxury-gold mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Length</p>
                          <p className="text-sm font-semibold text-gray-900">{yacht.length}m</p>
                        </div>
                      )}
                    </div>

                    {/* Extras: Top 3 as bullet list */}
                    {yachtExtras && yachtExtras.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Extras Included
                        </p>
                        <ul className="space-y-1">
                          {yachtExtras.slice(0, 3).map((extra, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-luxury-gold mt-1">•</span>
                              <span>{extra}</span>
                            </li>
                          ))}
                          {yachtExtras.length > 3 && (
                            <li className="text-xs text-gray-500 italic mt-1">
                              +{yachtExtras.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Price */}
                    {yacht.low_season_price && (
                      <div className="mb-4">
                        <span className="text-gray-600 text-sm">{t('from')} </span>
                        <span className="text-2xl font-bold text-luxury-blue">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: yacht.currency || 'EUR',
                            minimumFractionDigits: 0,
                          }).format(yacht.low_season_price)}
                        </span>
                        <span className="text-gray-600 text-sm"> {t('perDay')}</span>
                      </div>
                    )}

                    {yacht.high_season_price && !yacht.low_season_price && (
                      <div className="mb-4">
                        <span className="text-gray-600 text-sm">{t('from')} </span>
                        <span className="text-2xl font-bold text-luxury-blue">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: yacht.currency || 'EUR',
                            minimumFractionDigits: 0,
                          }).format(yacht.high_season_price)}
                        </span>
                        <span className="text-gray-600 text-sm"> {t('perDay')}</span>
                      </div>
                    )}

                    {/* View Details Button - Fixed spacing with mt-6 and block */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <Link
                        href={`/${locale}/fleet/${yacht.slug}`}
                        className="block w-full text-center rounded-lg bg-luxury-blue px-6 py-3 text-white font-semibold transition-colors hover:bg-luxury-gold hover:text-luxury-blue"
                      >
                        {t('viewDetails')}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            } catch (error) {
              console.error('[FleetSection] Error rendering yacht card:', yacht?.id, error)
              return null
            }
          })}
        </div>
      </div>
    </section>
  )
}
