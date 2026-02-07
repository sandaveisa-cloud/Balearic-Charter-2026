'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import type { Review } from '@/types/database'
import { Star, Quote, CheckCircle, Globe, ChevronUp, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { loadReviewsFromJson } from '@/lib/reviewLoader'

// Swiper styles are imported in globals.css

interface LuxuryTrustSectionProps {
  reviews: Review[]
}

const INITIAL_DISPLAY_COUNT = 6 // Show first 2 rows (3 columns x 2 rows)
const TRUNCATE_LENGTH = 120
const LINES_TO_SHOW = 3 // Show first 3 lines of text

export default function LuxuryTrustSection({ reviews }: LuxuryTrustSectionProps) {
  const t = useTranslations('reviews')
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT)
  const [showAll, setShowAll] = useState(false)
  const [mergedReviews, setMergedReviews] = useState<Review[]>([])
  const [showOriginalText, setShowOriginalText] = useState<Record<string, boolean>>({})
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Load and merge reviews from JSON on mount
  useEffect(() => {
    const merged = loadReviewsFromJson(reviews)
    setMergedReviews(merged)
  }, [reviews])

  // Back to Top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
    
    // Calculate lines to show (approximately 3 lines)
    const words = currentText.split(' ')
    const wordsPerLine = 12 // Approximate words per line for compact text
    const maxWords = LINES_TO_SHOW * wordsPerLine
    const shouldTruncate = words.length > maxWords
    const displayText = shouldTruncate && !isExpanded 
      ? words.slice(0, maxWords).join(' ') + '...' 
      : currentText

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="h-full"
      >
        {/* Glassmorphism Card - Compact (15% smaller via reduced padding/fonts) */}
        <motion.div
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-xl p-4 md:p-5 shadow-md border border-gray-200/50 hover:border-luxury-gold/30 transition-all duration-300 hover:shadow-lg relative overflow-hidden h-full flex flex-col"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-luxury-gold/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Tiny Click&Boat Source Link in corner */}
          <div className="absolute top-2 right-2 z-10">
            <a
              href="https://www.clickandboat.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[8px] text-gray-300 hover:text-blue-500 transition-colors flex items-center gap-0.5"
              title="Source: Click&Boat"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Stars - Smaller */}
          <div className="flex gap-0.5 mb-2 pt-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < (review.rating || 5)
                    ? 'text-luxury-gold fill-luxury-gold'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Verified Translation Badge - Compact */}
          {hasTranslation && (
            <div className="mb-2 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 text-luxury-gold" />
              <span className="text-[8px] text-gray-400 italic">
                {originalLanguageName}
              </span>
            </div>
          )}

          {/* Review Text - Compact, 3 lines max */}
          <div className="mb-3 flex-grow">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${review.id}-${showOriginal}-${isExpanded}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`font-serif italic text-gray-700 leading-tight text-sm md:text-base ${
                  shouldTruncate && !isExpanded ? 'line-clamp-3' : ''
                }`}
              >
                "{displayText}"
              </motion.p>
            </AnimatePresence>
            
            {/* Action Buttons Row - Compact */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {shouldTruncate && (
                <button
                  onClick={() => toggleExpand(review.id)}
                  className="text-[10px] text-luxury-gold hover:text-luxury-blue font-medium transition-colors underline underline-offset-1"
                >
                  {isExpanded ? 'less' : 'more'}
                </button>
              )}
              
              {/* Language Toggle - Compact */}
              {hasTranslation && (
                <button
                  onClick={() => toggleLanguage(review.id)}
                  className="text-[9px] text-gray-400 hover:text-gray-600 font-light underline underline-offset-1 transition-colors flex items-center gap-0.5"
                >
                  <Globe className="w-2.5 h-2.5" />
                  {showOriginal ? 'EN' : originalLanguageName.substring(0, 2).toUpperCase()}
                </button>
              )}
            </div>
          </div>

          {/* Reviewer Info - Compact */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200/30">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center text-white font-semibold text-xs overflow-hidden relative shadow-sm border border-white flex-shrink-0">
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
              <h4 className="font-semibold text-luxury-blue text-xs truncate">
                {review.guest_name || 'Guest'}
              </h4>
              {review.guest_location && (
                <p className="text-[9px] text-gray-400 truncate">
                  {review.guest_location}
                </p>
              )}
            </div>
          </div>

          {/* Footer with Dates - Compact */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
            {review.rental_date && (
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-400">Rental:</span>
                <span className="text-[8px] text-gray-500">{formatRentalDate(review.rental_date)}</span>
              </div>
            )}
            {(review.published_date || review.review_date) && (
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-400">Pub:</span>
                <span className="text-[8px] text-gray-500">{formatDate(review.published_date || review.review_date)}</span>
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
    <section className="py-10 md:py-16 lg:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 via-transparent to-luxury-blue/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(197,160,89,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header - Compact */}
        <div className="text-center mb-8 md:mb-10 max-w-3xl mx-auto">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-luxury-gold/20">
              <Quote className="w-6 h-6 text-luxury-gold" />
            </div>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-luxury-blue mb-3 tracking-wide">
            Luxury Trust
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-6">
            {t('subtitle') || 'What our guests say about their Mediterranean experience'}
          </p>
          
          {/* Average Rating Badge - Compact */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-luxury-gold/20 shadow-md">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-luxury-gold fill-luxury-gold" />
              ))}
            </div>
            <span className="font-bold text-luxury-blue text-base">4.9</span>
            <span className="text-gray-500 text-xs">/ 5</span>
            <span className="text-gray-400 text-[10px] ml-1">({curatedReviews.length})</span>
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
                <div className="h-[400px]">
                  <ReviewCard review={review} index={index} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop: 3-Column Masonry Grid - Tight layout */}
        <div className="hidden md:block relative">
          <div className="relative">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
              <AnimatePresence mode="popLayout">
                {displayedReviews.map((review, index) => (
                  <div key={review.id || index} className="break-inside-avoid mb-4 md:mb-5">
                    <ReviewCard review={review} index={index} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Fade-out gradient overlay (only when showing first 2 rows) */}
            {!showAll && hasMore && (
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10" />
            )}
          </div>
        </div>

        {/* Read All Experiences Button - Minimalist */}
        {hasMore && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8 md:mt-10 relative z-10"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAll(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/90 backdrop-blur-sm text-luxury-blue text-sm font-medium rounded-full border border-gray-200/50 shadow-sm hover:shadow-md hover:border-luxury-gold/30 transition-all duration-300"
            >
              Read All {curatedReviews.length} Experiences
            </motion.button>
          </motion.div>
        )}

        {showAll && hasMore && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              Showing all {curatedReviews.length} reviews
            </p>
          </div>
        )}
      </div>

      {/* Back to Top Button - Floating Circle */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg hover:shadow-xl hover:border-luxury-gold/30 flex items-center justify-center transition-all duration-300"
            aria-label="Back to top"
          >
            <ChevronUp className="w-5 h-5 text-luxury-blue" />
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  )
}
