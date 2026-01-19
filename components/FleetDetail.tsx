'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { Fleet } from '@/types/database'
import { getImageUrl } from '@/lib/imageUtils'
import BookingCalendar from './BookingCalendar'
import BookingForm from './BookingForm'

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

  const getSeasonPrice = (season: 'low' | 'medium' | 'high') => {
    switch (season) {
      case 'low':
        return yacht.low_season_price
      case 'medium':
        return yacht.medium_season_price
      case 'high':
        return yacht.high_season_price
      default:
        return yacht.high_season_price
    }
  }

  const determineSeason = (month: number): 'low' | 'medium' | 'high' => {
    // Low: Nov-Feb, Medium: Mar-May & Oct, High: Jun-Sep
    if (month >= 11 || month <= 2) return 'low'
    if (month >= 3 && month <= 5) return 'medium'
    if (month === 10) return 'medium'
    return 'high'
  }

  const calculatePrice = () => {
    if (!selectedStartDate || !selectedEndDate) return null

    const startMonth = selectedStartDate.getMonth() + 1
    const endMonth = selectedEndDate.getMonth() + 1

    const startSeason = determineSeason(startMonth)
    const endSeason = determineSeason(endMonth)

    // Use the higher season price if dates span multiple seasons
    const seasons = [startSeason, endSeason]
    let maxPrice = 0
    let season: 'low' | 'medium' | 'high' = 'high'

    if (getSeasonPrice('high') && maxPrice < getSeasonPrice('high')!) {
      maxPrice = getSeasonPrice('high')!
      season = 'high'
    }
    if (getSeasonPrice('medium') && maxPrice < getSeasonPrice('medium')!) {
      maxPrice = getSeasonPrice('medium')!
      season = 'medium'
    }
    if (getSeasonPrice('low') && maxPrice < getSeasonPrice('low')!) {
      maxPrice = getSeasonPrice('low')!
      season = 'low'
    }

    const days = Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24))
    return { total: maxPrice * days, perDay: maxPrice, days, season }
  }

  const priceCalculation = calculatePrice()


  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery/Slider */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-gray-900">
        {allImages.length > 0 ? (
          <>
            {/* Main Image Slider */}
            <div className="relative h-full w-full">
              {allImages.map((imageUrl, index) => {
                const resolvedUrl = getImageUrl(imageUrl)
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <img
                      src={resolvedUrl || ''}
                      alt={`${yacht.name} - Image ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error('[FleetDetail] Image failed to load:', {
                          yachtId: yacht.id,
                          index,
                          originalUrl: imageUrl,
                          resolvedUrl,
                        })
                        // Replace with placeholder div if image fails
                        const img = e.target as HTMLImageElement
                        const parent = img.parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="h-full w-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center"><span class="text-white text-2xl font-serif">${yacht.name}</span></div>`
                        }
                      }}
                      onClick={() => setIsLightboxOpen(true)}
                      style={{ cursor: 'pointer' }}
                    />
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
                    const resolvedUrl = getImageUrl(imageUrl)
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden transition-all ${
                          index === currentImageIndex ? 'border-white scale-110' : 'border-white/50 opacity-70'
                        }`}
                      >
                        <img
                          src={resolvedUrl || ''}
                          alt={`Thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
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
            <img
              src={getImageUrl(allImages[currentImageIndex]) || ''}
              alt={`${yacht.name} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
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

            {/* Technical Specs */}
            {yacht.technical_specs && Object.keys(yacht.technical_specs).length > 0 && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-luxury-blue mb-4">Technical Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(yacht.technical_specs).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-2">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="ml-2 font-semibold text-luxury-blue">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-gray-50 rounded-lg p-6 shadow-lg">
              <h2 className="font-serif text-2xl font-bold text-luxury-blue mb-6">Book Your Charter</h2>

              {/* Pricing */}
              <div className="mb-6 space-y-2">
                <h3 className="font-semibold text-gray-700">Seasonal Pricing:</h3>
                {yacht.low_season_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low Season:</span>
                    <span className="font-semibold text-luxury-blue">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: yacht.currency || 'EUR',
                        minimumFractionDigits: 0,
                      }).format(yacht.low_season_price)}
                    </span>
                  </div>
                )}
                {yacht.medium_season_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medium Season:</span>
                    <span className="font-semibold text-luxury-blue">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: yacht.currency || 'EUR',
                        minimumFractionDigits: 0,
                      }).format(yacht.medium_season_price)}
                    </span>
                  </div>
                )}
                {yacht.high_season_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">High Season:</span>
                    <span className="font-semibold text-luxury-blue">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: yacht.currency || 'EUR',
                        minimumFractionDigits: 0,
                      }).format(yacht.high_season_price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Calendar */}
              <BookingCalendar
                yachtId={yacht.id}
                onDateSelect={(start, end) => {
                  setSelectedStartDate(start)
                  setSelectedEndDate(end)
                }}
              />

              {/* Price Calculation */}
              {priceCalculation && (
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-luxury-gold">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{priceCalculation.perDay} × {priceCalculation.days} days</span>
                      <span className="capitalize">({priceCalculation.season} season)</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-luxury-blue">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: yacht.currency || 'EUR',
                          minimumFractionDigits: 0,
                        }).format(priceCalculation.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <BookingForm
                yachtId={yacht.id}
                yachtName={yacht.name}
                startDate={selectedStartDate}
                endDate={selectedEndDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
