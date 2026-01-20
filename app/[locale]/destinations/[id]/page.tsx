import { notFound } from 'next/navigation'
import { getDestinationByIdOrSlug } from '@/lib/data'
import DestinationDetail from '@/components/DestinationDetail'

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const destination = await getDestinationByIdOrSlug(id)

  if (!destination) {
    return {
      title: 'Destination Not Found',
    }
  }

  const destinationName = destination.name || destination.title || 'Destination'
  const description = destination.description || destination.description_en || ''

  return {
    title: `${destinationName} | Balearic & Costa Blanca Charters`,
    description: description.substring(0, 160) || `Explore ${destinationName} with our luxury yacht charter services.`,
  }
}

export default async function DestinationPage({ params }: Props) {
  const { id } = await params
  const destination = await getDestinationByIdOrSlug(id)

  if (!destination) {
    notFound()
  }

  return <DestinationDetail destination={destination} />
}
