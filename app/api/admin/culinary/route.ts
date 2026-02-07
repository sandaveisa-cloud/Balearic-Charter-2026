import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for culinary experiences management
 * Uses service role key to bypass RLS
 */

// GET - Fetch all culinary experiences
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
    const { data: culinary, error } = await (supabase
      .from('culinary_experiences' as any) as any)
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[Admin API] ❌ Error fetching culinary:', error)
      return NextResponse.json(
        { error: 'Failed to fetch culinary experiences', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ culinary: culinary || [] })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Create new culinary experience
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

    // Prepare insert data with all localized fields and media_urls
    const insertData: any = {
      // Multi-language titles
      title_en: body.title_en || body.title || '',
      title_es: body.title_es || '',
      title_de: body.title_de || '',
      // Multi-language descriptions
      description_en: body.description_en || body.description || '',
      description_es: body.description_es || '',
      description_de: body.description_de || '',
      // Legacy fields (for backward compatibility)
      title: body.title_en || body.title || '',
      description: body.description_en || body.description || null,
      // Media gallery - ensure it's an array
      media_urls: Array.isArray(body.media_urls) ? body.media_urls : (body.media_urls ? [body.media_urls] : []),
      // Legacy single image (use first from media_urls if available)
      image_url: Array.isArray(body.media_urls) && body.media_urls.length > 0 
        ? body.media_urls[0] 
        : (body.image_url || null),
      order_index: body.order_index || 0,
      is_active: body.is_active !== false,
    }

    console.log('[Admin API] 📤 Inserting culinary experience:', {
      ...insertData,
      media_urls_count: insertData.media_urls?.length || 0,
    })

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('culinary_experiences' as any) as any)
      .insert(insertData as any)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error creating culinary:', error)
      return NextResponse.json(
        { error: 'Failed to create culinary experience', details: error.message },
        { status: 500 }
      )
    }

    // COMPREHENSIVE REVALIDATION - ensure translations appear instantly
    try {
      const { revalidatePath, revalidateTag } = await import('next/cache')
      revalidatePath('/', 'layout')
      
      const locales = ['en', 'es', 'de']
      locales.forEach(loc => {
        revalidatePath(`/${loc}`, 'layout')
        revalidatePath(`/${loc}`, 'page')
      })
      
      revalidateTag('site-content')
      console.log('[Admin API] ✅ Revalidated homepage and layout after culinary create')
    } catch (revalError) {
      console.warn('[Admin API] ⚠️ Could not revalidate paths:', revalError)
    }

    return NextResponse.json({ culinary: data as any }, { status: 201 })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update existing culinary experience
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
        { error: 'Culinary experience ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Prepare update data with all localized fields and media_urls
    const updatePayload: any = {
      // Multi-language titles
      title_en: updateData.title_en !== undefined ? updateData.title_en : undefined,
      title_es: updateData.title_es !== undefined ? updateData.title_es : undefined,
      title_de: updateData.title_de !== undefined ? updateData.title_de : undefined,
      // Multi-language descriptions
      description_en: updateData.description_en !== undefined ? updateData.description_en : undefined,
      description_es: updateData.description_es !== undefined ? updateData.description_es : undefined,
      description_de: updateData.description_de !== undefined ? updateData.description_de : undefined,
      // Legacy fields (for backward compatibility)
      title: updateData.title_en !== undefined ? updateData.title_en : (updateData.title !== undefined ? updateData.title : undefined),
      description: updateData.description_en !== undefined ? updateData.description_en : (updateData.description !== undefined ? updateData.description : undefined),
      // Media gallery - ensure it's an array
      media_urls: updateData.media_urls !== undefined 
        ? (Array.isArray(updateData.media_urls) ? updateData.media_urls : (updateData.media_urls ? [updateData.media_urls] : []))
        : undefined,
      // Legacy single image (use first from media_urls if available)
      image_url: updateData.media_urls !== undefined && Array.isArray(updateData.media_urls) && updateData.media_urls.length > 0
        ? updateData.media_urls[0]
        : (updateData.image_url !== undefined ? updateData.image_url : undefined),
      order_index: updateData.order_index !== undefined ? updateData.order_index : undefined,
      is_active: updateData.is_active !== undefined ? updateData.is_active : undefined,
    }

    // Remove undefined fields to avoid Supabase errors
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key]
      }
    })

    console.log('[Admin API] 📤 Updating culinary experience:', {
      id,
      ...updatePayload,
      media_urls_count: updatePayload.media_urls?.length || 0,
    })

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('culinary_experiences' as any) as any)
      .update(updatePayload as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error updating culinary:', error)
      return NextResponse.json(
        { error: 'Failed to update culinary experience', details: error.message },
        { status: 500 }
      )
    }

    // COMPREHENSIVE REVALIDATION - ensure translations appear instantly
    try {
      const { revalidatePath, revalidateTag } = await import('next/cache')
      revalidatePath('/', 'layout')
      
      const locales = ['en', 'es', 'de']
      locales.forEach(loc => {
        revalidatePath(`/${loc}`, 'layout')
        revalidatePath(`/${loc}`, 'page')
      })
      
      revalidateTag('site-content')
      console.log('[Admin API] ✅ Revalidated homepage and layout after culinary update')
    } catch (revalError) {
      console.warn('[Admin API] ⚠️ Could not revalidate paths:', revalError)
    }

    return NextResponse.json({ culinary: data as any })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Delete culinary experience
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
        { error: 'Culinary experience ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { error } = await (supabase
      .from('culinary_experiences' as any) as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] ❌ Error deleting culinary:', error)
      return NextResponse.json(
        { error: 'Failed to delete culinary experience', details: error.message },
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
