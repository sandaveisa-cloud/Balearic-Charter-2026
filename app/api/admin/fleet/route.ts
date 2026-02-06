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
  
  // Taglines (i18n individual columns)
  'tagline_en',
  'tagline_es',
  'tagline_de',
  
  // Descriptions (i18n JSONB)
  'description_i18n',
  'short_description_i18n',
  'tagline_i18n',
  
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
 * Extracts the missing column name from a Supabase error message.
 * Returns null if not a column error.
 */
function extractMissingColumn(error: any): string | null {
  if (!error?.message) return null
  
  // Pattern: "Could not find the 'column_name' column of 'table' in the schema cache"
  const match = error.message.match(/Could not find the '(\w+)' column/)
  if (match) return match[1]
  
  // Pattern: "column \"column_name\" of relation \"table\" does not exist"
  const match2 = error.message.match(/column "(\w+)" .* does not exist/)
  if (match2) return match2[1]
  
  return null
}

/**
 * Prepares data for database operation with proper type casting.
 */
function prepareDataForDb(data: Record<string, any>): Record<string, any> {
  const prepared = { ...data }
  
  // Ensure boolean fields are proper booleans
  const booleanFields = ['recently_refitted', 'is_featured', 'is_active', 'show_on_home']
  for (const field of booleanFields) {
    if (field in prepared) {
      prepared[field] = Boolean(prepared[field])
    }
  }
  
  // Ensure array fields are arrays
  if (prepared.gallery_images && !Array.isArray(prepared.gallery_images)) {
    prepared.gallery_images = []
  }
  if (prepared.extras && !Array.isArray(prepared.extras)) {
    prepared.extras = []
  }
  
  // Ensure JSONB fields are objects
  if (prepared.amenities && typeof prepared.amenities !== 'object') {
    prepared.amenities = {}
  }
  if (prepared.technical_specs && typeof prepared.technical_specs !== 'object') {
    prepared.technical_specs = {}
  }
  
  return prepared
}

/**
 * Attempts to execute a Supabase mutation with progressive fallback.
 * If a column is missing, it removes that column and retries automatically.
 * This ensures the save operation succeeds even if some columns don't exist.
 */
