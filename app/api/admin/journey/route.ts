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

    // Fetch all milestones
    // @ts-ignore - TypeScript doesn't recognize journey_milestones table
    const { data, error } = await (supabase as any)
      .from('journey_milestones')
      .select('*')
      .order('year', { ascending: true })
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
    
    // Validate year range
    if (body.year < 2000 || body.year > 2030) {
      return NextResponse.json(
        { 
          error: 'Invalid year', 
          details: `Year must be between 2000 and 2030. Received: ${body.year}` 
        },
        { status: 400 }
      )
    }
    
    // Log incoming data for debugging
    console.log('[Admin API] 📥 POST request body:', {
      ...body,
      image_url: body.image_url || '(empty/null)',
      hasImage: !!body.image_url
    })
    
    const supabase = createSupabaseAdminClient()

    // Prepare insert data
    const insertData = {
      year: body.year,
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

    // Validate year range
    if (updateData.year !== undefined && (updateData.year < 2000 || updateData.year > 2030)) {
      return NextResponse.json(
        { 
          error: 'Invalid year', 
          details: `Year must be between 2000 and 2030. Received: ${updateData.year}` 
        },
        { status: 400 }
      )
    }

    // Log incoming data for debugging
    console.log('[Admin API] 📥 PUT request:', {
      id,
      ...updateData,
      image_url: updateData.image_url || '(empty/null)',
      hasImage: !!updateData.image_url
    })

    const supabase = createSupabaseAdminClient()

    // Prepare update data
    const updatePayload = {
      year: updateData.year,
      title_en: updateData.title_en,
      title_es: updateData.title_es,
      title_de: updateData.title_de,
      description_en: updateData.description_en,
      description_es: updateData.description_es,
      description_de: updateData.description_de,
      image_url: updateData.image_url || null, // Explicitly handle empty string as null
      order_index: updateData.order_index || 0,
      is_active: updateData.is_active !== false,
      updated_at: new Date().toISOString(),
    }

    console.log('[Admin API] 📤 Updating milestone:', {
      id,
      ...updatePayload,
      image_url: updatePayload.image_url || '(null)'
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
      console.error('[Admin API] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: 'Failed to update milestone', 
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('[Admin API] ✅ Milestone updated successfully:', data?.id)

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
