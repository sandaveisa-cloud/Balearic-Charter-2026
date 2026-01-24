'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ChevronRight, Home, ArrowLeft } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showBackButton?: boolean
}

export default function Breadcrumb({ items, className = '', showBackButton = true }: BreadcrumbProps) {
  const t = useTranslations('breadcrumb')

  // Get the parent page for back navigation
  const getBackHref = () => {
    if (items.length > 1 && items[items.length - 2].href) {
      return items[items.length - 2].href
    }
    return '/'
  }

  const getBackLabel = () => {
    if (items.length > 1) {
      return items[items.length - 2].label
    }
    return t('home') || 'Home'
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`bg-gradient-to-r from-luxury-blue/5 via-luxury-gold/5 to-luxury-blue/5 border-b border-luxury-gold/20 ${className}`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Breadcrumb Trail */}
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            {/* Home link with gold icon */}
            <li>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-luxury-gold hover:text-luxury-blue transition-colors group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">{t('home') || 'Home'}</span>
              </Link>
            </li>

            {/* Breadcrumb items */}
            {items.map((item, index) => {
              const isLast = index === items.length - 1
              
              return (
                <li key={index} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-luxury-gold/60" />
                  {isLast || !item.href ? (
                    <span className="text-luxury-blue font-semibold truncate max-w-[200px]">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href as any}
                      className="text-luxury-gold hover:text-luxury-blue transition-colors font-medium truncate max-w-[200px]"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>

          {/* Quick Back Button */}
          {showBackButton && items.length > 0 && (
            <Link
              href={getBackHref() as any}
              className="hidden md:flex items-center gap-1.5 text-sm text-luxury-gold hover:text-luxury-blue transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{t('backTo') || 'Back to'} {getBackLabel()}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
