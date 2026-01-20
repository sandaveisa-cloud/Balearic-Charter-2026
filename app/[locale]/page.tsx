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
import StructuredData from '@/components/StructuredData'
import FloatingCTA from '@/components/FloatingCTA'

// Cache data for 1 hour (3600 seconds)
export const revalidate = 3600

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  console.log('[Home] Starting page render...')
  
  try {
    const { locale } = await params
    console.log('[Home] Locale from params:', locale)
    console.log('[Home] Available locales:', locales)
    
    // Validate locale parameter before using it
    if (!locale) {
      console.error('[Home] Locale is missing/undefined')
      notFound()
      return // TypeScript guard
    }
    
    if (!locales.includes(locale as any)) {
      console.error('[Home] Invalid locale:', locale, 'not in', locales)
      notFound()
      return // TypeScript guard
    }
    
    console.log('[Home] Locale validated successfully:', locale)
    
    // Fetch content with error handling
    let content
    try {
      console.log('[Home] Fetching site content...')
      content = await getSiteContent()
      console.log('[Home] Site content fetched successfully')
      console.log('[Home] Content summary:', {
        hasSettings: !!content?.settings,
        settingsKeys: content?.settings ? Object.keys(content.settings).length : 0,
        fleetCount: content?.fleet?.length || 0,
        destinationsCount: content?.destinations?.length || 0,
        reviewsCount: content?.reviews?.length || 0,
        statsCount: content?.stats?.length || 0,
        culinaryCount: content?.culinaryExperiences?.length || 0,
        crewCount: content?.crew?.length || 0,
        hasSectionVisibility: !!content?.sectionVisibility,
      })
    } catch (dataError) {
      console.error('[Home] Error fetching site content:', dataError)
      console.error('[Home] Error details:', {
        message: dataError instanceof Error ? dataError.message : 'Unknown error',
        stack: dataError instanceof Error ? dataError.stack : 'No stack',
      })
      // Return safe defaults if data fetching fails - NEVER call notFound() for empty data
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
      console.log('[Home] Using fallback empty content')
    }

    // Ensure content and settings exist before accessing properties
    // NEVER call notFound() for empty data - always render with fallbacks
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
    
    console.log('[Home] Using safeContent with:', {
      hasSettings: !!safeContent.settings,
      fleetLength: safeContent.fleet?.length || 0,
      hasSectionVisibility: !!safeContent.sectionVisibility,
    })
    
    // Ensure settings object exists and has safe defaults
    const safeSettings = safeContent.settings || {}
    console.log('[Home] Safe settings keys:', Object.keys(safeSettings).length)
    
    // Get section visibility settings (default to true if not set)
    const visibility = safeContent.sectionVisibility || {
      journey: true,
      mission: true,
      crew: true,
      culinary: true,
      contact: true,
    }
    
    console.log('[Home] Section visibility:', visibility)
    console.log('[Home] Rendering page with components...')

    // Wrap each component in error boundary to prevent one failure from crashing entire page
    try {
      return (
        <>
          {/* Structured Data for SEO */}
          <StructuredData type="TravelAgency" settings={safeSettings} locale={locale} />
          
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
          
          {/* Floating CTA Button */}
          <FloatingCTA />
        </>
      )
    } catch (renderError) {
      console.error('[Home] Error during component rendering:', renderError)
      // Return minimal fallback UI instead of crashing
      return (
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-luxury-blue mb-4">Welcome</h1>
            <p className="text-gray-600 mb-4">We're experiencing some technical difficulties.</p>
            <p className="text-sm text-gray-500">Please try refreshing the page.</p>
          </div>
        </main>
      )
    }
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
