/**
 * Early Bird Discount Utility
 * Applies 10% discount on all bookings made before February 28, 2026
 */

export const EARLY_BIRD_DEADLINE = new Date('2026-02-28T23:59:59')
export const EARLY_BIRD_DISCOUNT_PERCENTAGE = 10

/**
 * Check if the current date is before the Early Bird deadline
 */
export function isEarlyBirdEligible(checkDate?: Date): boolean {
  const dateToCheck = checkDate || new Date()
  return dateToCheck < EARLY_BIRD_DEADLINE
}

/**
 * Calculate price with Early Bird discount applied
 * @param basePrice - Original price
 * @param bookingDate - Date of booking (defaults to current date)
 * @returns Object with original price, discounted price, and discount amount
 */
export function calculateEarlyBirdPrice(
  basePrice: number,
  bookingDate?: Date
): {
  originalPrice: number
  discountedPrice: number
  discountAmount: number
  isEligible: boolean
} {
  const eligible = isEarlyBirdEligible(bookingDate)
  
  if (!eligible || basePrice <= 0) {
    return {
      originalPrice: basePrice,
      discountedPrice: basePrice,
      discountAmount: 0,
      isEligible: false,
    }
  }

  const discountAmount = basePrice * (EARLY_BIRD_DISCOUNT_PERCENTAGE / 100)
  const discountedPrice = basePrice - discountAmount

  return {
    originalPrice: basePrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimals
    discountAmount: Math.round(discountAmount * 100) / 100,
    isEligible: true,
  }
}

/**
 * Format the Early Bird deadline date for display
 */
export function formatEarlyBirdDeadline(locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(EARLY_BIRD_DEADLINE)
}
