import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/routing'

// Root page - redirect to default locale
// Middleware should handle this, but this is a fallback
// This should never be reached if middleware is working correctly
export default function RootPage() {
  // redirect() throws NEXT_REDIRECT error internally, so this return is never reached
  redirect(`/${defaultLocale}`)
}
