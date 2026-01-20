'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  className?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  aspectRatio?: string // e.g., "16/9", "4/3", "1/1"
  onClick?: () => void
  onError?: () => void
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

/**
 * Optimized Image Component
 * - Prevents stretching with object-fit
 * - Adds cursor pointer for clickable images
 * - Implements skeleton loader for slow connections
 * - Uses aspect-ratio to prevent layout shift (CLS)
 * - Automatic WebP/AVIF format support via Next.js
 * - Proper srcset and sizes for responsive images
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  loading,
  className = '',
  objectFit = 'cover',
  aspectRatio,
  onClick,
  onError,
  quality = 80,
  placeholder = 'blur',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Default blur placeholder (light grey)
  const defaultBlurDataURL =
    blurDataURL ||
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Build className with object-fit and cursor
  const imageClassName = [
    className,
    `object-${objectFit}`,
    onClick ? 'cursor-pointer' : '',
    'transition-opacity duration-300',
    isLoading ? 'opacity-0' : 'opacity-100',
  ]
    .filter(Boolean)
    .join(' ')

  // Container styles with aspect-ratio
  const containerStyle: React.CSSProperties = {}
  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio
  }

  // Skeleton loader (shown while loading)
  const skeletonLoader = (
    <div
      className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse"
      style={containerStyle}
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  )

  // Error placeholder
  if (hasError) {
    return (
      <div
        className="bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
        style={containerStyle}
        onClick={onClick}
      >
        <div className="text-center text-gray-500 p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    )
  }

  // Image with container
  const imageElement = fill ? (
    <div 
      className="relative w-full h-full" 
      style={containerStyle}
    >
      {isLoading && skeletonLoader}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={loading || (priority ? undefined : 'lazy')}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        className={imageClassName}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectFit: objectFit }}
      />
    </div>
  ) : (
    <div className="relative" style={containerStyle}>
      {isLoading && skeletonLoader}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={loading || (priority ? undefined : 'lazy')}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        className={imageClassName}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectFit: objectFit }}
      />
    </div>
  )

  return imageElement
}
