'use client'

import OptimizedImage from './OptimizedImage'
import type { Review } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { Star, CheckCircle2 } from 'lucide-react'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    } catch {
      return dateString
    }
  }

  // ATPAKAĻ PIE PAREIZAJIEM NOSAUKUMIEM
  const profileImageUrl = review.profile_image_url
    ? getOptimizedImageUrl(review.profile_image_url, {
        width: 80,
        height: 80,
        quality: 80,
        format: 'webp',
      })
    : null

  return (
    <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-luxury-gold/20 max-w-sm mx-auto">
      {/* Verified Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-luxury-gold" />
          <span className="text-xs text-gray-500 font-medium">
            Verified via Click&Boat
          </span>
        </div>
        {review.is_featured && (
          <span className="text-xs font-semibold text-luxury-gold uppercase tracking-wider px-2 py-0.5 bg-luxury-gold/10 rounded">
            Featured
          </span>
        )}
      </div>

      {/* Rating Stars */}
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < (review.rating || 0)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Review Text */}
      <div className="flex-grow mb-4">
        <p className="text-gray-600 text-sm leading-relaxed italic font-light">
          "{review.review_text}"
        </p>
      </div>

      {/* Customer Info */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        {profileImageUrl ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-luxury-gold/30 flex-shrink-0">
            <OptimizedImage
              src={profileImageUrl}
              alt={review.guest_name || 'Guest'}
              fill
              sizes="40px"
              objectFit="cover"
              loading="lazy"
              quality={80}
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center border border-luxury-gold/30 flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {(review.guest_name || 'G')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-grow min-w-0">
          <p className="font-medium text-luxury-blue text-sm truncate">
            {review.guest_name || 'Guest'}
          </p>
          {review.guest_location && (
            <p className="text-xs text-gray-500 truncate">{review.guest_location}</p>
          )}
          {review.review_date && (
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(review.review_date)}</p>
          )}
        </div>
      </div>
    </div>
  )
}