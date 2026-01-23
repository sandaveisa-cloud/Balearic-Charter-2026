import { notFound } from 'next/navigation'
import YachtDetails from '@/components/YachtDetails'
import { locales } from '@/i18n/routing'

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

// Valid yacht slugs
const validSlugs = ['lagoon-400-s2-simona', 'lagoon-450-fly'] as const
type YachtSlug = (typeof validSlugs)[number]

// Generate static params for all yacht slugs and locales
export async function generateStaticParams() {
  const params: { slug: string; locale: string }[] = []
  
  for (const slug of validSlugs) {
    for (const locale of locales) {
      params.push({
        slug,
        locale,
      })
    }
  }
  
  return params
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  
  if (!validSlugs.includes(slug as YachtSlug)) {
    return {
      title: 'Yacht Not Found',
    }
  }

  const yachtNames: Record<YachtSlug, Record<string, string>> = {
    'lagoon-400-s2-simona': {
      en: 'Lagoon 400 S2 "Simona"',
      es: 'Lagoon 400 S2 "Simona"',
      de: 'Lagoon 400 S2 "Simona"',
    },
    'lagoon-450-fly': {
      en: 'Lagoon 450 Fly',
      es: 'Lagoon 450 Fly',
      de: 'Lagoon 450 Fly',
    },
  }

  const { locale } = await params
  const name = yachtNames[slug as YachtSlug]?.[locale] || yachtNames[slug as YachtSlug]?.en

  return {
    title: `${name} | widedream.es - Premium Yacht Charters`,
    description: `Discover the ${name}, a luxury catamaran available for charter in the Balearic Islands and Costa Blanca.`,
  }
}

export default async function YachtPage({ params }: Props) {
  const { slug, locale } = await params

  if (!validSlugs.includes(slug as YachtSlug)) {
    notFound()
  }

  return <YachtDetails yachtSlug={slug as YachtSlug} />
}
