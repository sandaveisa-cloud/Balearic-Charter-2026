'use client'

import Image from 'next/image'
import type { Destination } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface DestinationsSectionProps {
  destinations: Destination[]
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  if (destinations.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            Explore Our Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the stunning coastlines and hidden gems of the Mediterranean.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => {
            const firstImageUrl = destination.image_urls && destination.image_urls.length > 0
              ? getOptimizedImageUrl(destination.image_urls[0], {
                  width: 1200,
                  quality: 80,
                  format: 'webp',
                })
              : null

            return (
              <div
                key={destination.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
              >
                {firstImageUrl ? (
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <Image
                      src={firstImageUrl}
                      alt={destination.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
                    <span className="text-white text-2xl font-serif">{destination.title}</span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-serif text-2xl font-bold text-luxury-blue mb-3">
                    {destination.title}
                  </h3>
                  {destination.description && (
                    <p className="text-gray-600">{destination.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
