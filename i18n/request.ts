import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, type Locale } from './routing'

// next-intl App Router request config
// See: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
export default getRequestConfig(async ({ requestLocale }) => {
  try {
    const requested = await requestLocale
    const locale = (requested || defaultLocale) as string

    // Validate locale - use default if invalid to prevent build failures during static generation
    // Don't call notFound() here as it can cause prerender crashes
    const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale

    try {
      const messages = (await import(`../messages/${validLocale}.json`)).default
      return { locale: validLocale, messages }
    } catch (error) {
      // Fallback to English if locale messages fail to load
      console.error(`[i18n] Failed to load messages for locale: ${locale}`, error)
      try {
        const messages = (await import(`../messages/${defaultLocale}.json`)).default
        return { locale: defaultLocale, messages }
      } catch (fallbackError) {
        console.error(`[i18n] Failed to load fallback messages:`, fallbackError)
        // Return empty messages object to prevent build failure
        return { locale: defaultLocale, messages: {} }
      }
    }
  } catch (error) {
    console.error('[i18n] Error in getRequestConfig:', error)
    // Return safe defaults to prevent build failure
    return { locale: defaultLocale, messages: {} }
  }
})

