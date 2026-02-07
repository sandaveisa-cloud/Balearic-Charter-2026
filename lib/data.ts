import { supabase } from './supabase'
import { unstable_cache } from 'next/cache'
import type { SiteContent, Fleet, Destination, Review, Stat, CulinaryExperience, CrewMember, ContactPerson, BookingAvailability, JourneyMilestone, MissionPromise } from '@/types/database'

// Internal function to fetch data from Supabase
async function fetchSiteContentInternal(): Promise<SiteContent> {
  // Fetch all data in parallel - catch individual errors
  let settingsResult, fleetResult, destinationsResult, reviewsResult, statsResult, culinaryResult, crewResult, contactResult, journeyResult, missionResult
  
  try {
    settingsResult = await supabase.from('site_settings').select('*')
    if (settingsResult.error) {
      console.error('[Data] Error fetching site_settings:', settingsResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching site_settings:', error)
    settingsResult = { data: null, error: error as any }
  }

  try {
    console.log('[Data] Fetching fleet...')
    // Select all columns including extras, specs, show_on_home, and all description columns
    // Try with order_index first, fallback to simpler query if column doesn't exist
    try {
      fleetResult = await supabase
        .from('fleet')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('is_featured', { ascending: false })
      
      if (fleetResult.error) {
        // If order_index column doesn't exist, try without it
        if (fleetResult.error.message?.includes('order_index') || fleetResult.error.code === '42703') {
          console.warn('[Data] order_index column not found, using fallback sort by name...')
          fleetResult = await supabase
            .from('fleet')
            .select('*')
            .eq('is_active', true)
            .order('is_featured', { ascending: false })
            .order('name', { ascending: true })
        } else {
          console.error('[Data] Error fetching fleet:', fleetResult.error)
        }
      }
    } catch (orderError) {
      console.warn('[Data] Fleet order query failed, trying simple query:', orderError)
      fleetResult = await supabase
        .from('fleet')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
    }
    
    if (fleetResult.error) {
      console.error('[Data] Error fetching fleet:', fleetResult.error)
      // Don't set to empty - try one more simple query
      const simpleResult = await supabase.from('fleet').select('*').eq('is_active', true)
      fleetResult = simpleResult.error ? { data: [], error: null } : simpleResult
    }
    
    console.log('[Data] fleet fetched:', fleetResult.data?.length || 0, 'items')
  } catch (error) {
    console.error('[Data] Exception fetching fleet:', error)
    // Last resort: try simplest possible query
    try {
      const lastResort = await supabase.from('fleet').select('*')
      fleetResult = lastResort.error ? { data: [], error: null } : lastResort
      console.log('[Data] fleet (last resort):', fleetResult.data?.length || 0, 'items')
    } catch (e) {
      fleetResult = { data: [], error: null }
    }
  }

  try {
    console.log('[Data] Fetching destinations...')
    // Try with order_index first
    try {
      destinationsResult = await supabase
        .from('destinations')
        .select('id, title, name, description, description_en, description_es, description_de, image_urls, youtube_video_url, slug, region, order_index, is_active, seasonal_data, highlights_data, gallery_images, coordinates, created_at, updated_at')
        .eq('is_active', true)
        .order('order_index', { ascending: true, nullsFirst: false })
      
      if (destinationsResult.error) {
        // If order_index column doesn't exist, try with fallback sorting by title
        if (destinationsResult.error.message?.includes('order_index') || destinationsResult.error.code === '42703') {
          console.warn('[Data] order_index column not found in destinations, using fallback sort by title...')
          destinationsResult = await supabase
            .from('destinations')
            .select('id, title, name, description, description_en, description_es, description_de, image_urls, youtube_video_url, slug, region, is_active, seasonal_data, highlights_data, gallery_images, coordinates, created_at, updated_at')
            .eq('is_active', true)
            .order('title', { ascending: true })
        } else if (destinationsResult.error.message?.includes('youtube_video_url') || 
                   destinationsResult.error.message?.includes('gallery_images')) {
          // Try without optional columns
          console.warn('[Data] Some columns missing in destinations, trying simpler query...')
          destinationsResult = await supabase
            .from('destinations')
            .select('id, title, name, description, description_en, description_es, description_de, image_urls, slug, region, is_active, created_at, updated_at')
            .eq('is_active', true)
        }
      }
    } catch (orderError) {
      console.warn('[Data] Destinations order query failed, trying simple query with title sort:', orderError)
      destinationsResult = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true })
    }
    
    if (destinationsResult.error) {
      console.error('[Data] ❌ Error fetching destinations:', destinationsResult.error)
      console.error('[Data] Error code:', destinationsResult.error.code)
      console.error('[Data] Error message:', destinationsResult.error.message)
      destinationsResult = { data: [], error: null }
    } else {
      console.log('[Data] ✅ destinations fetched:', destinationsResult.data?.length || 0, 'items')
      if (destinationsResult.data && destinationsResult.data.length > 0) {
        const sample = destinationsResult.data[0] as any
        console.log('[Data] Sample destination:', {
          id: sample.id,
          title: sample.title,
          has_youtube_video_url: !!sample.youtube_video_url,
          has_gallery_images: !!sample.gallery_images,
        })
      }
    }
  } catch (error) {
    console.error('[Data] ❌ Exception fetching destinations:', error)
    destinationsResult = { data: [], error: null }
  }

  try {
    console.log('[Data] Fetching reviews...')
    reviewsResult = await supabase.from('reviews').select('*').eq('is_approved', true).order('is_featured', { ascending: false }).limit(6)
    if (reviewsResult.error) {
      console.error('[Data] Error fetching reviews:', reviewsResult.error)
      reviewsResult = { data: [], error: null }
    } else {
      console.log('[Data] reviews fetched:', reviewsResult.data?.length || 0, 'items')
    }
  } catch (error) {
    console.error('[Data] Exception fetching reviews:', error)
    reviewsResult = { data: [], error: null }
  }

  try {
    console.log('[Data] Fetching stats...')
    statsResult = await supabase.from('stats').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (statsResult.error) {
      console.error('[Data] Error fetching stats:', statsResult.error)
      statsResult = { data: [], error: null }
    } else {
      console.log('[Data] stats fetched:', statsResult.data?.length || 0, 'items')
    }
  } catch (error) {
    console.error('[Data] Exception fetching stats:', error)
    statsResult = { data: [], error: null }
  }

  try {
    console.log('[Data] Fetching culinary_experiences...')
    culinaryResult = await supabase.from('culinary_experiences').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (culinaryResult.error) {
      console.error('[Data] Error fetching culinary_experiences:', culinaryResult.error)
      culinaryResult = { data: [], error: null }
    } else {
      console.log('[Data] culinary_experiences fetched:', culinaryResult.data?.length || 0, 'items')
    }
  } catch (error) {
    console.error('[Data] Exception fetching culinary_experiences:', error)
    culinaryResult = { data: [], error: null }
  }

  try {
    console.log('[Data] Fetching crew...')
    crewResult = await supabase.from('crew').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (crewResult.error) {
      console.error('[Data] Error fetching crew:', crewResult.error)
      crewResult = { data: [], error: null }
    } else {
      console.log('[Data] crew fetched:', crewResult.data?.length || 0, 'items')
    }
  } catch (error) {
    console.error('[Data] Exception fetching crew:', error)
    crewResult = { data: [], error: null }
  }

  try {
    console.log('[Data] Fetching contact_persons...')
    contactResult = await supabase.from('contact_persons').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (contactResult.error) {
      console.error('[Data] Error fetching contact_persons:', contactResult.error)
      contactResult = { data: [], error: null }
    } else {
      console.log('[Data] contact_persons fetched:', contactResult.data?.length || 0, 'items')
    }
  } catch (error) {
    console.error('[Data] Exception fetching contact_persons:', error)
    contactResult = { data: [], error: null }
  }

  // Fetch Journey Milestones
  try {
    console.log('[Data] Fetching journey_milestones...')
    journeyResult = await (supabase as any)
      .from('journey_milestones')
      .select('*')
      .eq('is_active', true)
      // NO filter on order_index - include all active milestones including order_index 0
      .order('order_index', { ascending: true, nullsFirst: false }) // Sort by order_index first (includes 0)
      .order('year', { ascending: true }) // Then by year
    
    if (journeyResult?.error) {
      console.error('[Data] ❌ Error fetching journey_milestones:', journeyResult.error)
      journeyResult = { data: [], error: journeyResult.error }
    } else {
      const milestoneCount = journeyResult?.data?.length || 0
      console.log('[Data] ✅ journey_milestones fetched:', milestoneCount, 'items')
      if (journeyResult?.data && journeyResult.data.length > 0) {
        console.log('[Data] Sample milestone:', {
          id: journeyResult.data[0].id,
          year: journeyResult.data[0].year,
          order_index: journeyResult.data[0].order_index,
          title_en: journeyResult.data[0].title_en?.substring(0, 50),
          is_active: journeyResult.data[0].is_active,
          hasImage: !!journeyResult.data[0].image_url
        })
        // Log all milestones for debugging
        journeyResult.data.forEach((m: JourneyMilestone, idx: number) => {
          console.log(`[Data] Milestone ${idx + 1}:`, {
            id: m.id,
            year: m.year,
            order_index: m.order_index,
            title_en: m.title_en?.substring(0, 30),
            is_active: m.is_active
          })
        })
      } else {
        console.warn('[Data] ⚠️ No milestones returned from database (check is_active and RLS policies)')
      }
    }
  } catch (error) {
    console.error('[Data] Exception fetching journey_milestones:', error)
    journeyResult = { data: [], error: null }
  }

  // Fetch Mission Promises
  try {
    missionResult = await (supabase as any)
      .from('mission_promises')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    
    if (missionResult?.error) {
      console.error('[Data] Error fetching mission_promises:', missionResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching mission_promises:', error)
    missionResult = { data: [], error: null }
  }

  // Transform settings into a key-value object
  // Add error handling to prevent crashes if settings data is malformed
  console.log('[Data] Transforming settings...')
  const settings: Record<string, string> = {}
  if (settingsResult?.data && Array.isArray(settingsResult.data)) {
    try {
      settingsResult.data.forEach((setting: any) => {
        if (setting && typeof setting === 'object' && 'key' in setting) {
          settings[setting.key] = setting.value || ''
        }
      })
      console.log('[Data] Settings transformed:', Object.keys(settings).length, 'keys')
    } catch (error) {
      console.error('[Data] Error transforming settings:', error)
      // Continue with empty settings object if transformation fails
    }
  } else {
    console.warn('[Data] settingsResult.data is not an array:', settingsResult?.data)
  }

  // Default section visibility to true if not set
  const sectionVisibility = {
    journey: settings['section_journey_visible'] !== 'false', // Default true
    mission: settings['section_mission_visible'] !== 'false', // Default true
    crew: settings['section_crew_visible'] !== 'false', // Default true
    culinary: settings['section_culinary_visible'] !== 'false', // Default true
    contact: settings['section_contact_visible'] !== 'false', // Default true
  }

  // Return data with safe fallbacks
  const result = {
    settings: settings || {},
    sectionVisibility,
    fleet: (fleetResult?.data as Fleet[]) || [],
    destinations: (destinationsResult?.data as Destination[]) || [],
    reviews: (reviewsResult?.data as Review[]) || [],
    stats: (statsResult?.data as Stat[]) || [],
    culinaryExperiences: (culinaryResult?.data as CulinaryExperience[]) || [],
    crew: (crewResult?.data as CrewMember[]) || [],
    contactPersons: (contactResult?.data as ContactPerson[]) || [],
    journeyMilestones: (journeyResult?.data as JourneyMilestone[]) || [] || [], // Ensure it's always an array
    missionPromises: (missionResult?.data as MissionPromise[]) || [],
  }
  
  console.log('[Data] fetchSiteContentInternal completed:', {
    settingsCount: Object.keys(result.settings).length,
    fleetCount: result.fleet.length,
    destinationsCount: result.destinations.length,
    reviewsCount: result.reviews.length,
    statsCount: result.stats.length,
    culinaryCount: result.culinaryExperiences.length,
    crewCount: result.crew.length,
    contactCount: result.contactPersons.length,
    journeyCount: result.journeyMilestones.length,
    missionCount: result.missionPromises.length,
  })
  
  return result
}

// Cached version - shorter cache for destinations (60 seconds) to allow faster updates
// Wrap in try-catch to prevent cache errors from crashing the page
export async function getSiteContent(): Promise<SiteContent> {
  try {
    console.log('[Data] getSiteContent called, using unstable_cache...')
    const cachedFetch = unstable_cache(
      fetchSiteContentInternal,
      ['site-content-v2'], // Changed cache key to force refresh
      {
        revalidate: 30, // 30 seconds cache (reduced to force immediate updates)
        tags: ['site-content', 'fleet', 'destinations', 'settings']
      }
    )
    const result = await cachedFetch()
    console.log('[Data] getSiteContent completed successfully')
    return result
  } catch (error) {
    console.error('[Data] Error in getSiteContent (cache):', error)
    // Fallback to direct fetch if cache fails
    console.log('[Data] Falling back to direct fetch...')
    try {
      const result = await fetchSiteContentInternal()
      console.log('[Data] Direct fetch completed successfully')
      return result
    } catch (fallbackError) {
      console.error('[Data] Error in direct fetch fallback:', fallbackError)
      // Return empty data structure to prevent page crash
      return {
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
        contactPersons: [],
        journeyMilestones: [],
        missionPromises: [],
      }
    }
  }
}

export async function getFleetBySlug(slug: string): Promise<Fleet | null> {
  if (!slug) {
    console.warn('[Data] getFleetBySlug called with empty slug')
    return null
  }
  
  console.log('[Data] Fetching fleet by slug:', slug)
  
  try {
    // First try with exact slug match
    const { data, error } = await supabase
      .from('fleet')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('[Data] Error fetching fleet by slug:', slug, error.code, error.message)
      
      // If PGRST116 (no rows), try case-insensitive or fallback to name match
      if (error.code === 'PGRST116') {
        console.log('[Data] No exact match for slug, trying case-insensitive match...')
        const { data: fallbackList, error: fallbackError } = await supabase
          .from('fleet')
          .select('*')
          .ilike('slug', slug)
          .eq('is_active', true)
          .limit(1)
        
        if (!fallbackError && fallbackList && fallbackList.length > 0) {
          const fallbackData = fallbackList[0] as Fleet
          console.log('[Data] Found yacht via case-insensitive match:', fallbackData.name)
          return fallbackData
        }
        
        // Try matching by name as last resort
        console.log('[Data] Trying name match as fallback...')
        const { data: nameList, error: nameError } = await supabase
          .from('fleet')
          .select('*')
          .ilike('name', slug.replace(/-/g, ' '))
          .eq('is_active', true)
          .limit(1)
        
        if (!nameError && nameList && nameList.length > 0) {
          const nameData = nameList[0] as Fleet
          console.log('[Data] Found yacht via name match:', nameData.name)
          return nameData
        }
      }
      
      return null
    }

    if (!data) {
      console.warn('[Data] No data returned for slug:', slug)
      return null
    }

    const fleetData = data as Fleet
    console.log('[Data] Found yacht:', fleetData.name, 'slug:', fleetData.slug)
    return fleetData
  } catch (error) {
    console.error('[Data] Exception fetching fleet by slug:', error)
    return null
  }
}

// Get multiple fleet items by slugs for comparison
export async function getFleetBySlugs(slugs: string[]): Promise<Fleet[]> {
  if (!slugs || slugs.length === 0) return []
  
  try {
    const { data, error } = await supabase
      .from('fleet')
      .select('*')
      .in('slug', slugs)
      .eq('is_active', true)

    if (error || !data) {
      console.error('[Data] Error fetching fleet by slugs:', error)
      return []
    }

    return data as Fleet[]
  } catch (error) {
    console.error('[Data] Exception fetching fleet by slugs:', error)
    return []
  }
}

// Get destination by ID or slug
export async function getDestinationByIdOrSlug(idOrSlug: string): Promise<Destination | null> {
  if (!idOrSlug) return null

  try {
    // Try to fetch by ID first (UUID format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    let query = supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)

    if (isUUID) {
      query = query.eq('id', idOrSlug)
    } else {
      query = query.eq('slug', idOrSlug)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      // If not found by slug, try by ID as fallback
      if (!isUUID) {
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('destinations')
            .select('*')
            .eq('id', idOrSlug)
            .eq('is_active', true)
            .single()

          if (fallbackError || !fallbackData) {
            console.error('[Data] Error fetching destination by ID fallback:', fallbackError)
            return null
          }
          return fallbackData as Destination
        } catch (fallbackException) {
          console.error('[Data] Exception fetching destination by ID fallback:', fallbackException)
          return null
        }
      }
      console.error('[Data] Error fetching destination:', error)
      return null
    }

    return data as Destination
  } catch (error) {
    console.error('[Data] Exception fetching destination:', error)
    return null
  }
}

