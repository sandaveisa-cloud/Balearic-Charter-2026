import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for journey milestones management
 * Uses service role key to bypass RLS
 */

// GET - Fetch all milestones
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const yachtId = searchParams.get('yacht_id')

    if (id) {
      // Fetch single milestone
      // @ts-ignore - TypeScript doesn't recognize journey_milestones table
      const { data, error } = await (supabase as any)
        .from('journey_milestones')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('[Admin API] Error fetching milestone:', error)
        return NextResponse.json(
          { error: 'Failed to fetch milestone', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json(data)
    }

    // Fetch milestones - filter by yacht_id if provided
    let query = (supabase as any).from('journey_milestones').select('*')
    
    if (yachtId) {
      // Fetch milestones for specific yacht
      query = query.eq('yacht_id', yachtId)
    }
    
    // @ts-ignore - TypeScript doesn't recognize journey_milestones table
    const { data, error } = await query
      .order('year', { ascending: false })
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[Admin API] Error fetching milestones:', error)
      return NextResponse.json(
        { error: 'Failed to fetch milestones', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Create new milestone
export async function POST(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    // Validate year range (allow 2000-2030, including 2012)
    const yearNum = parseInt(body.year)
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2030) {
      console.error('[Admin API] ❌ Year validation failed:', {
        received: body.year,
        parsed: yearNum,
        isValid: !isNaN(yearNum) && yearNum >= 2000 && yearNum <= 2030
      })
      return NextResponse.json(
        { 
          error: 'Invalid year', 
          details: `Year must be between 2000 and 2030 (inclusive). Received: ${body.year}`,
          received: body.year,
          parsed: yearNum
        },
        { status: 400 }
      )
    }
    // Ensure year is stored as integer
    body.year = yearNum
    
    // Log incoming data for debugging
    console.log('[Admin API] 📥 POST request body:', {
      ...body,
      image_url: body.image_url || '(empty/null)',
      hasImage: !!body.image_url,
      year: body.year,
      yearType: typeof body.year
    })
    
    const supabase = createSupabaseAdminClient()

    // Prepare insert data - ensure all fields match database schema exactly
    const insertData: any = {
      year: body.year, // Already validated and converted to integer
      title_en: body.title_en,
      title_es: body.title_es,
      title_de: body.title_de,
      description_en: body.description_en,
      description_es: body.description_es,
      description_de: body.description_de,
      image_url: body.image_url || null, // Explicitly handle empty string as null
      order_index: body.order_index || 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
    }
    
    // Add yacht_id if provided (links milestone to specific yacht)
    if (body.yacht_id) {
      insertData.yacht_id = body.yacht_id
    }

    console.log('[Admin API] 📤 Inserting data:', {
      ...insertData,
      image_url: insertData.image_url || '(null)'
    })

    // @ts-ignore - Šī rindiņa pateiks TypeScript ignorēt nākamo bloku, un build procesam jāiziet cauri
    const { data, error } = await (supabase as any)
      .from('journey_milestones')
      .insert(insertData)
      .select()
      .single()

    // COMPREHENSIVE REVALIDATION - ensure changes appear instantly
    if (!error && data) {
      try {
        const { revalidatePath, revalidateTag } = await import('next/cache')
        revalidatePath('/', 'layout')
        
        const locales = ['en', 'es', 'de']
        locales.forEach(loc => {
          revalidatePath(`/${loc}`, 'layout')
          revalidatePath(`/${loc}`, 'page')
        })
        
        // Revalidate specific yacht page if yacht_id exists
        if (insertData.yacht_id) {
          locales.forEach(loc => {
            revalidatePath(`/${loc}/fleet`, 'page')
          })
        }
        
        revalidateTag('site-content')
        console.log('[Admin API] ✅ Revalidated pages after milestone create')
      } catch (revalError) {
        console.warn('[Admin API] ⚠️ Could not revalidate paths:', revalError)
      }
    }

    if (error) {
      console.error('[Admin API] ❌ Error creating milestone:', error)
      console.error('[Admin API] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: 'Failed to create milestone', 
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Milestone created successfully:', data?.id)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update milestone
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    // Validate year range (allow 2000-2030, including 2012)
    if (updateData.year !== undefined) {
      const yearNum = parseInt(updateData.year)
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2030) {
        console.error('[Admin API] ❌ Year validation failed:', {
          received: updateData.year,
          parsed: yearNum,
          isValid: !isNaN(yearNum) && yearNum >= 2000 && yearNum <= 2030
        })
        return NextResponse.json(
          { 
            error: 'Invalid year', 
            details: `Year must be between 2000 and 2030 (inclusive). Received: ${updateData.year}`,
            received: updateData.year,
            parsed: yearNum
          },
          { status: 400 }
        )
      }
      // Ensure year is stored as integer
      updateData.year = yearNum
    }

    // Log incoming data for debugging
    console.log('[Admin API] 📥 PUT request:', {
      id,
      ...updateData,
      image_url: updateData.image_url || '(empty/null)',
      hasImage: !!updateData.image_url
    })

    const supabase = createSupabaseAdminClient()

    // Prepare update data - ensure all fields match database schema exactly
    const updatePayload: any = {
      year: updateData.year !== undefined ? parseInt(updateData.year) : undefined,
      title_en: updateData.title_en,
      title_es: updateData.title_es,
      title_de: updateData.title_de,
      description_en: updateData.description_en,
      description_es: updateData.description_es,
      description_de: updateData.description_de,
      image_url: updateData.image_url || null, // Explicitly handle empty string as null
      order_index: updateData.order_index !== undefined ? parseInt(updateData.order_index) : 0,
      is_active: updateData.is_active !== undefined ? updateData.is_active : true,
      yacht_id: updateData.yacht_id !== undefined ? (updateData.yacht_id || null) : undefined, // Include yacht_id if provided
      updated_at: new Date().toISOString(),
    }

    // Remove undefined fields to avoid Supabase errors
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key]
      }
    })

    console.log('[Admin API] 📤 Updating milestone:', {
      id,
      payload: updatePayload,
      image_url: updatePayload.image_url || '(null)',
      year: updatePayload.year,
      yearType: typeof updatePayload.year
    })

    // @ts-ignore - TypeScript doesn't recognize journey_milestones table
    const { data, error } = await (supabase as any)
      .from('journey_milestones')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error updating milestone:', error)
      console.error('[Admin API] Full error object:', JSON.stringify(error, null, 2))
      console.error('[Admin API] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        statusCode: error.statusCode
      })
      console.error('[Admin API] Update payload that failed:', updatePayload)
      console.error('[Admin API] Milestone ID:', id)
      
      // Check for specific error types
      let errorMessage = 'Failed to update milestone'
      if (error.code === '23505') {
        errorMessage = 'Duplicate entry: A milestone with these details already exists'
      } else if (error.code === '23503') {
        errorMessage = 'Foreign key constraint violation'
      } else if (error.code === '23514') {
        errorMessage = `Check constraint violation: ${error.message}`
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = 'Permission denied: Check RLS policies for journey_milestones table'
      }
      
      // Return detailed error with Supabase error.message as the primary message
      return NextResponse.json(
        { 
          error: error.message || errorMessage, // Supabase error.message is the primary error
          message: error.message, // Explicitly include error.message
          details: error.details || error.message,
          hint: error.hint,
          code: error.code,
          fullError: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          }
        },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Milestone updated successfully:', data?.id)

    // COMPREHENSIVE REVALIDATION - ensure changes appear instantly
    try {
      const { revalidatePath, revalidateTag } = await import('next/cache')
      revalidatePath('/', 'layout')
      
      const locales = ['en', 'es', 'de']
      locales.forEach(loc => {
        revalidatePath(`/${loc}`, 'layout')
        revalidatePath(`/${loc}`, 'page')
      })
      
      // Revalidate specific yacht page if yacht_id exists
      if (updatePayload.yacht_id || data?.yacht_id) {
        const yachtId = updatePayload.yacht_id || data?.yacht_id
        // Note: We'd need to fetch yacht slug to revalidate specific page
        // For now, revalidate all fleet pages
        locales.forEach(loc => {
          revalidatePath(`/${loc}/fleet`, 'page')
        })
      }
      
      revalidateTag('site-content')
      console.log('[Admin API] ✅ Revalidated pages after milestone update')
    } catch (revalError) {
      console.warn('[Admin API] ⚠️ Could not revalidate paths:', revalError)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Delete milestone
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
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - TypeScript doesn't recognize journey_milestones table
    const { error } = await (supabase as any)
      .from('journey_milestones')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] Error deleting milestone:', error)
      return NextResponse.json(
        { error: 'Failed to delete milestone', details: error.message },
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
