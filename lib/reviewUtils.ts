/**
 * Utility functions for processing and cleaning review data
 * Handles CSV/JSON import, text cleaning, and language detection
 */

export interface ReviewImportData {
  guest_name: string
  guest_location?: string | null
  rating: number
  review_text: string
  rental_date?: string | null
  published_date?: string | null
  category?: string | null
  profile_image_url?: string | null
  yacht_id?: string | null
  is_featured?: boolean
  original_language?: string | null
}

/**
 * Clean review text by removing extra spaces and trimming
 */
export function cleanReviewText(text: string): string {
  if (!text) return ''
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim()
}

/**
 * Detect language from text (basic detection)
 */
export function detectLanguage(text: string): string {
  if (!text) return 'en'
  
  const latvianPattern = /[āčēģīķļņōŗšūžĀČĒĢĪĶĻŅŌŖŠŪŽ]/i
  const spanishPattern = /[ñáéíóúüÑÁÉÍÓÚÜ]/i
  const germanPattern = /[äöüßÄÖÜ]/i
  
  if (latvianPattern.test(text)) return 'lv'
  if (spanishPattern.test(text)) return 'es'
  if (germanPattern.test(text)) return 'de'
  
  return 'en'
}

/**
 * Process a single review from CSV/JSON import
 */
export function processReviewImport(data: ReviewImportData) {
  return {
    guest_name: data.guest_name.trim(),
    guest_location: data.guest_location?.trim() || null,
    rating: Math.max(1, Math.min(5, data.rating || 5)), // Clamp between 1-5
    review_text: cleanReviewText(data.review_text),
    rental_date: data.rental_date || null,
    published_date: data.published_date || null,
    category: data.category?.trim() || null,
    profile_image_url: data.profile_image_url?.trim() || null,
    yacht_id: data.yacht_id || null,
    is_featured: data.is_featured || false,
    original_language: data.original_language || detectLanguage(data.review_text),
  }
}

/**
 * Process an array of reviews from CSV/JSON import
 */
export function processReviewsImport(reviews: ReviewImportData[]) {
  return reviews.map(processReviewImport)
}

/**
 * Parse date string in various formats
 */
export function parseDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
  } catch {
    return null
  }
}

/**
 * Format date for display
 */
export function formatReviewDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Extract categories from reviews array
 */
export function extractCategories(reviews: Array<{ category?: string | null }>): string[] {
  const categories = new Set<string>(['All'])
  
  reviews.forEach(review => {
    if (review.category) {
      categories.add(review.category)
    }
  })
  
  return Array.from(categories).sort()
}
