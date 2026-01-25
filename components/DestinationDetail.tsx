'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText } from '@/lib/i18nUtils'
import { getImageUrl, getOptimizedImageUrl } from '@/lib/imageUtils'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import OptimizedImage from './OptimizedImage'
import InteractiveDestinationsMap from './InteractiveDestinationsMap'
import VideoModal from './VideoModal'
import SailingCalendarWidget from './SailingCalendarWidget'
import WeatherForecast from './WeatherForecast'
import TideMoonInfo from './TideMoonInfo'
import HighlightsGallery from './HighlightsGallery'
import HappyGuestsGallery from './HappyGuestsGallery'
import { ArrowLeft, Play, MapPin, Navigation, Calendar, Ship, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Destination } from '@/types/database'

interface DestinationDetailProps {
  destination: Destination
}

export default function DestinationDetail({ destination }: DestinationDetailProps) {
  const t = useTranslations('destinations')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const getDestinationCoordinates = (dest: Destination): { lat: number; lng: number } | null => {
    if ((dest as any).coordinates && typeof (dest as any).coordinates === 'object') {
      const coords = (dest as any).coordinates
      if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return { lat: coords.lat, lng: coords.lng }
      }
    }
    const destName = dest.name || dest.title || ''
    const coords: Record<string, { lat: number; lng: number }> = {
      'ibiza': { lat: 38.9067, lng: 1.4206 },
      'formentera': { lat: 38.7050, lng: 1.4500 },
      'mallorca': { lat: 39.5696, lng: 2.6502 },
      'palma': { lat: 39.5696, lng: 2.6502 },
      'menorca': { lat: 39.9375, lng: 4.0000 },
      'costa-blanca': { lat: 38.3452, lng: -0.4810 },
    }
    const key = destName.toLowerCase().replace(/\s+/g, '-')
    return coords[key] || coords[destName.toLowerCase()] || null
  }

  useEffect(() => {
    const generateContentIfNeeded = async () => {
      if (!destination.seasonal_data || Object.keys(destination.seasonal_data).length === 0) {
        setIsGenerating(true)
        try {
          const response = await fetch('/api/generate-destination-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destinationName: getDestinationName(destination),
              locale,
              region: destination.region,
              existingDescription: getLocalizedDescription(destination),
            }),
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setGeneratedContent(data.content)
            }
          }
        } catch (error) {
          console.error('[DestinationDetail] Error generating content:', error)
        } finally {
          setIsGenerating(false)
        }
      }
    }
    generateContentIfNeeded()
  }, [destination, locale])

  const getDestinationName = (dest: Destination): string => dest.name || dest.title || 'Destination'

  const getLocalizedDescription = (dest: Destination): string => {
    switch (locale) {
      case 'es': return dest.description_es || dest.description || ''
      case 'de': return dest.description_de || dest.description || ''
      default: return dest.description_en || dest.description || ''
    }
  }

  const getDestinationImage = (dest: Destination): string | null => {
    if (dest.image_urls && Array.isArray(dest.image_urls) && dest.image_urls.length > 0) {
      return dest.image_urls[0]
    }
    return null
  }

  const destinationName = getDestinationName(destination)
  const description = getLocalizedDescription(destination)
  const imageUrl = getDestinationImage(destination)
  const optimizedImageUrl = imageUrl ? getOptimizedImageUrl(imageUrl, { width: 1920, quality: 85, format: 'webp' }) : null
  const youtubeVideoId = destination.youtube_video_url ? extractYouTubeId(destination.youtube_video_url) : null
  const destinationSlug = destination.slug || destination.id
  const coordinates = getDestinationCoordinates(destination)
  const seasonalData = destination.seasonal_data
  const databaseHighlights = (destination as any).highlights_data