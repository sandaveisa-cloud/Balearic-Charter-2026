import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '../../i18n'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import '../globals.css'
import Footer from '@/components/Footer'
import StickyHeader from '@/components/StickyHeader'
import ScrollToTop from '@/components/ScrollToTop'
import WhatsAppButton from '@/components/WhatsAppButton'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const { locale } = resolvedParams
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  
  // Get translated metadata from translation files
  let currentTitle: string
  let currentDescription: string
  
  try {
    const t = await getTranslations({ locale, namespace: 'metadata' })
    currentTitle = t('title')
    currentDescription = t('description')
  } catch (error) {
    console.error('[Metadata] Error loading translations, using fallback:', error)
    // Fallback to English if translation fails
    const fallbackT = await getTranslations({ locale: 'en', namespace: 'metadata' })
    currentTitle = fallbackT('title')
    currentDescription = fallbackT('description')
  }

  // Generate hreflang links for SEO
  const languages = locales.map((loc) => ({
    url: `${baseUrl}/${loc}`,
    hreflang: loc,
  }))

  return {
    title: currentTitle,
    description: currentDescription,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`,
        'de': `${baseUrl}/de`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: currentTitle,
      description: currentDescription,
      locale: locale,
      alternateLocale: locales.filter((l) => l !== locale),
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  console.log('[LocaleLayout] Starting layout render...')
  
  try {
    // Handle both Promise and direct params (Next.js 14+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params
    const { locale } = resolvedParams
    
    console.log('[LocaleLayout] Locale from params:', locale)
    console.log('[LocaleLayout] Available locales:', locales)
    
    // Validate locale
    if (!locale || !locales.includes(locale as any)) {
      console.error('[LocaleLayout] Invalid locale:', locale)
      notFound()
      return // TypeScript guard
    }

    console.log('[LocaleLayout] Locale validated, setting request locale...')
    // Enable static rendering for pages using next-intl in Server Components
    setRequestLocale(locale)

    console.log('[LocaleLayout] Loading messages for locale:', locale)
    // Load messages for the locale
    let messages
    try {
      messages = await getMessages({ locale })
      console.log('[LocaleLayout] Messages loaded successfully, keys:', Object.keys(messages || {}).length)
    } catch (messagesError) {
      console.error('[LocaleLayout] Error loading messages:', messagesError)
      // Fallback to empty messages object instead of crashing
      messages = {}
      console.warn('[LocaleLayout] Using empty messages object as fallback')
    }

    return (
      <NextIntlClientProvider messages={messages}>
        {/* Sticky Header with Language Switcher */}
        <StickyHeader />
        
        <div className="pt-16">
          {children}
        </div>
        <Footer />
        
        {/* Floating Action Buttons */}
        <WhatsAppButton />
        <ScrollToTop />
      </NextIntlClientProvider>
    )
  } catch (error) {
    console.error('[LocaleLayout] Error:', error)
    // Return error UI instead of throwing to prevent 404
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Layout</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <p className="text-sm text-gray-500">
            Please check the server console for more details.
          </p>
        </div>
      </div>
    )
  }
}
