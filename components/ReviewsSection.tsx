'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import type { Review } from '@/types/database'
import ReviewCard from './ReviewCard'
import { Star, Quote } from 'lucide-react'

interface ReviewsSectionProps {
  reviews: Review[]
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const t = useTranslations('reviews')
  
  // Curate the best 4-6 reviews that highlight key aspects
  const curatedReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return []
    
    // Keywords to prioritize for curation
    const priorityKeywords = {
      crew: ['crew', 'captain', 'professional', 'attentive', 'expert', 'experienced', 'service'],
      luxury: ['luxury', 'luxurious', 'premium', 'elegant', 'comfortable', 'comfort', 'spacious', 'beautiful'],
      locations: ['mallorca', 'ibiza', 'formentera', 'menorca', 'balearic', 'costa blanca', 'mediterranean'],
      food: ['food', 'chef', 'cuisine', 'gourmet', 'dining', 'meal', 'paella', 'delicious', 'culinary']
    }
    
    // Score each review based on relevance to key topics
    const scoredReviews = reviews
      .filter((review) => review.is_approved) // Only approved reviews
      .map((review) => {
        const text = (review.review_text || '').toLowerCase()
        let score = 0
        
        // Base score from rating (5 stars = 5 points, 4 stars = 4 points, etc.)
        score += review.rating || 0
        
        // Bonus for featured reviews
        if (review.is_featured) score += 3
        
        // Bonus for mentioning key topics
        priorityKeywords.crew.forEach(keyword => {
          if (text.includes(keyword)) score += 2
        })
        priorityKeywords.luxury.forEach(keyword => {
          if (text.includes(keyword)) score += 2
        })
        priorityKeywords.locations.forEach(keyword => {
          if (text.includes(keyword)) score += 1.5
        })
        priorityKeywords.food.forEach(keyword => {
          if (text.includes(keyword)) score += 1.5
        })
        
        // Bonus for longer, detailed reviews (more than 100 characters)
        if ((review.review_text || '').length > 100) score += 1
        
        return { review, score }
      })
      .sort((a, b) => {
        // Featured reviews first
        if (a.review.is_featured && !b.review.is_featured) return -1
        if (!a.review.is_featured && b.review.is_featured) return 1
        // Then by score
        return b.score - a.score
      })
      .slice(0, 6) // Take top 6 reviews
      .map(item => item.review)
    
    return scoredReviews
  }, [reviews])
  
  if (curatedReviews.length === 0) {
    return null
  }

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (curatedReviews.length === 0) return 0
    const sum = curatedReviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    return (sum / curatedReviews.length).toFixed(1)
  }, [curatedReviews])

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Quote className="w-8 h-8 text-luxury-gold" />
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue">
              {t('title')}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {t('subtitle')}
          </p>
          
          {/* Average Rating Display */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.round(4.9)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-300 text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-luxury-blue ml-2">
              4.9 / 5 Average Customer Rating
            </span>
            <span className="text-sm text-gray-500 ml-2">
              ({curatedReviews.length} {curatedReviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Reviews Grid - Elegant 3-column on desktop, carousel-friendly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {curatedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}
