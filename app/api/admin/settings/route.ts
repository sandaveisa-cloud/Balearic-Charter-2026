import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for site settings management
 * Uses service role key to bypass RLS
 */

// GET - Fetch all site settings
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
    const { data: settings, error } = await (supabase
      .from('site_settings' as any) as any)
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('[Admin API] ❌ Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch site settings', details: error.message },
        { status: 500 }
      )
    }

    // Transform array to key-value object
    const settingsObject: Record<string, string> = {}
    if (settings && Array.isArray(settings)) {
      settings.forEach((setting: any) => {
        settingsObject[setting.key] = setting.value || ''
      })
    }

    return NextResponse.json({ settings: settingsObject, raw: settings || [] })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Create or update site setting
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
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('site_settings' as any) as any)
      .upsert({
        key,
        value: value || '',
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'key',
      })
      .select()
      .single()

    if (error) {
      console.error('[Admin API] ❌ Error saving setting:', error)
      return NextResponse.json(
        { error: 'Failed to save site setting', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ setting: data as any }, { status: 201 })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update multiple settings at once
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
    const { settings } = body // Expects { settings: { key1: value1, key2: value2, ... } }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value || '',
      updated_at: new Date().toISOString(),
    }))

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { data, error } = await (supabase
      .from('site_settings' as any) as any)
      .upsert(updates as any, {
        onConflict: 'key',
      })
      .select()

    if (error) {
      console.error('[Admin API] ❌ Error updating settings:', error)
      return NextResponse.json(
        { error: 'Failed to update site settings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings: data as any })
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Delete site setting
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
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // @ts-ignore - Atvieglo build procesu, apejot striktos Supabase tipus
    const { error } = await (supabase
      .from('site_settings' as any) as any)
      .delete()
      .eq('key', key)

    if (error) {
      console.error('[Admin API] ❌ Error deleting setting:', error)
      return NextResponse.json(
        { error: 'Failed to delete site setting', details: error.message },
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
