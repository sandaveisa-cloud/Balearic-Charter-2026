// Centralized i18n routing config for next-intl + App Router
export const locales = ['en', 'es', 'de'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

