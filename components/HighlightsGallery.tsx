'use client'

import { useTranslations } from 'next-intl'
import { MapPin, Anchor, Camera, Sparkles } from 'lucide-react'
import OptimizedImage from './OptimizedImage'
import Link from 'next/link'

interface Highlight {
  id?: string
  name: string
  name_en?: string
  name_es?: string
  name_de?: string
  description: string
  description_en?: string
  description_es?: string
  description_de?: string
  image_url?: string | null
  coordinates?: { lat: number; lng: number } | null
  category?: 'landmark' | 'beach' | 'marina' | 'viewpoint' | 'restaurant' | 'other'
}

interface HighlightsGalleryProps {
  highlights?: Highlight[]
  destinationName: string
  locale: string
}

export default function HighlightsGallery({ highlights, destinationName, locale }: HighlightsGalleryProps) {
  const t = useTranslations('destinations')

  // Default highlights if none provided
  const defaultHighlights: Highlight[] = [
    {
      id: '1',
      name: 'Cathedral La Seu',
      description: 'Gothic masterpiece overlooking the bay',
      category: 'landmark',
    },
    {
      id: '2',
      name: 'Es Trenc Beach',
      description: 'Pristine white sand beach, boat access only',
      category: 'beach',
    },
    {
      id: '3',
      name: 'Port de Sóller',
      description: 'Charming fishing port with excellent restaurants',
      category: 'marina',
    },
  ]

  // Use provided highlights if available, otherwise use defaults
  let displayHighlights = highlights && highlights.length > 0 ? highlights : defaultHighlights
  
  // If we have gallery images from the destination, merge them with highlights
  // This allows gallery images to replace placeholder highlights
  // Note: This would need to be passed as a prop from DestinationDetail
  // For now, we'll use highlights_data which may contain images

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'landmark':
        return <Camera className="w-4 h-4" />
      case 'beach':
        return <Anchor className="w-4 h-4" />
      case 'marina':
        return <MapPin className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'landmark':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'beach':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'marina':
        return 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/20'
      default:
        return 'bg-luxury-gold/10 text-luxury-gold border-luxury-gold/20'
    }
  }

  if (displayHighlights.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue mb-4">
          {t('highlights') || 'Highlights & Attractions'}
        </h2>
        <p className="text-gray-600 max-w-2xl">
          {t('highlightsDescription') || `Discover the must-see locations in ${destinationName}`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayHighlights.map((highlight, index) => {
          // Get localized name and description
          const getName = () => {
            if (locale === 'es' && highlight.name_es) return highlight.name_es
            if (locale === 'de' && highlight.name_de) return highlight.name_de
            return highlight.name_en || highlight.name
          }
          
          const getDescription = () => {
            if (locale === 'es' && highlight.description_es) return highlight.description_es
            if (locale === 'de' && highlight.description_de) return highlight.description_de
            return highlight.description_en || highlight.description
          }
          
          const displayName = getName()
          const displayDescription = getDescription()
          const highlightId = highlight.id || `highlight-${index}`
          
          return (
            <div
              key={highlightId}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-luxury-gold/30"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-luxury-blue/20 to-luxury-gold/20">
                {highlight.image_url ? (
                  <OptimizedImage
                    src={highlight.image_url}
                    alt={displayName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getCategoryIcon(highlight.category)}
                  </div>
                )}
                {/* Category Badge */}
                {highlight.category && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(highlight.category)}`}>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(highlight.category)}
                      <span className="capitalize">{highlight.category}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-serif text-xl font-bold text-luxury-blue mb-2">
                  {displayName}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {displayDescription}
                </p>
                {highlight.coordinates && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {highlight.coordinates.lat.toFixed(4)}° N, {Math.abs(highlight.coordinates.lng).toFixed(4)}° {highlight.coordinates.lng < 0 ? 'W' : 'E'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
