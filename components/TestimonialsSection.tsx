'use client'

import { useTranslations } from 'next-intl'
import ReviewGrid from './ReviewGrid'
import type { Review } from '@/types/database'
import { Quote, Star } from 'lucide-react'

interface TestimonialsSectionProps {
  reviews: Review[]
}

export default function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  const t = useTranslations('testimonials')
  
  if (!reviews || reviews.length === 0) return null

  // Calculate average rating
  const approvedReviews = reviews.filter(r => r.is_approved !== false)
  const averageRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / approvedReviews.length
    : 0

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Quote className="w-16 h-16 text-luxury-gold/20" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-luxury-blue mb-4 tracking-wide">
            {t('title')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 font-sans">
            {t('subtitle')}
          </p>
          
          {/* Average Rating Badge */}
          <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full border border-gray-100 shadow-lg">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${
                    i < Math.round(averageRating)
                      ? 'fill-luxury-gold text-luxury-gold'
                      : 'fill-gray-200 text-gray-200'
                  }`} 
                />
              ))}
            </div>
            <span className="font-bold text-luxury-blue text-xl ml-2 font-sans">
              {averageRating.toFixed(1)} / 5
            </span>
            <span className="text-gray-500 text-sm ml-2 font-sans">
              ({approvedReviews.length} {approvedReviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Review Grid */}
        <ReviewGrid reviews={reviews} />
      </div>
    </section>
  )
}
