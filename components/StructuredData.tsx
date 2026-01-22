import type { Fleet, Destination } from '@/types/database'
import { getLocalizedText, getDescriptionForLocaleWithTextColumns } from '@/lib/i18nUtils'

interface StructuredDataProps {
  type: 'TravelAgency' | 'BoatTrip' | 'Place'
  settings?: Record<string, string>
  yacht?: Fleet
  destination?: Destination
  locale?: string
}

export default function StructuredData({ type, settings = {}, yacht, destination, locale = 'en' }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.widedream.es'
  
  if (type === 'TravelAgency') {
    const travelAgencySchema = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": settings.company_name || "Wide Dream",
      "description": locale === 'en' 
        ? "Luxury yacht charter in Majorca, Ibiza, and Costa Blanca"
        : locale === 'es'
        ? "Alquiler de yates de lujo en Mallorca, Ibiza y Costa Blanca"
        : "Luxus Yachtcharter auf Mallorca, Ibiza und Costa Blanca",
      "url": baseUrl,
      "telephone": settings.contact_phone || undefined,
      "email": settings.contact_email || undefined,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Palma de Mallorca",
        "addressRegion": "Balearic Islands",
        "addressCountry": "ES"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Palma de Mallorca"
        },
        {
          "@type": "City",
          "name": "Ibiza"
        },
        {
          "@type": "City",
          "name": "Torrevieja"
        },
        {
          "@type": "State",
          "name": "Balearic Islands"
        },
        {
          "@type": "State",
          "name": "Costa Blanca"
        }
      ],
      "serviceType": "Yacht Charter",
      "priceRange": "€€€",
      "sameAs": [
        settings.whatsapp_link,
        settings.instagram_link,
        settings.telegram_link
      ].filter(Boolean)
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencySchema) }}
      />
    )
  }

  if (type === 'BoatTrip' && yacht) {
    // Get localized description for SEO
    const yachtDescription = getDescriptionForLocaleWithTextColumns(
      yacht,
      locale as 'en' | 'es' | 'de'
    ) || getLocalizedText(yacht.short_description_i18n, locale as 'en' | 'es' | 'de') || yacht.short_description || ""
    
    const boatTripSchema = {
      "@context": "https://schema.org",
      "@type": "BoatTrip",
      "name": yacht.name,
      "description": yachtDescription,
      "provider": {
        "@type": "TravelAgency",
        "name": settings.company_name || "Wide Dream",
        "url": baseUrl
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": yacht.currency || "EUR",
        "price": yacht.high_season_price || yacht.medium_season_price || yacht.low_season_price || "0",
        "availability": "https://schema.org/InStock",
        "url": `${baseUrl}/${locale}/fleet/${yacht.slug}`
      },
      "departureLocation": {
        "@type": "Place",
        "name": "Palma de Mallorca",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Palma de Mallorca",
          "addressRegion": "Balearic Islands",
          "addressCountry": "ES"
        }
      },
      "itinerary": {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Balearic Islands"
          }
        ]
      }
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(boatTripSchema) }}
      />
    )
  }

  if (type === 'Place' && destination) {
    const destinationName = destination.name || destination.title || 'Destination'
    // Use description_en/es/de columns (not description_i18n JSONB)
    let description = ''
    switch (locale) {
      case 'es':
        description = destination.description_es || destination.description || ''
        break
      case 'de':
        description = destination.description_de || destination.description || ''
        break
      default:
        description = destination.description_en || destination.description || ''
    }
    
    // Map destination names to coordinates
    const coordinates: Record<string, { lat: number; lng: number }> = {
      ibiza: { lat: 38.9067, lng: 1.4206 },
      formentera: { lat: 38.7050, lng: 1.4500 },
      mallorca: { lat: 39.5696, lng: 2.6502 },
      menorca: { lat: 39.9375, lng: 4.0000 },
      'costa-blanca': { lat: 38.3452, lng: -0.4810 },
    }
    
    const slug = destination.slug?.toLowerCase() || (destinationName || '').toLowerCase().replace(/\s+/g, '-')
    const coords = coordinates[slug] || coordinates[destinationName.toLowerCase()] || { lat: 39.5, lng: 2.5 }
    
    const placeSchema = {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": destinationName,
      "description": description.substring(0, 200),
      "image": (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0) 
        ? destination.image_urls[0] 
        : undefined,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": coords.lat,
        "longitude": coords.lng
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": destination.region || destinationName,
        "addressRegion": "Balearic Islands",
        "addressCountry": "ES"
      },
      "url": `${baseUrl}/${locale}/destinations/${slug}`,
      "sameAs": settings.instagram_link || undefined
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
    )
  }

  return null
}
