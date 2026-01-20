export interface SiteSetting {
  id: string
  key: string
  value: string
  created_at: string
  updated_at: string
}

export interface Fleet {
  id: string
  name: string
  slug: string
  year: number | null
  technical_specs: {
    engines?: string
    cruising_speed?: string
    max_speed?: string
    fuel_capacity?: string
    water_capacity?: string
    length?: number | string // in meters/feet
    beam?: number | string // in meters/feet
    draft?: number | string // in meters/feet
    [key: string]: any
  }
  description: string | null
  short_description: string | null
  main_image_url: string | null
  gallery_images: string[]
  low_season_price: number | null
  medium_season_price: number | null
  high_season_price: number | null
  currency: string
  capacity: number | null // Guests
  cabins: number | null
  toilets: number | null
  length: number | null // Overall length in meters
  amenities: {
    ac?: boolean
    watermaker?: boolean
    generator?: boolean
    flybridge?: boolean
    heating?: boolean
    teak_deck?: boolean
    full_batten?: boolean
    folding_table?: boolean
    fridge?: boolean
    dinghy?: boolean
    water_entertainment?: boolean // Water toys
    [key: string]: boolean | undefined
  } | null
  apa_percentage: number | null
  crew_service_fee: number | null
  cleaning_fee: number | null
  tax_percentage: number | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Destination {
  id: string
  name: string
  region: string | null
  description: string | null
  description_en: string | null
  description_es: string | null
  description_de: string | null
  image_url: string | null
  youtube_video_url: string | null
  slug: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Legacy fields for backward compatibility
  title?: string
  image_urls?: string[]
}

export interface Review {
  id: string
  guest_name: string
  guest_location: string | null
  rating: number
  review_text: string
  review_date: string | null // Date of the review (can be different from created_at)
  profile_image_url: string | null // Profile image/avatar URL
  yacht_id: string | null
  is_featured: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Stat {
  id: string
  label: string
  value: string
  icon: string | null
  title: string | null // Extended title for Culinary/Crew stats
  description: string | null // Long description (rich text)
  media_urls: string[] // Array of image/video URLs (images and YouTube URLs)
  category: 'general' | 'culinary' | 'crew' | null // Category for stats
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CulinaryExperience {
  id: string
  title: string
  description: string | null
  image_url: string | null // Legacy field, kept for backward compatibility
  media_urls: string[] // Array of images/videos (images and YouTube URLs)
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CrewMember {
  id: string
  name: string
  role: string
  bio: string | null // Legacy field, kept for backward compatibility
  role_description: string | null // Detailed role description
  image_url: string | null // Profile image
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookingInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  yacht_id: string | null
  start_date: string | null
  end_date: string | null
  guests: number | null
  message: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface MediaAsset {
  id: string
  filename: string
  original_filename: string
  file_type: string
  file_size: number | null
  url: string
  thumbnail_url: string | null
  mime_type: string | null
  alt_text: string | null
  category: string | null
  created_at: string
  updated_at: string
}

export interface BookingAvailability {
  id: string
  yacht_id: string
  date: string
  is_available: boolean
  price_override: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Season = 'low' | 'medium' | 'high'

export interface SiteContent {
  settings: Record<string, string>
  fleet: Fleet[]
  destinations: Destination[]
  reviews: Review[]
  stats: Stat[]
  culinaryExperiences: CulinaryExperience[]
  crew: CrewMember[]
}
