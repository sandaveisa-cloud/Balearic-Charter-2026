'use client'

import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Quote, Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Review } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

// Import Swiper components and modules
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles - safe to import in client component
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface TestimonialsProps {
  reviews: Review[]
}

export default function Testimonials({ reviews }: TestimonialsProps) {
  const t = useTranslations('reviews')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter approved and featured reviews
  const approvedReviews = reviews
    .filter((review) => review.is_approved)
    .sort((a, b) => {
      // Featured reviews first
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      // Then by date (newest first)
      const dateA = a.review_date ? new Date(a.review_date).getTime() : 0
      const dateB = b.review_date ? new Date(b.review_date).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 10) // Limit to 10 reviews

  if (approvedReviews.length === 0) {
    return null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    } catch {
      return dateString
    }
  }

  const highlightKeywords = (text: string) => {
    const keywords = ['Paella', 'Chef', 'Sunset', 'Formentera', 'Ibiza', 'Mallorca', 'luxury', 'amazing', 'perfect', 'beautiful']
    let highlightedText = text

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      highlightedText = highlightedText.replace(
        regex,
        `<span class="font-semibold text-luxury-gold">${keyword}</span>`
      )
    })

    return highlightedText
  }

  if (!mounted) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 via-luxury-blue/30 to-gray-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-luxury-gold rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-luxury-blue rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            navigation={{
              nextEl: '.testimonial-next',
              prevEl: '.testimonial-prev',
            }}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-luxury-gold/50',
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-luxury-gold',
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={approvedReviews.length > 3}
            className="testimonials-swiper"
          >
            {approvedReviews.map((review) => {
              const profileImageUrl = review.profile_image_url
                ? getOptimizedImageUrl(review.profile_image_url, {
                    width: 80,
                    height: 80,
                    quality: 80,
                    format: 'webp',
                  })
                : null

              return (
                <SwiperSlide key={review.id}>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full flex flex-col relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:border-luxury-gold/50">
                    {/* Large Quote Icon Background */}
                    <Quote className="absolute top-4 right-4 w-24 h-24 text-luxury-gold/10" strokeWidth={1} />

                    {/* Verified Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-luxury-gold" />
                      <span className="text-xs font-semibold text-luxury-gold uppercase tracking-wider">
                        Verified via Click&Boat
                      </span>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'fill-luxury-gold text-luxury-gold'
                              : 'fill-gray-700 text-gray-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <div className="flex-grow mb-6">
                      <p
                        className="font-serif text-lg md:text-xl text-white/90 leading-relaxed italic"
                        dangerouslySetInnerHTML={{
                          __html: `"${highlightKeywords(review.review_text)}"`,
                        }}
                      />
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      {profileImageUrl ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-luxury-gold/50 flex-shrink-0">
                          <Image
                            src={profileImageUrl}
                            alt={review.guest_name}
                            fill
                            sizes="64px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-luxury-blue to-luxury-gold flex items-center justify-center border-2 border-luxury-gold/50 flex-shrink-0">
                          <span className="text-white text-lg font-bold">
                            {review.guest_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-grow">
                        <p className="font-semibold text-white text-lg">{review.guest_name}</p>
                        {review.guest_location && (
                          <p className="text-sm text-gray-400">{review.guest_location}</p>
                        )}
                        {review.review_date && (
                          <p className="text-xs text-luxury-gold/70 mt-1">
                            {formatDate(review.review_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
          )}

          {/* Custom Navigation Buttons - Only show when mounted */}
          {mounted && (
          <>
          <button
            className="testimonial-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-12 h-12 bg-luxury-gold/20 hover:bg-luxury-gold/40 backdrop-blur-sm border border-luxury-gold/50 rounded-full flex items-center justify-center text-luxury-gold transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="testimonial-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-12 h-12 bg-luxury-gold/20 hover:bg-luxury-gold/40 backdrop-blur-sm border border-luxury-gold/50 rounded-full flex items-center justify-center text-luxury-gold transition-all duration-300 hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          </>
          )}
        </div>
      </div>
    </section>
  )
}
