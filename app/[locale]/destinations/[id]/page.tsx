import { notFound } from 'next/navigation'
import { getDestinationByIdOrSlug, getSiteContent } from '@/lib/data'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import DestinationDetail from '@/components/DestinationDetail'
import StructuredData from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import { getLocalizedText } from '@/lib/i18nUtils'
import { locales } from '@/i18n/routing'

// Force dynamic rendering to always fetch fresh data from database
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ id: string; locale: string }>
}

// Generate static params for better performance (optional - can be removed if you want fully dynamic)
export async function generateStaticParams() {
  try {
    const content = await getSiteContent()
    const destinations = content.destinations || []
    
    const params: { id: string; locale: string }[] = []
    
    for (const locale of locales) {
      for (const destination of destinations) {
        if (destination.is_active && destination.slug) {
          params.push({
            id: destination.slug,
            locale: locale,
          })
        }
      }
    }
    
    return params
  } catch (error) {
    console.error('[Destinations] Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const destination = await getDestinationByIdOrSlug(id)

  if (!destination) {
    return {
      title: 'Destination Not Found',
    }
  }

  const destinationName = destination.name || destination.title || 'Destination'
  
  // Get localized description - use description_en/es/de columns (not description_i18n)
  const getLocalizedDescription = (dest: typeof destination, loc: string): string => {
    // Use description_en, description_es, description_de columns (not description_i18n JSONB)
    switch (loc) {
      case 'es':
        return dest.description_es || dest.description || ''
      case 'de':
        return dest.description_de || dest.description || ''
      default:
        return dest.description_en || dest.description || ''
    }
  }

  const description = getLocalizedDescription(destination, locale)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.balearicyachtcharters.com'
  
  // SEO-optimized titles and descriptions
  const seoTitles: Record<string, Record<string, string>> = {
    ibiza: {
      en: `Ibiza Boat Rentals & Yacht Charter | Luxury Private Boats | Balearic Yacht Charters`,
      es: `Alquiler de Barcos en Ibiza | Chárter de Yates de Lujo | Balearic Yacht Charters`,
      de: `Bootsvermietung Ibiza | Luxus Yachtcharter | Balearic Yacht Charters`,
    },
    formentera: {
      en: `Formentera Yacht Charter | Private Boat Rentals | Balearic Yacht Charters`,
      es: `Chárter de Yates en Formentera | Alquiler de Barcos Privados | Balearic Yacht Charters`,
      de: `Yachtcharter Formentera | Privatbootvermietung | Balearic Yacht Charters`,
    },
    mallorca: {
      en: `Mallorca Yacht Charter | Luxury Boat Rentals Majorca | Balearic Yacht Charters`,
      es: `Chárter de Yates en Mallorca | Alquiler de Barcos de Lujo | Balearic Yacht Charters`,
      de: `Yachtcharter Mallorca | Luxus Bootsvermietung | Balearic Yacht Charters`,
    },
    menorca: {
      en: `Menorca Boat Rentals & Yacht Charter | Private Yachts | Balearic Yacht Charters`,
      es: `Alquiler de Barcos en Menorca | Chárter de Yates Privados | Balearic Yacht Charters`,
      de: `Bootsvermietung Menorca | Privat Yachtcharter | Balearic Yacht Charters`,
    },
    'costa-blanca': {
      en: `Costa Blanca Yacht Charter | Boat Rentals Spain | Balearic Yacht Charters`,
      es: `Chárter de Yates Costa Blanca | Alquiler de Barcos España | Balearic Yacht Charters`,
      de: `Yachtcharter Costa Blanca | Bootsvermietung Spanien | Balearic Yacht Charters`,
    },
  }

  const seoDescriptions: Record<string, Record<string, string>> = {
    ibiza: {
      en: `Rent a luxury yacht in Ibiza. Discover hidden coves, pristine beaches, and legendary sunsets. Professional crew, gourmet cuisine. Book your exclusive Ibiza boat charter today!`,
      es: `Alquile un yate de lujo en Ibiza. Descubra calas ocultas, playas pristinas y puestas de sol legendarias. Tripulación profesional, cocina gourmet. ¡Reserve su chárter exclusivo en Ibiza hoy!`,
      de: `Mieten Sie eine Luxusyacht auf Ibiza. Entdecken Sie versteckte Buchten, unberührte Strände und legendäre Sonnenuntergänge. Professionelle Crew, Gourmetküche. Buchen Sie noch heute Ihren exklusiven Bootscharter auf Ibiza!`,
    },
    formentera: {
      en: `Experience Formentera's crystal-clear waters with our luxury yacht charter. Perfect for water sports and relaxation. Professional crew, premium service. Book your Formentera adventure!`,
      es: `Experimente las aguas cristalinas de Formentera con nuestro chárter de yates de lujo. Perfecto para deportes acuáticos y relajación. Tripulación profesional, servicio premium. ¡Reserve su aventura en Formentera!`,
      de: `Erleben Sie das kristallklare Wasser von Formentera mit unserem Luxus-Yachtcharter. Perfekt für Wassersport und Entspannung. Professionelle Crew, Premium-Service. Buchen Sie Ihr Formentera-Abenteuer!`,
    },
    mallorca: {
      en: `Explore Mallorca's stunning coastline with our luxury yacht charter. From dramatic cliffs to secluded bays. Professional crew, gourmet dining. Book your Mallorca yacht rental today!`,
      es: `Explore la impresionante costa de Mallorca con nuestro chárter de yates de lujo. Desde acantilados dramáticos hasta bahías apartadas. Tripulación profesional, cena gourmet. ¡Reserve su alquiler de yate en Mallorca hoy!`,
      de: `Erkunden Sie die atemberaubende Küste von Mallorca mit unserem Luxus-Yachtcharter. Von dramatischen Klippen bis zu abgelegenen Buchten. Professionelle Crew, Gourmet-Dining. Buchen Sie noch heute Ihre Yachtvermietung auf Mallorca!`,
    },
    menorca: {
      en: `Discover Menorca's UNESCO Biosphere Reserve with our luxury yacht charter. Pristine beaches, charming fishing villages. Professional crew, premium service. Book your Menorca boat rental!`,
      es: `Descubra la Reserva de la Biosfera UNESCO de Menorca con nuestro chárter de yates de lujo. Playas pristinas, encantadores pueblos pesqueros. Tripulación profesional, servicio premium. ¡Reserve su alquiler de barco en Menorca!`,
      de: `Entdecken Sie Menorcas UNESCO-Biosphärenreservat mit unserem Luxus-Yachtcharter. Unberührte Strände, charmante Fischerdörfer. Professionelle Crew, Premium-Service. Buchen Sie Ihre Bootsvermietung auf Menorca!`,
    },
    'costa-blanca': {
      en: `Rent a luxury yacht along Spain's Costa Blanca. Golden beaches, vibrant marinas, charming coastal towns. Professional crew, gourmet cuisine. Book your Costa Blanca yacht charter today!`,
      es: `Alquile un yate de lujo a lo largo de la Costa Blanca de España. Playas doradas, puertos deportivos vibrantes, encantadores pueblos costeros. Tripulación profesional, cocina gourmet. ¡Reserve su chárter de yate en Costa Blanca hoy!`,
      de: `Mieten Sie eine Luxusyacht entlang der spanischen Costa Blanca. Goldene Strände, lebendige Yachthäfen, charmante Küstenstädte. Professionelle Crew, Gourmetküche. Buchen Sie noch heute Ihren Yachtcharter an der Costa Blanca!`,
    },
  }

  const slug = destination.slug?.toLowerCase() || (destinationName || '').toLowerCase().replace(/\s+/g, '-')
  const seoTitle = seoTitles[slug]?.[locale] || `${destinationName} Yacht Charter | Balearic Yacht Charters`
  const seoDescription = seoDescriptions[slug]?.[locale] || 
    (description.substring(0, 155) || `Explore ${destinationName} with our luxury yacht charter services. Professional crew, gourmet cuisine, premium boats. Book today!`)

  const imageUrl = (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0) 
    ? destination.image_urls[0] 
    : null
  const canonicalUrl = `${baseUrl}/${locale}/destinations/${slug}`

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/destinations/${slug}`,
        'es': `${baseUrl}/es/destinations/${slug}`,
        'de': `${baseUrl}/de/destinations/${slug}`,
        'x-default': `${baseUrl}/en/destinations/${slug}`,
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      siteName: 'Balearic Yacht Charters',
      locale: locale,
      type: 'website',
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${destinationName} - Luxury Yacht Charter`,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      ...(imageUrl && { images: [imageUrl] }),
    },
  }
}

export default async function DestinationPage({ params }: Props) {
  const { id, locale } = await params
  const destination = await getDestinationByIdOrSlug(id)

  if (!destination) {
    notFound()
  }

  // Fetch settings for structured data
  const siteContent = await getSiteContent()
  const settings = siteContent.settings || {}

  // Get destination name for breadcrumb
  const destinationName = destination.name || destination.title || 'Destination'
  const t = await getTranslations({ locale, namespace: 'destinations' })

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: t('title') || 'Destinations', href: '/destinations' },
          { label: destinationName }
        ]} 
      />
      
      {/* Structured Data for SEO */}
      <StructuredData 
        type="Place" 
        settings={settings} 
        destination={destination} 
        locale={locale} 
      />
      <DestinationDetail destination={destination} />
    </main>
  )
}
