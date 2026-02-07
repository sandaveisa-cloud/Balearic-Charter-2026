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

    // Explicit column list to avoid PGRST204 cache errors
    // Only select columns that exist in the database
    const { data: culinary, error } = await supabase
      .from('culinary_experiences')
      .select('id, title, description, title_en, title_es, title_de, description_en, description_es, description_de, image_url, media_urls, order_index, is_active, created_at, updated_at')
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

    // Prepare insert data - ONLY fields that exist in the database
    // Schema: title_en, title_es, title_de, description_en, description_es, description_de, media_urls
    // Handle empty strings by converting to null for optional fields
    const insertData = {
      // Multi-language titles - exact column names
      title_en: (body.title_en || body.title || '').trim() || null,
      title_es: (body.title_es || '').trim() || null,
      title_de: (body.title_de || '').trim() || null,
      // Multi-language descriptions - exact column names
      description_en: (body.description_en || body.description || '').trim() || null,
      description_es: (body.description_es || '').trim() || null,
      description_de: (body.description_de || '').trim() || null,
      // Legacy fields (for backward compatibility)
      title: (body.title_en || body.title || '').trim() || null,
      description: (body.description_en || body.description || '').trim() || null,
      // Media gallery - ensure it's an array (JSONB in database)
      media_urls: Array.isArray(body.media_urls) 
        ? body.media_urls.filter((url: string) => url && url.trim().length > 0)
        : (body.media_urls && typeof body.media_urls === 'string' && body.media_urls.trim().length > 0 ? [body.media_urls] : []),
      // Legacy single image (use first from media_urls if available)
      image_url: Array.isArray(body.media_urls) && body.media_urls.length > 0 
        ? body.media_urls[0].trim()
        : (body.image_url && typeof body.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : null),
      order_index: parseInt(String(body.order_index)) || 0,
      is_active: body.is_active !== false,
    }

    console.log('[Admin API] 📤 Inserting culinary experience:', {
      ...insertData,
      media_urls_count: insertData.media_urls?.length || 0,
    })

    // Insert with explicit column selection to avoid cache issues
    const { data, error } = await supabase
      .from('culinary_experiences')
      .insert(insertData as any)
      .select('id, title, description, title_en, title_es, title_de, description_en, description_es, description_de, image_url, media_urls, order_index, is_active, created_at, updated_at')
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error creating culinary:', error)
      console.error('[Admin API] ❌ Full Supabase error:', JSON.stringify(error, null, 2))
      console.error('[Admin API] ❌ Error code:', error.code)
      console.error('[Admin API] ❌ Error message:', error.message)
      console.error('[Admin API] ❌ Error details:', error.details)
      console.error('[Admin API] ❌ Error hint:', error.hint)
      console.error('[Admin API] ❌ Payload that failed:', JSON.stringify(insertData, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to create culinary experience', 
          details: error.message || 'Unknown error',
          code: error.code,
          hint: error.hint,
          fullError: error
        },
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

    // Prepare update data - ONLY fields that exist in the database
    // Schema: title_en, title_es, title_de, description_en, description_es, description_de, media_urls
    const updatePayload: Record<string, any> = {}
    
    // Multi-language titles - exact column names
    if (updateData.title_en !== undefined) {
      updatePayload.title_en = typeof updateData.title_en === 'string' ? updateData.title_en.trim() || null : null
    }
    if (updateData.title_es !== undefined) {
      updatePayload.title_es = typeof updateData.title_es === 'string' ? updateData.title_es.trim() || null : null
    }
    if (updateData.title_de !== undefined) {
      updatePayload.title_de = typeof updateData.title_de === 'string' ? updateData.title_de.trim() || null : null
    }
    
    // Multi-language descriptions - exact column names
    if (updateData.description_en !== undefined) {
      updatePayload.description_en = typeof updateData.description_en === 'string' ? updateData.description_en.trim() || null : null
    }
    if (updateData.description_es !== undefined) {
      updatePayload.description_es = typeof updateData.description_es === 'string' ? updateData.description_es.trim() || null : null
    }
    if (updateData.description_de !== undefined) {
      updatePayload.description_de = typeof updateData.description_de === 'string' ? updateData.description_de.trim() || null : null
    }
    
    // Legacy fields (for backward compatibility)
    if (updateData.title_en !== undefined || updateData.title !== undefined) {
      updatePayload.title = typeof (updateData.title_en || updateData.title) === 'string' 
        ? (updateData.title_en || updateData.title || '').trim() || null 
        : null
    }
    if (updateData.description_en !== undefined || updateData.description !== undefined) {
      updatePayload.description = typeof (updateData.description_en || updateData.description) === 'string'
        ? (updateData.description_en || updateData.description || '').trim() || null
        : null
    }
    
    // Media gallery - ensure it's an array (JSONB in database)
    if (updateData.media_urls !== undefined) {
      if (Array.isArray(updateData.media_urls)) {
        updatePayload.media_urls = updateData.media_urls.filter((url: string) => url && typeof url === 'string' && url.trim().length > 0)
      } else if (updateData.media_urls && typeof updateData.media_urls === 'string') {
        updatePayload.media_urls = updateData.media_urls.trim() ? [updateData.media_urls] : []
      } else {
        updatePayload.media_urls = []
      }
    }
    
    // Legacy single image (use first from media_urls if available)
    if (updateData.media_urls !== undefined) {
      if (Array.isArray(updateData.media_urls) && updateData.media_urls.length > 0) {
        updatePayload.image_url = typeof updateData.media_urls[0] === 'string' ? updateData.media_urls[0].trim() : null
      } else {
        updatePayload.image_url = null
      }
    } else if (updateData.image_url !== undefined) {
      updatePayload.image_url = typeof updateData.image_url === 'string' ? updateData.image_url.trim() || null : null
    }
    
    // Order index and active status
    if (updateData.order_index !== undefined) {
      updatePayload.order_index = parseInt(String(updateData.order_index)) || 0
    }
    if (updateData.is_active !== undefined) {
      updatePayload.is_active = updateData.is_active !== false
    }

    console.log('[Admin API] 📤 Updating culinary experience:', {
      id,
      ...updatePayload,
      media_urls_count: updatePayload.media_urls?.length || 0,
    })

    // Update with explicit column selection to avoid cache issues
    const { data, error } = await supabase
      .from('culinary_experiences')
      .update(updatePayload)
      .eq('id', id)
      .select('id, title, description, title_en, title_es, title_de, description_en, description_es, description_de, image_url, media_urls, order_index, is_active, created_at, updated_at')
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error updating culinary:', error)
      console.error('[Admin API] ❌ Full Supabase error:', JSON.stringify(error, null, 2))
      console.error('[Admin API] ❌ Error code:', error.code)
      console.error('[Admin API] ❌ Error message:', error.message)
      console.error('[Admin API] ❌ Error details:', error.details)
      console.error('[Admin API] ❌ Error hint:', error.hint)
      console.error('[Admin API] ❌ Payload that failed:', JSON.stringify(updatePayload, null, 2))
      console.error('[Admin API] ❌ Original updateData:', JSON.stringify(updateData, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to update culinary experience', 
          details: error.message || 'Unknown error',
          code: error.code,
          hint: error.hint,
          fullError: error
        },
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

    const { error } = await supabase
      .from('culinary_experiences')
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
