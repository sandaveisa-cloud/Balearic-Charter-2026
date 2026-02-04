import { getSiteContent } from '@/lib/data'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import DestinationsSection from '@/components/DestinationsSection'
import Breadcrumb from '@/components/Breadcrumb'
import { ArrowLeft, Anchor } from 'lucide-react'
import { locales } from '@/i18n/routing'

export const revalidate = 60 // Revalidate every 60 seconds for quick updates from Admin

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'destinations' })
  
  const titles: Record<string, string> = {
    en: 'Explore Our Destinations | Ibiza, Mallorca, Menorca, Costa Blanca | Balearic Yacht Charters',
    es: 'Explora Nuestros Destinos | Ibiza, Mallorca, Menorca, Costa Blanca | Balearic Yacht Charters',
    de: 'Entdecken Sie Unsere Reiseziele | Ibiza, Mallorca, Menorca, Costa Blanca | Balearic Yacht Charters',
  }
  
  const descriptions: Record<string, string> = {
    en: 'Discover the most beautiful Mediterranean destinations for your luxury yacht charter. Ibiza, Formentera, Mallorca, Menorca, and Costa Blanca await.',
    es: 'Descubra los destinos mediterráneos más hermosos para su chárter de yates de lujo. Ibiza, Formentera, Mallorca, Menorca y Costa Blanca le esperan.',
    de: 'Entdecken Sie die schönsten Mittelmeerziele für Ihren Luxus-Yachtcharter. Ibiza, Formentera, Mallorca, Menorca und Costa Blanca erwarten Sie.',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      languages: {
        'en': '/en/destinations',
        'es': '/es/destinations',
        'de': '/de/destinations',
      },
    },
  }
}

export default async function DestinationsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'destinations' })
  
  const content = await getSiteContent()
  const destinations = content.destinations || []

  return (
    <main className="min-h-screen pt-20">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: t('title') || 'Destinations', href: '/destinations' }
        ]} 
      />
      
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-luxury-blue via-luxury-blue/95 to-luxury-blue/90 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-4">
            <Anchor className="w-10 h-10 text-luxury-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">
              {t('allDestinations') || 'Our Destinations'}
            </h1>
          </div>
          
          <p className="text-xl text-white/80 max-w-2xl">
            {t('allDestinationsSubtitle') || 'Explore the most beautiful sailing destinations in the Mediterranean. From the vibrant nightlife of Ibiza to the tranquil beaches of Formentera.'}
          </p>
        </div>
      </header>

      {/* Destinations Grid */}
      <DestinationsSection destinations={destinations} />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-luxury-blue/5 via-luxury-gold/5 to-luxury-blue/5 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">
            {t('readyToExplore') || 'Ready to Explore?'}
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {t('ctaDescription') || 'Contact us to plan your perfect Mediterranean yacht charter. Our team is ready to create an unforgettable experience.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-gold text-luxury-blue font-bold rounded-lg hover:bg-luxury-blue hover:text-white transition-all duration-300 shadow-lg"
            >
              {t('viewFleet') || 'View Our Fleet'}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-blue text-white font-bold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 shadow-lg"
            >
              {t('backToHome') || 'Back to Home'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
