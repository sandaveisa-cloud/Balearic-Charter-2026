'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard, EffectFade } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import OptimizedImage from './OptimizedImage'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

interface ImageLightboxProps {
  images: string[]
  initialIndex: number
  title: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Premium Full-Screen Image Lightbox
 * Features:
 * - Full-screen image preview
 * - Keyboard navigation (Arrow keys, Escape)
 * - Touch/swipe support
 * - Smooth fade transitions
 * - Thumbnail navigation strip
 * - Image counter
 * - Optimized Next.js Image loading
 */
export default function ImageLightbox({
  images,
  initialIndex,
  title,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Filter out YouTube URLs and empty strings
  const validImages = images.filter(
    (url) =>
      url &&
      typeof url === 'string' &&
      url.trim().length > 0 &&
      !url.includes('youtube.com') &&
      !url.includes('youtu.be')
  )

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen && swiper) {
      swiper.slideTo(initialIndex, 0)
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex, swiper])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && swiper) {
        swiper.slidePrev()
      } else if (e.key === 'ArrowRight' && swiper) {
        swiper.slideNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, swiper, onClose])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || validImages.length === 0) return null

  const goToSlide = (index: number) => {
    if (swiper) {
      swiper.slideTo(index)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 transition-colors p-3 bg-black/60 rounded-full hover:bg-black/80 backdrop-blur-sm"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous Button */}
      {validImages.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            swiper?.slidePrev()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors p-3 bg-black/60 rounded-full hover:bg-black/80 backdrop-blur-sm"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {validImages.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            swiper?.slideNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors p-3 bg-black/60 rounded-full hover:bg-black/80 backdrop-blur-sm"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Swiper
          modules={[Navigation, Pagination, Keyboard, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={initialIndex}
          onSwiper={setSwiper}
          onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
          keyboard={{ enabled: true }}
          className="w-full h-full max-w-7xl"
        >
          {validImages.map((imageUrl, index) => {
            const optimizedUrl = getOptimizedImageUrl(imageUrl, {
              width: 1920,
              quality: 90,
              format: 'webp',
            })

            return (
              <SwiperSlide key={`${imageUrl}-${index}`} className="relative">
                <div className="relative w-full h-full flex items-center justify-center">
                  {optimizedUrl ? (
                    <OptimizedImage
                      src={optimizedUrl}
                      alt={`${title} - Image ${index + 1} of ${validImages.length}`}
                      fill
                      sizes="100vw"
                      objectFit="contain"
                      quality={90}
                      className="cursor-default"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <p>Image unavailable</p>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            {currentIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Thumbnail Strip */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 bg-black/40 rounded-lg backdrop-blur-sm scrollbar-hide">
            {validImages.map((img, idx) => {
              const thumbUrl = getOptimizedImageUrl(img, {
                width: 100,
                quality: 75,
                format: 'webp',
              })

              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToSlide(idx)
                  }}
                  className={`relative w-16 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                    currentIndex === idx
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {thumbUrl ? (
                    <OptimizedImage
                      src={thumbUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      objectFit="cover"
                      quality={75}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
