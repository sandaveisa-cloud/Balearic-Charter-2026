'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { getEmbedUrl } from '@/lib/imageUtils'

// Dynamically import react-player to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface HeroProps {
  settings: Record<string, string>
}

export default function Hero({ settings }: HeroProps) {
  const t = useTranslations('hero')
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [videoError, setVideoError] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const videoUrl = settings.hero_video_url || ''
  
  // Use getEmbedUrl to process the video URL
  const { embedUrl, isYouTube, isValid } = getEmbedUrl(videoUrl)
  
  const showVideo = videoUrl && isValid && !videoError
  
  console.log('[Hero] Video URL processing:', {
    raw: videoUrl,
    embedUrl,
    isYouTube,
    isValid,
    showVideo,
  })

  // Ensure we're on the client side for react-player
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    console.log('[Hero] Component mounted with settings:', settings)
    
    // Auto-play direct video URLs
    if (showVideo && !isYouTube && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('[Hero] Autoplay prevented:', error)
        setVideoError(true)
      })
    }
  }, [settings, showVideo, isYouTube])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Direct Video URL (not YouTube) */}
      {showVideo && !isYouTube && embedUrl && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            console.error('[Hero] Video element error:', {
              error: e,
              videoUrl: embedUrl,
            })
            setVideoError(true)
          }}
          onLoadedData={() => {
            console.log('[Hero] Video loaded successfully:', embedUrl)
            setVideoError(false)
          }}
        >
          <source src={embedUrl} type="video/mp4" />
        </video>
      )}

      {/* YouTube Video using react-player */}
      {showVideo && isYouTube && videoUrl && isClient && (
        <div className="absolute inset-0 h-full w-full pointer-events-none">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={true}
            loop={true}
            muted={true}
            controls={false}
            width="100%"
            height="100%"
            playsinline={true}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  rel: 0,
                  modestbranding: 1,
                  playsinline: 1,
                  loop: 1,
                  // Extract video ID for playlist parameter (required for loop)
                  playlist: (() => {
                    try {
                      if (videoUrl.includes('watch?v=')) {
                        const url = new URL(videoUrl)
                        return url.searchParams.get('v') || ''
                      } else if (videoUrl.includes('youtu.be/')) {
                        const match = videoUrl.match(/youtu\.be\/([^?&#]+)/)
                        return match ? match[1] : ''
                      } else if (videoUrl.includes('embed/')) {
                        const match = videoUrl.match(/embed\/([^?&#]+)/)
                        return match ? match[1] : ''
                      }
                      return ''
                    } catch {
                      return ''
                    }
                  })(),
                },
              },
            }}
            onError={(error) => {
              console.error('[Hero] ReactPlayer error:', error)
              setVideoError(true)
            }}
            onReady={() => {
              console.log('[Hero] ReactPlayer ready, YouTube video loaded successfully')
              setVideoError(false)
            }}
          />
        </div>
      )}

      {/* Fallback luxury yacht background when no video URL or video failed */}
      {(!videoUrl || !isValid || videoError) && (
        <div 
          className="absolute inset-0 h-full w-full"
          style={{
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

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
        <div className="max-w-4xl space-y-6">
          <h1 className="font-serif text-5xl font-bold text-white md:text-7xl lg:text-8xl">
            {settings.hero_title || t('title')}
          </h1>
          <p className="text-xl text-white md:text-2xl lg:text-3xl">
            {settings.hero_subtitle || t('subtitle')}
          </p>
          <div className="pt-8">
            <a
              href="#fleet"
              className="inline-block rounded-lg bg-luxury-gold px-8 py-4 text-lg font-semibold text-luxury-blue transition-colors hover:bg-luxury-gold-dark"
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
