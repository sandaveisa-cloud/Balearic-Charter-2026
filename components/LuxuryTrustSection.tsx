'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { Review } from '@/types/database'
import { Star, Quote, CheckCircle, Anchor, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { loadReviewsFromJson } from '@/lib/reviewLoader'

interface LuxuryTrustSectionProps {
  reviews: Review[]
}

const INITIAL_DISPLAY_COUNT = 6

export default function LuxuryTrustSection({ reviews }: LuxuryTrustSectionProps) {
  const t = useTranslations('reviews')
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT)
  const [showAll, setShowAll] = useState(false)
  const [mergedReviews, setMergedReviews] = useState<Review[]>([])

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

  const displayedReviews = showAll ? curatedReviews : curatedReviews.slice(0, displayCount)
  const hasMore = curatedReviews.length > displayCount

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
      // Handle both ISO format (YYYY-MM-DD) and other formats
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
      // Format as MM/YYYY for rental date
      return format(date, 'MM/yyyy')
    } catch {
      return 'N/A'
    }
  }

  if (curatedReviews.length === 0) return null

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

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
          <AnimatePresence mode="popLayout">
            {displayedReviews.map((review, index) => {
            const isExpanded = expandedReviews.has(review.id)
            const reviewText = review.review_text || ''
            const shouldTruncate = reviewText.length > 200
            const displayText = shouldTruncate && !isExpanded 
              ? reviewText.substring(0, 200) + '...' 
              : reviewText

            return (
              <motion.div
                key={review.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="break-inside-avoid mb-6 md:mb-8 group"
              >
                {/* Glassmorphism Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200/50 hover:border-luxury-gold/30 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-luxury-gold/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-luxury-gold/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-luxury-gold/20">
                    <CheckCircle className="w-3.5 h-3.5 text-luxury-gold" />
                    <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-wider">
                      Verified
                    </span>
                  </div>

                  {/* Click&Boat Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200/50 shadow-sm">
                    <Anchor className="w-3 h-3 text-gray-600" />
                    <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider">
                      Click&Boat
                    </span>
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

                  {/* Review Text - Serif Font */}
                  <div className="mb-6">
                    <p className={`font-serif text-gray-700 leading-relaxed text-base md:text-lg ${
                      shouldTruncate && !isExpanded ? 'line-clamp-4' : ''
                    }`}>
                      "{displayText}"
                    </p>
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpand(review.id)}
                        className="mt-2 text-sm text-luxury-gold hover:text-luxury-blue font-semibold transition-colors flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Read less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Read more
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center text-white font-bold text-lg overflow-hidden relative shadow-md border-2 border-white">
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

                  {/* Footer with Dates */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                    {review.rental_date && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600">Rental date:</span>
                        <span>{formatRentalDate(review.rental_date)}</span>
                      </div>
                    )}
                    {(review.published_date || review.review_date) && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600">Published:</span>
                        <span>{formatDate(review.published_date || review.review_date)}</span>
                      </div>
                    )}
                    {!review.rental_date && !review.published_date && !review.review_date && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600">Date:</span>
                        <span>{formatDate(review.created_at)}</span>
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
          })}
          </AnimatePresence>
        </div>

        {/* Show More Button */}
        {hasMore && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setDisplayCount((prev) => Math.min(prev + INITIAL_DISPLAY_COUNT, curatedReviews.length))
                if (displayCount + INITIAL_DISPLAY_COUNT >= curatedReviews.length) {
                  setShowAll(true)
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-md text-luxury-blue font-semibold rounded-full border border-luxury-gold/30 shadow-lg hover:shadow-xl hover:bg-luxury-gold hover:text-white transition-all duration-300"
            >
              Load More Reviews
              <ChevronDown className="w-5 h-5" />
            </motion.button>
            <p className="text-sm text-gray-500 mt-4">
              Showing {displayCount} of {curatedReviews.length} reviews
            </p>
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
