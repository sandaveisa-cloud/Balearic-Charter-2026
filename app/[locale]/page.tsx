import React from 'react'
import { getSiteContent } from '@/lib/data'
import { locales, defaultLocale } from '@/i18n/routing'
import { notFound } from 'next/navigation'
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
    
    // Validate locale parameter before using it
    if (!locale || !locales.includes(locale as any)) {
      console.error('[Home] Invalid locale:', locale)
      notFound()
    }
    
    // Fetch content with error handling
    let content
    try {
      content = await getSiteContent()
    } catch (dataError) {
      console.error('[Home] Error fetching site content:', dataError)
      // Return safe defaults if data fetching fails
      content = {
        settings: {},
        sectionVisibility: {
          journey: true,
          mission: true,
          crew: true,
          culinary: true,
          contact: true,
        },
        fleet: [],
        destinations: [],
        reviews: [],
        stats: [],
        culinaryExperiences: [],
        crew: [],
      }
    }

    // Ensure content and settings exist before accessing properties
    const safeContent = content || {
      settings: {},
      sectionVisibility: {
        journey: true,
        mission: true,
        crew: true,
        culinary: true,
        contact: true,
      },
      fleet: [],
      destinations: [],
      reviews: [],
      stats: [],
      culinaryExperiences: [],
      crew: [],
    }
    
    // Ensure settings object exists and has safe defaults
    const safeSettings = safeContent.settings || {}
    
    // Get section visibility settings (default to true if not set)
    const visibility = safeContent.sectionVisibility || {
      journey: true,
      mission: true,
      crew: true,
      culinary: true,
      contact: true,
    }

    return (
      <main className="min-h-screen pt-16">
        <Hero settings={safeSettings} />
        {visibility.mission && <MissionSection />}
        {visibility.journey && <StatsSection stats={safeContent.stats || []} />}
        <FleetSection fleet={safeContent.fleet || []} />
        <DestinationsSection destinations={safeContent.destinations || []} />
        <Testimonials reviews={safeContent.reviews || []} />
        {/* Always render CulinarySection if visibility is enabled, even if experiences array is empty */}
        {visibility.culinary && (
          <CulinarySection experiences={safeContent.culinaryExperiences || []} />
        )}
        {/* Only show CrewSection if visibility is enabled AND there are active crew members */}
        {visibility.crew && safeContent.crew && safeContent.crew.length > 0 && (
          <CrewSection crew={safeContent.crew} />
        )}
        <ReviewsSection reviews={safeContent.reviews || []} />
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
