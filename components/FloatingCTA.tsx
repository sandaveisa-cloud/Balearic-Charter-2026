'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function FloatingCTA() {
  const t = useTranslations('common')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <a
      href="#fleet"
      className="fixed bottom-24 right-8 z-40 flex items-center gap-2 bg-gradient-to-r from-luxury-gold to-yellow-400 text-luxury-blue px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
      aria-label={t('bookNow') || 'Book Now'}
    >
      {/* Pulse ring animation on hover */}
      <span className="absolute inset-0 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-75 group-hover:animate-ping transition-opacity duration-300"></span>
      
      <Calendar className="w-5 h-5 relative z-10" />
      <span className="font-bold text-sm md:text-base relative z-10">{t('bookNow') || 'Book Now'}</span>
    </a>
  )
}
