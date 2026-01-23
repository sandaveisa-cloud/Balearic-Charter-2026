import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for fetching booking inquiries
 * Uses service role key to bypass RLS
 * This ensures admin users can always access inquiries regardless of RLS policies
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

    // Fetch inquiries with fleet data in parallel (optimized)
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const [inquiriesResult, fleetResult] = await Promise.all([
      (supabase.from('booking_inquiries' as any) as any)
        .select('*')
        .order('created_at', { ascending: false }),
      (supabase.from('fleet' as any) as any)
        .select('id, name, boat_name'),
    ])

    if (inquiriesResult.error) {
      console.error('[Admin API] Error fetching inquiries:', inquiriesResult.error.message)
      return NextResponse.json(
        { error: 'Failed to fetch inquiries', details: inquiriesResult.error.message },
        { status: 500 }
      )
    }

    const inquiries = inquiriesResult.data || []
    const fleet = fleetResult.data || []

    // Map yacht names to inquiries
    const inquiriesWithYachts = inquiries.map((inquiry: any) => {
      const yacht = fleet.find((y: any) => y.id === inquiry.yacht_id)
      return {
        ...inquiry,
        yacht_name: yacht?.name || yacht?.boat_name || 'Unknown Yacht',
      }
    })

    return NextResponse.json({
      inquiries: inquiriesWithYachts,
      total: inquiriesWithYachts.length,
    })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
