import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/routing'

// Root page - redirect to default locale
// Middleware should handle this, but this is a fallback
export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
