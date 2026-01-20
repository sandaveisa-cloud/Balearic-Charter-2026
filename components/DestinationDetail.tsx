'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText } from '@/lib/i18nUtils'
import { getImageUrl, getOptimizedImageUrl } from '@/lib/imageUtils'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import OptimizedImage from './OptimizedImage'
import BalearicIslandsMap from './BalearicIslandsMap'
import VideoModal from './VideoModal'
import { ArrowLeft, Play, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { Destination } from '@/types/database'

interface DestinationDetailProps {
  destination: Destination
}

export default function DestinationDetail({ destination }: DestinationDetailProps) {
  const t = useTranslations('destinations')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  // Get localized content
  const getDestinationName = (dest: Destination): string => {
    return dest.name || dest.title || 'Destination'
  }

  const getLocalizedDescription = (dest: Destination): string => {
    // Try JSONB i18n first
    const i18nDesc = getLocalizedText((dest as any).description_i18n, locale)
    if (i18nDesc) return i18nDesc
    
    // Fallback to legacy columns
    switch (locale) {
      case 'es':
        return dest.description_es || dest.description || ''
      case 'de':
        return dest.description_de || dest.description || ''
      default:
        return dest.description_en || dest.description || ''
    }
  }

  const getDestinationImage = (dest: Destination): string | null => {
    // Try image_url first
    if (dest.image_url) {
      return dest.image_url
    }
    // Fallback to image_urls array
    if (dest.image_urls && Array.isArray(dest.image_urls) && dest.image_urls.length > 0) {
      return dest.image_urls[0]
    }
    return null
  }

  const destinationName = getDestinationName(destination)
  const description = getLocalizedDescription(destination)
  const imageUrl = getDestinationImage(destination)
  const optimizedImageUrl = imageUrl ? getOptimizedImageUrl(imageUrl, {
    width: 1920,
    quality: 85,
    format: 'webp',
  }) : null
  const youtubeVideoId = destination.youtube_video_url
    ? extractYouTubeId(destination.youtube_video_url)
    : null
  const destinationSlug = destination.slug || destination.id

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gradient-to-br from-luxury-blue to-luxury-blue/80">
        {optimizedImageUrl ? (
          <OptimizedImage
            src={optimizedImageUrl}
            alt={destinationName}
            fill
            sizes="100vw"
            priority
            objectFit="cover"
            aspectRatio="16/9"
            quality={85}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue via-luxury-blue/90 to-luxury-gold flex items-center justify-center">
            <MapPin className="w-24 h-24 text-white/30" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href={`/${locale}/#destinations`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Destinations</span>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute inset-0 flex items-end pb-12 pointer-events-none">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
              {destinationName}
            </h1>
            {destination.region && (
              <p className="text-lg md:text-xl text-luxury-gold">{destination.region}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {description && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">About {destinationName}</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </div>
              </section>
            )}

            {/* Video Section */}
            {youtubeVideoId && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">Discover {destinationName}</h2>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                  <iframe
                    src={buildYouTubeEmbedUrl(youtubeVideoId, {
                      autoplay: false,
                      mute: false,
                      loop: false,
                      controls: true,
                    })}
                    title={`${destinationName} - Video`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-blue font-semibold rounded-lg hover:bg-luxury-blue hover:text-white transition-all"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Full Video</span>
                </button>
              </section>
            )}
          </div>

          {/* Sidebar with Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Interactive Map */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="font-serif text-xl font-bold text-luxury-blue mb-4">Location</h3>
                <div className="h-[500px] w-full rounded-lg overflow-hidden">
                  <BalearicIslandsMap
                    highlightedDestination={destinationSlug}
                    onDestinationHover={() => {}}
                  />
                </div>
              </div>

              {/* Quick Info */}
              {destination.region && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="font-serif text-xl font-bold text-luxury-blue mb-4">Quick Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-luxury-gold" />
                      <span className="text-gray-700">{destination.region}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {youtubeVideoId && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={destination.youtube_video_url || ''}
          title={destinationName}
        />
      )}
    </div>
  )
}
