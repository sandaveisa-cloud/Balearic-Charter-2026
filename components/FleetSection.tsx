'use client'

import { Link } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Ruler, Users, BedDouble, Ship, Sparkles, ChevronDown, ChevronUp, Calendar, Maximize2 } from 'lucide-react'
import type { Fleet } from '@/types/database'
import OptimizedImage from './OptimizedImage'
import TrustBar from './TrustBar'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { calculateEarlyBirdPrice, formatEarlyBirdDeadline } from '@/lib/earlyBirdDiscount'

interface FleetSectionProps {
  fleet: Fleet[]
}

export default function FleetSection({ fleet }: FleetSectionProps) {
  const t = useTranslations('fleet')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [expandedExtras, setExpandedExtras] = useState<Record<string, boolean>>({})

  // Debug logging
  useEffect(() => {
    console.log('[FleetSection] Fleet data received:', {
      count: fleet?.length || 0,
    })
  }, [fleet])

  const visibleYachts = (fleet || []).filter(yacht => {
    if (!yacht || !yacht.id) return false
    if (yacht.is_active === false) return false
    const showOnHome = (yacht as any)?.show_on_home
    if (showOnHome !== undefined && showOnHome !== true) return false
    return true
  })

  if (!fleet || fleet.length === 0 || visibleYachts.length === 0) {
    /* SAMAZINĀTS pt-20 uz pt-10 */
    return (
      <section id="fleet" className="pt-10 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
              {t('title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Ship className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">
              Our luxury fleet is being updated. Please check back soon.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    /* SAMAZINĀTS pt-20 uz pt-10, lai noņemtu balto tukšumu */
    <section id="fleet" className="pt-10 pb-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {visibleYachts.map((yacht) => {
            try {
              const yachtExtras = Array.isArray(yacht.extras) ? yacht.extras : []
              const descriptionKey = `description_${locale}` as keyof Fleet
              const localizedDescription = (yacht[descriptionKey] as string) || yacht.description_en || yacht.description || ''

              const imageUrl = getOptimizedImageUrl(yacht.main_image_url, {
                width: 1200,
                quality: 80,
                format: 'webp',
              })
              const hasError = imageErrors[yacht.id]
              const showImage = imageUrl && !hasError

              const baseStartingPrice = yacht.low_season_price || yacht.high_season_price || null
              const priceInfo = baseStartingPrice ? calculateEarlyBirdPrice(baseStartingPrice) : null
              const startingPrice = priceInfo?.discountedPrice || baseStartingPrice
              const showEarlyBird = priceInfo?.isEligible || false

              const isExtrasExpanded = expandedExtras[yacht.id] || false

              return (
                <div key={yacht.id} className="group relative overflow-hidden rounded-xl bg-white shadow-lg border border-gray-200 transition-all hover:shadow-xl">
                  <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-2/5 flex-shrink-0">
                      {showImage ? (
                        <div className="aspect-[4/3] lg:aspect-square overflow-hidden relative">
                          <OptimizedImage
                            src={imageUrl}
                            alt={yacht.name || 'Yacht'}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            objectFit="cover"
                            onError={() => setImageErrors(prev => ({ ...prev, [yacht.id]: true }))}
                          />
                          {yacht.recently_refitted && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-luxury-gold to-yellow-400 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-1.5 z-10">
                              <Sparkles className="w-3 h-3" /> Refit 2024
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[4/3] lg:aspect-square bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
                          <Ship className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-3/5 flex flex-col p-5 lg:p-6">
                      <div className="flex items-start justify-between mb-3">