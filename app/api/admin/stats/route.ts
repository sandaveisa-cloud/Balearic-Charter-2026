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
      console.error('[Admin API] Error fetching inquiries:', inquiriesResult.error)
    }

    if (fleetResult.error) {
      console.error('[Admin API] Error fetching fleet:', fleetResult.error)
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
    if (inquiriesResult.data && fleetResult.data) {
      inquiriesResult.data.forEach((inquiry: any) => {
        if (inquiry.start_date && inquiry.end_date) {
          const yacht = fleetResult.data.find((y: any) => y.id === inquiry.yacht_id)
          if (yacht) {
            const start = new Date(inquiry.start_date)
            const end = new Date(inquiry.end_date)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

            const avgPrice =
              ((yacht.low_season_price || 0) +
                (yacht.medium_season_price || 0) +
                (yacht.high_season_price || 0)) /
              3

            const basePrice = avgPrice * days
            const estimatedTotal = basePrice * 1.51 // 1 + 0.30 (APA) + 0.21 (tax)
            revenuePotential += estimatedTotal
          }
        }
      })
    }

    return NextResponse.json({
      stats: {
        totalInquiries,
        fleetSize,
        galleryImages,
        revenuePotential,
      },
    })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
