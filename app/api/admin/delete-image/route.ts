import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client using service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { bucket, path } = body

    if (!bucket || !path) {
      return NextResponse.json(
        { error: 'Missing bucket or path parameter' },
        { status: 400 }
      )
    }

    console.log('[delete-image] Attempting to delete:', { bucket, path })

    const supabase = createAdminClient()

    // Delete the file from Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('[delete-image] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete image from storage', details: error.message },
        { status: 500 }
      )
    }

    console.log('[delete-image] Successfully deleted:', { bucket, path, data })

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      deleted: { bucket, path },
    })
  } catch (error) {
    console.error('[delete-image] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
