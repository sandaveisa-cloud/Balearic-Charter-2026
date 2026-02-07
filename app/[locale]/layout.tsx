import React, { Suspense } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '../../i18n'
import type { Metadata } from 'next'
// IZDZĒSTS: Fontu imports (Inter, Playfair) šeit nav vajadzīgs
import '../globals.css'
import Footer from '@/components/Footer'
import StickyHeader from '@/components/StickyHeader'
import ScrollToTop from '@/components/ScrollToTop'
import ChatBot from '@/components/ChatBot'
import ThemeProvider from '@/components/ThemeProvider'

// IZDZĒSTS: const inter un const playfair definīcijas

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.balearicyachtcharters.com'
  
  // Default fallback metadata
  let currentTitle = 'Balearic Yacht Charters | Luxury Yacht Charter'
  let currentDescription = 'Premium yacht charters in the Balearic Islands.'
  let locale = 'en'
  
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    locale = resolvedParams.locale || 'en'
    
    // Validate locale before using it
    if (!locale || !locales.includes(locale as any)) {
      locale = 'en'
    }
    
    try {
      const t = await getTranslations({ locale, namespace: 'metadata' })
      currentTitle = t('title') || currentTitle
      currentDescription = t('description') || currentDescription
    } catch (translationError) {
      console.error('[Metadata] Error loading translations, using fallback:', translationError)
      // Try English fallback
      try {
        const fallbackT = await getTranslations({ locale: 'en', namespace: 'metadata' })
        currentTitle = fallbackT('title') || currentTitle
        currentDescription = fallbackT('description') || currentDescription
      } catch (fallbackError) {
        console.error('[Metadata] Error loading fallback translations:', fallbackError)
        // Use hardcoded defaults already set above
      }
    }
  } catch (error) {
    console.error('[Metadata] Error in generateMetadata, using defaults:', error)
    // Use hardcoded defaults already set above
  }

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
  // Pārējā loģika paliek nemainīga
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { locale } = resolvedParams
    
    if (!locale || !locales.includes(locale as any)) {
      notFound()
      return
    }

    setRequestLocale(locale)

    let messages = {}
    try {
      messages = await getMessages({ locale })
    } catch (messagesError) {
      console.error('[LocaleLayout] Error loading messages:', messagesError)
      // Use empty messages object as fallback - translations will use defaults
      messages = {}
    }

    return (
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider />
        <StickyHeader />
        <div className="pt-16">
          {children}
        </div>
        <Suspense fallback={<div className="h-32 bg-luxury-blue" />}>
          <Footer />
        </Suspense>
        <ChatBot />
        <ScrollToTop />
      </NextIntlClientProvider>
    )
  } catch (error) {
    console.error('[LocaleLayout] Error in layout:', error)
    // Return minimal layout for error cases (e.g., during static generation)
    return (
      <NextIntlClientProvider messages={{}}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Layout</h1>
            <p className="text-gray-600 mb-4">Please check console.</p>
          </div>
        </div>
      </NextIntlClientProvider>
    )
  }
}