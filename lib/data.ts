import { supabase } from './supabase'
import { unstable_cache } from 'next/cache'
import type { SiteContent, Fleet, Destination, Review, Stat, CulinaryExperience, CrewMember, BookingAvailability } from '@/types/database'

// Internal function to fetch data from Supabase
async function fetchSiteContentInternal(): Promise<SiteContent> {
  // Fetch all data in parallel - catch individual errors
  let settingsResult, fleetResult, destinationsResult, reviewsResult, statsResult, culinaryResult, crewResult
  
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
    fleetResult = await supabase.from('fleet').select('*').eq('is_active', true).order('is_featured', { ascending: false })
    if (fleetResult.error) {
      console.error('[Data] Error fetching fleet:', fleetResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching fleet:', error)
    fleetResult = { data: null, error: error as any }
  }

  try {
    destinationsResult = await supabase
      .from('destinations')
      .select('id, title, description, image_urls, order_index, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    if (destinationsResult.error) {
      console.error('[Data] Error fetching destinations:', destinationsResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching destinations:', error)
    destinationsResult = { data: null, error: error as any }
  }

  try {
    reviewsResult = await supabase.from('reviews').select('*').eq('is_approved', true).order('is_featured', { ascending: false }).limit(6)
    if (reviewsResult.error) {
      console.error('[Data] Error fetching reviews:', reviewsResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching reviews:', error)
    reviewsResult = { data: null, error: error as any }
  }

  try {
    statsResult = await supabase.from('stats').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (statsResult.error) {
      console.error('[Data] Error fetching stats:', statsResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching stats:', error)
    statsResult = { data: null, error: error as any }
  }

  try {
    culinaryResult = await supabase.from('culinary_experiences').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (culinaryResult.error) {
      console.error('[Data] Error fetching culinary_experiences:', culinaryResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching culinary_experiences:', error)
    culinaryResult = { data: null, error: error as any }
  }

  try {
    crewResult = await supabase.from('crew').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (crewResult.error) {
      console.error('[Data] Error fetching crew:', crewResult.error)
    }
  } catch (error) {
    console.error('[Data] Exception fetching crew:', error)
    crewResult = { data: null, error: error as any }
  }

  // Transform settings into a key-value object
  // Add error handling to prevent crashes if settings data is malformed
  const settings: Record<string, string> = {}
  if (settingsResult.data && Array.isArray(settingsResult.data)) {
    try {
      settingsResult.data.forEach((setting: any) => {
        if (setting && typeof setting === 'object' && 'key' in setting) {
          settings[setting.key] = setting.value || ''
        }
      })
    } catch (error) {
      console.error('[Data] Error transforming settings:', error)
      // Continue with empty settings object if transformation fails
    }
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
  return {
    settings: settings || {},
    sectionVisibility,
    fleet: (fleetResult.data as Fleet[]) || [],
    destinations: (destinationsResult.data as Destination[]) || [],
    reviews: (reviewsResult.data as Review[]) || [],
    stats: (statsResult.data as Stat[]) || [],
    culinaryExperiences: (culinaryResult.data as CulinaryExperience[]) || [],
    crew: (crewResult.data as CrewMember[]) || [],
  }
}

// Cached version - cache for 1 hour (3600 seconds)
export const getSiteContent = unstable_cache(
  fetchSiteContentInternal,
  ['site-content'],
  {
    revalidate: 3600, // 1 hour cache
    tags: ['site-content', 'fleet', 'destinations', 'settings']
  }
)

export async function getFleetBySlug(slug: string): Promise<Fleet | null> {
  if (!slug) return null
  
  try {
    const { data, error } = await supabase
      .from('fleet')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.error('[Data] Error fetching fleet by slug:', error)
      return null
    }

    return data as Fleet
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
