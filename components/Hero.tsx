'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface HeroProps {
  settings: Record<string, string>
}

// Noklusējuma YouTube video ID
const DEFAULT_VIDEO_ID = 'v3ejpQjaScg'

// Funkcija YouTube ID izgūšanai
function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim()
  const patterns = [
    /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

// YouTube embed URL būvēšana
function buildYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1', mute: '1', loop: '1', playlist: videoId,
    controls: '0', rel: '0', showinfo: '0', iv_load_policy: '3',
    modestbranding: '1', playsinline: '1', enablejsapi: '1', start: '0',
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export default function Hero({ settings }: HeroProps) {
  const t = useTranslations('hero')
  const [isMounted, setIsMounted] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const videoId = useMemo(() => {
    const heroVideoUrl = settings.hero_video_url || ''
    const extractedId = extractYouTubeId(heroVideoUrl)
    return extractedId || DEFAULT_VIDEO_ID
  }, [settings.hero_video_url])

  const embedUrl = useMemo(() => buildYouTubeEmbedUrl(videoId), [videoId])

  // Professional yacht/Mediterranean landscape background - no people, clean wide shot
  // High-res panoramic view of Balearic coastline or yacht at sea
  const bgImage = settings.hero_image_url || '/images/formentera-beach.jpg'

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative h-[85vh] min-h-[500px] md:min-h-[600px] w-full overflow-hidden bg-luxury-blue">
      
      {/* 1. SLĀNIS: Fona attēls (LCP optimizēts) - Centered on mobile */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Balearic Yacht Charters"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* 2. SLĀNIS: Video pārklājums */}
      {isMounted && !videoError && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-0 transition-opacity duration-1000 ease-in" style={{ opacity: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '177.77777778vh', height: '100vh', minWidth: '100%', minHeight: '56.25vw', transform: 'translate(-50%, -50%) scale(1.1)' }}>
            <iframe
              src={embedUrl}
              title="Hero Background Video"
              allow="autoplay; encrypted-media"
              className="absolute top-0 left-0 w-full h-full border-none"
              onError={() => setVideoError(true)}
            />
          </div>
        </div>
      )}

      {/* 3. SLĀNIS: Overlay - Darker on mobile for better text readability */}
      <div className="absolute inset-0 bg-black/50 md:bg-black/40 z-1" />

      {/* 4. SLĀNIS: Saturs (Dinamiski teksti no JSON failiem) - Centered on all devices */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 md:px-6 text-center pb-8 md:pb-12">
        <div className="max-w-4xl space-y-4 md:space-y-6 w-full">
          {/* Headline with premium typography - Responsive font sizes */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white drop-shadow-lg tracking-[0.05em] leading-tight px-2">
            {t('title')}
          </h1>

          {/* Subheadline with lighter weight and refined spacing - Responsive */}
          <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/95 drop-shadow-md font-light leading-relaxed tracking-wide max-w-3xl mx-auto px-2">
            {t('subtitle')}
          </p>

          {/* Premium CTA Button - Larger touch target on mobile */}
          <div className="pt-6 md:pt-8">
            <a
              href="#fleet"
              className="inline-block rounded-lg bg-luxury-gold px-8 md:px-12 py-4 md:py-5 text-base md:text-lg font-semibold text-luxury-blue transition-all duration-300 hover:bg-luxury-gold-dark shadow-lg hover:shadow-xl hover:scale-105 tracking-wide min-h-[48px] md:min-h-[56px] flex items-center justify-center"
            >
              {t('cta')}
            </a>
          </div>
        </div>
      </div>

      {/* Bulta uz leju */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg className="h-8 w-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}