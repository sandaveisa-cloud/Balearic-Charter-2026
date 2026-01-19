'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'

interface HeroProps {
  settings: Record<string, string>
}

// Default YouTube video ID (hardcoded fallback)
const DEFAULT_VIDEO_ID = 'v3ejpQjaScg'

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string | null | undefined): string | null {
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

// Build YouTube embed URL with all required parameters
function buildYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId, // Required for loop to work
    controls: '0',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
    start: '0',
  })

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export default function Hero({ settings }: HeroProps) {
  const t = useTranslations('hero')
  const [isMounted, setIsMounted] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Memoize video ID extraction to prevent unnecessary recalculations
  const videoId = useMemo(() => {
    const heroVideoUrl = settings.hero_video_url || ''
    const extractedId = extractYouTubeId(heroVideoUrl)
    return extractedId || DEFAULT_VIDEO_ID
  }, [settings.hero_video_url])

  // Memoize embed URL to prevent unnecessary recalculations
  const embedUrl = useMemo(() => {
    return buildYouTubeEmbedUrl(videoId)
  }, [videoId])

  // Hydration fix: Only set mounted state once on client side
  // Lazy load video after initial page paint to improve LCP
  useEffect(() => {
    // Use requestIdleCallback or setTimeout to defer video loading
    if (typeof window !== 'undefined') {
      // Wait for initial paint to complete
      const timer = setTimeout(() => {
        setIsMounted(true)
      }, 100) // Small delay to allow initial content to render first

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* YouTube Video Background - Client-side only to prevent hydration errors */}
      {isMounted && !videoError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '177.77777778vh', // 16:9 aspect ratio width
              height: '100vh',
              minWidth: '100%',
              minHeight: '56.25vw', // 16:9 aspect ratio height
              transform: 'translate(-50%, -50%) scale(1.1)', // Scale up to cover without black bars
              pointerEvents: 'none',
            }}
          >
            <iframe
              src={embedUrl}
              title="Hero Background Video"
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: 'none',
              }}
              onError={() => {
                console.error('[Hero] YouTube iframe failed to load')
                setVideoError(true)
              }}
              onLoad={() => {
                console.log('[Hero] YouTube iframe loaded successfully')
              }}
            />
          </div>
        </div>
      )}

      {/* Fallback Background - Professional yacht-themed gradient */}
      {(!isMounted || videoError) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: 'linear-gradient(135deg, #002366 0%, #003d99 50%, #D4AF37 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: `
              linear-gradient(135deg, rgba(0, 35, 102, 0.95) 0%, rgba(0, 61, 153, 0.9) 50%, rgba(212, 175, 55, 0.85) 100%),
              url("data:image/svg+xml,%3Csvg width='1920' height='1080' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='yachtGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23002366;stop-opacity:0.9' /%3E%3Cstop offset='50%25' style='stop-color:%23003d99;stop-opacity:0.85' /%3E%3Cstop offset='100%25' style='stop-color:%23D4AF37;stop-opacity:0.8' /%3E%3C/linearGradient%3E%3Cpattern id='waves' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 100 Q50 80 100 100 T200 100' stroke='rgba(212,175,55,0.1)' fill='none' stroke-width='2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23yachtGrad)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23waves)'/%3E%3Ctext x='50%25' y='50%25' font-family='serif' font-size='120' fill='rgba(255,255,255,0.05)' text-anchor='middle' dominant-baseline='middle'%3E⚓%3C/text%3E%3C/svg%3E")
            `,
          }}
        />
      )}

      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
        <div className="max-w-4xl space-y-6">
          {/* Main Title */}
          <h1 className="font-serif text-5xl font-bold text-white md:text-7xl lg:text-8xl drop-shadow-lg">
            Experience Luxury at Sea
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white md:text-2xl lg:text-3xl drop-shadow-md">
            {settings.hero_subtitle || t('subtitle')}
          </p>

          {/* Description */}
          <div className="pt-4 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-md">
              We provide premium yacht charters in the Balearic Islands and Costa Blanca with professional crew and tailored experiences.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <a
              href="#fleet"
              className="inline-block rounded-lg bg-luxury-gold px-8 py-4 text-lg font-semibold text-luxury-blue transition-colors hover:bg-luxury-gold-dark shadow-lg"
            >
              {t('cta')}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg
          className="h-8 w-8 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
