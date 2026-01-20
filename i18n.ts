import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// Supported locales
export const locales = ['en', 'es', 'de'] as const
export type Locale = (typeof locales)[number]

// Default locale
export const defaultLocale: Locale = 'en'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  try {
    // Dynamically import messages for the locale
    const messages = (await import(`./messages/${locale}.json`)).default
    
    return {
      messages
    }
  } catch (error) {
    console.error(`[i18n] Failed to load messages for locale: ${locale}`, error)
    // Fallback to English if locale messages fail to load
    if (locale !== 'en') {
      try {
        const fallbackMessages = (await import(`./messages/en.json`)).default
        return {
          messages: fallbackMessages
        }
      } catch (fallbackError) {
        console.error('[i18n] Failed to load fallback English messages', fallbackError)
        throw new Error(`Failed to load messages for locale: ${locale}`)
      }
    }
    throw error
  }
})
