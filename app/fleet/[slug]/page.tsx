import { notFound } from 'next/navigation'
import { getFleetBySlug } from '@/lib/data'
import FleetDetail from '@/components/FleetDetail'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const yacht = await getFleetBySlug(params.slug)

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

export default async function FleetPage({ params }: { params: { slug: string } }) {
  const yacht = await getFleetBySlug(params.slug)

  if (!yacht) {
    notFound()
  }

  return <FleetDetail yacht={yacht} />
}
