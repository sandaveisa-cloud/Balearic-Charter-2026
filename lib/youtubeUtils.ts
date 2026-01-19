/**
 * Utility functions for YouTube URL handling
 */

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null

  // If it's already just an ID, return it
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim()
  }

  // Try to extract from different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Build YouTube embed URL with parameters
 */
export function buildYouTubeEmbedUrl(videoId: string, options?: {
  autoplay?: boolean
  mute?: boolean
  loop?: boolean
  controls?: boolean
}): string {
  const params = new URLSearchParams({
    autoplay: options?.autoplay ? '1' : '0',
    mute: options?.mute !== false ? '1' : '0',
    loop: options?.loop ? '1' : '0',
    controls: options?.controls ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })

  if (options?.loop) {
    params.append('playlist', videoId) // Required for loop to work
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality === 'maxres' ? 'maxresdefault' : `${quality}default`}.jpg`
}
