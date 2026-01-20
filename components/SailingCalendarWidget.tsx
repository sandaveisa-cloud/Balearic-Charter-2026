'use client'

import { useTranslations } from 'next-intl'
import { Wind, Sun, Cloud, Droplets, Calendar } from 'lucide-react'
import type { SeasonalData } from '@/types/database'

interface SailingCalendarWidgetProps {
  seasonalData?: SeasonalData | null
  destinationName: string
}

export default function SailingCalendarWidget({ seasonalData, destinationName }: SailingCalendarWidgetProps) {
  const t = useTranslations('destinations')

  if (!seasonalData) {
    return null
  }

  const seasons = [
    { key: 'spring', label: t('seasons.spring') || 'Spring', icon: Sun, months: 'Mar-May' },
    { key: 'summer', label: t('seasons.summer') || 'Summer', icon: Sun, months: 'Jun-Aug' },
    { key: 'earlyAutumn', label: t('seasons.earlyAutumn') || 'Early Autumn', icon: Wind, months: 'Sep-Oct' },
    { key: 'lateAutumn', label: t('seasons.lateAutumn') || 'Late Autumn', icon: Cloud, months: 'Nov' },
    { key: 'winter', label: t('seasons.winter') || 'Winter', icon: Droplets, months: 'Dec-Feb' },
  ]

  const getSeasonData = (key: string) => {
    return seasonalData[key as keyof SeasonalData]
  }

  // Find best season (highest sailing score)
  const allScores = seasons
    .map(s => ({ season: s, data: getSeasonData(s.key) }))
    .filter(s => s.data)
    .map(s => ({ ...s, score: s.data!.sailing_score }))
  
  const bestSeason = allScores.reduce((best, current) => 
    current.score > best.score ? current : best, allScores[0]
  )

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-luxury-gold" />
        <h3 className="font-serif text-2xl font-bold text-luxury-blue">
          {t('sailingCalendar') || 'Sailing Calendar'}
        </h3>
      </div>

      <p className="text-gray-600 mb-6 text-sm">
        {t('sailingCalendarDescription') || 'Best sailing conditions throughout the year'}
      </p>

      {/* Seasons Grid */}
      <div className="space-y-4">
        {seasons.map((season) => {
          const data = getSeasonData(season.key)
          if (!data) return null

          const Icon = season.icon
          const isBest = bestSeason?.season.key === season.key
          const scoreColor = data.sailing_score >= 90 
            ? 'text-luxury-gold' 
            : data.sailing_score >= 75 
            ? 'text-green-600' 
            : 'text-gray-600'

          return (
            <div
              key={season.key}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                isBest
                  ? 'border-luxury-gold bg-luxury-gold/5 shadow-md'
                  : 'border-gray-200 hover:border-luxury-gold/50'
              }`}
            >
              {/* Best Time Badge */}
              {isBest && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-luxury-gold text-luxury-blue text-xs font-bold rounded-full shadow-lg">
                  {t('bestTime') || 'Best Time'}
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="w-5 h-5 text-luxury-blue mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-luxury-blue">{season.label}</h4>
                      <span className="text-xs text-gray-500">({season.months})</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{data.conditions}</p>
                    {data.pros && data.pros.length > 0 && (
                      <ul className="text-xs text-gray-500 space-y-1">
                        {data.pros.slice(0, 2).map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-luxury-gold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Sailing Score */}
                <div className="text-center flex-shrink-0">
                  <div className={`text-3xl font-bold ${scoreColor} mb-1`}>
                    {data.sailing_score}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    {t('sailingScore') || 'Score'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {data.avg_temp}°C
                  </div>
                </div>
              </div>

              {/* Score Bar */}
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    data.sailing_score >= 90
                      ? 'bg-luxury-gold'
                      : data.sailing_score >= 75
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                  style={{ width: `${data.sailing_score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendation */}
      {bestSeason && bestSeason.data && (
        <div className="mt-6 p-4 bg-luxury-blue/5 border border-luxury-gold/30 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-luxury-blue">
              {t('recommendation') || 'Our Recommendation'}:
            </span>{' '}
            {t('bestSeasonText', {
              season: bestSeason.season.label,
              score: bestSeason.data.sailing_score,
              destination: destinationName
            }) || `${bestSeason.season.label} offers the best sailing conditions (${bestSeason.data.sailing_score}% score) for ${destinationName}.`}
          </p>
        </div>
      )}
    </div>
  )
}
