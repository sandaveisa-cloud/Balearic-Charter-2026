import { supabase } from './supabase'

/**
 * Converts an image URL or filename to a full URL
 * Handles:
 * - Full URLs (http:// or https://) - returns as-is
 * - Local paths (/images/...) - returns as-is for Next.js public folder serving
 * - Supabase storage paths - constructs full URL for the 'yacht-images' bucket
 */
export function getImageUrl(imageUrlOrFilename: string | null | undefined): string | null {
  if (!imageUrlOrFilename) {
    return null
  }

  // If it's already a full URL, return as-is
  if (imageUrlOrFilename.startsWith('http://') || imageUrlOrFilename.startsWith('https://')) {
    return imageUrlOrFilename
  }

  // If it's a local path starting with /images/, return as-is
  // Next.js will serve these from the public folder
  if (imageUrlOrFilename.startsWith('/images/') || imageUrlOrFilename.startsWith('/')) {
    return imageUrlOrFilename
  }

  // Otherwise, construct the Supabase Storage public URL
  try {
    const { data } = supabase.storage
      .from('yacht-images')
      .getPublicUrl(imageUrlOrFilename)

    return data.publicUrl
  } catch (error) {
    console.error('[ImageUtils] Error constructing image URL:', error)
    return null
  }
}

/**
 * Gets optimized image URL
 * Handles:
 * - Local paths (/images/...) - returns as-is, Next.js Image will handle optimization
 * - Supabase Storage URLs - adds transformation query parameters
 * - External URLs - returns as-is, Next.js Image will handle optimization
 * 
 * @param imageUrlOrFilename - The image URL or filename
 * @param options - Transformation options (used for Supabase URLs)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  imageUrlOrFilename: string | null | undefined,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpg' | 'png'
    resize?: 'cover' | 'contain' | 'fill'
  } = {}
): string | null {
  if (!imageUrlOrFilename) {
    return null
  }

  // Default options
  const {
    width = 1200,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options

  // If it's a local path starting with /, return as-is
  // Next.js Image component will handle optimization
  if (imageUrlOrFilename.startsWith('/')) {
    return imageUrlOrFilename
  }

  // If it's already a full URL
  if (imageUrlOrFilename.startsWith('http://') || imageUrlOrFilename.startsWith('https://')) {
    // Check if it's a Supabase Storage URL
    if (imageUrlOrFilename.includes('.supabase.co/storage/v1/object/public/')) {
      // Add transformation query parameters
      try {
        const url = new URL(imageUrlOrFilename)
        url.searchParams.set('width', width.toString())
        if (options.height) {
          url.searchParams.set('height', options.height.toString())
        }
        url.searchParams.set('quality', quality.toString())
        url.searchParams.set('format', format)
        url.searchParams.set('resize', resize)
        return url.toString()
      } catch {
        return imageUrlOrFilename
      }
    }
    // For non-Supabase URLs, return as-is (Next.js Image will handle optimization)
    return imageUrlOrFilename
  }

  // Construct Supabase Storage URL with transformations
  try {
    const { data } = supabase.storage
      .from('yacht-images')
      .getPublicUrl(imageUrlOrFilename, {
        transform: {
          width,
          height: options.height,
          quality,
          format: format as any,
          resize,
        },
      })

    return data.publicUrl
  } catch (error) {
    // Fallback to regular URL
    return getImageUrl(imageUrlOrFilename)
  }
}

/**
 * Gets thumbnail URL for an image
 * Optimized for small previews (800px width, 70% quality)
 */
export function getThumbnailUrl(imageUrlOrFilename: string | null | undefined): string | null {
  return getOptimizedImageUrl(imageUrlOrFilename, {
    width: 800,
    quality: 70,
    format: 'webp',
  })
}

/**
 * Converts YouTube URLs to embed format for iframe use
 * Handles:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID (already embed format)
 * @deprecated Use getEmbedUrl instead for better video URL handling
 */
export function convertYouTubeUrlToEmbed(url: string | null | undefined): string | null {
  if (!url) {
    return null
  }

  try {
    // If already an embed URL, return as-is
    if (url.includes('youtube.com/embed/')) {
      return url
    }

    let videoId: string | null = null

    // Handle standard YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url)
      videoId = urlObj.searchParams.get('v')
    }
    // Handle short YouTube URL: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&#]+)/)
      videoId = match ? match[1] : null
    }

    if (!videoId) {
      return url // Return original URL if we can't convert it
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playlist=${videoId}`
    return embedUrl
  } catch (error) {
    return url // Return original URL on error
  }
}

/**
 * Gets the embed URL for a video - handles YouTube and direct video URLs
 * Converts YouTube watch/short URLs to embed format
 * Returns direct video URLs as-is for use in <video> tags
 * 
 * @param url - The video URL (YouTube or direct video URL)
 * @returns Object with embedUrl, isYouTube flag, and isValid flag
 */
export function getEmbedUrl(url: string | null | undefined): {
  embedUrl: string | null
  isYouTube: boolean
  isValid: boolean
} {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return {
      embedUrl: null,
      isYouTube: false,
      isValid: false,
    }
  }

  const trimmedUrl = url.trim()

  // Check if it's a YouTube URL
  const isYouTube = trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')

  if (!isYouTube) {
    // Not a YouTube URL, assume it's a direct video URL
    // Validate it's a proper URL
    try {
      new URL(trimmedUrl)
      return {
        embedUrl: trimmedUrl,
        isYouTube: false,
        isValid: true,
      }
    } catch {
      return {
        embedUrl: null,
        isYouTube: false,
        isValid: false,
      }
    }
  }

  // Handle YouTube URLs
  try {
    // If already an embed URL, ensure it has autoplay/loop/mute params
    if (trimmedUrl.includes('youtube.com/embed/')) {
      let embedUrl = trimmedUrl
      
      // Check if it already has query params
      const urlObj = new URL(embedUrl)
      
      // Set required parameters for background video
      urlObj.searchParams.set('autoplay', '1')
      urlObj.searchParams.set('loop', '1')
      urlObj.searchParams.set('mute', '1')
      urlObj.searchParams.set('controls', '0')
      urlObj.searchParams.set('playsinline', '1')
      urlObj.searchParams.set('rel', '0') // Don't show related videos
      urlObj.searchParams.set('modestbranding', '1') // Minimal YouTube branding
      
      // For loop to work, we need playlist parameter with the same video ID
      const videoIdMatch = embedUrl.match(/\/embed\/([^/?]+)/)
      if (videoIdMatch && videoIdMatch[1]) {
        urlObj.searchParams.set('playlist', videoIdMatch[1])
      }
      
      embedUrl = urlObj.toString()
      
      return {
        embedUrl,
        isYouTube: true,
        isValid: true,
      }
    }

    let videoId: string | null = null

    // Handle standard YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (trimmedUrl.includes('youtube.com/watch')) {
      const urlObj = new URL(trimmedUrl)
      videoId = urlObj.searchParams.get('v')
    }
    // Handle short YouTube URL: https://youtu.be/VIDEO_ID
    else if (trimmedUrl.includes('youtu.be/')) {
      const match = trimmedUrl.match(/youtu\.be\/([^?&#]+)/)
      videoId = match ? match[1] : null
    }

    if (!videoId) {
      return {
        embedUrl: null,
        isYouTube: true,
        isValid: false,
      }
    }

    // Build embed URL with all necessary parameters for background video
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&playlist=${videoId}`

    return {
      embedUrl,
      isYouTube: true,
      isValid: true,
    }
  } catch {
    return {
      embedUrl: null,
      isYouTube: true,
      isValid: false,
    }
  }
}
