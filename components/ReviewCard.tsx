'use client'

import { useState, useEffect } from 'react'
import OptimizedImage from './OptimizedImage'
import type { Review } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { Star, CheckCircle2, Languages } from 'lucide-react'

interface ReviewCardProps {
  review: Review & {
    rental_date?: string | null
    published_date?: string | null
    category?: string | null
    original_language?: string | null
    translated_text?: string | null
  }
}

// Simple language detection (basic)
function detectLanguage(text: string): string {
  // Basic detection patterns
  const latvianPattern = /[āčēģīķļņōŗšūžĀČĒĢĪĶĻŅŌŖŠŪŽ]/i
  const spanishPattern = /[ñáéíóúüÑÁÉÍÓÚÜ]/i
  
  if (latvianPattern.test(text)) return 'lv'
  if (spanishPattern.test(text)) return 'es'
  return 'en'
}

// Simple translation function (in production, use a proper translation API)
async function translateText(text: string, targetLang: string = 'en'): Promise<string> {
  // This is a placeholder - in production, integrate with Google Translate API or similar
  // For now, return the original text
  return text
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [showTranslated, setShowTranslated] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  
  const detectedLanguage = review.original_language || detectLanguage(review.review_text)
  const needsTranslation = detectedLanguage !== 'en' && detectedLanguage !== 'en-US'
  const displayText = showTranslated && translatedText ? translatedText : review.review_text

  useEffect(() => {
    // If review has pre-translated text, use it
    if (review.translated_text) {
      setTranslatedText(review.translated_text)
    }
  }, [review.translated_text])

  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslated(!showTranslated)
      return
    }

    setIsTranslating(true)
    try {
      const translated = await translateText(review.review_text, 'en')
      setTranslatedText(translated)
      setShowTranslated(true)
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const profileImageUrl = review.profile_image_url
    ? getOptimizedImageUrl((review.profile_image_url as string), {
        width: 80,
        height: 80,
        quality: 80,
        format: 'webp',
      })
    : null

  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 hover:border-luxury-gold/30 break-inside-avoid mb-6">
      {/* Verified Badge with Click&Boat */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
            <span className="text-xs text-gray-600 font-medium font-sans">
              Verified Review
            </span>
          </div>
          {/* Click&Boat Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-md border border-blue-200/50 shadow-sm">
            <svg 
              className="w-3.5 h-3.5 text-blue-600" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span className="text-[10px] font-bold text-blue-700 tracking-wide font-sans">Click&Boat</span>
          </div>
        </div>
        {review.is_featured && (
          <span className="text-xs font-semibold text-luxury-gold uppercase tracking-wider px-2 py-0.5 bg-luxury-gold/10 rounded">
            Featured
          </span>
        )}
      </div>

      {/* Rating Stars - Gold */}
      <div className="flex items-center gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < (review.rating || 0)
                ? 'fill-luxury-gold text-luxury-gold'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Review Text - Serif font for quotes */}
      <div className="flex-grow mb-4">
        <p className="text-gray-700 text-sm leading-relaxed font-serif italic mb-2">
          "{displayText}"
        </p>
        
        {/* Translation Toggle */}
        {needsTranslation && (
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-1 text-xs text-luxury-blue hover:text-luxury-gold transition-colors font-sans mt-2"
          >
            <Languages className="w-3 h-3" />
            <span>
              {isTranslating 
                ? 'Translating...' 
                : showTranslated 
                  ? 'Show Original' 
                  : 'Translate to English'}
            </span>
          </button>
        )}
      </div>

      {/* Reviewer Info */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mb-4">
        {profileImageUrl ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-luxury-gold/30 flex-shrink-0">
            <OptimizedImage
              src={profileImageUrl}
              alt={review.guest_name || 'Guest'}
              fill
              sizes="48px"
              objectFit="cover"
              loading="lazy"
              quality={80}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center border border-luxury-gold/30 flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {(review.guest_name || 'G')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-luxury-blue text-sm font-sans">
            {review.guest_name || 'Guest'}
          </p>
          {review.guest_location && (
            <p className="text-xs text-gray-500 font-sans truncate">{review.guest_location}</p>
          )}
        </div>
      </div>

      {/* Footer with Dates - Sans-serif for details */}
      <div className="pt-3 border-t border-gray-50 flex flex-col gap-1">
        {review.rental_date && (
          <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
            <span className="font-medium">Rental Date:</span>
            <span>{formatDate(review.rental_date)}</span>
          </div>
        )}
        {review.published_date && (
          <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
            <span className="font-medium">Published:</span>
            <span>{formatDate(review.published_date)}</span>
          </div>
        )}
        {!review.rental_date && !review.published_date && review.review_date && (
          <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
            <span className="font-medium">Review Date:</span>
            <span>{formatDate(review.review_date)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
