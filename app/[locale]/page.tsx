import React from 'react'
import { getSiteContent } from '@/lib/data'
import Hero from '@/components/Hero'
import MissionSection from '@/components/MissionSection'
import FleetSection from '@/components/FleetSection'
import DestinationsSection from '@/components/DestinationsSection'
import Testimonials from '@/components/Testimonials'
import ReviewsSection from '@/components/ReviewsSection'
import StatsSection from '@/components/StatsSection'
import CulinarySection from '@/components/CulinarySection'
import CrewSection from '@/components/CrewSection'

// Cache data for 1 hour (3600 seconds)
export const revalidate = 3600

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  try {
    const { locale } = await params
    const content = await getSiteContent()

    return (
      <main className="min-h-screen pt-16">
        <Hero settings={content.settings} />
        <MissionSection />
        <StatsSection stats={content.stats || []} />
        <FleetSection fleet={content.fleet || []} />
        <DestinationsSection destinations={content.destinations || []} />
        <Testimonials reviews={content.reviews || []} />
        <CulinarySection experiences={content.culinaryExperiences || []} />
        {/* Only show CrewSection if there are active crew members */}
        {content.crew && content.crew.length > 0 && (
          <CrewSection crew={content.crew} />
        )}
        <ReviewsSection reviews={content.reviews || []} />
      </main>
    )
  } catch (error) {
    console.error('[Home] Error rendering page:', error)
    // Return error UI instead of throwing to prevent 500
    return (
      <main className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <p className="text-sm text-gray-500">
            Please check the server console for more details.
          </p>
        </div>
      </main>
    )
  }
}
