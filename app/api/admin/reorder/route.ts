import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for reordering items (destinations, fleet, etc.)
 * Uses service role key to bypass RLS
 */

interface ReorderItem {
  id: string
  order_index: number
}

interface ReorderRequest {
  table: 'destinations' | 'fleet' | 'culinary_experiences' | 'crew' | 'stats'
  items: ReorderItem[]
}

// POST - Update order_index for multiple items
export async function POST(request: NextRequest) {
  try {
    // Check if service role key is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[Admin Reorder API] SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured' },
        { status: 500 }
      )
    }

    const body: ReorderRequest = await request.json()
    const { table, items } = body

    // Validate request
    if (!table || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request: table and items array are required' },
        { status: 400 }
      )
    }

    // Validate table name to prevent SQL injection
    const allowedTables = ['destinations', 'fleet', 'culinary_experiences', 'crew', 'stats']
    if (!allowedTables.includes(table)) {
      return NextResponse.json(
        { error: `Invalid table: ${table}. Allowed tables: ${allowedTables.join(', ')}` },
        { status: 400 }
      )
    }

    console.log(`[Admin Reorder API] Reordering ${items.length} items in ${table}`)

    // Create admin client (bypasses RLS)
    const supabase = createSupabaseAdminClient()

    // Update each item's order_index
    const updatePromises = items.map(async (item) => {
      // @ts-ignore - Bypass strict Supabase types
      const { error } = await (supabase.from(table as any) as any)
        .update({ order_index: item.order_index })
        .eq('id', item.id)

      if (error) {
        console.error(`[Admin Reorder API] Error updating ${table} item ${item.id}:`, error)
        return { id: item.id, success: false, error: error.message }
      }
      return { id: item.id, success: true }
    })

    const results = await Promise.all(updatePromises)
    const failures = results.filter(r => !r.success)

    if (failures.length > 0) {
      console.error('[Admin Reorder API] Some items failed to update:', failures)
      return NextResponse.json(
        { 
          error: 'Some items failed to update', 
          details: failures,
          successCount: results.length - failures.length,
          failCount: failures.length
        },
        { status: 207 } // Multi-Status
      )
    }

    console.log(`[Admin Reorder API] ✅ Successfully reordered ${items.length} items in ${table}`)

    // Revalidate cache based on table
    revalidatePath('/', 'layout')
    revalidatePath('/en', 'page')
    revalidatePath('/es', 'page')
    revalidatePath('/de', 'page')
    
    // Revalidate specific paths based on table
    if (table === 'destinations') {
      revalidatePath('/en/destinations', 'page')
      revalidatePath('/es/destinations', 'page')
      revalidatePath('/de/destinations', 'page')
      revalidateTag('destinations')
    } else if (table === 'fleet') {
      revalidatePath('/en/fleet', 'page')
      revalidatePath('/es/fleet', 'page')
      revalidatePath('/de/fleet', 'page')
      revalidateTag('fleet')
    }
    
    // Always invalidate site-content cache
    revalidateTag('site-content')

    console.log('[Admin Reorder API] ✅ Cache revalidated')

    return NextResponse.json({ 
      success: true, 
      message: `Successfully reordered ${items.length} items`,
      table
    })
  } catch (error) {
    console.error('[Admin Reorder API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
