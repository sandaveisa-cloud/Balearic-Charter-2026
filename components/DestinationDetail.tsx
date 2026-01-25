'use client'

import { useTranslations, useLocale } from 'next-intl'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import OptimizedImage from './OptimizedImage'
import InteractiveDestinationsMap from './InteractiveDestinationsMap'
import VideoModal from './VideoModal'
import SailingCalendarWidget from './SailingCalendarWidget'
import WeatherForecast from './WeatherForecast'
import TideMoonInfo from './TideMoonInfo'
import HighlightsGallery from './HighlightsGallery'
import HappyGuestsGallery from './HappyGuestsGallery'
import { ArrowLeft, MapPin, Navigation, Ship } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useState } from 'react'
import type { Destination } from '@/types/database'

interface DestinationDetailProps {
  destination: Destination
}

export default function DestinationDetail({ destination }: DestinationDetailProps) {
  const t = useTranslations('destinations')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  // 1. Datu loģika
  const destinationName = destination.name || destination.title || 'Destination'
  const youtubeVideoId = destination.youtube_video_url ? extractYouTubeId(destination.youtube_video_url) : null
  const destinationSlug = destination.slug || destination.id
  
  const getDestinationCoordinates = (dest: Destination) => {
    if ((dest as any).coordinates?.lat && (dest as any).coordinates?.lng) {
      return (dest as any).coordinates
    }
    const coords: Record<string, { lat: number; lng: number }> = {
      'ibiza': { lat: 38.9067, lng: 1.4206 },
      'formentera': { lat: 38.7050, lng: 1.4500 },
      'mallorca': { lat: 39.5696, lng: 2.6502 },
      'palma': { lat: 39.5696, lng: 2.6502 },
      'menorca': { lat: 39.9375, lng: 4.0000 },
      'costa-blanca': { lat: 38.3452, lng: -0.4810 },
    }
    return coords[(destinationName).toLowerCase().replace(/\s+/g, '-')] || null
  }

  const coordinates = getDestinationCoordinates(destination)
  const description = locale === 'es' ? destination.description_es : locale === 'de' ? destination.description_de : destination.description_en || destination.description || ''
  const imageUrl = (destination.image_urls && destination.image_urls[0]) || null
  const optimizedImageUrl = imageUrl ? getOptimizedImageUrl(imageUrl, { width: 1920, quality: 85 }) : null
  const displayHighlights = (destination as any).highlights_data || null
  const galleryImages = (destination as any).gallery_images || null

  return (
    <article className="min-h-screen bg-white">
      {/* Hero sadaļa ar fiksētu proporciju */}
      <header className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden bg-luxury-blue">
        {optimizedImageUrl ? (
          <OptimizedImage 
            src={optimizedImageUrl} 
            alt={destinationName} 
            fill 
            priority 
            className="object-cover" 
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
            <MapPin className="w-20 h-20 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">{t('backToHome')}</span>
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 pb-12 text-white">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">{destinationName}</h1>
            <div className="flex flex-wrap gap-4">
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
            
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-luxury-blue">{t('weatherForecast')}</h3>
              <WeatherForecast latitude={coordinates?.lat} longitude={coordinates?.lng} />
            </div>

            {youtubeVideoId && (
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-slate-900">
                <iframe 
                  src={buildYouTubeEmbedUrl(youtubeVideoId, { autoplay: false })} 
                  className="w-full h-full border-0" 
                  allowFullScreen 
                />
              </div>
            )}

            <HighlightsGallery highlights={displayHighlights} destinationName={destinationName} locale={locale} />

            {galleryImages && (
              <section className="space-y-6">
                <h2 className="font-serif text-3xl font-bold text-luxury-blue">{t('happyGuests')}</h2>
                {/* Attēli galerijā tiek izlīdzināti ar object-cover */}
                <HappyGuestsGallery images={galleryImages} destinationName={destinationName} locale={locale} />
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <TideMoonInfo latitude={coordinates?.lat} longitude={coordinates?.lng} />
            
            <div className="bg-white rounded-2xl p-2 shadow-xl border border-slate-100">
              <h3 className="font-serif text-xl font-bold text-luxury-blue p-4 pb-2">{t('location')}</h3>
              {/* FIKSĒTS KARTES AUGSTUMS */}
              <div className="h-[500px] w-full rounded-xl overflow-hidden">
                <InteractiveDestinationsMap
                  destinations={[{ id: destination.id, title: destinationName, name: destinationName, slug: destinationSlug, coordinates }]}
                  highlightedDestination={destinationSlug}
                  onMarkerClick={() => {}}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="py-20 text-center border-t border-slate-100">
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-blue text-white font-bold rounded-xl shadow-xl hover:bg-luxury-gold transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span>{t('backToHome')}</span>
        </Link>
      </footer>
    </article>
  )
}