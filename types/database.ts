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
  extras: string[] | null // Array of extra features/services like 'WiFi', 'Snorkeling', 'Towels', etc.
  specs?: {
    beam?: number | string // in meters/feet
    draft?: number | string // in meters/feet
    fuel_tank?: number | string // in liters
    water_tank?: number | string // in liters
    engine?: string // Engine description
    [key: string]: any
  } | null
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
  description: string | null // Legacy field, kept for backward compatibility
  short_description: string | null // Legacy field, kept for backward compatibility
  description_i18n?: Record<string, string> | null // Multi-language descriptions: { "en": "...", "es": "...", "de": "..." }
  short_description_i18n?: Record<string, string> | null // Multi-language short descriptions: { "en": "...", "es": "...", "de": "..." }
  tagline_i18n?: Record<string, string> | null // Multi-language taglines: { "en": "...", "es": "...", "de": "..." }
  description_en?: string | null // English description (TEXT column)
  description_es?: string | null // Spanish description (TEXT column)
  description_de?: string | null // German description (TEXT column)
  short_description_en?: string | null // English short description (TEXT column) - used for fleet card previews
  short_description_es?: string | null // Spanish short description (TEXT column) - used for fleet card previews
  short_description_de?: string | null // German short description (TEXT column) - used for fleet card previews
  tagline_en?: string | null // English tagline (TEXT column)
  tagline_es?: string | null // Spanish tagline (TEXT column)
  tagline_de?: string | null // German tagline (TEXT column)
  boat_name?: string | null // Official name of the boat/yacht
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
  recently_refitted?: boolean | null
  refit_details?: string | null
  order_index?: number | null  // Display order for sorting
  show_on_home?: boolean | null  // Whether to show on homepage
  created_at: string
  updated_at: string
}

export interface SeasonalData {
  spring?: SeasonInfo
  summer?: SeasonInfo
  earlyAutumn?: SeasonInfo
  lateAutumn?: SeasonInfo
  winter?: SeasonInfo
}

export interface SeasonInfo {
  sailing_score: number // Percentage (0-100)
  avg_temp: number // Average temperature in Celsius
  conditions: string
  tourist_level: string
  pros: string[]
}

export interface DestinationHighlight {
  id?: string
  name: string
  name_en?: string
  name_es?: string
  name_de?: string
  description: string
  description_en?: string
  description_es?: string
  description_de?: string
  image_url?: string | null
  coordinates?: { lat: number; lng: number } | null
  category?: 'landmark' | 'beach' | 'marina' | 'viewpoint' | 'restaurant' | 'other'
}

export interface Destination {
  id: string
  title: string // Primary field from database
  name?: string // Optional legacy field (code uses fallback: name || title)
  region: string | null
  description: string | null // Legacy field, kept for backward compatibility
  description_en: string | null // Legacy field, kept for backward compatibility
  description_es: string | null // Legacy field, kept for backward compatibility
  description_de: string | null // Legacy field, kept for backward compatibility
  description_i18n?: Record<string, string> | null // Multi-language descriptions: { "en": "...", "es": "...", "de": "..." }
  image_urls: string[] | null // Primary field: JSONB array of image URLs
  youtube_video_url: string | null
  slug: string
  order_index: number
  is_active: boolean
  seasonal_data?: SeasonalData | null // JSONB field for seasonal sailing information
  highlights_data?: DestinationHighlight[] | null // JSONB array of highlights/attractions
  gallery_images?: string[] | null // JSONB array of gallery image URLs
  coordinates?: { lat: number; lng: number } | null // JSONB object with lat/lng
  created_at: string
  updated_at: string
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
  // Optional fields for enhanced testimonials
  rental_date?: string | null // Date of the yacht rental/charter
  published_date?: string | null // Date when review was published
  category?: string | null // Category like 'With Captain', 'Catamarans', etc.
  original_language?: string | null // Language code of the original review (e.g., 'lv', 'es', 'en')
  translated_text?: string | null // Pre-translated English version of the review
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

export interface ContactPerson {
  id: string
  name: string
  role: string | null
  phone: string
  email: string
  locations: string[] // Array of location strings
  is_active: boolean
  order_index: number
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

export interface JourneyMilestone {
  id: string
  year: number
  title_en: string
  title_es: string
  title_de: string
  description_en: string
  description_es: string
  description_de: string
  image_url: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MissionPromise {
  id: string
  title_en: string
  title_es: string
  title_de: string
  description_en: string
  description_es: string
  description_de: string
  icon_name: string | null // Icon identifier (e.g., 'Ship', 'ShieldCheck', 'Utensils')
  icon_url: string | null // Custom icon image URL
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Season = 'low' | 'medium' | 'high'

export interface SiteContent {
  settings: Record<string, string>
  sectionVisibility?: {
    journey: boolean
    mission: boolean
    crew: boolean
    culinary: boolean
    contact: boolean
  }
  fleet: Fleet[]
  destinations: Destination[]
  reviews: Review[]
  stats: Stat[]
  culinaryExperiences: CulinaryExperience[]
  crew: CrewMember[]
  contactPersons: ContactPerson[]
  journeyMilestones: JourneyMilestone[]
  missionPromises: MissionPromise[]
}
