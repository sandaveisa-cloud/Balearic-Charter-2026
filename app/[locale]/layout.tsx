import React from 'react'
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
  const resolvedParams = params instanceof Promise ? await params : params
  const { locale } = resolvedParams
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.widedream.es'
  
  let currentTitle: string
  let currentDescription: string
  
  try {
    const t = await getTranslations({ locale, namespace: 'metadata' })
    currentTitle = t('title')
    currentDescription = t('description')
  } catch (error) {
    console.error('[Metadata] Error loading translations, using fallback:', error)
    const fallbackT = await getTranslations({ locale: 'en', namespace: 'metadata' })
    currentTitle = fallbackT('title')
    currentDescription = fallbackT('description')
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

    let messages
    try {
      messages = await getMessages({ locale })
    } catch (messagesError) {
      messages = {}
    }

    return (
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider />
        <StickyHeader />
        <div className="pt-16">
          {children}
        </div>
        <Footer />
        <ChatBot />
        <ScrollToTop />
      </NextIntlClientProvider>
    )
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Layout</h1>
          <p className="text-gray-600 mb-4">Please check console.</p>
        </div>
      </div>
    )
  }
}