'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Ruler, Users, Home, Bath, Wind, Droplets, Zap, Ship, Flame, Waves, Table, Refrigerator, Anchor, Sparkles } from 'lucide-react'
import type { Fleet } from '@/types/database'
import { getOptimizedImageUrl, getThumbnailUrl } from '@/lib/imageUtils'
import BookingCalendar from './BookingCalendar'
import BookingForm from './BookingForm'
import SeasonalPriceCalculator, { type PriceBreakdown } from './SeasonalPriceCalculator'

interface FleetDetailProps {
  yacht: Fleet
}

export default function FleetDetail({ yacht }: FleetDetailProps) {
  useEffect(() => {
    console.log('[FleetDetail] Component loaded with yacht:', {
      id: yacht.id,
      name: yacht.name,
      main_image_url: yacht.main_image_url,
      gallery_images_count: yacht.gallery_images?.length || 0,
    })
  }, [yacht])
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null)

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
                      <Image
                        src={optimizedUrl}
                        alt={`${yacht.name} - Image ${index + 1}`}
                        fill
                        sizes="100vw"
                        className="object-cover cursor-pointer"
                        priority={index === 0}
                        onClick={() => setIsLightboxOpen(true)}
                        onError={() => {
                          console.error('[FleetDetail] Image failed to load:', {
                            yachtId: yacht.id,
                            index,
                            originalUrl: imageUrl,
                            resolvedUrl: optimizedUrl,
                          })
                        }}
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
                          <Image
                            src={thumbnailUrl}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                            loading="lazy"
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

      {/* Lightbox Modal */}
      {isLightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const lightboxImageUrl = getOptimizedImageUrl(allImages[currentImageIndex], {
                width: 2048,
                quality: 90,
                format: 'webp',
              })
              return lightboxImageUrl ? (
                <div className="relative w-full h-[90vh]">
                  <Image
                    src={lightboxImageUrl}
                    alt={`${yacht.name} - Image ${currentImageIndex + 1}`}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-contain"
                    priority
                  />
                </div>
              ) : null
            })()}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">About {yacht.name}</h2>
              {yacht.description && (
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {yacht.description}
                </div>
              )}
            </section>

            {/* Technical Specifications Table */}
            <section>
              <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-6">Technical Specifications</h2>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {yacht.length && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700 w-1/3">Length</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.length}m</td>
                      </tr>
                    )}
                    {yacht.technical_specs?.beam && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Beam</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.technical_specs.beam}</td>
                      </tr>
                    )}
                    {yacht.technical_specs?.draft && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Draft</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.technical_specs.draft}</td>
                      </tr>
                    )}
                    {yacht.technical_specs?.engines && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Engines</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.technical_specs.engines}</td>
                      </tr>
                    )}
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
                    {yacht.technical_specs?.fuel_capacity && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Fuel Capacity</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.technical_specs.fuel_capacity}</td>
                      </tr>
                    )}
                    {yacht.technical_specs?.water_capacity && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">Water Capacity</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{yacht.technical_specs.water_capacity}</td>
                      </tr>
                    )}
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
                    { key: 'ac', label: 'Air Conditioning', icon: Wind },
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
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-luxury-blue hover:shadow-md transition-all"
                      >
                        <Icon className="w-6 h-6 text-luxury-blue flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Calendar - Date Selection */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="font-serif text-xl font-bold text-luxury-blue mb-4">Select Your Charter Dates</h3>
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
      </div>
    </div>
  )
}
