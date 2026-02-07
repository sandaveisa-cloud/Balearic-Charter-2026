'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Star, Globe, ExternalLink, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { Review } from '@/types/database'
import { format } from 'date-fns'
import { loadReviewsFromJson } from '@/lib/reviewLoader'

interface GuestbookSectionProps {
  reviews: Review[]
}

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

export default function GuestbookSection({ reviews }: GuestbookSectionProps) {
  const t = useTranslations('reviews')
  const [isExpanded, setIsExpanded] = useState(false)
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

  const toggleLanguage = (reviewId: string) => {
    setShowOriginalText((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  // Prevent body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isExpanded])

  if (curatedReviews.length === 0) return null

  return (
    <section className="py-10 md:py-16 lg:py-20 relative">
      {/* Collapsed Banner Trigger */}
      <motion.div
        initial={false}
        className="container mx-auto px-4 md:px-6"
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001F3F]/5 via-[#1B263B]/5 to-[#001F3F]/5 border border-[#C5A059]/20 hover:border-[#C5A059]/40 transition-all duration-300"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23C5A059%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          
          <div className="relative px-6 md:px-10 py-8 md:py-12 flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 bg-gradient-to-br from-[#001F3F] to-[#1B263B] rounded-full shadow-lg">
                <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-[#C5A059]" />
              </div>
              <div className="text-left">
                <h3 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-[#001F3F] mb-1 tracking-wide">
                  {t('discoverStories', { count: curatedReviews.length })}
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  {t('fromOurGuests')}
                </p>
              </div>
            </div>
            
            {/* Rotating Chevron Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-6 h-6 md:w-7 md:h-7 text-[#C5A059]" />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>

      {/* Expanded Accordion/Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />

            {/* Expanded Content - Drawer Style */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="fixed inset-x-0 bottom-0 top-20 md:top-24 z-50 bg-white shadow-2xl rounded-t-3xl overflow-hidden flex flex-col"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#001F3F] to-[#1B263B] px-6 md:px-8 py-4 md:py-5 flex items-center justify-between z-10 border-b border-[#C5A059]/20 shadow-md">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-[#C5A059]" />
                  <div>
                    <h2 className="font-serif text-lg md:text-xl font-bold text-white">
                      Guestbook
                    </h2>
                    <p className="text-xs md:text-sm text-white/80">
                      {curatedReviews.length} stories from our guests
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:text-[#C5A059] transition-colors p-2 rounded-full hover:bg-white/10 flex-shrink-0"
                  aria-label="Close guestbook"
                >
                  <X className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {curatedReviews.map((review, index) => {
                      const hasTranslation = review.original_language && review.original_language !== 'en' && review.translated_text
                      const showOriginal = showOriginalText[review.id] || false
                      
                      // Determine which text to show
                      const originalText = review.review_text || ''
                      const translatedText = review.translated_text || originalText
                      const currentText = hasTranslation && !showOriginal ? translatedText : originalText
                      
                      const originalLanguageName = review.original_language 
                        ? languageNames[review.original_language] || review.original_language.toUpperCase() 
                        : ''

                      return (
                        <motion.div
                          key={review.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.4 }}
                          className="border-b border-[#C5A059]/20 pb-6 md:pb-8 last:border-b-0"
                        >
                          {/* Review Card */}
                          <div className="space-y-4">
                            {/* Stars */}
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (review.rating || 5)
                                      ? 'text-[#C5A059] fill-[#C5A059]'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Review Text - Premium Serif */}
                            <p className="font-serif italic text-gray-700 leading-relaxed text-base md:text-lg font-light">
                              "{currentText}"
                            </p>

                            {/* Language Toggle */}
                            {hasTranslation && (
                              <button
                                onClick={() => toggleLanguage(review.id)}
                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#C5A059] transition-colors"
                              >
                                <Globe className="w-3 h-3" />
                                <span className="underline underline-offset-2">
                                  {showOriginal 
                                    ? `Show Translation` 
                                    : `Show Original (${originalLanguageName})`
                                  }
                                </span>
                              </button>
                            )}

                            {/* Reviewer Info */}
                            <div className="flex items-center gap-3 pt-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#001F3F] to-[#C5A059] flex items-center justify-center text-white font-semibold text-sm overflow-hidden relative shadow-sm border border-white flex-shrink-0">
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
                                <h4 className="font-sans font-semibold text-[#001F3F] text-sm tracking-wide">
                                  {review.guest_name || 'Guest'}
                                </h4>
                                {review.guest_location && (
                                  <p className="text-xs text-gray-500">
                                    {review.guest_location}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Footer - Dates & Source */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                              {review.rental_date && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-gray-400 font-sans tracking-wider uppercase">RENTAL DATE</span>
                                  <span className="text-[9px] text-gray-500 font-sans tracking-wide">{formatRentalDate(review.rental_date)}</span>
                                </div>
                              )}
                              {(review.published_date || review.review_date) && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-gray-400 font-sans tracking-wider uppercase">PUBLISHED</span>
                                  <span className="text-[9px] text-gray-500 font-sans tracking-wide">{formatDate(review.published_date || review.review_date)}</span>
                                </div>
                              )}
                              {/* Click&Boat Source */}
                              <a
                                href="https://www.clickandboat.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto flex items-center gap-1 text-[9px] text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Click&Boat</span>
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-6 md:px-8 py-4 border-t border-gray-200/50">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Thank you for being part of our journey
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
