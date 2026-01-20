import type { Fleet } from '@/types/database'

interface StructuredDataProps {
  type: 'TravelAgency' | 'BoatTrip'
  settings?: Record<string, string>
  yacht?: Fleet
  locale?: string
}

export default function StructuredData({ type, settings = {}, yacht, locale = 'en' }: StructuredDataProps) {
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
    const boatTripSchema = {
      "@context": "https://schema.org",
      "@type": "BoatTrip",
      "name": yacht.name,
      "description": yacht.short_description || yacht.description || "",
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

  return null
}
