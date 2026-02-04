import { getSiteContent } from '@/lib/data'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import FleetSection from '@/components/FleetSection'
import Breadcrumb from '@/components/Breadcrumb'
import { ArrowLeft, Ship } from 'lucide-react'
import { locales } from '@/i18n/routing'

export const revalidate = 60 // Atjaunināt datus reizi minūtē

type Props = {
  params: Promise<{ locale: string }>
}

// 1. STRATĒĢISKĀ ATSLĒGVĀRDU MAIŅA (Baleāru salas)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  const titles: Record<string, string> = {
    en: 'Luxury Yacht Charter Balearic Islands | Ibiza & Mallorca | Balearic Yacht Charters',
    es: 'Alquiler de Yates en Baleares | Ibiza y Mallorca | Balearic Yacht Charters',
    de: 'Luxus Yachtcharter Balearen | Ibiza & Mallorca | Balearic Yacht Charters',
  }
  
  const descriptions: Record<string, string> = {
    en: 'Premium yacht rentals in Ibiza, Mallorca and Menorca. Discover our exclusive fleet of catamarans and luxury yachts. Professional crew and bespoke Balearic charters.',
    es: 'Alquiler exclusivo de yates en Ibiza, Mallorca y Menorca. Explore nuestra flota premium de catamaranes y yates de lujo. Chárters a medida con tripulación.',
    de: 'Exklusive Yachtmiete auf Ibiza, Mallorca und Menorca. Entdecken Sie unsere Premium-Flotte von Katamaranen und Luxusyachten. Maßgeschneiderte Charter.',
  }

  const baseUrl = 'https://balearicyachtcharters.com'

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: `${baseUrl}/${locale}/fleet`,
      languages: {
        en: `${baseUrl}/en/fleet`,
        es: `${baseUrl}/es/fleet`,
        de: `${baseUrl}/de/fleet`,
      },
    },
    keywords: ['yacht charter Ibiza', 'Mallorca boat rental', 'Balearic Islands sailing', 'luxury catamaran Menorca', 'Formentera boat trips'],
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [{ url: '/images/fleet-og.jpg', width: 1200, height: 630, alt: 'Balearic Yacht Charters Fleet' }],
    },
  }
}

export default async function FleetPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'fleet' })
  
  const content = await getSiteContent()
  const fleet = content.fleet || []

  // 2. STRUKTURĒTIE DATI (Schema.org) Google meklētājam
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Balearic Yacht Charters",
    "serviceType": "Yacht Rental",
    "areaServed": [
      { "@type": "State", "name": "Balearic Islands" },
      { "@type": "City", "name": "Ibiza" },
      { "@type": "City", "name": "Palma de Mallorca" }
    ],
    "provider": {
      "@type": "LocalBusiness",
      "name": "Balearic Yacht Charters",
      "url": "https://widedream.es"
    }
  }

  return (
    <main className="min-h-screen pt-20">
      {/* Pievienojam JSON-LD galvenajā lapas daļā */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb 
        items={[
          { label: t('title') || 'Fleet', href: '/fleet' }
        ]} 
      />
      
      <header className="bg-gradient-to-br from-luxury-blue via-luxury-blue/95 to-luxury-blue/90 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-4">
            <Ship className="w-10 h-10 text-luxury-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">
              {t('title') || 'Our Luxury Fleet'}
            </h1>
          </div>
          
          <p className="text-xl text-white/80 max-w-2xl">
            {t('subtitle') || 'Discover our exclusive fleet in the Balearic Islands, offering exceptional style and performance for your Mediterranean adventure.'}
          </p>
        </div>
      </header>

      <FleetSection fleet={fleet} />

      <section className="bg-gradient-to-r from-luxury-blue/5 via-luxury-gold/5 to-luxury-blue/5 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">
            {t('ctaTitle') || 'Ready to Set Sail?'}
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {t('ctaDescription') || 'Book your dream charter in Ibiza or Mallorca. Our team is ready to help you plan the perfect journey.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/destinations"
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