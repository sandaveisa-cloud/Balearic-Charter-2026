import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for fleet management
 * Uses service role key to bypass RLS
 */

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
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('fleet' as any) as any)
      .insert(body as any)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error creating fleet:', error)
      return NextResponse.json(
        { error: 'Failed to create fleet', details: error.message },
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

    console.log('[Admin API] ✅ Created fleet and revalidated cache')
    return NextResponse.json({ fleet: data as any }, { status: 201 })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
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
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Fleet ID is required' },
        { status: 400 }
      )
    }

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
      console.error('[Admin API] ❌ Error updating fleet:', error)
      return NextResponse.json(
        { error: 'Failed to update fleet', details: error.message },
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

    console.log('[Admin API] ✅ Updated fleet and revalidated cache')
    return NextResponse.json({ fleet: data as any })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
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
