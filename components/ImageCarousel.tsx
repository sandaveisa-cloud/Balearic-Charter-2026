'use client'

import { useRef, useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import OptimizedImage from './OptimizedImage'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

interface ImageCarouselProps {
  images: string[]
  alt: string
  aspectRatio?: string
  autoplayDelay?: number // milliseconds
  showNavigation?: boolean
  showPagination?: boolean
  effect?: 'slide' | 'fade'
  className?: string
  onImageClick?: (index: number) => void
  priority?: boolean
  quality?: number
}

/**
 * Premium Image Carousel Component
 * Features:
 * - Auto-play with configurable delay (default 5 seconds)
 * - Smooth fade or slide transitions
 * - Navigation arrows (appear on hover)
 * - Pagination dots
 * - Click to open lightbox
 * - Next.js Image optimization
 * - Responsive and accessible
 */
export default function ImageCarousel({
  images,
  alt,
  aspectRatio = '4/3',
  autoplayDelay = 5000,
  showNavigation = true,
  showPagination = true,
  effect = 'fade',
  className = '',
  onImageClick,
  priority = false,
  quality = 85,
}: ImageCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter out YouTube URLs and empty strings
  const validImages = images.filter(
    (url) =>
      url &&
      typeof url === 'string' &&
      url.trim().length > 0 &&
      !url.includes('youtube.com') &&
      !url.includes('youtu.be')
  )

  // If only one image, render single image instead of carousel
  if (validImages.length <= 1) {
    const imageUrl = validImages[0]
      ? getOptimizedImageUrl(validImages[0], {
          width: 800,
          quality,
          format: 'webp',
        })
      : null

    if (!imageUrl) return null

    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio }}
        onClick={() => onImageClick?.(0)}
      >
        <OptimizedImage
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          objectFit="cover"
          aspectRatio={aspectRatio}
          priority={priority}
          quality={quality}
          className={onImageClick ? 'cursor-pointer' : ''}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative group ${className}`}
      style={{ aspectRatio }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Prevent navigation when clicking on carousel controls
        const target = e.target as HTMLElement
        if (
          target.closest('.swiper-button-prev-custom') ||
          target.closest('.swiper-button-next-custom') ||
          target.closest('.swiper-pagination')
        ) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect={effect}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: (index, className) => {
            return `<span class="${className} swiper-pagination-bullet-custom"></span>`
          },
        }}
        loop={validImages.length > 2}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={(swiper) => {
          setCurrentIndex(swiper.realIndex)
        }}
        className="h-full w-full"
        onClick={(swiper, event) => {
          // Only trigger image click if not clicking on navigation/pagination
          const target = event.target as HTMLElement
          if (
            !target.closest('.swiper-button-prev-custom') &&
            !target.closest('.swiper-button-next-custom') &&
            !target.closest('.swiper-pagination')
          ) {
            onImageClick?.(swiper.realIndex)
          }
        }}
      >
        {validImages.map((imageUrl, index) => {
          const optimizedUrl = getOptimizedImageUrl(imageUrl, {
            width: 1200,
            quality,
            format: 'webp',
          })

          return (
            <SwiperSlide key={`${imageUrl}-${index}`} className="relative">
              <div
                className="relative w-full h-full cursor-pointer"
                onClick={(e) => {
                  // Prevent event bubbling to parent Link
                  e.stopPropagation()
                  onImageClick?.(index)
                }}
              >
                <OptimizedImage
                  src={optimizedUrl}
                  alt={`${alt} - Image ${index + 1} of ${validImages.length}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  objectFit="cover"
                  priority={priority && index === 0}
                  quality={quality}
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {/* Custom Navigation Arrows - Appear on hover */}
      {showNavigation && validImages.length > 1 && (
        <>
          <button
            className={`swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className={`swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Image Counter Badge */}
      {validImages.length > 1 && (
        <div className="absolute top-2 right-2 z-10 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}

      {/* Custom Pagination Styles */}
      <style jsx global>{`
        .swiper-pagination-bullet-custom {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-custom-active {
          background: white;
          width: 24px;
          border-radius: 4px;
        }
        .swiper-pagination {
          bottom: 12px !important;
        }
      `}</style>
    </div>
  )
}
