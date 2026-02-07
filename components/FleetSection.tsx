'use client'

import { Link } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Ruler, Users, BedDouble, Ship, Sparkles, ChevronDown, ChevronUp, Calendar, Maximize2 } from 'lucide-react'
import type { Fleet } from '@/types/database'
import OptimizedImage from './OptimizedImage'
import TrustBar from './TrustBar'
import FleetCardSlider from './FleetCardSlider'
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
    <section id="fleet" className="pt-10 pb-12 md:pb-20 lg:pb-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-blue mb-3 md:mb-4 tracking-wide">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            {t('subtitle')}
          </p>
        </div>

        {/* Fleet Grid - Consistent gap and equal height cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {visibleYachts.map((yacht) => {
            try {
              const yachtExtras = Array.isArray(yacht.extras) ? yacht.extras : []
              // GOLDEN RULE: field_${locale} || field_en || ''
              // Use short_description for fleet card previews (not full description)
              const shortDescriptionKey = `short_description_${locale}` as keyof Fleet
              const localizedDescription = (yacht[shortDescriptionKey] as string) || 
                yacht.short_description_en ||
                yacht.short_description ||
                ''

              // Collect all images for the slider (main_image_url + gallery_images)
              const allImages: string[] = []
              
              // Helper to validate image URL
              const isValidImageUrl = (url: string | null | undefined): boolean => {
                if (!url || typeof url !== 'string' || url.trim() === '') return false
                const trimmed = url.trim()
                // Reject pure numbers or ID patterns
                if (/^\d+$/.test(trimmed) || /^image:\d+$/i.test(trimmed)) return false
                return true
              }
              
              // Add main image if valid
              if (yacht.main_image_url && isValidImageUrl(yacht.main_image_url)) {
                allImages.push(yacht.main_image_url)
              }
              
              // Add gallery images (avoid duplicates)
              const gallery = Array.isArray(yacht.gallery_images) ? yacht.gallery_images : []
              gallery.forEach((img: string) => {
                if (isValidImageUrl(img) && !allImages.includes(img)) {
                  allImages.push(img)
                }
              })
              
              const hasError = imageErrors[yacht.id]
              const hasImages = allImages.length > 0 && !hasError

              const baseStartingPrice = yacht.low_season_price || yacht.high_season_price || null
              const priceInfo = baseStartingPrice ? calculateEarlyBirdPrice(baseStartingPrice) : null
              const startingPrice = priceInfo?.discountedPrice || baseStartingPrice
              const showEarlyBird = priceInfo?.isEligible || false

              const isExtrasExpanded = expandedExtras[yacht.id] || false

              return (
                <div key={yacht.id} className="group relative overflow-hidden rounded-xl bg-white shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col h-full">
                  <div className="flex flex-col lg:flex-row flex-grow">
                    <div className="w-full lg:w-2/5 flex-shrink-0 relative">
                      {hasImages ? (
                        <>
                          <FleetCardSlider
                            images={allImages}
                            yachtName={yacht.name || 'Yacht'}
                            yachtId={yacht.id}
                            aspectRatio="4/3"
                            priority={false}
                            onImageError={() => setImageErrors(prev => ({ ...prev, [yacht.id]: true }))}
                          />
                          {yacht.recently_refitted && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-luxury-gold to-yellow-400 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-1.5 z-20">
                              <Sparkles className="w-3 h-3" /> Refit 2024
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="aspect-[4/3] lg:aspect-square bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
                          <Ship className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-3/5 flex flex-col p-5 lg:p-6 flex-grow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-luxury-blue mb-1">
                            {yacht.name}
                          </h3>
                          {startingPrice && (
                            <div className="flex flex-col gap-1">
                              {showEarlyBird ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg line-through text-gray-400">
                                    €{baseStartingPrice}
                                  </span>
                                  <span className="text-xl lg:text-2xl font-bold text-luxury-blue">
                                    €{startingPrice}
                                  </span>
                                  <span className="text-gray-600 text-xs">/{t('perDay')}</span>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl lg:text-2xl font-bold text-luxury-blue">
                                    €{startingPrice}
                                  </span>
                                  <span className="text-gray-600 text-xs">/{t('perDay')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3"><TrustBar variant="compact" /></div>
                      {localizedDescription && <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{localizedDescription}</p>}

                      {/* Icons - Centered grid layout */}
                      <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mb-4 pb-4 border-b border-gray-100 flex-wrap">
                        {yacht.year && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-xs text-gray-600">{yacht.year}</span></div>}
                        {yacht.cabins && <div className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-slate-400" /><span className="text-xs text-gray-600">{yacht.cabins} Cabins</span></div>}
                        {yacht.length && <div className="flex items-center gap-2"><Maximize2 className="w-4 h-4 text-slate-400" /><span className="text-xs text-gray-600">{yacht.length}m</span></div>}
                      </div>

                      {/* Buttons - Larger touch targets on mobile */}
                      <div className="mt-auto flex flex-col sm:flex-row gap-2 md:gap-3">
                        <Link href="/contact" className="flex-1 text-center rounded-lg bg-gradient-to-r from-luxury-gold to-yellow-400 text-luxury-blue py-3 md:py-2.5 font-bold text-sm md:text-base hover:shadow-md transition-all duration-300 tracking-wide min-h-[48px] flex items-center justify-center">
                          {t('getQuote')}
                        </Link>
                        {yacht.slug && (
                          <Link 
                            href={{ pathname: '/fleet/[slug]' as const, params: { slug: yacht.slug } }}
                            className="flex-1 text-center rounded-lg bg-luxury-blue text-white py-3 md:py-2.5 font-semibold text-sm md:text-base hover:bg-luxury-gold transition-colors duration-300 tracking-wide min-h-[48px] flex items-center justify-center"
                          >
                            {t('viewDetails')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            } catch (error) { return null }
          })}
        </div>
      </div>
    </section>
  )
}