'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ChevronDown, ChevronUp, Anchor } from 'lucide-react'
import type { JourneyMilestone } from '@/types/database'

interface VesselHistoryProps {
  milestones?: JourneyMilestone[]
  yachtSlug?: string
}

export default function VesselHistory({ milestones = [], yachtSlug }: VesselHistoryProps) {
  const t = useTranslations('vesselHistory')
  const locale = useLocale() as 'en' | 'es' | 'de'
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter active milestones and sort by year (most recent first)
  const activeMilestones = (milestones || [])
    .filter((m) => m.is_active !== false)
    .sort((a, b) => {
      // Sort by year descending (newest first)
      return b.year - a.year
    })

  // Get localized text
  const getTitle = (milestone: JourneyMilestone) => {
    return milestone[`title_${locale}` as keyof JourneyMilestone] as string || milestone.title_en
  }

  const getDescription = (milestone: JourneyMilestone) => {
    return milestone[`description_${locale}` as keyof JourneyMilestone] as string || milestone.description_en
  }

  // Format year
  const formatYear = (year: number) => {
    const currentYear = new Date().getFullYear()
    if (year >= currentYear) {
      return locale === 'en' ? 'Today' : locale === 'es' ? 'Hoy' : 'Heute'
    }
    return year.toString()
  }

  // Don't render if no milestones
  if (activeMilestones.length === 0) {
    return null
  }

  // Show first 2 milestones by default, rest when expanded
  const displayedMilestones = isExpanded ? activeMilestones : activeMilestones.slice(0, 2)

  return (
    <section className="py-8 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Anchor className="w-5 h-5 text-[#002447]" />
              <h3 className="text-xl md:text-2xl font-bold text-[#002447] font-serif">
                {t('title')}
              </h3>
            </div>
            {activeMilestones.length > 2 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-[#002447] hover:text-[#003d6b] transition-colors"
              >
                {isExpanded ? (
                  <>
                    {t('collapseHistory')}
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {t('expandHistory')}
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {displayedMilestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="relative pl-8 pb-6 border-l-2 border-[#002447]/20 last:border-l-0 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 -translate-x-1/2 w-4 h-4 bg-[#002447] rounded-full border-2 border-white shadow-sm"></div>

                {/* Content */}
                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="text-sm font-semibold text-[#002447] tracking-wide">
                      {formatYear(milestone.year)}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-[#001F3F] mb-2">
                    {getTitle(milestone)}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {getDescription(milestone)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
