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

    // Fetch only required fields for stats calculation (optimized)
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const [inquiriesResult, fleetResult] = await Promise.all([
      (supabase.from('booking_inquiries' as any) as any).select('id, start_date, end_date, yacht_id'),
      (supabase.from('fleet' as any) as any).select('id, gallery_images, low_season_price, medium_season_price, high_season_price'),
    ])

    if (inquiriesResult.error) {
      console.error('[Admin API] Error fetching inquiries:', inquiriesResult.error.message)
      return NextResponse.json(
        { error: 'Failed to fetch inquiries', details: inquiriesResult.error.message },
        { status: 500 }
      )
    }

    if (fleetResult.error) {
      console.error('[Admin API] Error fetching fleet:', fleetResult.error.message)
      return NextResponse.json(
        { error: 'Failed to fetch fleet', details: fleetResult.error.message },
        { status: 500 }
      )
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
            const prices = [lowPrice, mediumPrice, highPrice].filter(p => p > 0 && !isNaN(p))
            const avgPrice = prices.length > 0 
              ? prices.reduce((sum, p) => sum + p, 0) / prices.length
              : 0

            // Calculate revenue if valid
            if (avgPrice > 0 && !isNaN(avgPrice) && days > 0 && !isNaN(days)) {
              const basePrice = avgPrice * days
              if (!isNaN(basePrice) && basePrice > 0) {
                const estimatedTotal = basePrice * 1.51 // 1 + 0.30 (APA) + 0.21 (tax)
                if (!isNaN(estimatedTotal) && estimatedTotal > 0) {
                  revenuePotential += estimatedTotal
                }
              }
            }
          }
        }
      })
    }

    const stats = {
      totalInquiries,
      fleetSize,
      galleryImages,
      revenuePotential: Math.round(revenuePotential * 100) / 100,
    }
    
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
