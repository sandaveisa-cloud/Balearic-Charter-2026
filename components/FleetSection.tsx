'use client'

import Link from 'next/link'
import Image from 'next/image'
import OptimizedImage from './OptimizedImage'
import TrustBar from './TrustBar'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText, getDescriptionForLocaleWithTextColumns } from '@/lib/i18nUtils'
import { Ruler, Users, BedDouble, Bath, Snowflake, Droplets, Zap, Ship, Flame, Waves, Table, Refrigerator, Anchor, Sparkles } from 'lucide-react'
import type { Fleet } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface FleetSectionProps {
  fleet: Fleet[]
}

export default function FleetSection({ fleet }: FleetSectionProps) {
  const t = useTranslations('fleet')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // Safety check: Return null if fleet is empty or invalid
  if (!fleet || fleet.length === 0) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {fleet
            .filter(yacht => yacht && yacht.id && yacht.is_active !== false)
            .map((yacht) => {
            // Safety check: Handle null/undefined extras
            const yachtExtras = Array.isArray(yacht.extras) ? yacht.extras : []
            
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
                className="group relative overflow-hidden rounded-lg bg-white shadow-lg border border-gray-200 transition-transform hover:scale-105 hover:shadow-xl"
              >
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
                      <p className="text-sm font-medium">{yacht.name}</p>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-2xl font-bold text-luxury-blue">{yacht.name || 'Yacht'}</h3>
                    {yacht.year && (
                      <span className="text-luxury-gold font-semibold">{yacht.year}</span>
                    )}
                  </div>

                  {/* Trust Bar - Compact version for listing cards */}
                  <TrustBar variant="compact" />

                  {(() => {
                    // Use localized description with TEXT columns (description_en/es/de) with fallback
                    const description = getDescriptionForLocaleWithTextColumns(yacht, locale)
                    const shortDesc = getLocalizedText(yacht.short_description_i18n, locale) || yacht.short_description || description
                    return shortDesc ? (
                      <p className="text-gray-600 mb-4 line-clamp-2">{shortDesc}</p>
                    ) : null
                  })()}

                  {/* Quick Info Bar */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    {yacht.length && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Ruler className="w-5 h-5 text-luxury-gold" />
                        <span className="font-medium">{yacht.length}m</span>
                      </span>
                    )}
                    {yacht.capacity && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Users className="w-5 h-5 text-luxury-gold" />
                        <span className="font-medium">{yacht.capacity} {t('guests', { count: yacht.capacity })}</span>
                      </span>
                    )}
                    {yacht.cabins && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <BedDouble className="w-5 h-5 text-luxury-gold" />
                        <span className="font-medium">{yacht.cabins} {t('cabins', { count: yacht.cabins })}</span>
                      </span>
                    )}
                    {yacht.toilets && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Bath className="w-5 h-5 text-luxury-gold" />
                        <span className="font-medium">{yacht.toilets} {t('toilets', { count: yacht.toilets })}</span>
                      </span>
                    )}
                  </div>

                  {/* Extras List - Bullet Points */}
                  {yachtExtras && yachtExtras.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Extras Included</p>
                      <ul className="space-y-1">
                        {yachtExtras.slice(0, 3).map((extra, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-luxury-gold mt-1">•</span>
                            <span>{extra}</span>
                          </li>
                        ))}
                        {yachtExtras.length > 3 && (
                          <li className="text-xs text-gray-500 italic">+{yachtExtras.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Technical Specs Grid */}
                  {(() => {
                    const specs = yacht.specs || yacht.technical_specs
                    const hasSpecs = specs && (
                      specs.beam || specs.draft || specs.fuel_tank || specs.fuel_capacity || 
                      specs.water_tank || specs.water_capacity || specs.engine || specs.engines
                    )
                    return hasSpecs ? (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Technical Specs</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {specs.beam && (
                            <div>
                              <span className="text-gray-500">Beam:</span>
                              <span className="ml-1 font-medium text-gray-700">{specs.beam}{typeof specs.beam === 'number' ? 'm' : ''}</span>
                            </div>
                          )}
                          {specs.draft && (
                            <div>
                              <span className="text-gray-500">Draft:</span>
                              <span className="ml-1 font-medium text-gray-700">{specs.draft}{typeof specs.draft === 'number' ? 'm' : ''}</span>
                            </div>
                          )}
                          {(specs.fuel_tank || specs.fuel_capacity) && (
                            <div>
                              <span className="text-gray-500">Fuel:</span>
                              <span className="ml-1 font-medium text-gray-700">{specs.fuel_tank || specs.fuel_capacity}</span>
                            </div>
                          )}
                          {(specs.water_tank || specs.water_capacity) && (
                            <div>
                              <span className="text-gray-500">Water:</span>
                              <span className="ml-1 font-medium text-gray-700">{specs.water_tank || specs.water_capacity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null
                  })()}

                  {/* Amenities Tags */}
                  {yacht.amenities && Object.keys(yacht.amenities).filter(key => yacht.amenities?.[key]).length > 0 && (
                    <div className="mb-4">
                      <AmenitiesDisplay amenities={yacht.amenities} />
                    </div>
                  )}

                  {/* Price */}
                  {yacht.low_season_price && (
                    <div className="mb-4">
                      <span className="text-gray-600">{t('from')} </span>
                      <span className="text-2xl font-bold text-luxury-blue">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: yacht.currency || 'EUR',
                          minimumFractionDigits: 0,
                        }).format(yacht.low_season_price)}
                      </span>
                      <span className="text-gray-600"> {t('perDay')}</span>
                    </div>
                  )}

                  {yacht.high_season_price && !yacht.low_season_price && (
                    <div className="mb-4">
                      <span className="text-gray-600">{t('from')} </span>
                      <span className="text-2xl font-bold text-luxury-blue">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: yacht.currency || 'EUR',
                          minimumFractionDigits: 0,
                        }).format(yacht.high_season_price)}
                      </span>
                      <span className="text-gray-600"> {t('perDay')}</span>
                    </div>
                  )}

                  {/* View Details Button - Separated with proper spacing */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href={`/${locale}/fleet/${yacht.slug}`}
                      className="inline-block w-full text-center rounded-lg bg-luxury-blue px-6 py-3 text-white font-semibold transition-colors hover:bg-luxury-gold hover:text-luxury-blue"
                    >
                      {t('viewDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Amenities Display Component
function AmenitiesDisplay({ amenities }: { amenities: Fleet['amenities'] }) {
  const amenityConfig = [
    { key: 'ac', label: 'AC', icon: Snowflake },
    { key: 'watermaker', label: 'Watermaker', icon: Droplets },
    { key: 'generator', label: 'Generator', icon: Zap },
    { key: 'flybridge', label: 'Flybridge', icon: Ship },
    { key: 'heating', label: 'Heating', icon: Flame },
    { key: 'teak_deck', label: 'Teak Deck', icon: Waves },
    { key: 'full_batten', label: 'Full Batten', icon: Ship },
    { key: 'folding_table', label: 'Folding Table', icon: Table },
    { key: 'fridge', label: 'Fridge', icon: Refrigerator },
    { key: 'dinghy', label: 'Dinghy', icon: Anchor },
    { key: 'water_entertainment', label: 'Water Toys', icon: Sparkles },
  ]

  const enabledAmenities = amenityConfig.filter(config => amenities?.[config.key as keyof typeof amenities])
  const visibleCount = 5
  const visible = enabledAmenities.slice(0, visibleCount)
  const remaining = enabledAmenities.length - visibleCount

  if (enabledAmenities.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map(({ key, label, icon: Icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
        >
          <Icon className="w-5 h-5 text-blue-600" />
          {label}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-medium">
          +{remaining} more
        </span>
      )}
    </div>
  )
}
