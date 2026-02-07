import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/routing'

// Root page - redirect to default locale
// This is a fallback if middleware doesn't catch the root path
// Middleware should handle this first, but this ensures the redirect happens
export default function RootPage() {
  // Permanent redirect to default locale
  // redirect() throws NEXT_REDIRECT error internally, so this return is never reached
  redirect(`/${defaultLocale}`)
}
