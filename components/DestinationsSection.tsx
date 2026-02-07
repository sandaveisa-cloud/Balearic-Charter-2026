'use client'

import { useState } from 'react'
import OptimizedImage from './OptimizedImage'
import ImageCarousel from './ImageCarousel'
import ImageLightbox from './ImageLightbox'
import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import type { Destination as DestinationType } from '@/types/database'


interface DestinationsSectionProps {
  destinations: DestinationType[]
}

interface DestinationCardProps {
  destinationName: string
  description: string
  imageUrl: string | null
  allImages: string[]
  destinationSlug: string
  locale: string
  tags?: string[]
  onImageClick?: (index: number) => void
}

function DestinationCard({
  destinationName,
  description,
  imageUrl,
  allImages,
  destinationSlug,
  locale,
  tags = [],
  onImageClick,
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
  const hasMultipleImages = allImages.length > 1
  const displayImages = allImages.length > 0 ? allImages : (imageSrc ? [imageSrc] : [])

  return (
    <div className="group flex flex-col h-full">
      {/* Image Container - Carousel or Single Image */}
      <Link
        href={{ pathname: '/destinations/[id]', params: { id: destinationSlug } }}
        className="relative overflow-hidden rounded-sm aspect-[4/3] shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] block"
      >
        {hasMultipleImages && displayImages.length > 0 ? (
          // Use carousel for multiple images
          <div onClick={(e) => e.preventDefault()}>
            <ImageCarousel
              images={displayImages}
              alt={destinationName}
              aspectRatio="4/3"
              autoplayDelay={5000}
              showNavigation={true}
              showPagination={true}
              effect="fade"
              quality={85}
              onImageClick={(clickedIndex) => {
                onImageClick?.(clickedIndex)
              }}
            />
          </div>
        ) : imageSrc ? (
          // Single image
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
            onClick={(e) => {
              e.preventDefault()
              if (displayImages.length > 0) {
                onImageClick?.(0)
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <span className="text-2xl font-semibold text-slate-600">{destinationName}</span>
          </div>
        )}
        
        {/* Overlay that darkens on hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none"></div>
        
        {/* Destination Name Overlay */}
        <div className="absolute bottom-6 left-6 text-white z-10 pointer-events-none">
          <h3 className="text-2xl font-semibold mb-1">{destinationName}</h3>
        </div>
      </Link>

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
    </div>
  )
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  const locale = useLocale()
  const t = useTranslations('destinations')
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean
    images: string[]
    initialIndex: number
    title: string
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
    title: '',
  })

  // Filter active destinations and sort by order_index
  const activeDestinations = destinations
    .filter((dest) => dest.is_active)
    .sort((a, b) => a.order_index - b.order_index)

  if (activeDestinations.length === 0) {
    return null
  }

  // Get destination name (support both new 'name' and legacy 'title')
  const getDestinationName = (destination: DestinationType): string => {
    return destination.name || destination.title || 'Destination'
  }

  // Get localized title for alt text and SEO
  const getLocalizedTitle = (destination: DestinationType): string => {
    // For destinations, we use name/title (not localized yet, but ready for future)
    return getDestinationName(destination)
  }

  // Get image URL from image_urls array (first image)
  const getDestinationImage = (destination: DestinationType): string | null => {
    if (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0) {
      const imageUrl = destination.image_urls[0]
      // Validate that URL is not empty and is a valid string
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
        return imageUrl.trim()
      }
    }
    return null
  }

  // Get all images from image_urls array (excluding YouTube URLs)
  const getAllDestinationImages = (destination: DestinationType): string[] => {
    if (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0) {
      return destination.image_urls.filter(
        (url) =>
          url &&
          typeof url === 'string' &&
          url.trim().length > 0 &&
          !url.includes('youtube.com') &&
          !url.includes('youtu.be')
      )
    }
    return []
  }

  // Get localized description - GOLDEN RULE: field_${locale} || field_en || ''
  const getLocalizedDescription = (destination: Destination): string => {
    const localeKey = `description_${locale}` as keyof Destination
    const localizedDesc = destination[localeKey] as string | null | undefined
    
    // Use locale-specific field if available
    if (localizedDesc && typeof localizedDesc === 'string' && localizedDesc.trim().length > 0) {
      return localizedDesc
    }
    
    // Fallback to English
    if (destination.description_en && typeof destination.description_en === 'string' && destination.description_en.trim().length > 0) {
      return destination.description_en
    }
    
    // Final fallback to legacy description field
    return destination.description || ''
  }

  // Map destination names to tags (can be extended with database field later)
  const getDestinationTags = (destinationName: string): string[] => {
    const name = destinationName.toLowerCase()
    try {
      const tagTranslations = t.raw('tags') || {}
      const tagMap: Record<string, string[]> = {
        'ibiza': [tagTranslations.beachClubs || 'Beach Clubs', tagTranslations.luxury || 'Luxury', tagTranslations.nightlife || 'Nightlife'],
        'formentera': [tagTranslations.crystalWater || 'Crystal Water', tagTranslations.nature || 'Nature', tagTranslations.relax || 'Relax'],
        'mallorca': [tagTranslations.calas || 'Calas', tagTranslations.culture || 'Culture', tagTranslations.sailing || 'Sailing'],
        'menorca': [tagTranslations.peaceful || 'Peaceful', tagTranslations.unspoiled || 'Unspoiled', tagTranslations.eco || 'Eco'],
        'costa blanca': [tagTranslations.sun || 'Sun', tagTranslations.coastalTowns || 'Coastal Towns', tagTranslations.localVibe || 'Local Vibe'],
      }
      return tagMap[name] || []
    } catch {
      // Fallback to English if translations fail
      const tagMap: Record<string, string[]> = {
        'ibiza': ['Beach Clubs', 'Luxury', 'Nightlife'],
        'formentera': ['Crystal Water', 'Nature', 'Relax'],
        'mallorca': ['Calas', 'Culture', 'Sailing'],
        'menorca': ['Peaceful', 'Unspoiled', 'Eco'],
        'costa blanca': ['Sun', 'Coastal Towns', 'Local Vibe'],
      }
      return tagMap[name] || []
    }
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
            const allImages = getAllDestinationImages(destination)
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
                allImages={allImages}
                destinationSlug={destinationSlug}
                locale={locale}
                tags={tags}
                onImageClick={(index) => {
                  if (allImages.length > 0) {
                    setLightboxState({
                      isOpen: true,
                      images: allImages,
                      initialIndex: index,
                      title: getLocalizedTitle(destination),
                    })
                  }
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        title={lightboxState.title}
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState({ isOpen: false, images: [], initialIndex: 0, title: '' })}
      />
    </section>
  )
}
