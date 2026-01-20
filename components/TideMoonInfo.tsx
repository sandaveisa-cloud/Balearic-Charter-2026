'use client'

import { Moon, Waves, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TideMoonInfoProps {
  moonPhase?: string
  nextHighTide?: string
  tideHeight?: string
}

export default function TideMoonInfo({ 
  moonPhase = 'Waxing Gibbous',
  nextHighTide = '14:32',
  tideHeight = '0.8m'
}: TideMoonInfoProps) {
  const t = useTranslations('destinations')

  const getMoonIcon = (phase: string) => {
    const phaseLower = phase.toLowerCase()
    if (phaseLower.includes('new')) return '🌑'
    if (phaseLower.includes('waxing crescent')) return '🌒'
    if (phaseLower.includes('first quarter')) return '🌓'
    if (phaseLower.includes('waxing gibbous')) return '🌔'
    if (phaseLower.includes('full')) return '🌕'
    if (phaseLower.includes('waning gibbous')) return '🌖'
    if (phaseLower.includes('last quarter')) return '🌗'
    if (phaseLower.includes('waning crescent')) return '🌘'
    return '🌔' // Default to waxing gibbous
  }

  return (
    <div className="bg-gradient-to-br from-luxury-blue/10 to-luxury-gold/10 rounded-xl p-6 shadow-lg border border-luxury-gold/20">
      <div className="flex items-center gap-3 mb-4">
        <Waves className="w-5 h-5 text-luxury-gold" />
        <h3 className="font-serif text-xl font-bold text-luxury-blue">
          {t('tideMoonInfo') || 'Tide & Moon Phase'}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Moon Phase */}
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getMoonIcon(moonPhase)}</span>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {t('moonPhase') || 'Moon Phase'}
              </div>
              <div className="text-sm font-semibold text-luxury-blue">{moonPhase}</div>
            </div>
          </div>
        </div>

        {/* Next High Tide */}
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Waves className="w-5 h-5 text-luxury-blue" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {t('nextHighTide') || 'Next High Tide'}
              </div>
              <div className="text-sm font-semibold text-luxury-blue">{nextHighTide}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">{t('height') || 'Height'}</div>
            <div className="text-sm font-semibold text-luxury-gold">{tideHeight}</div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        {t('tideNote') || 'Tide information is approximate. Check local charts for navigation.'}
      </p>
    </div>
  )
}
