'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
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

                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    {yacht.length && (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-1 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {yacht.length}m
                      </span>
                    )}
                    {yacht.capacity && (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-1 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Up to {yacht.capacity} guests
                      </span>
                    )}
                  </div>

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
