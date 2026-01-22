import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for fetching dashboard stats
 * Uses service role key to bypass RLS
 */
export async function GET(request: NextRequest) {
  try {
    // Check if service role key is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[Admin API] SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    // Create admin client (bypasses RLS)
    const supabase = createSupabaseAdminClient()

    // Fetch all data in parallel
    const [inquiriesResult, fleetResult] = await Promise.all([
      supabase.from('booking_inquiries').select('*'),
      supabase.from('fleet').select('id, gallery_images, low_season_price, medium_season_price, high_season_price'),
    ])

    if (inquiriesResult.error) {
      console.error('[Admin API] ❌ Error fetching inquiries:', inquiriesResult.error)
      console.error('[Admin API] Error code:', inquiriesResult.error.code)
      console.error('[Admin API] Error message:', inquiriesResult.error.message)
    } else {
      console.log('[Admin API] ✅ Fetched inquiries:', inquiriesResult.data?.length || 0, 'items')
    }

    if (fleetResult.error) {
      console.error('[Admin API] ❌ Error fetching fleet:', fleetResult.error)
      console.error('[Admin API] Error code:', fleetResult.error.code)
      console.error('[Admin API] Error message:', fleetResult.error.message)
    } else {
      console.log('[Admin API] ✅ Fetched fleet:', fleetResult.data?.length || 0, 'items')
      if (fleetResult.data && fleetResult.data.length > 0) {
        const sampleYacht = fleetResult.data[0] as any
        console.log('[Admin API] Sample yacht prices:', {
          id: sampleYacht.id,
          low_season_price: sampleYacht.low_season_price,
          medium_season_price: sampleYacht.medium_season_price,
          high_season_price: sampleYacht.high_season_price,
        })
      }
    }

    // Calculate stats
    const totalInquiries = inquiriesResult.data?.length || 0
    const fleetSize = fleetResult.data?.length || 0

    // Calculate gallery images
    let galleryImages = 0
    fleetResult.data?.forEach((yacht: any) => {
      if (yacht.gallery_images && Array.isArray(yacht.gallery_images)) {
        galleryImages += yacht.gallery_images.length
      }
    })

    // Calculate revenue potential
    let revenuePotential = 0
    let revenueCalculationDetails: any[] = []
    
    if (inquiriesResult.data && fleetResult.data) {
      inquiriesResult.data.forEach((inquiry: any) => {
        if (inquiry.start_date && inquiry.end_date) {
          const yacht = fleetResult.data.find((y: any) => y.id === inquiry.yacht_id)
          if (yacht) {
            const start = new Date(inquiry.start_date)
            const end = new Date(inquiry.end_date)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

            // Type casting to fix TypeScript error - ensure robust null/0 handling
            const y = yacht as any
            // Use Number() with || 0 fallback to handle null, undefined, empty string, etc.
            const lowPrice = Number(y.low_season_price) || 0
            const mediumPrice = Number(y.medium_season_price) || 0
            const highPrice = Number(y.high_season_price) || 0
            
            // Calculate average price (only count non-zero prices)
            // This ensures we never crash if all prices are null/0
            const prices = [lowPrice, mediumPrice, highPrice].filter(p => p > 0 && !isNaN(p))
            const avgPrice = prices.length > 0 
              ? prices.reduce((sum, p) => sum + p, 0) / prices.length
              : 0

            // Ensure days is valid and > 0, and avgPrice is valid number
            if (avgPrice > 0 && !isNaN(avgPrice) && days > 0 && !isNaN(days)) {
              const basePrice = avgPrice * days
              // Ensure basePrice is valid before calculating total
              if (!isNaN(basePrice) && basePrice > 0) {
                const estimatedTotal = basePrice * 1.51 // 1 + 0.30 (APA) + 0.21 (tax)
                // Only add if estimatedTotal is valid
                if (!isNaN(estimatedTotal) && estimatedTotal > 0) {
                  revenuePotential += estimatedTotal
                  
                  // Push success details
                  revenueCalculationDetails.push({
                    inquiry_id: (inquiry as any).id,
                    yacht_id: (inquiry as any).yacht_id,
                    days,
                    avgPrice,
                    basePrice,
                    estimatedTotal,
                    hasPrices: prices.length > 0,
                    lowPrice,
                    mediumPrice,
                    highPrice,
                  })
                } else {
                  // Invalid estimatedTotal
                  revenueCalculationDetails.push({
                    inquiry_id: (inquiry as any).id,
                    yacht_id: (inquiry as any).yacht_id,
                    days,
                    avgPrice,
                    basePrice,
                    estimatedTotal: 0,
                    reason: 'Invalid estimatedTotal calculation',
                    hasPrices: prices.length > 0,
                    lowPrice,
                    mediumPrice,
                    highPrice,
                  })
                }
              } else {
                // Invalid basePrice
                revenueCalculationDetails.push({
                  inquiry_id: (inquiry as any).id,
                  yacht_id: (inquiry as any).yacht_id,
                  days,
                  avgPrice,
                  basePrice: 0,
                  reason: 'Invalid basePrice calculation',
                  hasPrices: prices.length > 0,
                  lowPrice,
                  mediumPrice,
                  highPrice,
                })
              }
            } else {
              // Invalid avgPrice or days
              revenueCalculationDetails.push({
                inquiry_id: (inquiry as any).id,
                yacht_id: (inquiry as any).yacht_id,
                days,
                avgPrice: 0,
                reason: avgPrice === 0 ? 'No prices set for yacht' : 'Invalid date range',
                lowPrice,
                mediumPrice,
                highPrice,
              })
            }
          } else {
            revenueCalculationDetails.push({
              inquiry_id: (inquiry as any).id,
              yacht_id: (inquiry as any).yacht_id,
              reason: 'Yacht not found in fleet',
            })
          }
        } else {
          revenueCalculationDetails.push({
            inquiry_id: (inquiry as any).id,
            reason: 'Missing start_date or end_date',
          })
        }
      })
    }
    
    console.log('[Admin API] Revenue calculation details:', {
      totalInquiries: inquiriesResult.data?.length || 0,
      inquiriesWithDates: revenueCalculationDetails.filter(d => d.days).length,
      inquiriesWithPrices: revenueCalculationDetails.filter(d => d.hasPrices).length,
      revenuePotential,
      details: revenueCalculationDetails.slice(0, 3), // Log first 3 for debugging
    })

    const stats = {
      totalInquiries,
      fleetSize,
      galleryImages,
      revenuePotential,
    }
    
    console.log('[Admin API] ✅ Returning stats:', stats)
    
    return NextResponse.json({
      stats,
    })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
