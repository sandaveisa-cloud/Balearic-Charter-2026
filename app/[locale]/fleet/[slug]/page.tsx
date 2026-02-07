import { notFound } from 'next/navigation'
import { getFleetBySlug, getSiteContent, getVesselMilestones } from '@/lib/data'
import { getTranslations } from 'next-intl/server'
import FleetDetail from '@/components/FleetDetail'
import StructuredData from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import { locales } from '@/i18n/routing'
import type { JourneyMilestone } from '@/types/database'

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
// This function must never throw - it must return safe defaults if database is unavailable
export async function generateStaticParams() {
  // Default fallback params to ensure build never fails
  const defaultParams = locales.map(locale => [
    { slug: 'simona', locale: locale },
    { slug: 'wide-dream', locale: locale },
  ]).flat()
  
  try {
    const siteContent = await getSiteContent()
    const fleet = siteContent?.fleet || []
    const params: { slug: string; locale: string }[] = []
    
    for (const yacht of fleet) {
      if (yacht?.slug && yacht.is_active !== false) {
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
      console.warn('[generateStaticParams] No fleet found, using default params')
      return defaultParams
    }
    
    return params
  } catch (error) {
    console.error('[generateStaticParams] Error generating fleet params, using defaults:', error)
    // Always return default params to prevent build failure
    return defaultParams
  }
}

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params
    
    // Return early for reserved slugs
    if (isReservedSlug(slug)) {
      return {
        title: 'Page Not Found',
      }
    }
    
    try {
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
    } catch (yachtError) {
      console.error('[generateMetadata] Error fetching yacht:', yachtError)
      return {
        title: 'Yacht Not Found',
      }
    }
  } catch (error) {
    console.error('[generateMetadata] Error in generateMetadata:', error)
    return {
      title: 'Balearic Yacht Charters',
      description: 'Premium yacht charters in the Balearic Islands.',
    }
  }
}

export default async function FleetPage({ params }: Props) {
  try {
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

    // Fetch settings for structured data with error handling
    let settings = {}
    try {
      const siteContent = await getSiteContent()
      settings = siteContent?.settings || {}
    } catch (settingsError) {
      console.error('[FleetPage] Error fetching site content:', settingsError)
      // Continue with empty settings
    }

    // Fetch translations with error handling
    let t
    try {
      t = await getTranslations({ locale, namespace: 'fleet' })
    } catch (translationError) {
      console.error('[FleetPage] Error loading translations:', translationError)
      // Use fallback translations
      try {
        t = await getTranslations({ locale: 'en', namespace: 'fleet' })
      } catch (fallbackError) {
        console.error('[FleetPage] Error loading fallback translations:', fallbackError)
        // Create a minimal translation function
        t = (key: string) => {
          if (key === 'title') return 'Fleet'
          return key
        }
      }
    }

    // Fetch vessel-specific milestones (lazy-loaded, doesn't block page render)
    // Wrap in try-catch to prevent build failures if database is unavailable
    let vesselMilestones: JourneyMilestone[] = []
    try {
      vesselMilestones = await getVesselMilestones(yacht.id)
    } catch (error) {
      console.error('[FleetPage] Error fetching vessel milestones:', error)
      // Continue with empty array - VesselHistory component handles this gracefully
    }

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
        <FleetDetail yacht={yacht} vesselMilestones={vesselMilestones} />
      </main>
    )
  } catch (error) {
    console.error('[FleetPage] Critical error in FleetPage:', error)
    notFound()
  }
}
