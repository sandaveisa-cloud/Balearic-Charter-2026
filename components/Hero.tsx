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

  // Attēla loģika: prioritāte ir failam no public mapes, lai izvairītos no kļūdām
  const bgImage = '/images/hero-sunset-view.jpg'

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-luxury-blue">
      
      {/* 1. SLĀNIS: Fona attēls (LCP optimizēts) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Balearic Yacht Charters"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover"
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

      {/* 3. SLĀNIS: Overlay */}
      <div className="absolute inset-0 bg-black/40 z-1" />

      {/* 4. SLĀNIS: Saturs (Dinamiski teksti no JSON failiem) */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center pb-12">
        <div className="max-w-4xl space-y-6">
          <h1 className="font-serif text-5xl font-bold text-white md:text-7xl lg:text-8xl drop-shadow-lg">
            {t('title')}
          </h1>

          <p className="text-xl text-white md:text-2xl lg:text-3xl drop-shadow-md">
            {t('subtitle')}
          </p>

          <div className="pt-4 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-md">
              {/* Šis teksts tagad nāk no tulkojumiem, ja tur ir pievienots, vai arī vari to definēt šeit */}
              Premium yacht charters in the Balearic Islands with professional crew and tailored luxury experiences.
            </p>
          </div>

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

      {/* Bulta uz leju */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg className="h-8 w-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}