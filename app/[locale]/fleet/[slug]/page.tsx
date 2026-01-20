import { notFound } from 'next/navigation'
import { getFleetBySlug, getSiteContent } from '@/lib/data'
import FleetDetail from '@/components/FleetDetail'
import StructuredData from '@/components/StructuredData'

type Props = {
  params: Promise<{ slug: string; locale: string }>
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
