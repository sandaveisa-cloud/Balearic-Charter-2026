import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import '../globals.css'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
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

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Load messages for the locale
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Hreflang tags for SEO */}
        {locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/${loc}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/en`}
        />
      </head>
      <body className="font-sans antialiased">
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
      </body>
    </html>
  )
}
