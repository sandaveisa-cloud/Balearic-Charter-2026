'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Shield, Star, TrendingUp, Users, MapPin } from 'lucide-react'

export default function SocialProof() {
  const t = useTranslations('trust')

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 md:p-6 mb-6 rounded-lg shadow-sm">
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">
            {t('verified')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <Shield className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">
            {t('insured')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">
            {t('crew')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">
            {t('experts')}
          </span>
        </div>
      </div>

      {/* Social Proof Stats */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-green-700">
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
