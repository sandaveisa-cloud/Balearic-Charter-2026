import { supabase } from './supabase'
import type { SiteContent, Fleet, Destination, Review, Stat, CulinaryExperience, CrewMember, BookingAvailability } from '@/types/database'

export async function getSiteContent(): Promise<SiteContent> {
  console.log('[Data] Fetching site content from Supabase (fresh fetch, no cache)...')
  
  // Fetch all data in parallel with no cache
  const [settingsResult, fleetResult, destinationsResult, reviewsResult, statsResult, culinaryResult, crewResult] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase.from('fleet').select('*').eq('is_active', true).order('is_featured', { ascending: false }),
    supabase.from('destinations').select('*').eq('is_active', true).order('order_index', { ascending: true }),
    supabase.from('reviews').select('*').eq('is_approved', true).order('is_featured', { ascending: false }).limit(6),
    supabase.from('stats').select('*').eq('is_active', true).order('order_index', { ascending: true }),
    supabase.from('culinary_experiences').select('*').eq('is_active', true).order('order_index', { ascending: true }),
    supabase.from('crew').select('*').eq('is_active', true).order('order_index', { ascending: true }),
  ])

  // Log results and errors
  if (settingsResult.error) {
    console.error('[Data] Error fetching site_settings:', settingsResult.error)
  } else {
    console.log('[Data] Site settings fetched:', {
      count: settingsResult.data?.length || 0,
      settings: settingsResult.data,
    })
  }

  if (fleetResult.error) {
    console.error('[Data] Error fetching fleet:', fleetResult.error)
  } else {
    console.log('[Data] Fleet fetched:', {
      count: fleetResult.data?.length || 0,
      yachts: fleetResult.data?.map(y => ({
        id: y.id,
        name: y.name,
        main_image_url: y.main_image_url,
      })),
    })
  }

  // Transform settings into a key-value object
  const settings: Record<string, string> = {}
  if (settingsResult.data) {
    settingsResult.data.forEach((setting) => {
      settings[setting.key] = setting.value || ''
    })
  }
  
  console.log('[Data] Transformed settings:', settings)

  return {
    settings,
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
