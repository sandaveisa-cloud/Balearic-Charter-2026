'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import type { JourneyMilestone } from '@/types/database'

interface JourneySectionProps {
  milestones?: JourneyMilestone[]
}

export default function JourneySection({ milestones = [] }: JourneySectionProps) {
  const locale = useLocale() as 'en' | 'es' | 'de'
  const t = useTranslations('journey.milestones')

  // Filter active milestones and sort by order_index
  const activeMilestones = milestones
    .filter((m) => m.is_active !== false)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .slice(0, 4) // Only show first 4 milestones

  // Get localized text for a milestone
  const getTitle = (milestone: JourneyMilestone) => {
    return milestone[`title_${locale}` as keyof JourneyMilestone] as string || milestone.title_en || milestone.title || ''
  }

  const getDescription = (milestone: JourneyMilestone) => {
    return milestone[`description_${locale}` as keyof JourneyMilestone] as string || milestone.description_en || milestone.description || ''
  }

  // Use database milestones if available, otherwise fall back to translations
  const displayMilestones = activeMilestones.length > 0 ? activeMilestones.map(m => ({
    year: m.year?.toString() || '',
    title: getTitle(m),
    description: getDescription(m),
  })) : [
    {
      year: t('beginning.year') || '2014',
      title: t('beginning.title') || 'Our Beginning',
      description: t('beginning.description') || 'Started with a vision for luxury and our first charter experiences.',
    },
    {
      year: t('growth.year') || 'Growth',
      title: t('growth.title') || 'Growth',
      description: t('growth.description') || 'Gradually expanded our offerings, focusing on quality and premium service.',
    },
    {
      year: t('destinations.year') || 'Destinations',
      title: t('destinations.title') || 'Destinations',
      description: t('destinations.description') || 'Developed unique routes around the Balearic Islands for unforgettable experiences.',
    },
    {
      year: t('today.year') || 'Today',
      title: t('today.title') || 'Your Trusted Partner',
      description: t('today.description') || 'Providing hand-picked yachts and full-service logistics.',
    },
  ]

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Horizontal Trust Bar - 4 columns on desktop, 2x2 on tablet, 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {displayMilestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              {/* Year - Small, elegant font */}
              <div className="mb-2">
                <span className="text-sm font-light text-gray-500 tracking-wider">
                  {milestone.year}
                </span>
              </div>

              {/* Title - Bold, short */}
              <h3 className="font-bold text-lg md:text-xl text-[#001F3F] mb-2 leading-tight">
                {milestone.title}
              </h3>

              {/* Description - Max 2 lines */}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {milestone.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
