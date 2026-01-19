import { notFound } from 'next/navigation'
import { getFleetBySlug } from '@/lib/data'
import FleetDetail from '@/components/FleetDetail'

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
  const { slug } = await params
  const yacht = await getFleetBySlug(slug)

  if (!yacht) {
    notFound()
  }

  return <FleetDetail yacht={yacht} />
}
