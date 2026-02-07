'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Globe, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { Review } from '@/types/database'
import { format } from 'date-fns'

interface GuestbookModalProps {
  isOpen: boolean
  onClose: () => void
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

export default function GuestbookModal({ isOpen, onClose, reviews }: GuestbookModalProps) {
  const t = useTranslations('reviews')
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#001F3F] to-[#1B263B] px-6 md:px-8 py-6 flex items-center justify-between z-10 border-b border-[#C5A059]/20">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">
                    Guestbook
                  </h2>
                  <p className="text-sm text-white/80">
                    {t('discoverStories', { count: reviews.length })}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-[#C5A059] transition-colors p-2 rounded-full hover:bg-white/10 flex-shrink-0"
                  aria-label="Close guestbook"
                >
                  <X className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8">
                <div className="space-y-8 max-w-3xl mx-auto">
                  {reviews.map((review, index) => {
                    const hasTranslation = review.original_language && review.original_language !== 'en' && review.translated_text
                    const originalLanguageName = review.original_language 
                      ? languageNames[review.original_language] || review.original_language.toUpperCase() 
                      : ''

                    return (
                      <motion.div
                        key={review.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02, duration: 0.3 }}
                        className="border-b border-gray-200/50 pb-8 last:border-b-0 last:pb-0"
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

                          {/* Review Text */}
                          <p className="font-serif italic text-gray-700 leading-relaxed text-base md:text-lg font-light">
                            "{review.review_text || ''}"
                          </p>

                          {/* Translation Badge */}
                          {hasTranslation && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Globe className="w-3 h-3 text-[#C5A059]" />
                              <span>Translated from {originalLanguageName}</span>
                            </div>
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
                              <h4 className="font-semibold text-[#001F3F] text-sm">
                                {review.guest_name || 'Guest'}
                              </h4>
                              {review.guest_location && (
                                <p className="text-xs text-gray-500">
                                  {review.guest_location}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Footer - Dates */}
                          <div className="flex flex-wrap items-center gap-4 pt-2">
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

              {/* Footer */}
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-6 md:px-8 py-4 border-t border-gray-200/50">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Thank you for being part of our journey
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
