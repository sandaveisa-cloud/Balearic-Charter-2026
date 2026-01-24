'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function FloatingCTA() {
  const t = useTranslations('common')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <Link
      href="/contact"
      className="fixed bottom-24 right-4 md:right-6 z-[9999] flex items-center gap-2 bg-gradient-to-r from-luxury-gold via-yellow-400 to-luxury-gold text-luxury-blue px-5 py-3.5 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-300 hover:scale-110 cursor-pointer select-none animate-pulse-slow"
      style={{ 
        pointerEvents: 'auto',
        touchAction: 'manipulation'
      }}
      aria-label={t('getQuote') || 'Get a Quote'}
    >
      {/* Animated glow ring */}
      <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-luxury-gold to-yellow-400 opacity-40 blur-md animate-pulse"></span>
      
      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <span className="font-bold text-sm md:text-base whitespace-nowrap">
          {t('getQuote') || 'Get a Quote'}
        </span>
      </span>
    </Link>
  )
}
