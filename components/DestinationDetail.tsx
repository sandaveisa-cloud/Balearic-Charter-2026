'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getImageUrl, getOptimizedImageUrl } from '@/lib/imageUtils'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import OptimizedImage from './OptimizedImage'
import InteractiveDestinationsMap from './InteractiveDestinationsMap'
import VideoModal from './VideoModal'
import SailingCalendarWidget from './SailingCalendarWidget'
import WeatherForecast from './WeatherForecast'
import TideMoonInfo from './TideMoonInfo'
import HighlightsGallery from './HighlightsGallery'
import HappyGuestsGallery from './HappyGuestsGallery'
import { ArrowLeft, Play, MapPin, Navigation, Ship, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
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

  const getDestinationCoordinates = (dest: Destination): { lat: number; lng: number } | null => {
    if ((dest as any).coordinates && typeof (dest as any).coordinates === 'object') {
      const coords = (dest as any).coordinates
      if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return { lat: coords.lat, lng: coords.lng }
      }
    }
    const destName = (dest.name || dest.title || '').toLowerCase().replace(/\s+/g, '-')
    const coords: Record<string, { lat: number; lng: number }> = {
      'ibiza': { lat: 38.9067, lng: 1.4206 },
      'formentera': { lat: 38.7050, lng: 1.4500 },
      'mallorca': { lat: 39.5696, lng: 2.6502 },
      'palma': { lat: 39.5696, lng: 2.6502 },
      'menorca': { lat: 39.9375, lng: 4.0000 },
      'costa-blanca': { lat: 38.3452, lng: -0.4810 },
    }
    return coords[destName] || null
  }

  useEffect(() => {
    const generateContentIfNeeded = async () => {
      if (!destination.seasonal_data || Object.keys(destination.seasonal_data).length === 0) {
        setIsGenerating(true)
        try {
          const response = await fetch('/api/generate-destination-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destinationName: destination.name || destination.title,
              locale,
              region: destination.region,
            }),
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success) setGeneratedContent(data.content)
          }
        } catch (error) {
          console.error('Error generating content:', error)
        } finally {
          setIsGenerating(false)
        }
      }
    }
    generateContentIfNeeded()
  }, [destination, locale])

  const getLocalizedDescription = (dest: Destination): string => {
    switch (locale) {
      case 'es': return dest.description_es || dest.description || ''
      case 'de': return dest.description_de || dest.description || ''
      default: return dest.description_en || dest.description || ''
    }
  }

  const destinationName = destination.name || destination.title || 'Destination'
  const description = getLocalizedDescription(destination)
  const imageUrl = (destination.image_urls && destination.image_urls[0]) || null
  const optimizedImageUrl = imageUrl ? getOptimizedImageUrl(imageUrl, { width: 1920, quality: 85 }) : null
  const youtubeVideoId = destination.youtube_video_url ? extractYouTubeId(destination.youtube_video_url) : null
  const destinationSlug = destination.slug || destination.id
  const coordinates = getDestinationCoordinates(destination)
  const displayHighlights = (destination as any).highlights_data || generatedContent?.highlights || null
  const galleryImages = (destination as any).gallery_images || null

  return (
    <article className="min-h-screen bg-white">
      <header className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden bg-luxury-blue">
        {optimizedImageUrl ? (
          <OptimizedImage src={optimizedImageUrl} alt={destinationName} fill priority className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
            <MapPin className="w-20 h-20 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 pb-12">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4">{destinationName}</h1>
            <div className="flex gap-4">
              <Link href="/" className="px-8 py-3 bg-luxury-gold text-luxury-blue font-bold rounded-lg shadow-lg">
                {t('viewFleet')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <section className="prose prose-lg max-w-none">
              <h2 className="font-serif text-3xl text-luxury-blue">About {destinationName}</h2>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{description}</p>
            </section>

            {destination.seasonal_data && (
              <SailingCalendarWidget seasonalData={destination.seasonal_data} destinationName={destinationName} />
            )}
            
            <WeatherForecast latitude={coordinates?.lat} longitude={coordinates?.lng} />

            {youtubeVideoId && (
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-slate-900">
                <iframe src={buildYouTubeEmbedUrl(youtubeVideoId, { autoplay: false })} className="w-full h-full border-0" allowFullScreen />
              </div>
            )}

            <HighlightsGallery highlights={displayHighlights} destinationName={destinationName} locale={locale} />

            {galleryImages && (
              <section className="space-y-6">
                <h2 className="font-serif text-3xl font-bold text-luxury-blue">{t('happyGuests')}</h2>
                <HappyGuestsGallery images={galleryImages} destinationName={destinationName} locale={locale} />
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <TideMoonInfo latitude={coordinates?.lat} longitude={coordinates?.lng} />
            <div className="bg-white rounded-2xl p-2 shadow-xl border border-slate-100">
              <div className="h-[450px] w-full rounded-xl overflow-hidden">
                <InteractiveDestinationsMap
                  destinations={[{ id: destination.id, title: destinationName, name: destinationName, slug: destination