async function executeWithFallback(
  supabase: any,
  operation: 'insert' | 'update',
  rawData: Record<string, any>,
  id?: string
): Promise<{ data: any; error: any; usedSafeMode: boolean; skippedColumns: string[] }> {
  const skippedColumns: string[] = []
  let operationData = prepareDataForDb(filterToKnownColumns(rawData, operation, false))
  let attempts = 0
  const maxAttempts = 10 // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    attempts++
    
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
    
    // Success!
    if (!result.error) {
      if (skippedColumns.length > 0) {
        console.warn(`[Admin API] ⚠️ Successfully saved but skipped ${skippedColumns.length} missing columns:`, skippedColumns)
      }
      return { ...result, usedSafeMode: skippedColumns.length > 0, skippedColumns }
    }
    
    // Check if error is a schema-related error
    const isSchemaError = 
      result.error.code === 'PGRST204' || 
      result.error.message?.includes('column') ||
      result.error.message?.includes('schema cache') ||
      result.error.message?.includes('does not exist')
    
    if (!isSchemaError) {
      // Not a schema error, return as-is
      return { ...result, usedSafeMode: false, skippedColumns }
    }
    
    // Try to extract the specific missing column
    const missingColumn = extractMissingColumn(result.error)
    
    if (missingColumn && operationData[missingColumn] !== undefined) {
      console.warn(`[Admin API] ⚠️ Column '${missingColumn}' not found in database, removing from payload...`)
      delete operationData[missingColumn]
      skippedColumns.push(missingColumn)
      continue // Retry without this column
    }
    
    // If we can't identify the specific column, fall back to safe mode
    console.warn('[Admin API] ⚠️ Cannot identify missing column, falling back to safe columns only...')
    console.warn('[Admin API] Original error:', result.error.message)
    
    operationData = prepareDataForDb(filterToKnownColumns(rawData, operation, true))
    
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
    
    return { ...result, usedSafeMode: true, skippedColumns }
  }
  
  // Max attempts reached
  console.error('[Admin API] ❌ Max retry attempts reached')
  return { 
    data: null, 
    error: { message: 'Failed after multiple retry attempts due to schema mismatches' }, 
    usedSafeMode: true,
    skippedColumns 
  }
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

    // Try fetching with order_index, fallback if column doesn't exist
    let fleet: any[] = []
    let fetchError: any = null

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    let result = await (supabase
      .from('fleet' as any) as any)
      .select('*')
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })

    if (result.error) {
      // If order_index column doesn't exist, try without it
      if (result.error.message?.includes('order_index') || result.error.code === '42703') {
        console.warn('[Admin API] order_index column not found, fetching without it...')
        result = await (supabase
          .from('fleet' as any) as any)
          .select('*')
          .order('is_featured', { ascending: false })
          .order('name', { ascending: true })
      }
    }

    if (result.error) {
      console.error('[Admin API] ❌ Error fetching fleet:', result.error)
      return NextResponse.json(
        { error: 'Failed to fetch fleet', details: result.error.message },
        { status: 500 }
      )
    }

    fleet = result.data || []
    return NextResponse.json({ fleet })
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
    const { data, error, usedSafeMode, skippedColumns } = await executeWithFallback(
      supabase,
      'insert',
      rawInsertData
    )

    if (usedSafeMode || skippedColumns.length > 0) {
      console.warn('[Admin API] ⚠️ Fleet created with limited fields due to schema mismatch.')
      console.warn('[Admin API] 💡 Skipped columns:', skippedColumns)
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
          skippedColumns,
          suggestion: 'Some fields may be missing from the database. Run the SQL migration in supabase/migrations/004_add_missing_fleet_columns.sql'
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
    revalidateTag('site-content') // Main cache tag used in getSiteContent()
    
    // Revalidate home pages for all locales
    revalidatePath('/en', 'page')
    revalidatePath('/es', 'page')
    revalidatePath('/de', 'page')

    console.log('[Admin API] ✅ Created fleet and revalidated cache:', { id: data?.id, slug })
    
    // Return success with warning if columns were skipped
    const response: any = { fleet: data as any }
    if (skippedColumns.length > 0) {
      response.warning = `Saved successfully but ${skippedColumns.length} fields were skipped due to missing database columns: ${skippedColumns.join(', ')}`
      response.skippedColumns = skippedColumns
    }
    return NextResponse.json(response, { status: 201 })
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
    const { data, error, usedSafeMode, skippedColumns } = await executeWithFallback(
      supabase,
      'update',
      rawUpdateData,
      id
    )

    if (usedSafeMode || skippedColumns.length > 0) {
      console.warn('[Admin API] ⚠️ Fleet updated with limited fields due to schema mismatch.')
      console.warn('[Admin API] 💡 Skipped columns:', skippedColumns)
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
          skippedColumns,
          suggestion: 'Some fields may be missing from the database. Run the SQL migration in supabase/migrations/004_add_missing_fleet_columns.sql'
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
    revalidateTag('site-content') // Main cache tag used in getSiteContent()
    
    // Revalidate home pages for all locales
    revalidatePath('/en', 'page')
    revalidatePath('/es', 'page')
    revalidatePath('/de', 'page')

    console.log('[Admin API] ✅ Updated fleet and revalidated cache:', { id: data?.id, slug })
    
    // Return success with warning if columns were skipped
    const response: any = { fleet: data as any }
    if (skippedColumns.length > 0) {
      response.warning = `Saved successfully but ${skippedColumns.length} fields were skipped due to missing database columns: ${skippedColumns.join(', ')}`
      response.skippedColumns = skippedColumns
    }
    return NextResponse.json(response)
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

    // Revalidate all fleet pages after deletion
    revalidatePath('/', 'layout')
    revalidatePath('/fleet', 'page')
    revalidatePath('/en', 'page')
    revalidatePath('/es', 'page')
    revalidatePath('/de', 'page')
    revalidatePath('/en/fleet', 'page')
    revalidatePath('/es/fleet', 'page')
    revalidatePath('/de/fleet', 'page')
    revalidateTag('fleet')
    revalidateTag('fleet-list')
    revalidateTag('site-content')

    console.log('[Admin API] ✅ Deleted fleet and revalidated cache:', { id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
