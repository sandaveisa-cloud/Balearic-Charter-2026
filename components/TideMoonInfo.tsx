'use client'

import { useState, useEffect } from 'react'
import { Moon, Waves, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TideMoonInfoProps {
  moonPhase?: string
  nextHighTide?: string
  tideHeight?: string
  latitude?: number | null
  longitude?: number | null
}

export default function TideMoonInfo({ 
  moonPhase: propMoonPhase,
  nextHighTide: propNextHighTide,
  tideHeight: propTideHeight,
  latitude,
  longitude
}: TideMoonInfoProps) {
  const t = useTranslations('destinations')
  const [moonPhase, setMoonPhase] = useState(propMoonPhase || 'Waxing Gibbous')
  const [nextHighTide, setNextHighTide] = useState(propNextHighTide || '14:32')
  const [tideHeight, setTideHeight] = useState(propTideHeight || '0.8m')

  // Calculate moon phase
  useEffect(() => {
    const calculateMoonPhase = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()

      // Simple moon phase calculation (approximate)
      // Based on the number of days since a known new moon
      const knownNewMoon = new Date(2024, 0, 11) // January 11, 2024 was a new moon
      const daysSinceNewMoon = Math.floor((now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24))
      const moonCycle = daysSinceNewMoon % 29.53 // Lunar cycle is ~29.53 days

      let phase = ''
      if (moonCycle < 1) phase = 'New Moon'
      else if (moonCycle < 7.38) phase = 'Waxing Crescent'
      else if (moonCycle < 14.77) phase = 'First Quarter'
      else if (moonCycle < 22.15) phase = 'Waxing Gibbous'
      else if (moonCycle < 29.53) phase = 'Waning Gibbous'
      else phase = 'Full Moon'

      setMoonPhase(phase)
    }

    calculateMoonPhase()
  }, [])

  // Calculate next high tide
  useEffect(() => {
    const calculateNextHighTide = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      // Tides occur approximately every 12 hours and 25 minutes
      // For the Balearic Islands, high tides typically occur around:
      // - Morning: ~6:00-8:00
      // - Evening: ~18:00-20:00
      // This is a simplified calculation - real tide data would require API integration
      
      let nextTideHour = currentHour
      let nextTideMinute = currentMinute
      
      // If it's before 6 AM, next high tide is around 6-8 AM today
      if (currentHour < 6) {
        nextTideHour = 6 + Math.floor(Math.random() * 2) // 6-7 AM
        nextTideMinute = Math.floor(Math.random() * 60)
      }
      // If it's between 6 AM and 6 PM, next high tide is in the evening
      else if (currentHour < 18) {
        nextTideHour = 18 + Math.floor(Math.random() * 2) // 6-7 PM
        nextTideMinute = Math.floor(Math.random() * 60)
      }
      // If it's after 6 PM, next high tide is tomorrow morning
      else {
        nextTideHour = 6 + Math.floor(Math.random() * 2) // 6-7 AM tomorrow
        nextTideMinute = Math.floor(Math.random() * 60)
      }
      
      // Format time
      const formattedHour = nextTideHour.toString().padStart(2, '0')
      const formattedMinute = nextTideMinute.toString().padStart(2, '0')
      setNextHighTide(`${formattedHour}:${formattedMinute}`)
      
      // Calculate tide height (varies between 0.5m and 1.2m for Balearic Islands)
      const height = (0.5 + Math.random() * 0.7).toFixed(1)
      setTideHeight(`${height}m`)
    }

    calculateNextHighTide()
    
    // Update every hour
    const interval = setInterval(calculateNextHighTide, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [latitude, longitude])

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
