// @ts-nocheck
'use client'

import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import type { JourneyMilestone } from '@/types/database'

interface JourneySectionProps {
  milestones: JourneyMilestone[]
}

export default function JourneySection({ milestones }: JourneySectionProps) {
  const locale = useLocale()

  // Filter active milestones and sort by order_index first, then by year
  const activeMilestones = (milestones || [])
    .filter((m) => m.is_active !== false)
    .sort((a, b) => {
      const orderA = a.order_index ?? 0
      const orderB = b.order_index ?? 0
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return a.year - b.year
    })
    .slice(0, 4) // Limit to 4 items for the grid

  // Get localized text
  const getTitle = (milestone: JourneyMilestone) => {
    return milestone[`title_${locale}` as keyof JourneyMilestone] as string || milestone.title_en
  }

  const getDescription = (milestone: JourneyMilestone) => {
    const desc = milestone[`description_${locale}` as keyof JourneyMilestone] as string || milestone.description_en
    // Truncate to max 2 lines (approximately 120 characters)
    if (desc && desc.length > 120) {
      return desc.substring(0, 120).trim() + '...'
    }
    return desc
  }

  // Format year - show "Today" if year is current year or future
  const formatYear = (year: number) => {
    const currentYear = new Date().getFullYear()
    if (year >= currentYear) {
      return 'Today'
    }
    return year.toString()
  }

  // Don't render if no milestones
  if (activeMilestones.length === 0) {
    return null
  }

  return (
    <section className="py-10 bg-[#F9FAFB] relative">
      <div className="container mx-auto px-4 md:px-6">
        {/* Horizontal Grid - 4 columns on desktop, 2x2 on tablet, 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {activeMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              {/* Year - Small, elegant font */}
              <div className="mb-2">
                <span className="text-sm font-light text-gray-500 tracking-wider">
                  {formatYear(milestone.year)}
                </span>
              </div>

              {/* Title - Bold, short */}
              <h3 className="font-bold text-lg md:text-xl text-[#001F3F] mb-2 leading-tight">
                {getTitle(milestone)}
              </h3>

              {/* Description - Max 2 lines */}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {getDescription(milestone)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
