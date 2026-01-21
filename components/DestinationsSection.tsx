'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import OptimizedImage from './OptimizedImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import { getLocalizedText } from '@/lib/i18nUtils'
import { ArrowRight, Play } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUtils'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import InteractiveDestinationsMap from './InteractiveDestinationsMap'
import VideoModal from './VideoModal'

interface Destination {
  id: string
  title: string // Primary field from database
  name?: string // Optional legacy field (code uses fallback: name || title)
  region?: string | null
  description: string | null
  description_en?: string | null
  description_es?: string | null
  description_de?: string | null
  image_url?: string | null
  youtube_video_url?: string | null
  image_urls?: string[] // Legacy field
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
  youtubeVideoId: string | null
  youtubeVideoUrl: string | null | undefined
  destinationSlug: string
  locale: string
  t: (key: string) => string
  onHover: () => void
  onHoverEnd: () => void
  onDiscoverMore: () => void
}

function DestinationCard({
  destinationName,
  region,
  description,
  imageUrl,
  youtubeVideoId,
  youtubeVideoUrl,
  destinationSlug,
  locale,
  t,
  onHover,
  onHoverEnd,
  onDiscoverMore,
}: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onHoverEnd()
  }

  useEffect(() => {
    if (isHovered && youtubeVideoId) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsVideoLoaded(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setIsVideoLoaded(false)
    }
  }, [isHovered, youtubeVideoId])

  return (
    <div
      className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image/Video Container with Dark Overlay */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Background Image */}
        {imageUrl && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isHovered && youtubeVideoId ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <OptimizedImage
              src={imageUrl}
              alt={destinationName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              objectFit="cover"
              aspectRatio="4/3"
              loading="lazy"
              quality={80}
            />
          </div>
        )}

        {/* YouTube Video (appears on hover) */}
        {youtubeVideoId && isHovered && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '177.77777778vh',
                height: '100vh',
                minWidth: '100%',
                minHeight: '56.25vw',
                transform: 'translate(-50%, -50%) scale(1.1)',
                pointerEvents: 'none',
              }}
            >
              <iframe
                src={buildYouTubeEmbedUrl(youtubeVideoId, {
                  autoplay: true,
                  mute: true,
                  loop: true,
                  controls: false,
                })}
                title={`${destinationName} - Drone Video`}
                allow="autoplay; encrypted-media"
                allowFullScreen={false}
                className="absolute inset-0 w-full h-full border-none pointer-events-none"
                style={{ pointerEvents: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Fallback Gradient if no image */}
        {!imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue via-luxury-blue/80 to-luxury-gold flex items-center justify-center">
            <span className="text-white text-4xl font-serif font-bold">{destinationName}</span>
          </div>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 transition-all duration-500 z-10" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white z-20">
          {/* Region Badge */}
          {region && (
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                {region}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {youtubeVideoUrl && (
              <button
                onClick={onDiscoverMore}
                className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-blue font-semibold rounded-lg hover:bg-white hover:text-luxury-blue transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5" />
                <span>{t('discoverMore') || 'Discover More'}</span>
              </button>
            )}
            <Link
              href={`/${locale}/destinations/${destinationSlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white hover:text-luxury-blue transition-all duration-300 transform group-hover:translate-x-2 shadow-lg hover:shadow-xl border border-white/30"
            >
              <span>{t('viewDetails') || 'View Details'}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Decorative Corner Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-luxury-gold/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
      </div>
    </div>
  )
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('destinations')
  const [highlightedDestination, setHighlightedDestination] = useState<string | null>(null)
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; videoUrl: string | null; title: string }>({
    isOpen: false,
    videoUrl: null,
    title: '',
  })

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

  // Get localized description with JSONB fallback
  const getLocalizedDescription = (destination: Destination): string => {
    // Try JSONB i18n first
    const i18nDesc = getLocalizedText((destination as any).description_i18n, locale as 'en' | 'es' | 'de')
    if (i18nDesc) return i18nDesc
    
    // Fallback to legacy columns
    switch (locale) {
      case 'es':
        return destination.description_es || destination.description || ''
      case 'de':
        return destination.description_de || destination.description || ''
      default:
        return destination.description_en || destination.description || ''
    }
  }

  const handleDiscoverMore = (videoUrl: string | null, destinationName: string) => {
    if (videoUrl) {
      setVideoModal({
        isOpen: true,
        videoUrl,
        title: destinationName,
      })
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
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-center px-4 text-balance">
            {t('subtitle') || 'Explore the stunning coastlines and hidden gems of the Mediterranean'}
          </p>
        </div>

        {/* Interactive Map and Destinations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Interactive Leaflet Map */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-8 h-[500px] lg:h-[600px]">
              <InteractiveDestinationsMap
                destinations={activeDestinations.map(dest => ({
                  id: dest.id,
                  title: getDestinationName(dest),
                  name: getDestinationName(dest),
                  slug: dest.slug || dest.id,
                  description: getLocalizedDescription(dest),
                }))}
                highlightedDestination={highlightedDestination}
                onMarkerClick={(slug) => {
                  // Navigate to destination page on marker click
                  router.push(`/${locale}/destinations/${slug}`)
                }}
              />
            </div>
          </div>

          {/* Destinations Grid */}
          <div className="lg:col-span-2 order-1 lg:order-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeDestinations.map((destination) => {
              const destinationImage = getDestinationImage(destination)
              const imageUrl = destinationImage || null
              const destinationName = getDestinationName(destination)
              const description = getLocalizedDescription(destination)
              const destinationSlug = destination.slug || destination.id
              const youtubeVideoId = destination.youtube_video_url
                ? extractYouTubeId(destination.youtube_video_url)
                : null

              return (
                <DestinationCard
                  key={destination.id}
                  destinationName={destinationName}
                  region={destination.region}
                  description={description}
                  imageUrl={imageUrl}
                  youtubeVideoId={youtubeVideoId}
                  youtubeVideoUrl={destination.youtube_video_url}
                  destinationSlug={destinationSlug}
                  locale={locale}
                  t={t}
                  onHover={() => setHighlightedDestination(destinationSlug)}
                  onHoverEnd={() => setHighlightedDestination(null)}
                  onDiscoverMore={() => handleDiscoverMore(destination.youtube_video_url || null, destinationName)}
                />
              )
            })}
          </div>
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

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, videoUrl: null, title: '' })}
        videoUrl={videoModal.videoUrl}
        title={videoModal.title}
      />
    </section>
  )
}
