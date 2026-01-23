import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for destination management
 * Uses service role key to bypass RLS
 * This ensures admin users can create, update, and delete destinations
 */

// GET - Fetch all destinations
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

    // Fetch all destinations
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data: destinations, error } = await (supabase
      .from('destinations' as any) as any)
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[Admin API] ❌ Error fetching destinations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch destinations', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Fetched destinations:', destinations?.length || 0, 'items')
    return NextResponse.json({ destinations: destinations || [] })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Create new destination
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, region, slug, description, description_en, description_es, description_de, image_urls, youtube_video_url, order_index, is_active } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Create admin client (bypasses RLS)
    const supabase = createSupabaseAdminClient()

    // Insert new destination
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('destinations' as any) as any)
      .insert({
        name,
        title: name, // Also set title for backward compatibility
        region: region || null,
        slug,
        description,
        description_en,
        description_es,
        description_de,
        image_urls,
        youtube_video_url,
        order_index,
        is_active: true,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error creating destination:', error)
      return NextResponse.json(
        { error: 'Failed to create destination', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Created destination:', (data as any)?.id)
    return NextResponse.json({ destination: data as any }, { status: 201 })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update existing destination
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { id, name, region, slug, description, description_en, description_es, description_de, image_urls, youtube_video_url, order_index, is_active } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Destination ID is required' },
        { status: 400 }
      )
    }

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Create admin client (bypasses RLS)
    const supabase = createSupabaseAdminClient()

    // Update destination
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('destinations' as any) as any)
      .update({
        name,
        title: name, // Also update title for backward compatibility
        region: region || null,
        slug,
        description,
        description_en,
        description_es,
        description_de,
        image_urls,
        youtube_video_url,
        order_index,
        is_active,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error updating destination:', error)
      return NextResponse.json(
        { error: 'Failed to update destination', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Updated destination:', (data as any)?.id)
    return NextResponse.json({ destination: data as any })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Delete destination
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Destination ID is required' },
        { status: 400 }
      )
    }

    // Create admin client (bypasses RLS)
    const supabase = createSupabaseAdminClient()

    // Delete destination
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { error } = await (supabase
      .from('destinations' as any) as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] ❌ Error deleting destination:', error)
      return NextResponse.json(
        { error: 'Failed to delete destination', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Deleted destination:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
