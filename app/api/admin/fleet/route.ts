import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for fleet management
 * Uses service role key to bypass RLS
 */

/**
 * KNOWN_FLEET_COLUMNS - Whitelist of valid fleet table columns
 * Any fields not in this list will be stripped from the payload to prevent
 * PGRST204 "column not found in schema cache" errors.
 * 
 * To add a new column:
 * 1. Add migration in Supabase SQL Editor: ALTER TABLE fleet ADD COLUMN IF NOT EXISTS column_name TYPE;
 * 2. Add the column name to this array
 * 3. Update FleetEditor.tsx form fields as needed
 */
const KNOWN_FLEET_COLUMNS = [
  // Core identification
  'id',
  'name',
  'slug',
  'boat_name',
  
  // Specifications (both column names supported)
  'year',
  'length',
  'beam',
  'draft',
  'cabins',
  'toilets',
  'capacity',
  'crew_count',
  'specifications',      // Legacy column name
  'technical_specs',     // New column name (JSONB for beam, draft, engines, etc.)
  
  // Individual spec fields (if stored as separate columns)
  'engines',
  'fuel_capacity',
  'water_capacity',
  'cruising_speed',
  'max_speed',
  
  // Pricing
  'price_low_season',
  'price_mid_season',
  'price_high_season',
  'price_per_day',
  'price_per_week',
  'apa_percentage',
  'crew_service_fee',
  'cleaning_fee',
  'tax_percentage',
  
  // Descriptions (legacy single-language)
  'description',
  'short_description',
  
  // Descriptions (i18n columns)
  'description_en',
  'description_es',
  'description_de',
  'description_i18n',
  'short_description_i18n',
  
  // Images
  'image',
  'main_image_url',
  'gallery_images',
  
  // Features & Amenities
  'amenities',
  'extras',
  
  // Refit & Condition
  'recently_refitted',
  'refit_details',
  
  // Visibility & Status
  'is_featured',
  'is_active',
  'show_on_home',
  'order_index',
  
  // Timestamps
  'created_at',
  'updated_at',
]

/**
 * Filters an object to only include keys that are in the KNOWN_FLEET_COLUMNS whitelist.
 * Logs any removed fields for debugging.
 */
function filterToKnownColumns(data: Record<string, any>, operation: 'insert' | 'update'): Record<string, any> {
  const filtered: Record<string, any> = {}
  const unknownFields: string[] = []
  
  for (const [key, value] of Object.entries(data)) {
    if (KNOWN_FLEET_COLUMNS.includes(key)) {
      filtered[key] = value
    } else {
      unknownFields.push(key)
    }
  }
  
  if (unknownFields.length > 0) {
    console.warn(`[Admin API] ⚠️ Stripped unknown fields from ${operation} payload:`, unknownFields)
    console.warn('[Admin API] 💡 If these fields should be saved, add them to KNOWN_FLEET_COLUMNS and run the SQL migration.')
  }
  
  return filtered
}

// GET - Fetch all fleet
export async function GET(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data: fleet, error } = await (supabase
      .from('fleet' as any) as any)
      .select('*')
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('[Admin API] ❌ Error fetching fleet:', error)
      return NextResponse.json(
        { error: 'Failed to fetch fleet', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ fleet: fleet || [] })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Create new fleet item
