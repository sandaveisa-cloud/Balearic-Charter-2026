'use client'

import type { Review } from '@/types/database'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Rating Stars */}
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < review.rating ? 'text-luxury-gold' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Review Text */}
      <p className="text-gray-700 mb-6 italic flex-grow">"{review.review_text}"</p>

      {/* Customer Info */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        {review.profile_image_url && (
          <img
            src={review.profile_image_url}
            alt={review.guest_name}
            className="w-12 h-12 rounded-full object-cover border-2 border-luxury-blue"
          />
        )}
        <div className="flex-grow">
          <p className="font-semibold text-luxury-blue">{review.guest_name}</p>
          {review.guest_location && (
            <p className="text-sm text-gray-500">{review.guest_location}</p>
          )}
          {review.review_date && (
            <p className="text-xs text-gray-400 mt-1">{formatDate(review.review_date)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
