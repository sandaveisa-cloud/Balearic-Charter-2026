'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { format } from 'date-fns'
import { useTranslations, useLocale } from 'next-intl'
import { Ruler, Users, BedDouble, Bath, Snowflake, Droplets, Zap, Ship, Flame, Waves, Table, Refrigerator, Anchor, Sparkles, Home, ChevronRight, Wind, ArrowLeft } from 'lucide-react'
import type { Fleet } from '@/types/database'
import { getOptimizedImageUrl, getThumbnailUrl } from '@/lib/imageUtils'
import { getFleetBySlugs } from '@/lib/data'
import { getDescriptionForLocaleWithTextColumns } from '@/lib/i18nUtils'
import BookingCalendar from './BookingCalendar'
import BookingForm from './BookingForm'
import SeasonalPriceCalculator, { type PriceBreakdown } from './SeasonalPriceCalculator'
import AddOnSelector from './AddOnSelector'
import BoatComparisonTable from './BoatComparisonTable'
import OptimizedImage from './OptimizedImage'
import StructuredData from './StructuredData'
import SocialProof from './SocialProof'
import TrustBar from './TrustBar'

interface FleetDetailProps {
  yacht: Fleet
}

export default function FleetDetail({ yacht }: FleetDetailProps) {
  const t = useTranslations('fleet')
  const tBreadcrumb = useTranslations('breadcrumb')
  const locale = useLocale()
  
  useEffect(() => {
    console.log('[FleetDetail] Component loaded with yacht:', {
      id: yacht.id,
      name: yacht.name,
      main_image_url: yacht.main_image_url,
      gallery_images_count: yacht.gallery_images?.length || 0,
    })
    
    // Load comparison boats (Lagoon 400 S and 450 F) if current boat is one of them
    const loadComparisonBoats = async () => {
      const comparisonSlugs: string[] = []
      const currentSlug = yacht.slug?.toLowerCase()
      
      // If viewing Lagoon 400 S, compare with 450 F
      if (currentSlug?.includes('400') || yacht.name?.toLowerCase().includes('400')) {
        comparisonSlugs.push('lagoon-450-f', 'lagoon-450f')
      }
      // If viewing Lagoon 450 F, compare with 400 S
      else if (currentSlug?.includes('450') || yacht.name?.toLowerCase().includes('450')) {
        comparisonSlugs.push('lagoon-400-s', 'lagoon-400s')
      }
      
      // Also try to find boats with similar names
      if (comparisonSlugs.length === 0) {
        // Try to find Lagoon boats for comparison
        const lagoonBoats = ['lagoon-400-s', 'lagoon-400s', 'lagoon-450-f', 'lagoon-450f']
        comparisonSlugs.push(...lagoonBoats.filter(slug => slug !== currentSlug))
      }
      
      if (comparisonSlugs.length > 0) {
        try {
          const boats = await getFleetBySlugs(comparisonSlugs)
          // Include current boat in comparison
          setComparisonBoats([yacht, ...boats].slice(0, 3)) // Max 3 boats
        } catch (error) {
          console.error('[FleetDetail] Error loading comparison boats:', error)
        }
      }
    }
    
    loadComparisonBoats()
  }, [yacht])
  
  // Get ship-specific translations based on slug
  const getShipTranslations = () => {
    const slug = yacht.slug?.toLowerCase()
    try {
      if (slug === 'simona') {
        const highlights = t.raw('ships.simona.highlights') as string[]
        return {
          headline: t('ships.simona.headline'),
          description: t('ships.simona.description'),
          highlights: Array.isArray(highlights) ? highlights : [],
          tagline: t('ships.simona.tagline'),
        }
      } else if (slug === 'wide-dream') {
        const highlights = t.raw('ships.wide-dream.highlights') as string[]
        return {
          headline: t('ships.wide-dream.headline'),
          description: t('ships.wide-dream.description'),
          highlights: Array.isArray(highlights) ? highlights : [],
          tagline: t('ships.wide-dream.tagline'),
        }
      }
    } catch (error) {
      // Translation not found, return null to use fallback
      console.log('[FleetDetail] Translation not found for slug:', slug, error)
    }
    return null
  }
  
  const shipTranslations = getShipTranslations()
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null)
  const [addOnsTotal, setAddOnsTotal] = useState(0)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [comparisonBoats, setComparisonBoats] = useState<Fleet[]>([])
  
  // Touch/swipe support for lightbox
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Combine main_image_url and gallery_images into a single array
  const allImages = (() => {
    const gallery = yacht.gallery_images || []
    const main = yacht.main_image_url
    if (main && !gallery.includes(main)) {
      return [main, ...gallery]
    }
    return gallery.length > 0 ? gallery : (main ? [main] : [])
  })()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, allImages.length])

  // Touch/swipe handlers for lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50 // Minimum distance for a swipe
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left - next image
        nextImage()
      } else {
        // Swiped right - previous image
        prevImage()
      }
    }
    
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery/Slider */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-gray-900">
        {allImages.length > 0 ? (
          <>
            {/* Main Image Slider */}
            <div className="relative h-full w-full">
              {allImages.map((imageUrl, index) => {
                const optimizedUrl = getOptimizedImageUrl(imageUrl, {
                  width: 1920,
                  quality: 85,
                  format: 'webp',
                })
                const isActive = index === currentImageIndex

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    {optimizedUrl && (
                      <OptimizedImage
                        src={optimizedUrl}
                        alt={`${yacht.name} - Image ${index + 1}`}
                        fill
                        sizes="100vw"
                        priority={index === 0}
                        loading={index === 0 ? undefined : "lazy"}
                        objectFit="cover"
                        aspectRatio="16/9"
                        onClick={() => setIsLightboxOpen(true)}
                        quality={85}
                        className="cursor-pointer"
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all shadow-lg"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all shadow-lg"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 w-2'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail Strip (on mobile/tablet) */}
            {allImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-20 px-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {allImages.map((imageUrl, index) => {
                    const thumbnailUrl = getThumbnailUrl(imageUrl)
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden transition-all relative ${
                          index === currentImageIndex ? 'border-white scale-110' : 'border-white/50 opacity-70'
                        }`}
                      >
                        {thumbnailUrl && (
                          <OptimizedImage
                            src={thumbnailUrl}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                        sizes="80px"
                        objectFit="cover"
                        aspectRatio="5/4"
                        loading="lazy"
                        quality={70}
                        onClick={() => setCurrentImageIndex(index)}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center">
            <span className="text-white text-4xl md:text-6xl font-serif text-center px-4">{yacht.name}</span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        
        {/* Title Overlay */}
        <div className="absolute inset-0 flex items-end pb-12 pointer-events-none">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">{yacht.name}</h1>
            {yacht.year && (
              <p className="text-lg md:text-xl text-luxury-gold">{yacht.year} • {yacht.length}m</p>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal with Touch Support */}
      {isLightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 md:p-4"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 bg-black/50 rounded-full p-2 transition-all"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div 
            className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const lightboxImageUrl = getOptimizedImageUrl(allImages[currentImageIndex], {
                width: 2048,
                quality: 90,
                format: 'webp',
              })
              return lightboxImageUrl ? (
                <div className="relative w-full h-full max-h-[90vh]" style={{ aspectRatio: 'auto' }}>
                  <OptimizedImage
                    src={lightboxImageUrl}
                    alt={`${yacht.name} - Image ${currentImageIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
                    objectFit="contain"
                    priority
                    quality={90}
                    onClick={() => {}}
                  />
                </div>
              ) : null
            })()}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full transition-all shadow-lg z-10 touch-manipulation"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full transition-all shadow-lg z-10 touch-manipulation"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link 
                href={`/${locale}`}
                className="flex items-center hover:text-luxury-blue transition-colors"
              >
                <Home className="w-4 h-4 mr-1" />
                <span>{tBreadcrumb('home')}</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <a 
                href={`/${locale}#fleet`}
                className="hover:text-luxury-blue transition-colors"
              >
                {tBreadcrumb('fleet')}
              </a>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="text-luxury-blue font-semibold" aria-current="page">
              {yacht.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trust Bar - Full version for detail page */}
            <TrustBar variant="full" />
            
            {/* Social Proof & Trust Block */}
            <SocialProof />
            
            {/* Description */}
            <section className="space-y-4">
              <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">About {yacht.name}</h2>
              
              {/* Ship-specific content from translations */}
              {shipTranslations ? (
                <div className="space-y-6">
                  {/* Headline */}
                  <h3 className="font-serif text-2xl font-semibold text-luxury-blue">
                    {shipTranslations.headline}
                  </h3>
                  
                  {/* Main Description */}
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {shipTranslations.description}
                  </p>
                  
                  {/* Key Highlights */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xl text-gray-800">Key Highlights:</h4>
                    <ul className="space-y-3 list-none">
                      {shipTranslations.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-luxury-blue mt-2"></span>
                          <span className="text-gray-700 leading-relaxed">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Closing Tagline */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-luxury-blue/5 to-luxury-gold/5 border-l-4 border-luxury-blue rounded-lg">
                    <p className="text-lg italic text-gray-800 font-serif">
                      {shipTranslations.tagline}
                    </p>
                  </div>
                </div>
              ) : (
                /* Fallback to database description with i18n support */
                (() => {
                  const description = getDescriptionForLocaleWithTextColumns(yacht, locale as 'en' | 'es' | 'de')
                  return description ? (
                    <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                      {description}
                    </div>
                  ) : null
                })()
              )}
            </section>

            {/* Technical Specifications Table */}
            <section>
              <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-6">{t('technicalSpecs', { default: 'Technical Specifications' })}</h2>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {/* Year - Always from database, no hardcoded values */}
                    {yacht.year && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700 w-1/3">Year Built</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.year}</td>
                      </tr>
                    )}
                    {yacht.length && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700 w-1/3">Length</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.length}m</td>
                      </tr>
                    )}
                    {/* Use specs field first, fallback to technical_specs */}
                    {(() => {
                      const specs = yacht.specs || yacht.technical_specs
                      return (
                        <>
                          {specs?.beam && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-700">Beam</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {specs.beam}{typeof specs.beam === 'number' ? 'm' : ''}
                              </td>
                            </tr>
                          )}
                          {specs?.draft && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-700">Draft</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {specs.draft}{typeof specs.draft === 'number' ? 'm' : ''}
                              </td>
                            </tr>
                          )}
                          {(specs?.engine || specs?.engines) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-700">Engines</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {specs.engine || specs.engines}
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })()}
                    {yacht.capacity && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Capacity</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.capacity} Guests</td>
                      </tr>
                    )}
                    {yacht.cabins && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Cabins</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.cabins}</td>
                      </tr>
                    )}
                    {yacht.toilets && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Toilets</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.toilets}</td>
                      </tr>
                    )}
                    {yacht.technical_specs?.cruising_speed && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Cruising Speed</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.technical_specs.cruising_speed}</td>
                      </tr>
                    )}
                    {yacht.technical_specs?.max_speed && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Max Speed</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.technical_specs.max_speed}</td>
                      </tr>
                    )}
                    {(() => {
                      const specs = yacht.specs || yacht.technical_specs
                      return (
                        <>
                          {(specs?.fuel_tank || specs?.fuel_capacity) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-700">Fuel Capacity</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {specs.fuel_tank || specs.fuel_capacity}
                              </td>
                            </tr>
                          )}
                          {(specs?.water_tank || specs?.water_capacity) && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-700">Water Capacity</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {specs.water_tank || specs.water_capacity}
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })()}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Amenities Section */}
            {yacht.amenities && Object.keys(yacht.amenities).filter(key => yacht.amenities?.[key]).length > 0 && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-6">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'ac', label: 'Air Conditioning', icon: Snowflake },
                    { key: 'watermaker', label: 'Watermaker', icon: Droplets },
                    { key: 'generator', label: 'Generator', icon: Zap },
                    { key: 'flybridge', label: 'Flybridge', icon: Ship },
                    { key: 'heating', label: 'Heating', icon: Flame },
                    { key: 'teak_deck', label: 'Teak Deck', icon: Waves },
                    { key: 'full_batten', label: 'Full Batten', icon: Ship },
                    { key: 'folding_table', label: 'Folding Table', icon: Table },
                    { key: 'fridge', label: 'Refrigerator', icon: Refrigerator },
                    { key: 'dinghy', label: 'Dinghy', icon: Anchor },
                    { key: 'water_entertainment', label: 'Water Entertainment', icon: Sparkles },
                  ]
                    .filter(({ key }) => yacht.amenities?.[key as keyof typeof yacht.amenities])
                    .map(({ key, label, icon: Icon }) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all"
                      >
                        <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Features & Extras Section */}
            {yacht.extras && yacht.extras.length > 0 && (
              <section className="mt-8">
                <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-6">Features & Extras</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {yacht.extras.map((extra, index) => {
                    // Map specific extras to icons and translations
                    const getExtraConfig = (extraName: string) => {
                      const name = extraName.toLowerCase().trim()
                      
                      // Specific high-end water toys
                      if (name === 'efoil' || name.includes('efoil') || name.includes('fliteboard')) {
                        return { icon: Zap, translationKey: 'efoil' }
                      }
                      if (name === 'snorkel' || name.includes('snorkel')) {
                        return { icon: Waves, translationKey: 'snorkel' }
                      }
                      if (name === 'scooter' || name.includes('scooter') || name.includes('underwater')) {
                        return { icon: Wind, translationKey: 'scooter' }
                      }
                      if (name === 'sup' || name.includes('paddle') || name.includes('stand up')) {
                        return { icon: Anchor, translationKey: 'sup' }
                      }
                      
                      // Fallback for other extras
                      if (name.includes('wifi') || name.includes('wi-fi')) return { icon: Zap, translationKey: null }
                      if (name.includes('towel')) return { icon: Sparkles, translationKey: null }
                      if (name.includes('audio') || name.includes('sound') || name.includes('music')) return { icon: Sparkles, translationKey: null }
                      if (name.includes('kayak')) return { icon: Anchor, translationKey: null }
                      if (name.includes('fishing')) return { icon: Anchor, translationKey: null }
                      if (name.includes('beach')) return { icon: Waves, translationKey: null }
                      
                      return { icon: Sparkles, translationKey: null }
                    }
                    
                    const config = getExtraConfig(extra)
                    const Icon = config.icon
                    const displayText = config.translationKey 
                      ? t(`extras.${config.translationKey}`, { default: extra })
                      : extra
                    
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-luxury-blue/5 to-luxury-gold/5 border border-luxury-blue/20 rounded-lg hover:border-luxury-gold hover:shadow-lg transition-all text-center"
                      >
                        <Icon className="w-8 h-8 text-luxury-gold flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 leading-tight">{displayText}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Boat Comparison Table */}
            {comparisonBoats.length > 1 && (
              <section className="mt-12">
                <BoatComparisonTable boats={comparisonBoats} />
              </section>
            )}

            {/* Refit Details Section */}
            {yacht.recently_refitted && yacht.refit_details && (
              <section className="mt-12">
                <div className="bg-gradient-to-r from-luxury-gold/10 to-yellow-400/10 border-2 border-luxury-gold rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-luxury-gold" />
                    <h2 className="font-serif text-2xl font-bold text-luxury-blue">Recently Refitted</h2>
                    <span className="px-3 py-1 bg-gradient-to-r from-luxury-gold to-yellow-400 text-white rounded-full text-sm font-bold">
                      2024
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {yacht.refit_details}
                  </p>
                </div>
              </section>
            )}

          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Calendar - Date Selection */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="font-serif text-xl font-bold text-luxury-blue mb-4">{t('selectDates', { default: 'Select Your Charter Dates' })}</h3>
                <BookingCalendar
                  yachtId={yacht.id}
                  onDateSelect={(start, end) => {
                    setSelectedStartDate(start)
                    setSelectedEndDate(end)
                  }}
                />
              </div>

              {/* Price Summary Widget - Updates Instantly */}
              <SeasonalPriceCalculator
                lowSeasonPrice={yacht.low_season_price}
                mediumSeasonPrice={yacht.medium_season_price}
                highSeasonPrice={yacht.high_season_price}
                currency={yacht.currency || 'EUR'}
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                apaPercentage={yacht.apa_percentage}
                crewServiceFee={yacht.crew_service_fee}
                cleaningFee={yacht.cleaning_fee}
                taxPercentage={yacht.tax_percentage}
                onBreakdownChange={setPriceBreakdown}
              />

              {/* Add-ons Selector - Shows after dates are selected */}
              {priceBreakdown && priceBreakdown.totalEstimate > 0 && (
                <AddOnSelector
                  basePrice={priceBreakdown.totalEstimate}
                  currency={yacht.currency || 'EUR'}
                  onTotalChange={(total, addOns) => {
                    setAddOnsTotal(total)
                    setSelectedAddOns(addOns)
                  }}
                  className="w-full"
                />
              )}

              {/* Booking Form */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="font-serif text-xl font-bold text-luxury-blue mb-4">Send Booking Inquiry</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Fill out the form below and we'll get back to you with a confirmed quote.
                </p>
                <BookingForm
                  yachtId={yacht.id}
                  yachtName={yacht.name}
                  startDate={selectedStartDate}
                  endDate={selectedEndDate}
                  priceBreakdown={priceBreakdown}
                  currency={yacht.currency || 'EUR'}
                  taxPercentage={yacht.tax_percentage}
                  apaPercentage={yacht.apa_percentage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Back Navigation Section - Prominent button before footer */}
        <div className="mt-20 mb-12 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-luxury-blue via-luxury-gold to-luxury-blue text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold via-luxury-blue to-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>

        {/* Return to Overview Section */}
        <div className="mt-8 mb-12 bg-gradient-to-br from-luxury-blue/5 via-luxury-gold/5 to-luxury-blue/5 rounded-2xl p-8 md:p-12 border border-luxury-gold/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue mb-4">
              {tBreadcrumb('discoverMore')}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {tBreadcrumb('discoverMoreDescription')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-gold text-luxury-blue font-bold text-lg rounded-lg hover:bg-luxury-blue hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span>{tBreadcrumb('backToHome')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
