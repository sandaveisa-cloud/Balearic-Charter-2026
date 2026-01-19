import { supabase } from './supabase'

/**
 * Converts an image URL or filename to a full Supabase Storage public URL
 * If the input is already a full URL (starts with http:// or https://), it returns it as-is
 * If it's a filename or path, it constructs the full URL for the 'yacht-images' bucket
 */
export function getImageUrl(imageUrlOrFilename: string | null | undefined): string | null {
  if (!imageUrlOrFilename) {
    console.log('[ImageUtils] No image URL or filename provided')
    return null
  }

  // If it's already a full URL, return as-is
  if (imageUrlOrFilename.startsWith('http://') || imageUrlOrFilename.startsWith('https://')) {
    console.log('[ImageUtils] Image is already a full URL:', imageUrlOrFilename)
    return imageUrlOrFilename
  }

  // Otherwise, construct the Supabase Storage public URL
  try {
    const { data } = supabase.storage
      .from('yacht-images')
      .getPublicUrl(imageUrlOrFilename)

    const fullUrl = data.publicUrl
    console.log('[ImageUtils] Constructed Supabase Storage URL:', {
      input: imageUrlOrFilename,
      output: fullUrl,
    })

    return fullUrl
  } catch (error) {
    console.error('[ImageUtils] Error constructing image URL:', {
      input: imageUrlOrFilename,
      error,
    })
    return null
  }
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
    console.log('[YouTube] No video URL provided')
    return null
  }

  console.log('[YouTube] Processing URL:', url)

  try {
    // If already an embed URL, return as-is
    if (url.includes('youtube.com/embed/')) {
      console.log('[YouTube] URL is already in embed format')
      return url
    }

    let videoId: string | null = null

    // Handle standard YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url)
      videoId = urlObj.searchParams.get('v')
      console.log('[YouTube] Extracted video ID from watch URL:', videoId)
    }
    // Handle short YouTube URL: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&#]+)/)
      videoId = match ? match[1] : null
      console.log('[YouTube] Extracted video ID from short URL:', videoId)
    }

    if (!videoId) {
      console.error('[YouTube] Could not extract video ID from URL:', url)
      return url // Return original URL if we can't convert it
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playlist=${videoId}`
    console.log('[YouTube] Converted to embed URL:', embedUrl)

    return embedUrl
  } catch (error) {
    console.error('[YouTube] Error converting URL:', {
      url,
      error,
    })
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
    console.log('[getEmbedUrl] No valid URL provided')
    return {
      embedUrl: null,
      isYouTube: false,
      isValid: false,
    }
  }

  const trimmedUrl = url.trim()
  console.log('[getEmbedUrl] Processing URL:', trimmedUrl)

  // Check if it's a YouTube URL
  const isYouTube = trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')

  if (!isYouTube) {
    // Not a YouTube URL, assume it's a direct video URL
    // Validate it's a proper URL
    try {
      new URL(trimmedUrl)
      console.log('[getEmbedUrl] Direct video URL detected:', trimmedUrl)
      return {
        embedUrl: trimmedUrl,
        isYouTube: false,
        isValid: true,
      }
    } catch (error) {
      console.error('[getEmbedUrl] Invalid URL format:', trimmedUrl)
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
      console.log('[getEmbedUrl] YouTube embed URL (enhanced):', embedUrl)
      
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
      console.log('[getEmbedUrl] Extracted video ID from watch URL:', videoId)
    }
    // Handle short YouTube URL: https://youtu.be/VIDEO_ID
    else if (trimmedUrl.includes('youtu.be/')) {
      const match = trimmedUrl.match(/youtu\.be\/([^?&#]+)/)
      videoId = match ? match[1] : null
      console.log('[getEmbedUrl] Extracted video ID from short URL:', videoId)
    }

    if (!videoId) {
      console.error('[getEmbedUrl] Could not extract video ID from YouTube URL:', trimmedUrl)
      return {
        embedUrl: null,
        isYouTube: true,
        isValid: false,
      }
    }

    // Build embed URL with all necessary parameters for background video
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&playlist=${videoId}`
    console.log('[getEmbedUrl] Converted YouTube URL to embed:', embedUrl)

    return {
      embedUrl,
      isYouTube: true,
      isValid: true,
    }
  } catch (error) {
    console.error('[getEmbedUrl] Error processing YouTube URL:', {
      url: trimmedUrl,
      error,
    })
    return {
      embedUrl: null,
      isYouTube: true,
      isValid: false,
    }
  }
}