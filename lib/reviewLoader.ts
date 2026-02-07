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
  rating: number
  rental_date: string
  publish_date: string
  source: string
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
  return {
    guest_name: jsonReview.name,
    guest_location: null,
    rating: jsonReview.rating,
    review_text: jsonReview.text,
    review_date: parseDate(jsonReview.publish_date),
    profile_image_url: null,
    yacht_id: null,
    is_featured: false,
    is_approved: true,
    rental_date: parseDate(jsonReview.rental_date) || null,
    published_date: parseDate(jsonReview.publish_date) || null,
    category: null,
    original_language: null,
    translated_text: null,
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
