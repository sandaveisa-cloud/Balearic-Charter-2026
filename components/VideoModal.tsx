'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string | null
  title: string
}

export default function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && videoUrl) {
      const id = extractYouTubeId(videoUrl)
      setVideoId(id)
    }
  }, [isOpen, videoUrl])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !videoId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 text-white hover:text-luxury-gold transition-colors p-2 bg-black/50 rounded-full backdrop-blur-sm"
        aria-label="Close video"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Container */}
      <div
        className="relative w-full h-full max-w-7xl max-h-[90vh] m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl">
          <iframe
            src={buildYouTubeEmbedUrl(videoId, {
              autoplay: true,
              mute: true,
              loop: true,
              controls: true,
            })}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Video Title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h3 className="text-2xl font-serif font-bold text-white">{title}</h3>
        </div>
      </div>
    </div>
  )
}
