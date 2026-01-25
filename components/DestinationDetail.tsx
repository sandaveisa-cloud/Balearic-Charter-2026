'use client'

import { useTranslations, useLocale } from 'next-intl'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import OptimizedImage from './OptimizedImage'
import InteractiveDestinationsMap from './InteractiveDestinationsMap'
import SailingCalendarWidget from './SailingCalendarWidget'
import WeatherForecast from './WeatherForecast'
import TideMoonInfo from './TideMoonInfo'
import HighlightsGallery from './HighlightsGallery'
import HappyGuestsGallery from './HappyGuestsGallery'
import { ArrowLeft, MapPin, Navigation, Ship } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Destination } from '@/types/database'

interface DestinationDetailProps {
  destination: Destination
}

export default function DestinationDetail({ destination }: DestinationDetailProps) {
  const t = useTranslations('destinations')
  const locale = useLocale() as 'en' | 'es' | 'de'

  const destinationName = destination.name || destination.title || 'Destination'
  const destinationSlug = destination.slug || destination.id
  
  // Koordinātu loģika
  const getCoords = (dest: any) => {
    if (dest.coordinates?.lat && dest.coordinates?.lng) return dest.coordinates;
    const fallback: Record<string, { lat: number; lng: number }> = {
      'ibiza': { lat: 38.9067, lng: 1.4206 },
      'mallorca': { lat: 39.5696, lng: 2.6502 },
      'costa-blanca': { lat: 38.3452, lng: -0.4810 }
    };
    return fallback[destinationName.toLowerCase()] || null;
  };

  const coordinates = getCoords(destination);
  const description = locale === 'es' ? destination.description_es : locale === 'de' ? destination.description_de : destination.description_en || destination.description;
  const imageUrl = destination.image_urls?.[0] || null;
  const optimizedHero = imageUrl ? getOptimizedImageUrl(imageUrl, { width: 1920, quality: 85 }) : null;

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden bg-slate-900">
        {optimizedHero ? (
          <OptimizedImage src={optimizedHero} alt={destinationName} fill priority className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center"><MapPin className="w-16 h-16 text-white/20" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 pb-12">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">{destinationName}</h1>
            <div className="flex gap-4">
              <Link href="/" className="px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg shadow-lg hover:bg-white transition-colors uppercase tracking-wider text-sm">
                {t('viewFleet')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            {/* Apraksts */}
            <section className="prose prose-lg max-w-none">
              <h2 className="font-serif text-3xl text-slate-900 mb-6">{t('location')} {destinationName}</h2>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{description}</p>
            </section>

            {/* Sezonas un Laikapstākļi */}
            {destination.seasonal_data && <SailingCalendarWidget seasonalData={destination.seasonal_data} destinationName={destinationName} />}
            <WeatherForecast latitude={coordinates?.lat} longitude={coordinates?.lng} />

            {/* Galerijas ar object-cover */}
            <HighlightsGallery highlights={(destination as any).highlights_data} destinationName={destinationName} locale={locale} />
            
            <section className="space-y-6">
              <h2 className="font-serif text-3xl font-bold text-slate-900">{t('happyGuests')}</h2>
              <HappyGuestsGallery images={(destination as any).gallery_images} destinationName={destinationName} locale={locale} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <TideMoonInfo latitude={coordinates?.lat} longitude={coordinates?.lng} />
            <div className="bg-white rounded-2xl p-2 shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-4"><h3 className="font-serif text-xl font-bold">{t('location')}</h3></div>
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

      {/* Footer CTA */}
      <footer className="py-20 text-center border-t border-slate-100">
        <Link href="/" className="inline-flex items-center gap-2 px-10 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-xl hover:bg-amber-500 transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span>{t('backToHome')}</span>
        </Link>
      </footer>
    </article>
  );
}