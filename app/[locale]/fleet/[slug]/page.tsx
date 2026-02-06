import { notFound } from 'next/navigation'
import { getFleetBySlug, getSiteContent } from '@/lib/data'
import { getTranslations } from 'next-intl/server'
import FleetDetail from '@/components/FleetDetail'
import StructuredData from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import { locales } from '@/i18n/routing'

// Force dynamic rendering to always fetch fresh data from database
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Reserved slugs that should NOT be treated as yacht slugs
// These are static pages or localized URL patterns that might be mistakenly routed here
const RESERVED_SLUGS = [
  // About page (localized)
  'about',             // English About
  'sobre-nosotros',    // Spanish About
  'ueber-uns',         // German About
  // Contact page (localized)
  'contact',           // English Contact
  'contacto',          // Spanish Contact
  'kontakt',           // German Contact
  // Other pages
  'booking',           // Booking page
  'reservar',          // Spanish Booking
  'buchung',           // German Booking
  'privacy',           // Privacy policy
  'legal',             // Legal notice
  'terms',             // Terms and conditions
  'cookies',           // Cookies policy
  'login',             // Login page
  'admin',             // Admin panel
  'api',               // API routes
  'destinations',      // Destinations page
  'destinos',          // Spanish Destinations
  'reiseziele',        // German Destinations
]

// Check if a slug is reserved (not a yacht)
function isReservedSlug(slug: string): boolean {
  const normalizedSlug = slug.toLowerCase().trim()
  return RESERVED_SLUGS.includes(normalizedSlug) || 
         normalizedSlug.includes('%2f') || // URL-encoded slash (malformed URL)
         normalizedSlug.includes('/') ||   // Contains slash
         normalizedSlug.startsWith('_') || // Internal routes
         normalizedSlug.startsWith('.')    // Hidden files
}

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

// Generate static params for all fleet slugs to prevent 404s
export async function generateStaticParams() {
  try {
    const siteContent = await getSiteContent()
    const fleet = siteContent.fleet || []
    const params: { slug: string; locale: string }[] = []
    
    for (const yacht of fleet) {
      if (yacht.slug && yacht.is_active) {
        for (const locale of locales) {
          params.push({
            slug: yacht.slug,
            locale: locale,
          })
        }
      }
    }
    
    // If no fleet found, return default params to prevent build failure
    if (params.length === 0) {
      return locales.map(locale => [
        { slug: 'simona', locale: locale },
        { slug: 'wide-dream', locale: locale },
      ]).flat()
    }
    
    return params
  } catch (error) {
    console.error('[generateStaticParams] Error generating fleet params:', error)
    // Return default params to prevent build failure
    return locales.map(locale => [
      { slug: 'simona', locale: locale },
      { slug: 'wide-dream', locale: locale },
    ]).flat()
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  
  // Return early for reserved slugs
  if (isReservedSlug(slug)) {
    return {
      title: 'Page Not Found',
    }
  }
  
  const yacht = await getFleetBySlug(slug)

  if (!yacht) {
    return {
      title: 'Yacht Not Found',
    }
  }

  return {
    title: `${yacht.name} | Balearic Yacht Charters`,
    description: yacht.short_description || yacht.description || '',
  }
}

export default async function FleetPage({ params }: Props) {
  const { slug, locale } = await params
  
  // Immediately return 404 for reserved slugs - don't even try to fetch
  if (isReservedSlug(slug)) {
    console.log(`[FleetPage] Reserved slug detected, returning 404: ${slug}`)
    notFound()
  }
  
  const yacht = await getFleetBySlug(slug)

  if (!yacht) {
    notFound()
  }

  // Fetch settings for structured data
  const siteContent = await getSiteContent()
  const settings = siteContent.settings || {}
  const t = await getTranslations({ locale, namespace: 'fleet' })

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: t('title') || 'Fleet', href: '/fleet' },
          { label: yacht.name }
        ]} 
      />
      
      {/* Structured Data for SEO */}
      <StructuredData type="BoatTrip" settings={settings} yacht={yacht} locale={locale} />
      <FleetDetail yacht={yacht} />
    </main>
  )
}
