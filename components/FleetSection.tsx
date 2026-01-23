'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Ruler, Users, BedDouble, Ship, Sparkles, ChevronDown, ChevronUp, Calendar, Maximize2 } from 'lucide-react'
import type { Fleet } from '@/types/database'
import OptimizedImage from './OptimizedImage'
import TrustBar from './TrustBar'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { getDescriptionForLocaleWithTextColumns } from '@/lib/i18nUtils'
import { calculateEarlyBirdPrice, formatEarlyBirdDeadline, isEarlyBirdEligible } from '@/lib/earlyBirdDiscount'

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
      filtered: fleet?.filter(y => {
        const showOnHome = (y as any)?.show_on_home
        return y?.is_active !== false && (showOnHome === undefined || showOnHome === true)
      }).length || 0
    })
  }, [fleet])

  // Filter yachts: show_on_home is true (or undefined/not set), and is_active is true
  const visibleYachts = (fleet || []).filter(yacht => {
    if (!yacht || !yacht.id) return false
    if (yacht.is_active === false) return false
    const showOnHome = (yacht as any)?.show_on_home
    // If show_on_home exists, it must be true; if undefined, allow it
    if (showOnHome !== undefined && showOnHome !== true) return false
    return true
  })

  // Safety check: Return null if no yachts to display
  if (!fleet || fleet.length === 0 || visibleYachts.length === 0) {
    return null
  }

  return (
    <section id="fleet" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading yachts...</p>
          </div>
        )}

        {/* Compact Grid: 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {visibleYachts.map((yacht) => {
            try {
              // Safe data handling: Check if extras exists before mapping
              const yachtExtras = Array.isArray(yacht.extras) ? yacht.extras : []
              
              // Safe data handling: Check if specs exists
              const specs = yacht.specs || yacht.technical_specs || null

              // Localized description: Use description_${locale} with fallback to description_en
              const descriptionKey = `description_${locale}` as keyof Fleet
              const localizedDescription = 
                (yacht[descriptionKey] as string) || 
                yacht.description_en || 
                yacht.description || 
                ''

              const imageUrl = getOptimizedImageUrl(yacht.main_image_url, {
                width: 1200,
                quality: 80,
                format: 'webp',
              })
              const hasError = imageErrors[yacht.id]
              const showImage = imageUrl && !hasError

              // Get starting price and apply Early Bird discount
              const baseStartingPrice = yacht.low_season_price || yacht.high_season_price || null
              const priceInfo = baseStartingPrice 
                ? calculateEarlyBirdPrice(baseStartingPrice)
                : null
              const startingPrice = priceInfo?.discountedPrice || baseStartingPrice
              const showEarlyBird = priceInfo?.isEligible || false

              // Toggle extras visibility
              const toggleExtras = () => {
                setExpandedExtras(prev => ({
                  ...prev,
                  [yacht.id]: !prev[yacht.id]
                }))
              }

              const isExtrasExpanded = expandedExtras[yacht.id] || false

              return (
                <div
                  key={yacht.id}
                  className="group relative overflow-hidden rounded-xl bg-white shadow-lg border border-gray-200 transition-all hover:shadow-xl"
                >
                  {/* Horizontal Layout: Image Left, Content Right on Desktop */}
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section - Left on Desktop */}
                    <div className="w-full lg:w-2/5 flex-shrink-0">
                      {showImage ? (
                        <div className="aspect-[4/3] lg:aspect-square overflow-hidden relative">
                          <OptimizedImage
                            src={imageUrl}
                            alt={yacht.name || 'Yacht'}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            objectFit="cover"
                            aspectRatio="4/3"
                            loading="lazy"
                            quality={80}
                            onError={() => {
                              setImageErrors(prev => ({ ...prev, [yacht.id]: true }))
                            }}
                          />
                          {/* Refit Badge */}
                          {yacht.recently_refitted && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-luxury-gold to-yellow-400 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-1.5 z-10">
                              <Sparkles className="w-3 h-3" />
                              Refit 2024
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[4/3] lg:aspect-square bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
                          <div className="text-center text-white">
                            <Ship className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">{yacht.name || 'Yacht'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section - Right on Desktop */}
                    <div className="w-full lg:w-3/5 flex flex-col p-5 lg:p-6">
                      {/* Header: Title, Year, and Price */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-serif text-2xl lg:text-3xl font-bold text-luxury-blue">
                              {yacht.name || 'Yacht'}
                            </h3>
                            {yacht.year && (
                              <span className="text-luxury-gold font-semibold text-lg">{yacht.year}</span>
                            )}
                          </div>
                          {startingPrice && (
                            <div className="flex flex-col gap-1">
                              {showEarlyBird && baseStartingPrice ? (
                                <>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-gray-600 text-xs">{t('from')} </span>
                                    <span className="text-lg line-through text-gray-400">
                                      {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: yacht.currency || 'EUR',
                                        minimumFractionDigits: 0,
                                      }).format(baseStartingPrice)}
                                    </span>
                                    <span className="text-xl lg:text-2xl font-bold text-luxury-blue">
                                      {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: yacht.currency || 'EUR',
                                        minimumFractionDigits: 0,
                                      }).format(startingPrice)}
                                    </span>
                                    <span className="text-gray-600 text-xs">/{t('perDay')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-luxury-gold to-yellow-400 text-white text-xs font-bold rounded-full">
                                      Early Bird: -10%
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      until {formatEarlyBirdDeadline(locale)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-green-600 font-medium mt-0.5">
                                    ✓ Best Price Guaranteed - Direct Booking Discount applied
                                  </p>
                                </>
                              ) : (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-gray-600 text-xs">{t('from')} </span>
                                  <span className="text-xl lg:text-2xl font-bold text-luxury-blue">
                                    {new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: yacht.currency || 'EUR',
                                      minimumFractionDigits: 0,
                                    }).format(startingPrice)}
                                  </span>
                                  <span className="text-gray-600 text-xs">/{t('perDay')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Trust Bar - Compact */}
                      <div className="mb-3">
                        <TrustBar variant="compact" />
                      </div>

                      {/* Description - Single line */}
                      {localizedDescription && (
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                          {localizedDescription}
                        </p>
                      )}

                      {/* Compact Specs: Single Horizontal Row with Icons */}
                      <div className="flex items-center justify-between gap-6 mb-4 pb-4 border-b border-gray-100">
                        {yacht.year && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-[18px] h-[18px] text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600">Built {yacht.year}</span>
                          </div>
                        )}
                        {yacht.cabins && (
                          <div className="flex items-center gap-2">
                            <BedDouble className="w-[18px] h-[18px] text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{yacht.cabins} {yacht.cabins === 1 ? 'Cabin' : 'Cabins'}</span>
                          </div>
                        )}
                        {yacht.length && (
                          <div className="flex items-center gap-2">
                            <Maximize2 className="w-[18px] h-[18px] text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{yacht.length}m</span>
                          </div>
                        )}
                      </div>

                      {/* Collapsible Extras */}
                      {yachtExtras && yachtExtras.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={toggleExtras}
                            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-luxury-blue transition-colors w-full"
                          >
                            <span className="uppercase tracking-wide">
                              Extras Included ({yachtExtras.length})
                            </span>
                            {isExtrasExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                          {isExtrasExpanded && (
                            <ul className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                              {yachtExtras.map((extra, idx) => {
                                // Try to translate the extra using fleet.extras.{key} path
                                // If extra is a key like "efoil", "snorkel", etc., use translation
                                // Otherwise, display the extra as-is
                                const extraKey = typeof extra === 'string' ? extra.toLowerCase().trim() : String(extra);
                                let translatedExtra = extra;
                                
                                try {
                                  // Try to get translation for fleet.extras.{key}
                                  const translationKey = `extras.${extraKey}`;
                                  const translation = t(translationKey as any);
                                  // Check if translation was found (not the same as the key path)
                                  if (translation && translation !== `fleet.${translationKey}`) {
                                    translatedExtra = translation;
                                  }
                                } catch (error) {
                                  // If translation fails, use original value
                                  translatedExtra = extra;
                                }
                                
                                return (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                    <span className="text-luxury-gold mt-0.5">•</span>
                                    <span>{translatedExtra}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Thin Separator Line */}
                      <div className="mb-4 border-t border-gray-200"></div>

                      {/* Unified Bottom: Price (if not shown above) and View Details Button */}
                      <div className="mt-auto flex items-center justify-between gap-4">
                        {!startingPrice && (
                          <div className="flex items-baseline gap-1">
                            <span className="text-gray-600 text-xs">{t('from')} </span>
                            <span className="text-xl font-bold text-luxury-blue">
                              {yacht.low_season_price ? 
                                new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: yacht.currency || 'EUR',
                                  minimumFractionDigits: 0,
                                }).format(yacht.low_season_price) :
                                yacht.high_season_price ?
                                new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: yacht.currency || 'EUR',
                                  minimumFractionDigits: 0,
                                }).format(yacht.high_season_price) :
                                '—'
                              }
                            </span>
                            <span className="text-gray-600 text-xs">/{t('perDay')}</span>
                          </div>
                        )}
                        <Link
                          href={`/${locale}/fleet/${yacht.slug}`}
                          className="ml-auto rounded-lg bg-luxury-blue px-6 py-2.5 text-white font-semibold text-sm transition-colors hover:bg-luxury-gold hover:text-luxury-blue whitespace-nowrap"
                        >
                          {t('viewDetails')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            } catch (error) {
              console.error('[FleetSection] Error rendering yacht card:', yacht?.id, error)
              return null
            }
          })}
        </div>
      </div>
    </section>
  )
}
