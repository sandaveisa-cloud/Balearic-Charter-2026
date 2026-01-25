'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
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
import { ArrowLeft, Play, MapPin, Navigation, Ship, Sparkles } from 'lucide-react'
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
    const destName = (dest.name || dest.title || '').toLowerCase().replace(/\s+/g, '-')
    const coords: Record<string, { lat: number; lng: number }> = {
      'ibiza': { lat: 38.9067, lng: 1.4206 },
      'formentera': { lat: 38.7050, lng: 1.4500 },
      'mallorca': { lat: 39.5696, lng: 2.6502 },
      'palma': { lat: 39.5696, lng: 2.6502 },
      'menorca': { lat: 39.9375, lng: 4.0000 },
      'costa-blanca': { lat: 38.3452, lng: -0.4810 },
    }
    return coords[destName] || null
  }

  useEffect(() => {
    const generateContentIfNeeded = async () => {
      if (!destination.seasonal_