import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for mission promises management
 * Uses service role key to bypass RLS
 */

// GET - Fetch all promises
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
      // Fetch single promise
      const { data, error } = await supabase
        .from('mission_promises')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('[Admin API] Error fetching promise:', error)
        return NextResponse.json(
          { error: 'Failed to fetch promise', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json(data)
    }

    // Fetch all promises
    const { data, error } = await supabase
      .from('mission_promises')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[Admin API] Error fetching promises:', error)
      return NextResponse.json(
        { error: 'Failed to fetch promises', details: error.message },
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

// POST - Create new promise
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
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('mission_promises')
      .insert({
        title_en: body.title_en,
        title_es: body.title_es,
        title_de: body.title_de,
        description_en: body.description_en,
        description_es: body.description_es,
        description_de: body.description_de,
        icon_name: body.icon_name || null,
        icon_url: body.icon_url || null,
        order_index: body.order_index || 0,
        is_active: body.is_active !== false,
      })
      .select()
      .single()

    if (error) {
      console.error('[Admin API] Error creating promise:', error)
      return NextResponse.json(
        { error: 'Failed to create promise', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update promise
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
        { error: 'Promise ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('mission_promises')
      .update({
        title_en: updateData.title_en,
        title_es: updateData.title_es,
        title_de: updateData.title_de,
        description_en: updateData.description_en,
        description_es: updateData.description_es,
        description_de: updateData.description_de,
        icon_name: updateData.icon_name || null,
        icon_url: updateData.icon_url || null,
        order_index: updateData.order_index || 0,
        is_active: updateData.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] Error updating promise:', error)
      return NextResponse.json(
        { error: 'Failed to update promise', details: error.message },
        { status: 500 }
      )
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

// DELETE - Delete promise
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
        { error: 'Promise ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('mission_promises')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] Error deleting promise:', error)
      return NextResponse.json(
        { error: 'Failed to delete promise', details: error.message },
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
