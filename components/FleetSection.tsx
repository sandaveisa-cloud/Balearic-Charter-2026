'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Ruler, Users, BedDouble, Bath, Snowflake, Droplets, Zap, Ship, Flame, Waves, Table, Refrigerator, Anchor, Sparkles } from 'lucide-react'
import type { Fleet } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface FleetSectionProps {
  fleet: Fleet[]
}

export default function FleetSection({ fleet }: FleetSectionProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  useEffect(() => {
    console.log('[FleetSection] Component loaded with fleet:', fleet.length, 'yachts')
    fleet.forEach((yacht, index) => {
      console.log(`[FleetSection] Yacht ${index + 1}:`, {
        id: yacht.id,
        name: yacht.name,
        main_image_url: yacht.main_image_url,
      })
    })
  }, [fleet])

  if (fleet.length === 0) {
    return null
  }

  return (
    <section id="fleet" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            Our Luxury Fleet
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our collection of meticulously maintained yachts, each offering unique luxury experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fleet.map((yacht) => {
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
                className="group relative overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-105"
              >
                {showImage ? (
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <Image
                      src={imageUrl}
                      alt={yacht.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                      onError={() => {
                        console.error('[FleetSection] Image failed to load:', {
                          yachtId: yacht.id,
                          yachtName: yacht.name,
                          originalUrl: yacht.main_image_url,
                          resolvedUrl: imageUrl,
                        })
                        setImageErrors(prev => ({ ...prev, [yacht.id]: true }))
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white text-2xl md:text-3xl font-serif">{yacht.name}</span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-2xl font-bold text-luxury-blue">{yacht.name}</h3>
                    {yacht.year && (
                      <span className="text-luxury-gold font-semibold">{yacht.year}</span>
                    )}
                  </div>

                  {yacht.short_description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{yacht.short_description}</p>
                  )}

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
                        <span className="font-medium">{yacht.capacity} Guests</span>
                      </span>
                    )}
                    {yacht.cabins && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <BedDouble className="w-5 h-5 text-luxury-gold" />
                        <span className="font-medium">{yacht.cabins} Cabins</span>
                      </span>
                    )}
                    {yacht.toilets && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Bath className="w-5 h-5 text-luxury-gold" />
                        <span className="font-medium">{yacht.toilets} Toilets</span>
                      </span>
                    )}
                  </div>

                  {/* Amenities Tags */}
                  {yacht.amenities && Object.keys(yacht.amenities).filter(key => yacht.amenities?.[key]).length > 0 && (
                    <div className="mb-4">
                      <AmenitiesDisplay amenities={yacht.amenities} />
                    </div>
                  )}

                  {yacht.high_season_price && (
                    <div className="mb-4">
                      <span className="text-gray-600">From </span>
                      <span className="text-2xl font-bold text-luxury-blue">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: yacht.currency || 'EUR',
                          minimumFractionDigits: 0,
                        }).format(yacht.high_season_price)}
                      </span>
                      <span className="text-gray-600"> / day</span>
                    </div>
                  )}

                  <Link
                    href={`/fleet/${yacht.slug}`}
                    className="inline-block w-full text-center rounded-lg bg-luxury-blue px-6 py-3 text-white font-semibold transition-colors hover:bg-luxury-gold hover:text-luxury-blue"
                  >
                    View Details & Book
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
