'use client'

import { useEffect, useState } from 'react'
import OptimizedImage from './OptimizedImage'
import { useTranslations } from 'next-intl'
import type { CulinaryExperience } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { ChefHat } from 'lucide-react'

interface CulinarySectionProps {
  experiences: CulinaryExperience[]
}

export default function CulinarySection({ experiences }: CulinarySectionProps) {
  const t = useTranslations('culinary')
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  
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
      const imageUrl = exp.media_urls.find(url => 
        url && typeof url === 'string' && !url.includes('youtube.com') && !url.includes('youtu.be')
      )
      if (imageUrl) return imageUrl
    }
    
    // Fallback to legacy image_url field
    if (exp.image_url && typeof exp.image_url === 'string') {
      return exp.image_url
    }
    
    return null
  }

  // Get all images for a gallery (for future slider implementation)
  const getAllImagesFromExperience = (exp: CulinaryExperience): string[] => {
    const images: string[] = []
    
    // Get all images from media_urls (excluding YouTube URLs)
    if (exp.media_urls && Array.isArray(exp.media_urls)) {
      const imageUrls = exp.media_urls.filter(url => 
        url && typeof url === 'string' && !url.includes('youtube.com') && !url.includes('youtu.be')
      )
      images.push(...imageUrls)
    }
    
    // Add legacy image_url if it exists and not already in the array
    if (exp.image_url && typeof exp.image_url === 'string' && !images.includes(exp.image_url)) {
      images.push(exp.image_url)
    }
    
    // Remove duplicates
    return [...new Set(images)]
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
              Culinary Excellence
            </h2>
            <p className="text-base text-[#475569]">
              No culinary experiences available at the moment.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-white border-t border-b border-[#E2E8F0]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
            Culinary Excellence
          </h2>
          <p className="text-base text-[#475569]">
            World-class dining on the open sea.
          </p>
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                className="group relative overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#E2E8F0]"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#C5A059]/10 via-[#0F172A]/5 to-[#C5A059]/10">
                  {showImage ? (
                    <>
                      <OptimizedImage
                        src={imageUrl}
                        alt={`${experience.title || 'Culinary Experience'} - Featured Image`}
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
                      {/* Gallery indicator badge (if multiple images) */}
                      {hasMultipleImages && (
                        <div className="absolute top-2 right-2 bg-[#0F172A]/80 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {allImages.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-[#C5A059] opacity-50" />
                    </div>
                  )}
                </div>

                {/* Content Card */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#C5A059] transition-colors">
                    {experience.title}
                  </h3>

                  {/* Description */}
                  {experience.description && (
                    <p className="text-sm text-[#475569] leading-relaxed line-clamp-3">
                      {experience.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
