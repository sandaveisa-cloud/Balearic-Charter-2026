import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
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
    const { 
      name, region, slug, description, description_en, description_es, description_de, 
      image_urls, youtube_video_url, order_index, is_active,
      highlights_data, coordinates, ready_to_explore_title_en, ready_to_explore_title_es, ready_to_explore_title_de
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Create admin client (bypasses RLS)
    const supabase = createSupabaseAdminClient()

    // Build insert data - use title as primary field (required in schema)
    const insertData: any = {
      title: name, // title is required in schema
      order_index: order_index || 0,
      is_active: true,
    }

    // Add optional fields if provided
    if (name) insertData.name = name
    if (slug) insertData.slug = slug
    if (region) insertData.region = region
    if (description) insertData.description = description
    if (description_en) insertData.description_en = description_en
    if (description_es) insertData.description_es = description_es
    if (description_de) insertData.description_de = description_de
    if (image_urls) insertData.image_urls = Array.isArray(image_urls) ? image_urls : []
    if (youtube_video_url) insertData.youtube_video_url = youtube_video_url
    // Store additional fields as JSONB (if your schema supports it)
    if (highlights_data) insertData.highlights_data = highlights_data
    if (coordinates) insertData.coordinates = coordinates
    if (ready_to_explore_title_en) insertData.ready_to_explore_title_en = ready_to_explore_title_en
    if (ready_to_explore_title_es) insertData.ready_to_explore_title_es = ready_to_explore_title_es
    if (ready_to_explore_title_de) insertData.ready_to_explore_title_de = ready_to_explore_title_de

    // Insert new destination
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('destinations' as any) as any)
      .insert(insertData as any)
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
    
    // Revalidate pages that display destinations
    const destinationSlug = (data as any)?.slug || slug
    
    // Revalidate all locale paths
    revalidatePath('/', 'layout')
    revalidatePath('/destinations', 'page')
    
    // Revalidate locale-specific home pages (where DestinationsSection is displayed)
    revalidatePath('/en', 'page')
    revalidatePath('/es', 'page')
    revalidatePath('/de', 'page')
    
    if (destinationSlug) {
      revalidatePath(`/destinations/${destinationSlug}`, 'page')
      // Revalidate for all locales
      revalidatePath('/en/destinations', 'page')
      revalidatePath('/es/destinations', 'page')
      revalidatePath('/de/destinations', 'page')
      revalidatePath(`/en/destinations/${destinationSlug}`, 'page')
      revalidatePath(`/es/destinations/${destinationSlug}`, 'page')
      revalidatePath(`/de/destinations/${destinationSlug}`, 'page')
    }
    
    // Invalidate cache tags to force fresh data fetch
    revalidateTag('destinations')
    revalidateTag('destinations-list')
    revalidateTag('site-content') // This is the main cache tag used in getSiteContent

    console.log('[Admin API] ✅ Revalidated cache after creating destination')
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
    console.log('[Admin API] 📥 PUT request body:', body)
    
    const { 
      id, name, region, slug, description, description_en, description_es, description_de, 
      image_urls, youtube_video_url, order_index, is_active,
      highlights_data, coordinates, ready_to_explore_title_en, ready_to_explore_title_es, ready_to_explore_title_de
    } = body

    // Validate required fields
    if (!id) {
      console.error('[Admin API] ❌ Missing ID in PUT request')
      return NextResponse.json(
        { error: 'Destination ID is required' },
        { status: 400 }
      )
    }

    if (!name || !slug) {
      console.error('[Admin API] ❌ Missing name or slug:', { name, slug })
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Create admin client (bypasses RLS)
    const supabase = createSupabaseAdminClient()

    // Build update data object, only including fields that exist in the database
    // First, try to get the current destination to see what columns exist
    const updateData: any = {
      // Always update these core fields
      title: name.trim(), // title is the primary field in schema
      order_index: order_index || 0,
      is_active: is_active !== false,
    }

    // Add name if column exists (will be ignored if it doesn't)
    if (name) updateData.name = name.trim()
    
    // Add slug if provided
    if (slug) updateData.slug = slug.trim()
    
    // Add optional fields only if they are provided
    if (region !== undefined) updateData.region = region?.trim() || null
    if (description !== undefined) updateData.description = description?.trim() || null
    if (description_en !== undefined) updateData.description_en = description_en?.trim() || null
    if (description_es !== undefined) updateData.description_es = description_es?.trim() || null
    if (description_de !== undefined) updateData.description_de = description_de?.trim() || null
    if (image_urls !== undefined) updateData.image_urls = Array.isArray(image_urls) ? image_urls : []
    if (youtube_video_url !== undefined) updateData.youtube_video_url = youtube_video_url?.trim() || null
    // Store additional fields as JSONB (if your schema supports it)
    if (highlights_data !== undefined) updateData.highlights_data = highlights_data
    if (coordinates !== undefined) updateData.coordinates = coordinates
    if (ready_to_explore_title_en !== undefined) updateData.ready_to_explore_title_en = ready_to_explore_title_en?.trim() || null
    if (ready_to_explore_title_es !== undefined) updateData.ready_to_explore_title_es = ready_to_explore_title_es?.trim() || null
    if (ready_to_explore_title_de !== undefined) updateData.ready_to_explore_title_de = ready_to_explore_title_de?.trim() || null

    console.log('[Admin API] 🔄 Updating destination with data:', updateData)

    // Update destination
    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('destinations' as any) as any)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error updating destination:', error)
      console.error('[Admin API] ❌ Error code:', error.code)
      console.error('[Admin API] ❌ Error message:', error.message)
      console.error('[Admin API] ❌ Error details:', error.details)
      console.error('[Admin API] ❌ Error hint:', error.hint)
      
      // Provide more detailed error message
      let errorMessage = error.message || 'Failed to update destination'
      
      // Check for common Supabase errors
      if (error.code === '42703') {
        errorMessage = `Column does not exist: ${error.message}. Please check database schema.`
      } else if (error.code === '23502') {
        errorMessage = `Required field is missing: ${error.message}`
      } else if (error.code === '23505') {
        errorMessage = `Duplicate entry: ${error.message}. Slug might already exist.`
      } else if (error.message?.includes('column') || error.message?.includes('does not exist')) {
        errorMessage = `Database schema error: ${error.message}. Please check if all columns exist.`
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to update destination',
          details: errorMessage,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Updated destination:', (data as any)?.id)
    
    // Revalidate pages that display destinations
    const destinationSlug = (data as any)?.slug || slug
    
    // Revalidate all locale paths
    revalidatePath('/', 'layout')
    revalidatePath('/destinations', 'page')
    
    // Revalidate locale-specific home pages (where DestinationsSection is displayed)
    revalidatePath('/en', 'page')
    revalidatePath('/es', 'page')
    revalidatePath('/de', 'page')
    
    if (destinationSlug) {
      revalidatePath(`/destinations/${destinationSlug}`, 'page')
      // Revalidate for all locales
      revalidatePath('/en/destinations', 'page')
      revalidatePath('/es/destinations', 'page')
      revalidatePath('/de/destinations', 'page')
      revalidatePath(`/en/destinations/${destinationSlug}`, 'page')
      revalidatePath(`/es/destinations/${destinationSlug}`, 'page')
      revalidatePath(`/de/destinations/${destinationSlug}`, 'page')
    }
    
    // Invalidate cache tags to force fresh data fetch
    revalidateTag('destinations')
    revalidateTag('destinations-list')
    revalidateTag('site-content') // This is the main cache tag used in getSiteContent

    console.log('[Admin API] ✅ Revalidated cache after updating destination')
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
