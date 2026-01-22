import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for contact persons management
 * Uses service role key to bypass RLS
 */

// GET - Fetch all contact persons
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
    const { data: contacts, error } = await (supabase
      .from('contact_persons' as any) as any)
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[Admin API] ❌ Error fetching contacts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contact persons', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ contacts: contacts || [] })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Create new contact person
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

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('contact_persons' as any) as any)
      .insert(body as any)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error creating contact:', error)
      return NextResponse.json(
        { error: 'Failed to create contact person', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact: data as any }, { status: 201 })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update existing contact person
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
        { error: 'Contact person ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('contact_persons' as any) as any)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error updating contact:', error)
      return NextResponse.json(
        { error: 'Failed to update contact person', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact: data as any })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Delete contact person
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
        { error: 'Contact person ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { error } = await (supabase
      .from('contact_persons' as any) as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] ❌ Error deleting contact:', error)
      return NextResponse.json(
        { error: 'Failed to delete contact person', details: error.message },
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
