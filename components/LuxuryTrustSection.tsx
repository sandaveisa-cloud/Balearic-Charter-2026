'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import type { Review } from '@/types/database'
import { Star, Quote, CheckCircle, Globe } from 'lucide-react'
import { format } from 'date-fns'
import { loadReviewsFromJson } from '@/lib/reviewLoader'

// Swiper styles are imported in globals.css

interface LuxuryTrustSectionProps {
  reviews: Review[]
}

const INITIAL_DISPLAY_COUNT = 6
const TRUNCATE_LENGTH = 120

export default function LuxuryTrustSection({ reviews }: LuxuryTrustSectionProps) {
  const t = useTranslations('reviews')
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT)
  const [showAll, setShowAll] = useState(false)
  const [mergedReviews, setMergedReviews] = useState<Review[]>([])
  const [showOriginalText, setShowOriginalText] = useState<Record<string, boolean>>({})

  // Load and merge reviews from JSON on mount
  useEffect(() => {
    const merged = loadReviewsFromJson(reviews)
    setMergedReviews(merged)
  }, [reviews])

  // Filter and sort reviews
  const curatedReviews = useMemo(() => {
    if (!mergedReviews || mergedReviews.length === 0) return []
    
    return mergedReviews
      .filter((review) => review.is_approved !== false)
      .sort((a, b) => {
        // Featured reviews first
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        // Then by published date (newest first)
        const dateA = a.published_date || a.review_date || a.created_at
        const dateB = b.published_date || b.review_date || b.created_at
        if (dateA && dateB) {
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        }
        // Then by rating
        return (b.rating || 0) - (a.rating || 0)
      })
  }, [mergedReviews])

  const initialReviews = curatedReviews.slice(0, INITIAL_DISPLAY_COUNT)
  const displayedReviews = showAll ? curatedReviews : initialReviews
  const hasMore = curatedReviews.length > INITIAL_DISPLAY_COUNT

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev)
      if (next.has(reviewId)) {
        next.delete(reviewId)
      } else {
        next.add(reviewId)
      }
      return next
    })
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const formatRentalDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return format(date, 'MM/yyyy')
    } catch {
      return 'N/A'
    }
  }

  if (curatedReviews.length === 0) return null

  // Language name mapping (ISO codes to full names)
  const languageNames: Record<string, string> = {
    'nl': 'Dutch',
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'it': 'Italian',
    'lv': 'Latvian',
    'pt': 'Portuguese',
    'en': 'English',
  }

  const toggleLanguage = (reviewId: string) => {
    setShowOriginalText((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  // Review Card Component
  const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
    const isExpanded = expandedReviews.has(review.id)
    
    // Multi-language support
    const hasTranslation = review.original_language && review.original_language !== 'en' && review.translated_text
    const showOriginal = showOriginalText[review.id] || false
    
    // Determine which text to show
    // If review has translation: review_text = original, translated_text = English
    // By default, show English (translated_text), unless user toggles to show original
    const originalText = review.review_text || ''
    const translatedText = review.translated_text || originalText
    const currentText = hasTranslation && !showOriginal ? translatedText : originalText
    
    const originalLanguageName = review.original_language 
      ? languageNames[review.original_language] || review.original_language.toUpperCase() 
      : ''
    
    const shouldTruncate = currentText.length > TRUNCATE_LENGTH
    const displayText = shouldTruncate && !isExpanded 
      ? currentText.substring(0, TRUNCATE_LENGTH) + '...' 
      : currentText

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="h-full"
      >
        {/* Glassmorphism Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200/50 hover:border-luxury-gold/30 transition-all duration-300 hover:shadow-xl relative overflow-hidden h-full flex flex-col"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-luxury-gold/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Verified Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-luxury-gold/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-luxury-gold/20 z-10">
            <CheckCircle className="w-3.5 h-3.5 text-luxury-gold" />
            <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-wider">
              Verified
            </span>
          </div>

          {/* Subtle Click&Boat Source Link */}
          <div className="absolute top-4 left-4 z-10">
            <a
              href="https://www.clickandboat.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-400 hover:text-blue-500 transition-colors"
            >
              Source: Click&Boat
            </a>
          </div>

          {/* Stars */}
          <div className="flex gap-1 mb-4 pt-8">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < (review.rating || 5)
                    ? 'text-luxury-gold fill-luxury-gold'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Verified Translation Badge */}
          {hasTranslation && (
            <div className="mb-3 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-luxury-gold" />
              <span className="text-[10px] text-gray-500 italic">
                Verified Translation from {originalLanguageName}
              </span>
            </div>
          )}

          {/* Review Text - Italicized Serif Font */}
          <div className="mb-6 flex-grow">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${review.id}-${showOriginal}-${isExpanded}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`font-serif italic text-gray-700 leading-relaxed text-base md:text-lg ${
                  shouldTruncate && !isExpanded ? '' : ''
                }`}
              >
                "{displayText}"
              </motion.p>
            </AnimatePresence>
            
            {/* Action Buttons Row */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {shouldTruncate && (
                <button
                  onClick={() => toggleExpand(review.id)}
                  className="text-xs text-luxury-gold hover:text-luxury-blue font-medium transition-colors flex items-center gap-1"
                >
                  {isExpanded ? 'Read less' : 'Read'}
                </button>
              )}
              
              {/* Language Toggle */}
              {hasTranslation && (
                <button
                  onClick={() => toggleLanguage(review.id)}
                  className="text-[10px] text-gray-400 hover:text-gray-600 font-light underline underline-offset-2 transition-colors flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  {showOriginal 
                    ? `Show Translation` 
                    : `Show Original (${originalLanguageName})`
                  }
                </button>
              )}
            </div>
          </div>

          {/* Reviewer Info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/50">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center text-white font-bold text-lg overflow-hidden relative shadow-md border-2 border-white flex-shrink-0">
              {review.profile_image_url ? (
                <Image
                  src={review.profile_image_url}
                  alt={review.guest_name || 'Guest'}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{(review.guest_name || 'G').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-luxury-blue text-sm md:text-base truncate">
                {review.guest_name || 'Guest'}
              </h4>
              {review.guest_location && (
                <p className="text-xs text-gray-500 truncate">
                  {review.guest_location}
                </p>
              )}
            </div>
          </div>

          {/* Footer with Dates - Very Small Font for Rental Date */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-auto">
            {review.rental_date && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">Rental Date:</span>
                <span className="text-[10px] text-gray-500">{formatRentalDate(review.rental_date)}</span>
              </div>
            )}
            {(review.published_date || review.review_date) && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">Published:</span>
                <span className="text-[10px] text-gray-500">{formatDate(review.published_date || review.review_date)}</span>
              </div>
            )}
            {!review.rental_date && !review.published_date && !review.review_date && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">Date:</span>
                <span className="text-[10px] text-gray-500">{formatDate(review.created_at)}</span>
              </div>
            )}
          </div>

          {/* Featured Badge */}
          {review.is_featured && (
            <div className="absolute bottom-4 right-4 bg-luxury-blue/10 backdrop-blur-sm px-2 py-1 rounded-full border border-luxury-blue/20">
              <span className="text-[9px] font-bold text-luxury-blue uppercase tracking-wider">
                Featured
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 via-transparent to-luxury-blue/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(197,160,89,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-luxury-gold/20">
              <Quote className="w-8 h-8 text-luxury-gold" />
            </div>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-luxury-blue mb-4 tracking-wide">
            Luxury Trust
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            {t('subtitle') || 'What our guests say about their Mediterranean experience'}
          </p>
          
          {/* Average Rating Badge */}
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-luxury-gold/20 shadow-lg">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-luxury-gold fill-luxury-gold" />
              ))}
            </div>
            <span className="font-bold text-luxury-blue text-lg">4.9</span>
            <span className="text-gray-500 text-sm">/ 5</span>
            <span className="text-gray-400 text-xs ml-2">({curatedReviews.length} reviews)</span>
          </div>
        </div>

        {/* Mobile: Horizontal Snap Carousel */}
        <div className="md:hidden">
          <Swiper
            modules={[FreeMode, Pagination]}
            freeMode={true}
            slidesPerView={1.1}
            spaceBetween={16}
            className="!pb-12"
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              375: {
                slidesPerView: 1.2,
                spaceBetween: 20,
              },
            }}
          >
            {displayedReviews.map((review, index) => (
              <SwiperSlide key={review.id || index} className="!h-auto">
                <div className="h-[500px]">
                  <ReviewCard review={review} index={index} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop: 3-Column Masonry Grid */}
        <div className="hidden md:block">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
            <AnimatePresence mode="popLayout">
              {displayedReviews.map((review, index) => (
                <div key={review.id || index} className="break-inside-avoid mb-6 md:mb-8">
                  <ReviewCard review={review} index={index} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Discover More Stories Button (Desktop) */}
        {hasMore && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12 md:mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAll(true)
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-md text-luxury-blue font-semibold rounded-full border border-luxury-gold/30 shadow-lg hover:shadow-xl hover:bg-luxury-gold hover:text-white transition-all duration-300"
            >
              Discover more stories
            </motion.button>
          </motion.div>
        )}

        {showAll && hasMore && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Showing all {curatedReviews.length} reviews
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
