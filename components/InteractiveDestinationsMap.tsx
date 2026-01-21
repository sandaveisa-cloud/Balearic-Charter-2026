'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Anchor } from 'lucide-react'

// Destination coordinates (latitude, longitude)
const destinationCoordinates: Record<string, [number, number]> = {
  ibiza: [38.9067, 1.4206],
  formentera: [38.7050, 1.4500],
  mallorca: [39.5696, 2.6502],
  menorca: [39.9375, 4.0000],
  'costa-blanca': [38.3452, -0.4810],
}

interface Destination {
  id: string
  title: string // Primary field from database
  name?: string // Optional legacy field (code uses fallback: name || title)
  slug: string
  description?: string | null
  description_en?: string | null
  description_es?: string | null
  description_de?: string | null
}

interface InteractiveDestinationsMapProps {
  destinations?: Destination[]
  highlightedDestination?: string | null
  onMarkerClick?: (slug: string) => void
}

// Internal map component that uses Leaflet (only rendered client-side)
function LeafletMap({
  destinations,
  highlightedDestination,
  onMarkerClick,
  locale,
  t,
}: InteractiveDestinationsMapProps & { locale: string; t: any }) {
  const [LeafletComponents, setLeafletComponents] = useState<any>(null)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    // Load Leaflet only on client
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([reactLeaflet, leaflet]) => {
      const L = leaflet.default
      
      // Fix for default marker icons in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      setL(L)
      setLeafletComponents(reactLeaflet)
    })
  }, [])

  if (!LeafletComponents || !L) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue/20 to-luxury-gold/20 flex items-center justify-center">
        <div className="text-center">
          <Anchor className="w-16 h-16 text-luxury-blue/30 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, useMap } = LeafletComponents

  // Custom luxury marker icon
  const createLuxuryMarker = () => {
    return L.divIcon({
      className: 'luxury-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #002366 0%, #D4AF37 100%);
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 16px;
            font-weight: bold;
          ">⚓</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  // Component to handle map updates
  function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap()
    
    useEffect(() => {
      if (map) {
        map.setView(center, zoom, { animate: true, duration: 1.0 })
      }
    }, [map, center, zoom])
    
    return null
  }

  // Default destinations if none provided
  const defaultDestinations: Destination[] = [
    { id: 'ibiza', title: 'Ibiza', name: 'Ibiza', slug: 'ibiza' },
    { id: 'formentera', title: 'Formentera', name: 'Formentera', slug: 'formentera' },
    { id: 'mallorca', title: 'Mallorca', name: 'Mallorca', slug: 'mallorca' },
    { id: 'menorca', title: 'Menorca', name: 'Menorca', slug: 'menorca' },
  ]

  const displayDestinations = destinations && destinations.length > 0 ? destinations : defaultDestinations

  // Center map on Balearic Islands
  const mapCenter: [number, number] = [39.5, 2.5]
  const mapZoom = 7

  // Get destination info with translations
  const getDestinationInfo = (destination: Destination) => {
    const name = (destination.name || destination.title || '').toLowerCase()
    const keyMap: Record<string, string> = {
      'ibiza': 'ibiza',
      'formentera': 'formentera',
      'mallorca': 'mallorca',
      'menorca': 'menorca',
      'costa blanca': 'costaBlanca',
      'costa-blanca': 'costaBlanca',
    }
    const key = keyMap[name] || (name || '').replace(/\s+/g, '').replace(/-/g, '')
    
    // Get localized description from database with fallback to translations
    const getLocalizedDescription = (): string => {
      // Try database columns first (description_en, description_es, description_de)
      switch (locale) {
        case 'es':
          if (destination.description_es) return destination.description_es
          break
        case 'de':
          if (destination.description_de) return destination.description_de
          break
        case 'en':
        default:
          if (destination.description_en) return destination.description_en
          break
      }
      
      // Fallback to legacy description field
      if (destination.description) return destination.description
      
      // Fallback to translation keys
      return t(`${key}.description`) || ''
    }
    
    return {
      title: t(`${key}.title`) || destination.name || 'Destination',
      description: getLocalizedDescription(),
    }
  }

  // Handle marker click
  const handleMarkerClick = (slug: string) => {
    if (onMarkerClick) {
      onMarkerClick(slug)
    }
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={true}
      attributionControl={true}
      className="z-10"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render markers for each destination */}
      {displayDestinations.map((destination) => {
        const destinationName = (destination.name || destination.title || '').toLowerCase()
        const coords = destinationCoordinates[destination.slug.toLowerCase()] || 
                      destinationCoordinates[destinationName]
        
        if (!coords) {
          console.warn(`No coordinates found for destination: ${destination.name || destination.title || destination.slug}`)
          return null
        }

        const { title, description } = getDestinationInfo(destination)

        return (
          <Marker
            key={destination.id}
            position={coords}
            icon={createLuxuryMarker()}
            eventHandlers={{
              click: () => handleMarkerClick(destination.slug),
            }}
          >
            <Popup className="luxury-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-serif text-lg font-bold text-luxury-blue mb-2">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {description}
                  </p>
                )}
                <Link
                  href={`/${locale}/destinations/${destination.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-luxury-blue text-white text-sm font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{t('viewDetails')}</span>
                  <Anchor className="w-4 h-4" />
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Update map view when highlighted destination changes */}
      {highlightedDestination && (() => {
        const dest = displayDestinations.find(
          d => d.slug === highlightedDestination || d.id === highlightedDestination
        )
        if (dest) {
          const destName = (dest.name || dest.title || '').toLowerCase()
          const coords = destinationCoordinates[dest.slug.toLowerCase()] || 
                        destinationCoordinates[destName]
          if (coords) {
            return <MapUpdater center={coords} zoom={10} />
          }
        }
        return null
      })()}
    </MapContainer>
  )
}

// Main component with loading state
export default function InteractiveDestinationsMap(props: InteractiveDestinationsMapProps) {
  const locale = useLocale()
  const t = useTranslations('destinations')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] rounded-xl overflow-hidden border border-luxury-gold/20 shadow-lg">
      {isMounted ? (
        <LeafletMap {...props} locale={locale} t={t} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue/20 to-luxury-gold/20 flex items-center justify-center">
          <div className="text-center">
            <Anchor className="w-16 h-16 text-luxury-blue/30 mx-auto mb-4 animate-pulse" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Custom styles for Leaflet popups */}
      <style jsx global>{`
        .luxury-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border: 1px solid #D4AF37;
        }
        .luxury-popup .leaflet-popup-tip {
          background: white;
          border: 1px solid #D4AF37;
        }
        .luxury-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #002366 !important;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #D4AF37 !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}
