'use client'

import OptimizedImage from './OptimizedImage'
import { useTranslations } from 'next-intl'
import type { CulinaryExperience } from '@/types/database'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { ChefHat, ShoppingBag, Menu } from 'lucide-react'

interface CulinarySectionProps {
  experiences: CulinaryExperience[]
}

export default function CulinarySection({ experiences }: CulinarySectionProps) {
  const t = useTranslations('culinary')
  
  // Find paella image or use first experience image as placeholder
  const paellaExperience = experiences.find(exp => 
    exp.title?.toLowerCase().includes('paella') || 
    exp.description?.toLowerCase().includes('paella')
  )
  
  const featuredImageUrl = paellaExperience?.image_url 
    ? getOptimizedImageUrl(paellaExperience.image_url, {
        width: 1200,
        quality: 85,
        format: 'webp',
      })
    : experiences.length > 0 && experiences[0].image_url
    ? getOptimizedImageUrl(experiences[0].image_url, {
        width: 1200,
        quality: 85,
        format: 'webp',
      })
    : null

  const bulletPoints = [
    { icon: ChefHat, text: 'Private Chef Service' },
    { icon: ShoppingBag, text: 'Fresh Local Ingredients' },
    { icon: Menu, text: 'Tailored Menu Options' },
  ]

  return (
    <section className="py-12 bg-white border-t border-b border-[#E2E8F0]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Image */}
          <div className="order-2 lg:order-1">
            {featuredImageUrl ? (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <OptimizedImage
                  src={featuredImageUrl}
                  alt="Authentic Spanish Paella"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  objectFit="cover"
                  aspectRatio="4/3"
                  priority
                  quality={85}
                />
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <ChefHat className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Right Side - Content */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Main Heading */}
            <h2 className="font-serif text-3xl font-bold text-[#0F172A]">
              Culinary Excellence
            </h2>

            {/* Subheading */}
            <p className="text-base text-[#475569]">
              World-class dining on the open sea.
            </p>

            {/* Featured Dish */}
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">
                Authentic Spanish Paella
              </h3>
              <p className="text-base text-[#475569] leading-relaxed">
                Savor our signature traditional paella, prepared fresh on deck by our master chef using the finest local seafood and Mediterranean ingredients.
              </p>
            </div>

            {/* Bullet Points */}
            <ul className="space-y-3">
              {bulletPoints.map((point, index) => {
                const IconComponent = point.icon
                return (
                  <li key={index} className="flex items-start gap-3">
                    <IconComponent size={20} className="text-[#C5A059] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-base text-[#475569]">{point.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Verification Line */}
        <div className="mt-8 pt-4 border-t border-[#E2E8F0]">
          <p className="text-xs text-gray-400 text-center">
            ✓ 2026 Season | Verified & Logistically Synchronized
          </p>
        </div>
      </div>
    </section>
  )
}
