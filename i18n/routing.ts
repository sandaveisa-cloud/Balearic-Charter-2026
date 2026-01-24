// Centralized i18n routing config for next-intl + App Router
import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'de'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

// Define localized pathnames for pages with translated URLs
export const pathnames = {
  '/': '/',
  '/about': {
    en: '/about',
    es: '/sobre-nosotros',
    de: '/ueber-uns',
  },
  '/contact': {
    en: '/contact',
    es: '/contacto',
    de: '/kontakt',
  },
  '/fleet': '/fleet',
  '/fleet/[slug]': '/fleet/[slug]',
  '/destinations': '/destinations',
  '/destinations/[id]': '/destinations/[id]',
  '/legal': '/legal',
  '/privacy': '/privacy',
  '/cookies': '/cookies',
  '/terms': '/terms',
  '/login': '/login',
} as const

export const routing = defineRouting({
  locales,
  defaultLocale,
  pathnames,
  localePrefix: 'always',
})
