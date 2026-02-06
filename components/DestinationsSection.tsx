'use client'

import OptimizedImage from './OptimizedImage'
import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'

interface Destination {
  id: string
  title: string // Primary field from database
  name?: string // Optional legacy field (code uses fallback: name || title)
  region?: string | null
  description: string | null
  description_en?: string | null
  description_es?: string | null
  description_de?: string | null
  image_urls?: string[] | null // Primary field: JSONB array of image URLs
  youtube_video_url?: string | null
  slug?: string
  order_index: number
  is_active: boolean
}

interface DestinationsSectionProps {
  destinations: Destination[]
}

interface DestinationCardProps {
  destinationName: string
  description: string
  imageUrl: string | null
  destinationSlug: string
  locale: string
  tags?: string[]
}

function DestinationCard({
  destinationName,
  description,
  imageUrl,
  destinationSlug,
  locale,
  tags = [],
}: DestinationCardProps) {
  // Default images from Unsplash if no image provided
  const defaultImages: Record<string, string> = {
    'ibiza': 'https://images.unsplash.com/photo-1512753360425-42468305c10a?auto=format&fit=crop&q=80&w=800',
    'formentera': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800',
    'mallorca': 'https://images.unsplash.com/photo-1559494489-91880915ba31?auto=format&fit=crop&q=80&w=800',
    'menorca': 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800',
    'costa blanca': 'https://images.unsplash.com/photo-1590001158193-790f3c6f443a?auto=format&fit=crop&q=80&w=800',
  }

  const imageSrc = imageUrl || defaultImages[destinationName.toLowerCase()] || null

  return (
    <Link
      href={{ pathname: '/destinations/[id]', params: { id: destinationSlug } }}
      className="group cursor-pointer flex flex-col h-full"
    >
      {/* Image Container - Fixed aspect ratio */}
      <div className="relative overflow-hidden rounded-sm aspect-[4/3] shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        {imageSrc ? (
          <OptimizedImage
            src={imageSrc}
            alt={destinationName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            objectFit="cover"
            aspectRatio="4/3"
            loading="lazy"
            quality={85}
            className="transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <span className="text-2xl font-semibold text-slate-600">{destinationName}</span>
          </div>
        )}
        
        {/* Overlay that darkens on hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
        
        {/* Destination Name Overlay */}
        <div className="absolute bottom-6 left-6 text-white">
          <h3 className="text-2xl font-semibold mb-1">{destinationName}</h3>
        </div>
      </div>

      {/* Content Below Image - Flex grow for equal height */}
      <div className="mt-4 flex flex-col flex-grow">
        <p className="text-slate-600 leading-relaxed mb-3 line-clamp-3">{description}</p>
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="text-[10px] uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  const locale = useLocale()
  const t = useTranslations('destinations')

  // Filter active destinations and sort by order_index
  const activeDestinations = destinations
    .filter((dest) => dest.is_active)
    .sort((a, b) => a.order_index - b.order_index)

  if (activeDestinations.length === 0) {
    return null
  }

  // Get destination name (support both new 'name' and legacy 'title')
  const getDestinationName = (destination: Destination): string => {
    return destination.name || destination.title || 'Destination'
  }

  // Get image URL from image_urls array (first image)
  const getDestinationImage = (destination: Destination): string | null => {
    if (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0) {
      const imageUrl = destination.image_urls[0]
      // Validate that URL is not empty and is a valid string
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
        return imageUrl.trim()
      }
    }
    return null
  }

  // Get localized description - use description_en/es/de columns (not description_i18n)
  const getLocalizedDescription = (destination: Destination): string => {
    // Use description_en, description_es, description_de columns (not description_i18n JSONB)
    switch (locale) {
      case 'es':
        return destination.description_es || destination.description || ''
      case 'de':
        return destination.description_de || destination.description || ''
      default:
        return destination.description_en || destination.description || ''
    }
  }

  // Map destination names to tags (can be extended with database field later)
  const getDestinationTags = (destinationName: string): string[] => {
    const name = destinationName.toLowerCase()
    const tagMap: Record<string, string[]> = {
      'ibiza': ['Beach Clubs', 'Luxury', 'Nightlife'],
      'formentera': ['Crystal Water', 'Nature', 'Relax'],
      'mallorca': ['Calas', 'Culture', 'Sailing'],
      'menorca': ['Peaceful', 'Unspoiled', 'Eco'],
      'costa blanca': ['Sun', 'Coastal Towns', 'Local Vibe'],
    }
    return tagMap[name] || []
  }

  return (
    <section className="bg-white py-12 md:py-20 lg:py-24 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4 tracking-wide uppercase">
            {t('title') || 'Exclusive Destinations'}
          </h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto px-4 italic">
            {t('subtitle') || 'Explore the most beautiful locations in the Mediterranean from the deck of our premium fleet.'}
          </p>
        </div>

        {/* Destinations Grid - Consistent gap and equal height cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeDestinations.map((destination) => {
            const destinationImage = getDestinationImage(destination)
            const imageUrl = destinationImage || null
            const destinationName = getDestinationName(destination)
            const description = getLocalizedDescription(destination)
            const destinationSlug = destination.slug || destination.id
            const tags = getDestinationTags(destinationName)

            return (
              <DestinationCard
                key={destination.id}
                destinationName={destinationName}
                description={description}
                imageUrl={imageUrl}
                destinationSlug={destinationSlug}
                locale={locale}
                tags={tags}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
