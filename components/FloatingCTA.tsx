'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function FloatingCTA() {
  const t = useTranslations('common')
  const locale = useLocale()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  // Scroll to contact section on home page
  const handleClick = (e: React.MouseEvent) => {
    // If we're on the home page, scroll to contact section
    if (window.location.pathname === `/${locale}` || window.location.pathname === `/${locale}/`) {
      e.preventDefault()
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <Link
      href="/contact"
      onClick={handleClick}
      className="fixed bottom-40 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-luxury-gold to-yellow-400 text-luxury-blue px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
      aria-label={t('getQuote') || 'Get a Quote'}
    >
      {/* Subtle glow on hover */}
      <span className="absolute inset-0 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
      
      <MessageSquare className="w-5 h-5 relative z-10" />
      <span className="font-bold text-sm md:text-base relative z-10 whitespace-nowrap">
        {t('getQuote') || 'Get a Quote'}
      </span>
    </Link>
  )
}
