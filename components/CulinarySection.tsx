'use client'

import { useEffect, useState } from 'react'
import OptimizedImage from './OptimizedImage'
import ImageCarousel from './ImageCarousel'
import ImageLightbox from './ImageLightbox'
import { useTranslations, useLocale } from 'next-intl'
import type { CulinaryExperience } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { ChefHat } from 'lucide-react'

interface CulinarySectionProps {
  experiences: CulinaryExperience[]
}


export default function CulinarySection({ experiences }: CulinarySectionProps) {
  const t = useTranslations('culinary')
  const locale = useLocale() as 'en' | 'es' | 'de'
  
  // GOLDEN RULE: Use direct database fields - NEVER use translation keys for database content
  // All components use: field_${locale} || field_en || ''
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [galleryState, setGalleryState] = useState<{
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
  
  // Debug logging
  useEffect(() => {
    console.log('[CulinarySection] Experiences received:', experiences?.length || 0)
    if (experiences && experiences.length > 0) {
      console.log('[CulinarySection] All experiences:', experiences.map(exp => ({
        id: exp.id,
        title: exp.title,
        hasImageUrl: !!exp.image_url,
        hasMediaUrls: !!exp.media_urls?.length,
        mediaUrls: exp.media_urls
      })))
    }
  }, [experiences])
  
  // Helper function to get PRIMARY image URL from experience (checks both image_url and media_urls)
  // Returns only ONE image per experience to prevent duplication
  const getPrimaryImageFromExperience = (exp: CulinaryExperience): string | null => {
    // First check media_urls array (new format) - get FIRST image only
    if (exp.media_urls && Array.isArray(exp.media_urls) && exp.media_urls.length > 0) {
      // Filter out YouTube URLs and get first image URL only
      const imageUrl = exp.media_urls.find((url: string) => 
        url && typeof url === 'string' && url.trim().length > 0 && 
        !url.includes('youtube.com') && !url.includes('youtu.be')
      )
      if (imageUrl) return imageUrl.trim()
    }
    
    // Fallback to legacy image_url field
    if (exp.image_url && typeof exp.image_url === 'string' && exp.image_url.trim().length > 0) {
      return exp.image_url.trim()
    }
    
    return null
  }

  // Get all images for a gallery (for future slider implementation)
  const getAllImagesFromExperience = (exp: CulinaryExperience): string[] => {
    const images: string[] = []
    
    // Get all images from media_urls (excluding YouTube URLs)
    if (exp.media_urls && Array.isArray(exp.media_urls) && exp.media_urls.length > 0) {
      const imageUrls = exp.media_urls.filter((url: string) => 
        url && typeof url === 'string' && url.trim().length > 0 && 
        !url.includes('youtube.com') && !url.includes('youtu.be')
      )
      images.push(...imageUrls)
    }
    
    // Add legacy image_url if it exists and not already in the array
    if (exp.image_url && typeof exp.image_url === 'string' && exp.image_url.trim().length > 0 && !images.includes(exp.image_url)) {
      images.push(exp.image_url)
    }
    
    // Remove duplicates
    return [...new Set(images)]
  }

  // Get localized title from database fields
  // Priority: title_{locale} > title_en > title (legacy)
  // NEVER show raw translation keys - always use database fields
  const getLocalizedTitle = (exp: CulinaryExperience): string => {
    const localeKey = `title_${locale}` as keyof CulinaryExperience
    const localizedTitle = exp[localeKey] as string | null | undefined
    
    // Use locale-specific field if available
    if (localizedTitle && typeof localizedTitle === 'string' && localizedTitle.trim().length > 0) {
      return localizedTitle
    }
    
    // Fallback to English
    if (exp.title_en && typeof exp.title_en === 'string' && exp.title_en.trim().length > 0) {
      return exp.title_en
    }
    
    // Final fallback to legacy title field
    return exp.title || 'Culinary Experience'
  }

  // Get localized description from database fields
  // Priority: description_{locale} > description_en > description (legacy)
  // NEVER show raw translation keys - always use database fields
  const getLocalizedDescription = (exp: CulinaryExperience): string | null => {
    const localeKey = `description_${locale}` as keyof CulinaryExperience
    const localizedDescription = exp[localeKey] as string | null | undefined
    
    // Use locale-specific field if available
    if (localizedDescription && typeof localizedDescription === 'string' && localizedDescription.trim().length > 0) {
      return localizedDescription
    }
    
    // Fallback to English
    if (exp.description_en && typeof exp.description_en === 'string' && exp.description_en.trim().length > 0) {
      return exp.description_en
    }
    
    // Final fallback to legacy description field
    return exp.description || null
  }

  // Filter active experiences, remove duplicates by ID, and sort by order_index
  const activeExperiences = (experiences || [])
    .filter((exp) => exp.is_active !== false)
    // Remove duplicates by ID (in case of data issues)
    .filter((exp, index, self) => 
      index === self.findIndex((e) => e.id === exp.id)
    )
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

  // Empty state
  if (activeExperiences.length === 0) {
    return (
      <section className="py-12 bg-white border-t border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-[#C5A059] mx-auto mb-4" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
              {t('title')}
            </h2>
            <p className="text-base text-[#475569]">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-white border-t border-b border-[#E2E8F0]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-2 tracking-wide">
            {t('title')}
          </h2>
          <p className="text-base text-[#475569]">
            {t('subtitle')}
          </p>
        </div>

        {/* Experiences Grid - Consistent gap and equal height cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeExperiences.map((experience, index) => {
            // Get PRIMARY image only (one per experience)
            const rawImageUrl = getPrimaryImageFromExperience(experience)
            const imageUrl = rawImageUrl
              ? getOptimizedImageUrl(rawImageUrl, {
                  width: 800,
                  quality: 85,
                  format: 'webp',
                })
              : null

            const hasError = imageErrors[experience.id]
            const showImage = imageUrl && !hasError
            
            // Get all images for gallery (for future slider feature)
            const allImages = getAllImagesFromExperience(experience)
            const hasMultipleImages = allImages.length > 1

            return (
              <div
                key={`culinary-${experience.id}-${index}`}
                className="group relative overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#E2E8F0] flex flex-col h-full"
              >
                {/* Image Container - Carousel or Single Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#C5A059]/10 via-[#0F172A]/5 to-[#C5A059]/10">
                  {hasMultipleImages && allImages.length > 0 ? (
                    // Use carousel for multiple images
                    <ImageCarousel
                      images={allImages}
                      alt={getLocalizedTitle(experience)}
                      aspectRatio="4/3"
                      autoplayDelay={5000}
                      showNavigation={true}
                      showPagination={true}
                      effect="fade"
                      priority={index < 6}
                      quality={85}
                      onImageClick={(clickedIndex) => {
                        setGalleryState({
                          isOpen: true,
                          images: allImages,
                          initialIndex: clickedIndex,
                          title: getLocalizedTitle(experience),
                        })
                      }}
                    />
                  ) : showImage && imageUrl ? (
                    // Single image with click to open lightbox
                    <div
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => {
                        if (allImages.length > 0) {
                          setGalleryState({
                            isOpen: true,
                            images: allImages,
                            initialIndex: 0,
                            title: getLocalizedTitle(experience),
                          })
                        }
                      }}
                    >
                      <OptimizedImage
                        src={imageUrl}
                        alt={getLocalizedTitle(experience)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        objectFit="cover"
                        aspectRatio="4/3"
                        loading={index < 6 ? 'eager' : 'lazy'}
                        quality={85}
                        onError={() => {
                          console.error('[CulinarySection] Image failed to load for:', experience.title, imageUrl)
                          setImageErrors(prev => ({ ...prev, [experience.id]: true }))
                        }}
                      />
                      {/* Hover overlay hint */}
                      {allImages.length > 0 && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white bg-black/50 px-4 py-2 rounded-lg text-sm font-medium">
                            View image
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-[#C5A059] opacity-50" />
                    </div>
                  )}
                </div>

                {/* Content Card - Flex grow for equal height */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="font-serif text-lg md:text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#C5A059] transition-colors">
                    {getLocalizedTitle(experience)}
                  </h3>

                  {/* Description */}
                  {getLocalizedDescription(experience) && (
                    <p className="text-sm text-[#475569] leading-relaxed line-clamp-3 flex-grow">
                      {getLocalizedDescription(experience)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={galleryState.images}
        initialIndex={galleryState.initialIndex}
        title={galleryState.title}
        isOpen={galleryState.isOpen}
        onClose={() => setGalleryState({ isOpen: false, images: [], initialIndex: 0, title: '' })}
      />
    </section>
  )
}
