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

  const profileImageUrl = review.profile_image_url
    ? getOptimizedImageUrl(review.profile_image_url, {
        width: 80,
        height: 80,
        quality: 80,
        format: 'webp',
      })
    : null

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-luxury-gold/30">
      {/* Featured Badge */}
      {review.is_featured && (
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
          <span className="text-xs font-semibold text-luxury-gold uppercase tracking-wider">
            Featured Review
          </span>
        </div>
      )}

      {/* Rating Stars - Prominent */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 md:w-6 md:h-6 ${
              i < (review.rating || 0)
                ? 'fill-luxury-gold text-luxury-gold'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
        {review.rating && (
          <span className="ml-2 text-sm font-semibold text-gray-700">
            {review.rating}/5
          </span>
        )}
      </div>

      {/* Review Text */}
      <div className="flex-grow mb-6">
        <p className="text-gray-700 text-base md:text-lg leading-relaxed italic">
          "{review.review_text}"
        </p>
      </div>

      {/* Customer Info */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
        {profileImageUrl ? (
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-luxury-gold/50 flex-shrink-0">
            <OptimizedImage
              src={profileImageUrl}
              alt={review.guest_name}
              fill
              sizes="(max-width: 768px) 56px, 64px"
              objectFit="cover"
              aspectRatio="1/1"
              loading="lazy"
              quality={80}
            />
          </div>
        ) : (
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center border-2 border-luxury-gold/50 flex-shrink-0">
            <span className="text-white text-base md:text-lg font-bold">
              {review.guest_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-luxury-blue text-base md:text-lg truncate">
            {review.guest_name}
          </p>
          {review.guest_location && (
            <p className="text-sm text-gray-600 truncate">{review.guest_location}</p>
          )}
          {review.review_date && (
            <p className="text-xs text-gray-400 mt-1">{formatDate(review.review_date)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
