import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '../../i18n'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import '../globals.css'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  
  const titles: Record<string, string> = {
    en: 'Balearic & Costa Blanca Charters | Luxury Yacht Charter',
    es: 'Alquiler de Yates de Lujo | Islas Baleares y Costa Blanca',
    de: 'Balearen & Costa Blanca Charter | Luxus Yachtcharter',
  }

  const descriptions: Record<string, string> = {
    en: 'Premium yacht charters in the Balearic Islands and Costa Blanca. Experience luxury at sea with our world-class fleet and exceptional service.',
    es: 'Alquiler de yates de lujo en las Islas Baleares y Costa Blanca. Experimenta el lujo en el mar con nuestra flota de clase mundial y servicio excepcional.',
    de: 'Premium Yachtcharter auf den Balearen und Costa Blanca. Erleben Sie Luxus auf See mit unserer erstklassigen Flotte und außergewöhnlichem Service.',
  }

  const currentTitle = titles[locale] || titles.en
  const currentDescription = descriptions[locale] || descriptions.en

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
  try {
    const { locale } = await params
    
    // Validate locale
    if (!locales.includes(locale as any)) {
      notFound()
    }

    // Load messages for the locale
    const messages = await getMessages({ locale })

    return (
      <>
        {/* Language Switcher in Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-luxury-blue/95 backdrop-blur-sm shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-end">
            <LanguageSwitcher />
          </div>
        </header>
        
        <NextIntlClientProvider messages={messages}>
          <div className="pt-16">
            {children}
          </div>
        </NextIntlClientProvider>
        
        <Footer />
      </>
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
