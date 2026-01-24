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
/**
 * KNOWN_FLEET_COLUMNS - Complete whitelist of valid fleet table columns
 * 
 * IMPORTANT: This list must match the Supabase database schema exactly.
 * Any fields not in this list will be stripped from API payloads.
 * 
 * To add a new column:
 * 1. Add the column to Supabase: ALTER TABLE fleet ADD COLUMN IF NOT EXISTS column_name TYPE;
 * 2. Add the column name to this array
 * 3. Update FleetEditor.tsx form fields as needed
 * 4. Update 0000_master_schema.sql for future deployments
 */
const KNOWN_FLEET_COLUMNS = [
  // Core identification
  'id',
  'name',
  'slug',
  'boat_name',
  
  // Specifications
  'year',
  'length',
  'beam',
  'draft',
  'cabins',
  'toilets',
  'capacity',
  'crew_count',
  'specifications',      // Legacy column name
  'technical_specs',     // JSONB for beam, draft, engines, etc.
  
  // Individual spec fields (stored as separate columns)
  'engines',
  'fuel_capacity',
  'water_capacity',
  'cruising_speed',
  'max_speed',
  
  // Pricing (new naming convention)
  'price_low_season',
  'price_mid_season',
  'price_high_season',
  'price_per_day',
  'price_per_week',
  
  // Pricing (legacy naming - still supported)
  'low_season_price',
  'medium_season_price',
  'high_season_price',
  
  // Pricing fees
  'apa_percentage',
  'crew_service_fee',
  'cleaning_fee',
  'tax_percentage',
  'currency',
  
  // Descriptions (legacy single-language)
  'description',
  'short_description',
  
  // Descriptions (i18n individual columns)
  'description_en',
  'description_es',
  'description_de',
  'short_description_en',
  'short_description_es',
  'short_description_de',
  
  // Descriptions (i18n JSONB)
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
  'refit_year',
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
 * SAFE_COLUMNS - Columns that are 100% guaranteed to exist in all Supabase deployments.
 * Used as a fallback when the database returns schema errors.
 */
const SAFE_COLUMNS = [
  'id', 'name', 'slug', 'boat_name', 'year', 'length', 'cabins', 'capacity',
  'description', 'image', 'is_featured', 'is_active', 'created_at', 'updated_at'
]

/**
 * Filters an object to only include keys that are in the KNOWN_FLEET_COLUMNS whitelist.
 * Logs any removed fields for debugging.
 * 
 * @param data - The raw data object from the request
 * @param operation - Whether this is an 'insert' or 'update' operation
 * @param useSafeMode - If true, only use SAFE_COLUMNS (for retry after schema error)
 */
function filterToKnownColumns(
  data: Record<string, any>, 
  operation: 'insert' | 'update',
  useSafeMode: boolean = false
): Record<string, any> {
  const allowedColumns = useSafeMode ? SAFE_COLUMNS : KNOWN_FLEET_COLUMNS
  const filtered: Record<string, any> = {}
  const unknownFields: string[] = []
  
  for (const [key, value] of Object.entries(data)) {
    if (allowedColumns.includes(key)) {
      // Skip null/undefined values for cleaner payloads
      if (value !== undefined) {
        filtered[key] = value
      }
    } else {
      unknownFields.push(key)
    }
  }
  
  if (unknownFields.length > 0) {
    console.warn(`[Admin API] ⚠️ Stripped ${unknownFields.length} fields from ${operation} payload:`, unknownFields)
    if (!useSafeMode) {
      console.warn('[Admin API] 💡 If these fields should be saved, add them to KNOWN_FLEET_COLUMNS and run the SQL migration.')
    }
  }
  
  return filtered
}

/**
 * Attempts to execute a Supabase mutation with automatic retry using safe columns.
 * If the first attempt fails with a schema error, retries with only safe columns.
 */
async function executeWithFallback(
  supabase: any,
  operation: 'insert' | 'update',
  rawData: Record<string, any>,
  id?: string
): Promise<{ data: any; error: any; usedSafeMode: boolean }> {
  // First attempt with all known columns
  let operationData = filterToKnownColumns(rawData, operation, false)
  
  // Ensure boolean fields are proper booleans
  const booleanFields = ['recently_refitted', 'is_featured', 'is_active', 'show_on_home']
  for (const field of booleanFields) {
    if (field in operationData) {
      operationData[field] = Boolean(operationData[field])
    }
  }
  
  // Ensure array fields are arrays
  if (operationData.gallery_images && !Array.isArray(operationData.gallery_images)) {
    operationData.gallery_images = []
  }
  if (operationData.extras && !Array.isArray(operationData.extras)) {
    operationData.extras = []
  }
  
  let result: any
  
  if (operation === 'insert') {
    result = await (supabase.from('fleet' as any) as any)
      .insert(operationData)
      .select()
      .single()
  } else {
    result = await (supabase.from('fleet' as any) as any)
      .update({ ...operationData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  }
  
  // Check if error is a schema-related error (PGRST204 or similar)
  if (result.error && (
    result.error.code === 'PGRST204' || 
    result.error.message?.includes('column') ||
    result.error.message?.includes('schema cache')
  )) {
    console.warn('[Admin API] ⚠️ Schema error detected, retrying with safe columns only...')
    console.warn('[Admin API] Original error:', result.error.message)
    
    // Retry with only safe columns
    operationData = filterToKnownColumns(rawData, operation, true)
    
    // Re-apply boolean casting for safe columns
    for (const field of booleanFields) {
      if (field in operationData) {
        operationData[field] = Boolean(operationData[field])
      }
    }
    
    if (operation === 'insert') {
      result = await (supabase.from('fleet' as any) as any)
        .insert(operationData)
        .select()
        .single()
    } else {
      result = await (supabase.from('fleet' as any) as any)
        .update({ ...operationData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    }
    
    return { ...result, usedSafeMode: true }
  }
  
  return { ...result, usedSafeMode: false }
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

    console.log('[Admin API] 🔄 Creating fleet with data:', { 
      name: rawInsertData.name, 
      slug: rawInsertData.slug,
      main_image_url: rawInsertData.main_image_url,
      fieldCount: Object.keys(rawInsertData).length
    })

    const supabase = createSupabaseAdminClient()

    // Use the fail-safe execution with automatic fallback
    const { data, error, usedSafeMode } = await executeWithFallback(
      supabase,
      'insert',
      rawInsertData
    )

    if (usedSafeMode) {
      console.warn('[Admin API] ⚠️ Fleet created with limited fields due to schema mismatch.')
      console.warn('[Admin API] 💡 Run the SQL migration to add missing columns.')
    }

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
          hint: error.hint,
          suggestion: 'Some fields may be missing from the database. Run the SQL migration in supabase/migrations/0000_master_schema.sql'
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

    console.log('[Admin API] 🔄 Updating fleet:', { 
      id, 
      name: rawUpdateData.name, 
      slug: rawUpdateData.slug,
      fieldCount: Object.keys(rawUpdateData).length
    })

    const supabase = createSupabaseAdminClient()

    // Use the fail-safe execution with automatic fallback
    const { data, error, usedSafeMode } = await executeWithFallback(
      supabase,
      'update',
      rawUpdateData,
      id
    )

    if (usedSafeMode) {
      console.warn('[Admin API] ⚠️ Fleet updated with limited fields due to schema mismatch.')
      console.warn('[Admin API] 💡 Run the SQL migration to add missing columns.')
    }

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
          hint: error.hint,
          suggestion: 'Some fields may be missing from the database. Run the SQL migration in supabase/migrations/0000_master_schema.sql'
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
