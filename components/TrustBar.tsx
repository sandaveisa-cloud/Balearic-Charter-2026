'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Shield, Users, MapPin, Star, TrendingUp } from 'lucide-react'

interface TrustBarProps {
  variant?: 'compact' | 'full'
}

export default function TrustBar({ variant = 'full' }: TrustBarProps) {
  const t = useTranslations('trust')

  if (variant === 'compact') {
    // Compact version for fleet listing cards
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            <span className="font-medium">{t('verified')}</span>
          </div>
          <div className="flex items-center gap-1 text-green-700">
            <Shield className="w-3 h-3" />
            <span className="font-medium">{t('insured')}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-700">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{t('rating')}</span>
          </div>
        </div>
      </div>
    )
  }

  // Full version for detail pages
  return (
    <div className="bg-gradient-to-r from-green-50 via-amber-50 to-green-50 border border-green-200 rounded-lg p-3 md:p-4 mb-4 shadow-sm">
      {/* Trust Badges Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-2">
        <div className="flex items-center gap-1.5 text-green-800">
          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">{t('verified')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-800">
          <Shield className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">{t('insured')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-800">
          <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">{t('crew')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-800">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">{t('experts')}</span>
        </div>
      </div>

      {/* Social Proof Stats Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-green-700">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          <span>{t('bookings')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          <span>{t('rating')}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          <span>{t('secret_bays')}</span>
        </div>
      </div>
    </div>
  )
}
