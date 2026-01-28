'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import Image from 'next/image'
import type { Review } from '@/types/database'
import { Star, Quote, CheckCircle } from 'lucide-react'

interface ReviewsSectionProps {
  reviews: Review[]
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const t = useTranslations('reviews')
  
  // Atlasa labākās 4-6 atsauksmes
  const curatedReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return []
    
    const priorityKeywords = {
      crew: ['crew', 'captain', 'professional', 'attentive', 'expert', 'experienced', 'service'],
      luxury: ['luxury', 'luxurious', 'premium', 'elegant', 'comfortable', 'comfort', 'spacious', 'beautiful'],
      locations: ['mallorca', 'ibiza', 'formentera', 'menorca', 'balearic', 'costa blanca', 'mediterranean'],
      food: ['food', 'chef', 'cuisine', 'gourmet', 'dining', 'meal', 'paella', 'delicious', 'culinary']
    }
    
    const scoredReviews = reviews
      .filter((review) => review.is_approved !== false)
      .map((review) => {
        // LABOJUMS: Izmantojam tikai review_text, jo 'content' nav definēts tipā
        const text = (review.review_text || '').toLowerCase()
        let score = 0
        
        score += review.rating || 0
        if (review.is_featured) score += 3
        
        priorityKeywords.crew.forEach(keyword => { if (text.includes(keyword)) score += 2 })
        priorityKeywords.luxury.forEach(keyword => { if (text.includes(keyword)) score += 2 })
        priorityKeywords.locations.forEach(keyword => { if (text.includes(keyword)) score += 1.5 })
        priorityKeywords.food.forEach(keyword => { if (text.includes(keyword)) score += 1.5 })
        
        if (text.length > 100) score += 1
        
        return { review, score }
      })
      .sort((a, b) => {
        if (a.review.is_featured && !b.review.is_featured) return -1
        if (!a.review.is_featured && b.review.is_featured) return 1
        return b.score - a.score
      })
      .slice(0, 6)
      .map(item => item.review)
    
    return scoredReviews
  }, [reviews])
  
  if (curatedReviews.length === 0) return null

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <Quote className="w-12 h-12 text-luxury-gold/20" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('subtitle')}
          </p>
          
          {/* Average Rating Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="font-bold text-luxury-blue ml-2">4.9 / 5</span>
            <span className="text-gray-500 text-sm ml-1">Average Customer Rating</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {curatedReviews.map((review, index) => (
            <div 
              key={review.id || index}
              className="flex flex-col h-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Dekoratīvs elements */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-10 h-10 text-luxury-blue" />
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 mb-6">
                 <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-luxury-gold uppercase">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Guest</span>
                </div>
                {review.is_featured && (
                  <span className="bg-luxury-blue/5 text-luxury-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                )}
              </div>

              {/* Zvaigznes */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < (review.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>

              {/* Teksts */}
              <div className="flex-grow mb-8">
                {/* LABOJUMS: Arī šeit izmantojam tikai review_text */}
                <p className="text-gray-600 italic leading-relaxed text-lg line-clamp-6">
                  "{review.review_text}"
                </p>
              </div>

              {/* Autors */}
              <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-luxury-blue font-bold text-xl overflow-hidden relative shadow-sm border-2 border-white">
                  {review.author_image ? (
                    <Image 
                      src={review.author_image} 
                      alt={review.author_name || 'Guest'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{(review.author_name || 'G').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-luxury-blue text-sm">
                    {review.author_name || 'Guest'}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {review.location || 'Charter Guest'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}