'use client'

import { useState, useEffect } from 'react'
import { X, Zap } from 'lucide-react'
import { isEarlyBirdEligible, formatEarlyBirdDeadline } from '@/lib/earlyBirdDiscount'
import { useLocale, useTranslations } from 'next-intl'

export default function EarlyBirdBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const locale = useLocale()
  const t = useTranslations('hero')

  useEffect(() => {
    // Check if banner was dismissed in session storage
    const dismissed = sessionStorage.getItem('earlyBirdBannerDismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Only show if Early Bird is still eligible
    if (isEarlyBirdEligible()) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem('earlyBirdBannerDismissed', 'true')
  }

  if (!isVisible || isDismissed || !isEarlyBirdEligible()) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-r from-luxury-blue via-luxury-gold to-luxury-blue text-white py-3 px-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-center gap-3 relative">
        <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
        <p className="text-sm md:text-base font-medium text-center flex-1">
          {t('seasonLaunch')}
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
