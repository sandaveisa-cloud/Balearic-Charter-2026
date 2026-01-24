import { getSiteContent } from '@/lib/data'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import FleetSection from '@/components/FleetSection'
import { ArrowLeft, Ship } from 'lucide-react'
import { locales } from '@/i18n/routing'

export const revalidate = 60 // Revalidate every 60 seconds for quick updates from Admin

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  const titles: Record<string, string> = {
    en: 'Our Luxury Fleet | Premium Yacht Charter | Wide Dream',
    es: 'Nuestra Flota de Lujo | Chárter de Yates Premium | Wide Dream',
    de: 'Unsere Luxusflotte | Premium Yachtcharter | Wide Dream',
  }
  
  const descriptions: Record<string, string> = {
    en: 'Explore our premium fleet of luxury yachts available for charter. Professional crew, modern amenities, unforgettable experiences in the Mediterranean.',
    es: 'Explore nuestra flota premium de yates de lujo disponibles para chárter. Tripulación profesional, comodidades modernas, experiencias inolvidables en el Mediterráneo.',
    de: 'Entdecken Sie unsere Premium-Flotte luxuriöser Yachten zum Charter. Professionelle Crew, moderne Annehmlichkeiten, unvergessliche Erlebnisse im Mittelmeer.',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      languages: {
        'en': '/en/fleet',
        'es': '/es/fleet',
        'de': '/de/fleet',
      },
    },
  }
}

export default async function FleetPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'fleet' })
  
  const content = await getSiteContent()
  const fleet = content.fleet || []

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-luxury-blue via-luxury-blue/95 to-luxury-blue/90 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-luxury-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToHome') || 'Back to Home'}</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Ship className="w-10 h-10 text-luxury-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">
              {t('title') || 'Our Luxury Fleet'}
            </h1>
          </div>
          
          <p className="text-xl text-white/80 max-w-2xl">
            {t('subtitle') || 'Discover our carefully selected fleet of premium yachts, each offering exceptional comfort, style, and performance for your Mediterranean adventure.'}
          </p>
        </div>
      </header>

      {/* Fleet Grid */}
      <FleetSection fleet={fleet} />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-luxury-blue/5 via-luxury-gold/5 to-luxury-blue/5 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">
            {t('ctaTitle') || 'Ready to Set Sail?'}
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {t('ctaDescription') || 'Contact us to book your perfect yacht. Our team will help you choose the ideal vessel for your dream Mediterranean charter.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/#destinations"
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-gold text-luxury-blue font-bold rounded-lg hover:bg-luxury-blue hover:text-white transition-all duration-300 shadow-lg"
            >
              {t('exploreDestinations') || 'Explore Destinations'}
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
