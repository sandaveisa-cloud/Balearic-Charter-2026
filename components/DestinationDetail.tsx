'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText } from '@/lib/i18nUtils'
import { getImageUrl, getOptimizedImageUrl } from '@/lib/imageUtils'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import OptimizedImage from './OptimizedImage'
import InteractiveDestinationsMap from './InteractiveDestinationsMap'
import VideoModal from './VideoModal'
import SailingCalendarWidget from './SailingCalendarWidget'
import WeatherForecast from './WeatherForecast'
import TideMoonInfo from './TideMoonInfo'
import HighlightsGallery from './HighlightsGallery'
import { ArrowLeft, Play, MapPin, Navigation, Calendar, Ship, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Destination } from '@/types/database'

interface DestinationDetailProps {
  destination: Destination
}

export default function DestinationDetail({ destination }: DestinationDetailProps) {
  const t = useTranslations('destinations')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Get coordinates for destination (for hero display)
  const getDestinationCoordinates = (destName: string): { lat: number; lng: number } | null => {
    const coords: Record<string, { lat: number; lng: number }> = {
      'ibiza': { lat: 38.9067, lng: 1.4206 },
      'formentera': { lat: 38.7050, lng: 1.4500 },
      'mallorca': { lat: 39.5696, lng: 2.6502 },
      'palma': { lat: 39.5696, lng: 2.6502 },
      'menorca': { lat: 39.9375, lng: 4.0000 },
      'costa-blanca': { lat: 38.3452, lng: -0.4810 },
    }
    const key = destName.toLowerCase().replace(/\s+/g, '-')
    return coords[key] || coords[destName.toLowerCase()] || null
  }

  // Generate content if missing
  useEffect(() => {
    const generateContentIfNeeded = async () => {
      if (!destination.seasonal_data || Object.keys(destination.seasonal_data).length === 0) {
        setIsGenerating(true)
        try {
          const response = await fetch('/api/generate-destination-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destinationName: getDestinationName(destination),
              locale,
              region: destination.region,
              existingDescription: getLocalizedDescription(destination),
            }),
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setGeneratedContent(data.content)
            }
          }
        } catch (error) {
          console.error('[DestinationDetail] Error generating content:', error)
        } finally {
          setIsGenerating(false)
        }
      }
    }
    generateContentIfNeeded()
  }, [destination, locale])

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
  const coordinates = getDestinationCoordinates(destinationName)
  const seasonalData = destination.seasonal_data

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <header className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gradient-to-br from-luxury-blue to-luxury-blue/80">
        {optimizedImageUrl ? (
          <OptimizedImage
            src={optimizedImageUrl}
            alt={`${destinationName} - Luxury yacht charter destination in the Balearic Islands. Discover pristine beaches and hidden coves.`}
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

        {/* Title Overlay with Coordinates and CTA */}
        <div className="absolute inset-0 flex items-end pb-12 pointer-events-none">
          <div className="container mx-auto px-4 w-full">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                  {destinationName}
                </h1>
                {destination.region && (
                  <p className="text-lg md:text-xl text-luxury-gold mb-2">{destination.region}</p>
                )}
                {coordinates && (
                  <p className="text-sm text-white/80 font-mono">
                    {coordinates.lat.toFixed(4)}° N, {Math.abs(coordinates.lng).toFixed(4)}° E
                  </p>
                )}
              </div>
              {/* CTA Buttons */}
              <div className="flex gap-3 pointer-events-auto">
                <Link
                  href={`/${locale}/#fleet`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-blue font-bold rounded-lg hover:bg-white hover:text-luxury-blue transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Ship className="w-5 h-5" />
                  <span>{t('viewFleet') || 'View Our Fleet'}</span>
                </Link>
                <Link
                  href={`/${locale}/#contact`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white hover:text-luxury-blue transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{t('getQuote') || 'Get a Quote'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Ready to Explore CTA Section */}
        <div className="mb-12 text-center py-8 bg-gradient-to-r from-luxury-blue/5 via-luxury-gold/5 to-luxury-blue/5 rounded-2xl border border-luxury-gold/20">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue mb-4">
            {t('readyToExplore') || 'Ready to Explore?'}
          </h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            {t('readyToExploreDescription', { destination: destinationName }) || `Discover ${destinationName} aboard one of our luxury yachts. Professional crew, gourmet cuisine, and unforgettable memories await.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/#fleet`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-gold text-luxury-blue font-bold text-lg rounded-lg hover:bg-luxury-blue hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Ship className="w-6 h-6" />
              <span>{t('viewFleet') || 'View Our Fleet'}</span>
            </Link>
            <Link
              href={`/${locale}/#contact`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-blue text-white font-bold text-lg rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Navigation className="w-6 h-6" />
              <span>{t('getQuote') || 'Get a Quote'}</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {description && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="font-serif text-3xl font-bold text-luxury-blue mb-4">
                  About {destinationName}
                </h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  <p>{description}</p>
                </div>
              </section>
            )}

            {/* Sailing Calendar Widget */}
            {seasonalData && (
              <SailingCalendarWidget 
                seasonalData={seasonalData} 
                destinationName={destinationName}
              />
            )}

            {/* Weather Forecast */}
            <WeatherForecast />

            {/* Video Section */}
            {youtubeVideoId && (
              <section aria-labelledby="video-heading">
                <h2 id="video-heading" className="font-serif text-3xl font-bold text-luxury-blue mb-4">
                  Discover {destinationName}
                </h2>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                  <iframe
                    src={buildYouTubeEmbedUrl(youtubeVideoId, {
                      autoplay: false,
                      mute: false,
                      loop: false,
                      controls: true,
                    })}
                    title={`${destinationName} - Luxury yacht charter destination video`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
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

            {/* Sailing Tips */}
            {(generatedContent?.sailingTips || destination.seasonal_data) && (
              <section aria-labelledby="sailing-tips-heading">
                <h2 id="sailing-tips-heading" className="font-serif text-3xl font-bold text-luxury-blue mb-4 flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-luxury-gold" />
                  {t('sailingTips') || 'Sailing Tips'}
                </h2>
                <div className="bg-luxury-blue/5 rounded-xl p-6 border border-luxury-gold/20">
                  {generatedContent?.sailingTips ? (
                    <ul className="space-y-3">
                      {generatedContent.sailingTips.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-luxury-gold font-bold text-xl mt-1">•</span>
                          <p className="text-gray-700 leading-relaxed">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 italic">
                      {t('sailingTipsPlaceholder') || 'Expert sailing tips will be available soon.'}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Local Insights */}
            {generatedContent?.localInsights && (
              <section aria-labelledby="local-insights-heading">
                <h2 id="local-insights-heading" className="font-serif text-3xl font-bold text-luxury-blue mb-4">
                  {t('localInsights') || 'Local Insights'}
                </h2>
                <div className="bg-gradient-to-br from-luxury-gold/10 to-luxury-blue/10 rounded-xl p-6 border border-luxury-gold/30">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {generatedContent.localInsights}
                  </p>
                </div>
              </section>
            )}

            {/* Highlights Gallery */}
            <HighlightsGallery
              highlights={generatedContent?.highlights}
              destinationName={destinationName}
              locale={locale}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tide & Moon Info */}
              <TideMoonInfo />

              {/* Interactive Map */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="font-serif text-xl font-bold text-luxury-blue mb-4">Location</h3>
                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                  <InteractiveDestinationsMap
                    destinations={[{
                      id: destination.id,
                      name: destinationName,
                      slug: destinationSlug,
                      description: description,
                    }]}
                    highlightedDestination={destinationSlug}
                    onMarkerClick={() => {}}
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
                    {coordinates && (
                      <div className="flex items-center gap-3">
                        <Navigation className="w-5 h-5 text-luxury-gold" />
                        <span className="text-gray-700 font-mono text-sm">
                          {coordinates.lat.toFixed(4)}° N, {Math.abs(coordinates.lng).toFixed(4)}° E
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Video Modal */}
      {youtubeVideoId && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={destination.youtube_video_url || ''}
          title={destinationName}
        />
      )}
    </article>
  )
}