export async function POST(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[Admin API] ❌ SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    let body: any
    try {
      body = await request.json()
      console.log('[Admin API] 📥 Received fleet data:', JSON.stringify(body, null, 2).substring(0, 1000))
    } catch (parseError) {
      console.error('[Admin API] ❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.name || !body.slug) {
      console.error('[Admin API] ❌ Missing required fields:', { name: body.name, slug: body.slug })
      return NextResponse.json(
        { error: 'Missing required fields: name and slug are required' },
        { status: 400 }
      )
    }

    // Clean up the payload - remove id if it exists (for inserts)
    const { id, ...rawInsertData } = body

    // Filter to only known columns to prevent schema cache errors
    const insertData = filterToKnownColumns(rawInsertData, 'insert')

    // Ensure gallery_images is an array or null
    if (insertData.gallery_images && !Array.isArray(insertData.gallery_images)) {
      insertData.gallery_images = []
    }

    // Ensure extras is an array or null
    if (insertData.extras && !Array.isArray(insertData.extras)) {
      insertData.extras = null
    }

    // Ensure boolean fields are proper booleans
    if ('recently_refitted' in insertData) {
      insertData.recently_refitted = Boolean(insertData.recently_refitted)
    }
    if ('is_featured' in insertData) {
      insertData.is_featured = Boolean(insertData.is_featured)
    }
    if ('is_active' in insertData) {
      insertData.is_active = Boolean(insertData.is_active)
    }
    if ('show_on_home' in insertData) {
      insertData.show_on_home = Boolean(insertData.show_on_home)
    }

    console.log('[Admin API] 🔄 Creating fleet with data:', { 
      name: insertData.name, 
      slug: insertData.slug,
      main_image_url: insertData.main_image_url,
      gallery_images_count: insertData.gallery_images?.length || 0,
      recently_refitted: insertData.recently_refitted,
      fieldCount: Object.keys(insertData).length
    })

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('fleet' as any) as any)
      .insert(insertData as any)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Supabase error creating fleet:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { 
          error: 'Failed to create fleet', 
          details: error.message,
          code: error.code,
          hint: error.hint 
        },
        { status: 500 }
      )
    }

    // Revalidate pages that display fleet data
    const slug = (data as any)?.slug
    revalidatePath('/', 'layout')
    revalidatePath('/fleet', 'page')
    if (slug) {
      revalidatePath(`/fleet/${slug}`, 'page')
      // Revalidate for all locales
      revalidatePath('/en/fleet', 'page')
      revalidatePath('/es/fleet', 'page')
      revalidatePath('/de/fleet', 'page')
      revalidatePath(`/en/fleet/${slug}`, 'page')
      revalidatePath(`/es/fleet/${slug}`, 'page')
      revalidatePath(`/de/fleet/${slug}`, 'page')
    }
    revalidateTag('fleet')
    revalidateTag('fleet-list')

    console.log('[Admin API] ✅ Created fleet and revalidated cache:', { id: data?.id, slug })
    return NextResponse.json({ fleet: data as any }, { status: 201 })
  } catch (error) {
    console.error('[Admin API] ❌ Unexpected error in POST /api/admin/fleet:', error)
    console.error('[Admin API] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update existing fleet item
export async function PUT(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[Admin API] ❌ SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    let body: any
    try {
      body = await request.json()
      console.log('[Admin API] 📥 Received fleet update data:', JSON.stringify(body, null, 2).substring(0, 1000))
    } catch (parseError) {
      console.error('[Admin API] ❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 400 }
      )
    }

    const { id, ...rawUpdateData } = body

    if (!id) {
      console.error('[Admin API] ❌ Missing fleet ID in update request')
      return NextResponse.json(
        { error: 'Fleet ID is required' },
        { status: 400 }
      )
    }

    // Filter to only known columns to prevent schema cache errors
    const updateData = filterToKnownColumns(rawUpdateData, 'update')

    // Ensure gallery_images is an array or empty array
    if (updateData.gallery_images && !Array.isArray(updateData.gallery_images)) {
      updateData.gallery_images = []
    }

    // Ensure extras is an array or null
    if (updateData.extras && !Array.isArray(updateData.extras)) {
      updateData.extras = null
    }

    // Ensure boolean fields are proper booleans
    if ('recently_refitted' in updateData) {
      updateData.recently_refitted = Boolean(updateData.recently_refitted)
    }
    if ('is_featured' in updateData) {
      updateData.is_featured = Boolean(updateData.is_featured)
    }
    if ('is_active' in updateData) {
      updateData.is_active = Boolean(updateData.is_active)
    }
    if ('show_on_home' in updateData) {
      updateData.show_on_home = Boolean(updateData.show_on_home)
    }

    console.log('[Admin API] 🔄 Updating fleet:', { 
      id, 
      name: updateData.name, 
      slug: updateData.slug,
      main_image_url: updateData.main_image_url,
      gallery_images_count: updateData.gallery_images?.length || 0,
      recently_refitted: updateData.recently_refitted,
      fieldCount: Object.keys(updateData).length
    })

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('fleet' as any) as any)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Supabase error updating fleet:', {
        id,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { 
          error: 'Failed to update fleet', 
          details: error.message,
          code: error.code,
          hint: error.hint 
        },
        { status: 500 }
      )
    }

    // Revalidate pages that display fleet data
    const slug = (data as any)?.slug || body.slug
    revalidatePath('/', 'layout')
    revalidatePath('/fleet', 'page')
    if (slug) {
      revalidatePath(`/fleet/${slug}`, 'page')
      // Revalidate for all locales
      revalidatePath('/en/fleet', 'page')
      revalidatePath('/es/fleet', 'page')
      revalidatePath('/de/fleet', 'page')
      revalidatePath(`/en/fleet/${slug}`, 'page')
      revalidatePath(`/es/fleet/${slug}`, 'page')
      revalidatePath(`/de/fleet/${slug}`, 'page')
    }
    revalidateTag('fleet')
    revalidateTag('fleet-list')

    console.log('[Admin API] ✅ Updated fleet and revalidated cache:', { id: data?.id, slug })
    return NextResponse.json({ fleet: data as any })
  } catch (error) {
    console.error('[Admin API] ❌ Unexpected error in PUT /api/admin/fleet:', error)
    console.error('[Admin API] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Delete fleet item
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
        { error: 'Fleet ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { error } = await (supabase
      .from('fleet' as any) as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] ❌ Error deleting fleet:', error)
      return NextResponse.json(
        { error: 'Failed to delete fleet', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
