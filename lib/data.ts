import { supabase } from './supabase'
import type { SiteContent, Fleet, Destination, Review, Stat, CulinaryExperience, CrewMember, BookingAvailability } from '@/types/database'

export async function getSiteContent(): Promise<SiteContent> {
  console.log('[Data] Fetching site content from Supabase (fresh fetch, no cache)...')
  
  // Fetch all data in parallel with no cache - catch individual errors
  let settingsResult, fleetResult, destinationsResult, reviewsResult, statsResult, culinaryResult, crewResult
  
  try {
    settingsResult = await supabase.from('site_settings').select('*')
    if (settingsResult.error) {
      console.error('[Data] Error fetching site_settings:', settingsResult.error)
    } else {
      console.log('[Data] Site settings fetched:', {
        count: settingsResult.data?.length || 0,
      })
    }
  } catch (error) {
    console.error('[Data] Exception fetching site_settings:', error)
    settingsResult = { data: null, error: error as any }
  }

  try {
    fleetResult = await supabase.from('fleet').select('*').eq('is_active', true).order('is_featured', { ascending: false })
    if (fleetResult.error) {
      console.error('[Data] Error fetching fleet:', fleetResult.error)
    } else {
      console.log('[Data] Fleet fetched:', {
        count: fleetResult.data?.length || 0,
      })
    }
  } catch (error) {
    console.error('[Data] Exception fetching fleet:', error)
    fleetResult = { data: null, error: error as any }
  }

  try {
    destinationsResult = await supabase.from('destinations').select('*').eq('is_active', true).order('order_index', { ascending: true })
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
  const settings: Record<string, string> = {}
  if (settingsResult.data) {
    settingsResult.data.forEach((setting) => {
      settings[setting.key] = setting.value || ''
    })
  }
  
  console.log('[Data] Transformed settings:', settings)

  // Return data with safe fallbacks
  return {
    settings: settings || {},
    fleet: (fleetResult.data as Fleet[]) || [],
    destinations: (destinationsResult.data as Destination[]) || [],
    reviews: (reviewsResult.data as Review[]) || [],
    stats: (statsResult.data as Stat[]) || [],
    culinaryExperiences: (culinaryResult.data as CulinaryExperience[]) || [],
    crew: (crewResult.data as CrewMember[]) || [],
  }
}

export async function getFleetBySlug(slug: string): Promise<Fleet | null> {
  const { data, error } = await supabase
    .from('fleet')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as Fleet
}

export async function getBookingAvailability(yachtId: string, startDate: string, endDate: string): Promise<BookingAvailability[]> {
  const { data, error } = await supabase
    .from('booking_availability')
    .select('*')
    .eq('yacht_id', yachtId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as BookingAvailability[]
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
  const { data, error } = await supabase
    .from('booking_inquiries')
    .insert([inquiry])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
