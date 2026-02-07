/**
 * Utility to load reviews from reviews.json and check for duplicates
 */

import type { Review } from '@/types/database'
// @ts-ignore - JSON import
import reviewsData from '../reviews.json'

interface JsonReview {
  id: number
  name: string
  text: string
  rating?: number
  language?: string
  is_translated?: boolean
  rental_date: string
  publish_date: string
  source: string
}

/**
 * Map language names to ISO language codes
 */
function mapLanguageToCode(language: string | undefined): string | null {
  if (!language) return null
  
  const languageMap: Record<string, string> = {
    'English': 'en',
    'Dutch': 'nl',
    'German': 'de',
    'Spanish': 'es',
    'Italian': 'it',
    'French': 'fr',
    'Portuguese': 'pt',
    'Latvian': 'lv',
  }
  
  return languageMap[language] || null
}

/**
 * Get English translation for non-English reviews
 * These are manually provided translations for reviews marked as is_translated: true
 */
function getEnglishTranslation(reviewId: number, originalText: string, languageCode: string | null): string | null {
  // Manual translations for specific reviews
  const translations: Record<number, string> = {
    10: "Top boat, top skipper. Had a wonderful day!", // Maikel - Dutch
    40: "An unforgettable day with Peter on the water! Highly recommended! We'll be back! Thanks Peter! See you soon!", // Michael - German
    41: "Peter looked after us as a group with incredible respect. The boat was also really great for a group of 8 people. The price/performance ratio was also great due to the low consumption! I'd be happy to do it again!", // Ferdinand - German
    42: "Excellent treatment, excellent boat and great attention from the crew. Great experience", // Rubén - Spanish
    43: "Peter is an impeccable skipper! Really nice catamaran. Excellent experience, price in line with Ibiza.", // Gennaro - Italian
  }
  
  return translations[reviewId] || null
}

/**
 * Convert date from MM/DD/YYYY format to ISO date string
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null
  try {
    const [month, day, year] = dateStr.split('/')
    if (!month || !day || !year) return null
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isNaN(date.getTime())) return null
    return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
  } catch {
    return null
  }
}

/**
 * Check if a review already exists in the database reviews
 * Compares by name and first 50 characters of text
 */
function isDuplicate(
  jsonReview: JsonReview,
  existingReviews: Review[]
): boolean {
  const reviewTextStart = jsonReview.text.substring(0, 50).toLowerCase().trim()
  
  return existingReviews.some((existing) => {
    const existingName = existing.guest_name?.toLowerCase().trim()
    const existingTextStart = existing.review_text?.substring(0, 50).toLowerCase().trim()
    
    // Check if name matches
    if (existingName === jsonReview.name.toLowerCase().trim()) {
      // If name matches, check if text is similar
      if (existingTextStart && reviewTextStart) {
        // Consider it duplicate if first 30 chars match
        return existingTextStart.substring(0, 30) === reviewTextStart.substring(0, 30)
      }
    }
    
    return false
  })
}

/**
 * Convert JSON review to database Review format
 */
function convertJsonReviewToReview(jsonReview: JsonReview): Omit<Review, 'id' | 'created_at' | 'updated_at'> {
  const languageCode = mapLanguageToCode(jsonReview.language)
  const isTranslated = jsonReview.is_translated === true
  const isEnglish = languageCode === 'en' || !languageCode
  
  // For translated reviews: original text goes in review_text, English translation in translated_text
  // For English reviews: text goes in review_text, no translation needed
  let reviewText = jsonReview.text
  let translatedText: string | null = null
  let originalLanguage: string | null = null
  
  if (isTranslated && !isEnglish) {
    // This is a translated review - text is original, need English translation
    originalLanguage = languageCode
    translatedText = getEnglishTranslation(jsonReview.id, jsonReview.text, languageCode)
    // Keep original text in review_text
  } else if (isEnglish) {
    // English review - no translation needed
    originalLanguage = 'en'
  } else {
    // Non-English but not marked as translated - treat as original
    originalLanguage = languageCode
  }
  
  return {
    guest_name: jsonReview.name,
    guest_location: null,
    rating: jsonReview.rating || 5, // Default to 5 if not provided
    review_text: reviewText,
    review_date: parseDate(jsonReview.publish_date),
    profile_image_url: null,
    yacht_id: null,
    is_featured: false,
    is_approved: true,
    rental_date: parseDate(jsonReview.rental_date) || null,
    published_date: parseDate(jsonReview.publish_date) || null,
    category: null,
    original_language: originalLanguage,
    translated_text: translatedText,
  }
}

/**
 * Load reviews from reviews.json and merge with existing reviews, avoiding duplicates
 */
export function loadReviewsFromJson(existingReviews: Review[] = []): Review[] {
  try {
    const jsonReviews = reviewsData as JsonReview[]
    const newReviews: Review[] = []
    
    // Convert JSON reviews and filter out duplicates
    jsonReviews.forEach((jsonReview, index) => {
      if (!isDuplicate(jsonReview, existingReviews)) {
        const review: Review = {
          ...convertJsonReviewToReview(jsonReview),
          id: `json-${jsonReview.id}`,
          created_at: parseDate(jsonReview.publish_date) || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        newReviews.push(review)
      }
    })
    
    // Merge: existing reviews first, then new ones from JSON
    return [...existingReviews, ...newReviews]
  } catch (error) {
    console.error('[ReviewLoader] Error loading reviews from JSON:', error)
    // Return existing reviews if JSON loading fails
    return existingReviews
  }
}
