'use client'

import { useState, useEffect } from 'react'
import LanguageSwitcher from './LanguageSwitcher'

export default function StickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Add shadow and enhanced backdrop when scrolled
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-luxury-blue/98 backdrop-blur-md shadow-lg'
          : 'bg-luxury-blue/95 backdrop-blur-sm shadow-md'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
