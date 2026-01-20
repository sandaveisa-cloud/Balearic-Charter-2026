'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Shield, Star, TrendingUp } from 'lucide-react'

export default function SocialProof() {
  const t = useTranslations('fleet')

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 md:p-6 mb-6 rounded-lg shadow-sm">
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {t('trustBadges.verified') || 'Verified Charter'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {t('trustBadges.insured') || 'Fully Insured'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {t('trustBadges.professionalCrew') || 'Professional Crew'}
          </span>
        </div>
      </div>

      {/* Social Proof Stats */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-green-700">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>
            {t('socialProof.recentBookings') || '🔥 3 bookings in the last 7 days'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>
            {t('socialProof.rating') || '⭐ 4.9/5 average rating'}
          </span>
        </div>
      </div>
    </div>
  )
}
