'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ReviewCard from './ReviewCard'
import type { Review } from '@/types/database'
import { Filter } from 'lucide-react'

interface ReviewGridProps {
  reviews: (Review & {
    rental_date?: string | null
    published_date?: string | null
    category?: string | null
    original_language?: string | null
    translated_text?: string | null
  })[]
}

// Extract categories from reviews
function extractCategories(reviews: ReviewGridProps['reviews']): string[] {
  const categories = new Set<string>(['All'])
  
  reviews.forEach(review => {
    if (review.category) {
      categories.add(review.category)
    }
    // Also check yacht type from yacht_id if available
    // This would require fetching yacht data, so we'll rely on category field
  })
  
  return Array.from(categories).sort()
}

export default function ReviewGrid({ reviews }: ReviewGridProps) {
  const t = useTranslations('testimonials')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  
  const categories = useMemo(() => extractCategories(reviews), [reviews])
  
  const filteredReviews = useMemo(() => {
    if (selectedCategory === 'All') {
      return reviews.filter(review => review.is_approved !== false)
    }
    return reviews.filter(
      review => review.is_approved !== false && review.category === selectedCategory
    )
  }, [reviews, selectedCategory])

  // Clean review text (remove extra spaces)
  const cleanedReviews = useMemo(() => {
    return filteredReviews.map(review => ({
      ...review,
      review_text: review.review_text?.replace(/\s+/g, ' ').trim() || ''
    }))
  }, [filteredReviews])

  if (cleanedReviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{t('noReviews') || 'No reviews available'}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Filter Section */}
      {categories.length > 1 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-luxury-blue" />
            <h3 className="text-lg font-semibold text-luxury-blue font-sans">
              {t('filterByCategory') || 'Filter by Category'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 font-sans ${
                  selectedCategory === category
                    ? 'bg-luxury-blue text-white shadow-md'
                    : 'bg-white text-luxury-blue border border-luxury-blue/20 hover:border-luxury-gold hover:text-luxury-gold'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Masonry Grid Layout */}
      <div 
        className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0"
        style={{
          columnFill: 'balance'
        }}
      >
        {cleanedReviews.map((review, index) => (
          <ReviewCard key={review.id || index} review={review} />
        ))}
      </div>

      {/* Results Count */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 font-sans">
          {t('showingResults', { count: cleanedReviews.length, total: reviews.length }) || 
           `Showing ${cleanedReviews.length} of ${reviews.length} reviews`}
        </p>
      </div>
    </div>
  )
}
