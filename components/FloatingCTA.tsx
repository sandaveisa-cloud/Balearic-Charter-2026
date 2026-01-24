'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function FloatingCTA() {
  const t = useTranslations('common')
  const [isVisible, setIsVisible] = useState(false)

  const handleScroll = useCallback(() => {
    setIsVisible(window.scrollY > 300)
  }, [])

  useEffect(() => {
    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (!isVisible) return null

  return (
    <Link
      href="/contact"
      className="fixed right-4 md:right-6 flex items-center gap-2 bg-gradient-to-r from-luxury-gold via-yellow-400 to-luxury-gold text-luxury-blue px-5 py-3.5 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-300 hover:scale-110 cursor-pointer select-none"
      style={{ 
        bottom: '100px',
        zIndex: 9999,
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        position: 'fixed',
      }}
      aria-label={t('getQuote') || 'Get a Quote'}
    >
      {/* Animated glow ring */}
      <span 
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-luxury-gold to-yellow-400 opacity-40 blur-md"
        style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
      ></span>
      
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