export async function getBookingAvailability(yachtId: string, startDate: string, endDate: string): Promise<BookingAvailability[]> {
  if (!yachtId || !startDate || !endDate) return []
  
  try {
    const { data, error } = await supabase
      .from('booking_availability')
      .select('*')
      .eq('yacht_id', yachtId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error || !data) {
      console.error('[Data] Error fetching booking availability:', error)
      return []
    }

    return data as BookingAvailability[]
  } catch (error) {
    console.error('[Data] Exception fetching booking availability:', error)
    return []
  }
}

export async function submitBookingInquiry(inquiry: {
  name: string
  email: string
  phone?: string
  yacht_id?: string
  start_date?: string
  end_date?: string
  guests?: number
  message?: string
}) {
  if (!inquiry || !inquiry.name || !inquiry.email) {
    throw new Error('Invalid inquiry data: name and email are required')
  }
  
  try {
    const { data, error } = await supabase
      .from('booking_inquiries')
      // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
      .insert([inquiry])
      .select()
      .single()

    if (error) {
      console.error('[Data] Error submitting booking inquiry:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('[Data] Exception submitting booking inquiry:', error)
    throw error
  }
}

// Client-side function to fetch settings (for client components)
// This does NOT use unstable_cache and can be called from client components
export async function getSiteSettingsClient(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from('site_settings').select('*')
    
    if (error || !data) {
      console.error('[Data] Error fetching site settings (client):', error)
      return {}
    }

    const settings: Record<string, string> = {}
    if (Array.isArray(data)) {
      data.forEach((setting: any) => {
        if (setting && typeof setting === 'object' && 'key' in setting) {
          settings[setting.key] = setting.value || ''
        }
      })
    }

    return settings
  } catch (error) {
    console.error('[Data] Exception fetching site settings (client):', error)
    return {}
  }
}
