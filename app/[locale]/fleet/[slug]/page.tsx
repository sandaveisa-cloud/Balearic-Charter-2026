import { notFound } from 'next/navigation'
import { getFleetBySlug, getSiteContent } from '@/lib/data'
import FleetDetail from '@/components/FleetDetail'
import StructuredData from '@/components/StructuredData'
import { locales } from '@/i18n/routing'

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
  const yacht = await getFleetBySlug(slug)

  if (!yacht) {
    return {
      title: 'Yacht Not Found',
    }
  }

  return {
    title: `${yacht.name} | Balearic & Costa Blanca Charters`,
    description: yacht.short_description || yacht.description || '',
  }
}

export default async function FleetPage({ params }: Props) {
  const { slug, locale } = await params
  const yacht = await getFleetBySlug(slug)

  if (!yacht) {
    notFound()
  }

  // Fetch settings for structured data
  const siteContent = await getSiteContent()
  const settings = siteContent.settings || {}

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="BoatTrip" settings={settings} yacht={yacht} locale={locale} />
      <FleetDetail yacht={yacht} />
    </>
  )
}
