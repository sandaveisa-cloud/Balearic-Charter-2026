import React from 'react'
import { getSiteContent } from '@/lib/data'
import { locales, defaultLocale } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import Hero from '@/components/Hero'
import MissionSection from '@/components/MissionSection'
import FleetSection from '@/components/FleetSection'
import JourneySection from '@/components/JourneySection'
import DestinationsSection from '@/components/DestinationsSection'
import GuestbookSection from '@/components/GuestbookSection'
import StatsSection from '@/components/StatsSection'
import CulinarySection from '@/components/CulinarySection'
import CrewSection from '@/components/CrewSection'
import StructuredData from '@/components/StructuredData'
import FloatingCTA from '@/components/FloatingCTA'
import EarlyBirdBanner from '@/components/EarlyBirdBanner'

// No cache - always fetch fresh data (especially for destinations)
export const revalidate = 0

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  console.log('[Home] Starting page render...')
  
  try {
    const { locale } = await params
    
    // Validate locale parameter before using it
    if (!locale || !locales.includes(locale as any)) {
      console.error('[Home] Invalid or missing locale:', locale)
      notFound()
      return
    }
    
    // Fetch content with error handling
    let content
    try {
      content = await getSiteContent()
    } catch (dataError) {
      console.error('[Home] Error fetching site content:', dataError)
      content = {
        settings: {},
        sectionVisibility: { journey: true, mission: true, crew: true, culinary: true, contact: true },
        fleet: [],
        destinations: [],
        reviews: [],
        stats: [],
        culinaryExperiences: [],
        crew: [],
        contactPersons: [],
        journeyMilestones: [],
        missionPromises: [],
      }
    }

    const safeContent = content || {
      settings: {},
      sectionVisibility: { journey: true, mission: true, crew: true, culinary: true, contact: true },
      fleet: [],
      destinations: [],
      reviews: [],
      stats: [],
      culinaryExperiences: [],
      crew: [],
      contactPersons: [],
      journeyMilestones: [],
      missionPromises: [],
    }
    
    const safeSettings = safeContent.settings || {}
    const visibility = safeContent.sectionVisibility || {
      journey: true,
      mission: true,
      crew: true,
      culinary: true,
      contact: true,
    }

    try {
      return (
        <>
          {/* Structured Data for SEO */}
          <StructuredData type="TravelAgency" settings={safeSettings} locale={locale} />
          
          {/* SAMAZINĀTS pt-16 uz pt-0, lai noņemtu balto caurumu */}
          <main className="min-h-screen pt-0">
            {/* Early Bird Discount Banner */}
            <EarlyBirdBanner />
            
            {/* Hero Section - Always at the top */}
            <Hero settings={safeSettings} />
            
            {/* Mission (The Balearic Promise) - Right after Hero */}
            {visibility.mission && <MissionSection promises={safeContent.missionPromises || []} />}
            
            {/* Fleet Section */}
            <FleetSection fleet={safeContent.fleet || []} />
            
            {/* Journey (The Timeline) */}
            {visibility.journey && <JourneySection milestones={safeContent.journeyMilestones || []} />}
            
            {/* Destinations */}
            <DestinationsSection destinations={safeContent.destinations || []} />
            
            {/* Stats Section */}
            {visibility.journey && <StatsSection stats={safeContent.stats || []} />}
            
            {/* Culinary Section */}
            {visibility.culinary && (
              <CulinarySection experiences={safeContent.culinaryExperiences || []} />
            )}
            
            {/* Crew Section */}
            {visibility.crew && safeContent.crew && safeContent.crew.length > 0 && (
              <CrewSection crew={safeContent.crew} />
            )}
            
            {/* Guestbook Section - Interactive (with spacing before Footer) */}
            <div className="pb-16 md:pb-20 lg:pb-24">
              <GuestbookSection reviews={safeContent.reviews || []} />
            </div>
          </main>
          
          {/* Floating CTA Button */}
          <FloatingCTA />
        </>
      )
    } catch (renderError) {
      console.error('[Home] Error during component rendering:', renderError)
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
    return (
      <main className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
          <p className="text-gray-600 mb-4">Something went wrong.</p>
        </div>
      </main>
    )
  }
}