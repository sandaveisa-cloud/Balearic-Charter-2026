import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, type Locale } from './routing'

// next-intl App Router request config
// See: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = (requested || defaultLocale) as string

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default
    return { locale, messages }
  } catch (error) {
    // Fallback to English if locale messages fail to load
    console.error(`[i18n] Failed to load messages for locale: ${locale}`, error)
    const messages = (await import(`../messages/${defaultLocale}.json`)).default
    return { locale: defaultLocale, messages }
  }
})

