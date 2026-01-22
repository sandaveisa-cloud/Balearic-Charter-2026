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

    // Fetch all inquiries
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('booking_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (inquiriesError) {
      console.error('[Admin API] ❌ Error fetching inquiries:', inquiriesError)
      console.error('[Admin API] Error code:', inquiriesError.code)
      console.error('[Admin API] Error message:', inquiriesError.message)
      console.error('[Admin API] Error details:', inquiriesError.details)
      console.error('[Admin API] Error hint:', inquiriesError.hint)
      return NextResponse.json(
        { error: 'Failed to fetch inquiries', details: inquiriesError.message },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Fetched inquiries:', inquiries?.length || 0, 'items')
    if (inquiries && inquiries.length > 0) {
      console.log('[Admin API] Sample inquiry:', {
        id: inquiries[0].id,
        name: (inquiries[0] as any).name,
        email: (inquiries[0] as any).email,
        yacht_id: (inquiries[0] as any).yacht_id,
      })
    }

    // Fetch fleet data for yacht names
    const { data: fleet, error: fleetError } = await supabase
      .from('fleet')
      .select('id, name, boat_name')

    if (fleetError) {
      console.error('[Admin API] Error fetching fleet:', fleetError)
      // Don't fail completely if fleet fetch fails
    }

    // Map yacht names to inquiries
    const inquiriesWithYachts = (inquiries || []).map((inquiry: any) => {
      const yacht = fleet?.find((y: any) => y.id === inquiry.yacht_id)
      // Type casting to fix TypeScript error
      const yachtData = yacht as any
      return {
        ...inquiry,
        yacht_name: yachtData?.name || yachtData?.boat_name || 'Unknown Yacht',
      }
    })

    console.log('[Admin API] ✅ Returning inquiries with yacht names:', inquiriesWithYachts.length, 'items')
    console.log('[Admin API] First inquiry with yacht:', inquiriesWithYachts[0] ? {
      id: inquiriesWithYachts[0].id,
      name: inquiriesWithYachts[0].name,
      email: inquiriesWithYachts[0].email,
      yacht_name: inquiriesWithYachts[0].yacht_name,
    } : 'No inquiries')

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
