'use client'

import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import OptimizedImage from './OptimizedImage'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface FleetCardSliderProps {
  images: string[]
  yachtName: string
  yachtId: string
  aspectRatio?: '4/3' | 'square'
  priority?: boolean
  onImageError?: (yachtId: string) => void
}

export default function FleetCardSlider({
  images,
  yachtName,
  yachtId,
  aspectRatio = '4/3',
  priority = false,
  onImageError,
}: FleetCardSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filter out invalid images
  const validImages = images.filter((img) => {
    if (!img || typeof img !== 'string' || img.trim() === '') return false
    const trimmed = img.trim()
    // Reject pure numbers or ID patterns
    if (/^\d+$/.test(trimmed) || /^image:\d+$/i.test(trimmed)) return false
    return true
  })

  // If less than 2 images, return single image (no slider needed)
  if (validImages.length < 2) {
    if (validImages.length === 0) return null
    
    const imageUrl = getOptimizedImageUrl(validImages[0], {
      width: 1200,
      quality: 80,
      format: 'webp',
    })

    return (
      <div className={`${aspectRatio === '4/3' ? 'aspect-[4/3] lg:aspect-square' : 'aspect-square'} overflow-hidden relative`}>
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={yachtName || 'Yacht'}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            objectFit="cover"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => onImageError?.(yachtId)}
          />
        ) : null}
      </div>
    )
  }

  if (!isMounted) {
    // Return a placeholder during SSR to avoid hydration issues
    return (
      <div className={`${aspectRatio === '4/3' ? 'aspect-[4/3] lg:aspect-square' : 'aspect-square'} overflow-hidden relative bg-gray-200 animate-pulse`} />
    )
  }

  return (
    <div className={`${aspectRatio === '4/3' ? 'aspect-[4/3] lg:aspect-square' : 'aspect-square'} overflow-hidden relative group fleet-card-slider`}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={validImages.length > 2}
        navigation={validImages.length > 1}
        pagination={{
          clickable: true,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        className="h-full w-full"
        speed={500}
      >
        {validImages.map((imageUrl, index) => {
          const optimizedUrl = getOptimizedImageUrl(imageUrl, {
            width: 1200,
            quality: 80,
            format: 'webp',
          })

          return (
            <SwiperSlide key={`${yachtId}-${index}`} className="relative">
              {optimizedUrl ? (
                <OptimizedImage
                  src={optimizedUrl}
                  alt={`${yachtName} - Image ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  objectFit="cover"
                  priority={priority && index === 0}
                  loading={priority && index === 0 ? 'eager' : 'lazy'}
                  onError={() => onImageError?.(yachtId)}
                />
              ) : null}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
