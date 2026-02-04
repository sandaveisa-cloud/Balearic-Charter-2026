'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import { Ship, Anchor, Phone, Menu, X } from 'lucide-react'

export default function StickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations('navigation')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navLinks = [
    { href: '/fleet', label: t('fleet') || 'Fleet', icon: Ship },
    { href: '/destinations', label: t('destinations') || 'Destinations', icon: Anchor },
    { href: '/contact', label: t('contact') || 'Contact', icon: Phone },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-luxury-blue/98 backdrop-blur-md shadow-lg'
          : 'bg-luxury-blue/95 backdrop-blur-sm shadow-md'
      }`}
      style={{ position: 'fixed' }}
    >
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Company Name - Links to Home */}
          <Link 
            href="/"
            className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-white hover:text-luxury-gold transition-colors duration-300"
          >
            Balearic Yacht Charters
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="flex items-center gap-1.5 text-white/90 hover:text-luxury-gold transition-colors text-sm font-medium"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side - Language Switcher + Mobile Menu */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-luxury-gold transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-white/90 hover:text-luxury-gold transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
