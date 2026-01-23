import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for managing booking inquiries
 * Uses service role key to bypass RLS
 */
export async function GET(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[Admin API] SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

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

/**
 * Update an inquiry (status, notes, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Inquiry ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore
    const { data, error } = await (supabase
      .from('booking_inquiries' as any) as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] Error updating inquiry:', error)
      return NextResponse.json(
        { error: 'Failed to update inquiry', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      inquiry: data,
      message: 'Inquiry updated successfully',
    })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * Delete an inquiry
 */
export async function DELETE(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Inquiry ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore
    const { error } = await (supabase
      .from('booking_inquiries' as any) as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] Error deleting inquiry:', error)
      return NextResponse.json(
        { error: 'Failed to delete inquiry', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Inquiry deleted successfully',
    })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
