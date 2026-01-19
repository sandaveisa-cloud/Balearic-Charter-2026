import { getSiteContent } from '@/lib/data'
import Hero from '@/components/Hero'
import MissionSection from '@/components/MissionSection'
import FleetSection from '@/components/FleetSection'
import DestinationsSection from '@/components/DestinationsSection'
import ReviewsSection from '@/components/ReviewsSection'
import StatsSection from '@/components/StatsSection'
import CulinarySection from '@/components/CulinarySection'
import CrewSection from '@/components/CrewSection'

// Force fresh data on every request (disable caching)
export const revalidate = 0

type Props = {
  params: { locale: string }
}

export default async function Home({ params: { locale } }: Props) {
  const content = await getSiteContent()

  return (
    <main className="min-h-screen pt-16">
      <Hero settings={content.settings} />
      <MissionSection />
      <StatsSection stats={content.stats} />
      <FleetSection fleet={content.fleet} />
      <DestinationsSection destinations={content.destinations} />
      <CulinarySection experiences={content.culinaryExperiences} />
      <CrewSection crew={content.crew} />
      <ReviewsSection reviews={content.reviews} />
    </main>
  )
}
