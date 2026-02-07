import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin API Route for uploading images to Supabase Storage
 * Uses service role key to bypass RLS for storage operations
 * This ensures admin users can upload images even if storage RLS is restrictive
 */
export async function POST(request: NextRequest) {
  console.log('[Admin API] 📤 Image upload request received')
  
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[Admin API] ❌ SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error: Admin access not configured. SUPABASE_SERVICE_ROLE_KEY missing.' },
        { status: 500 }
      )
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error('[Admin API] ❌ Failed to parse form data:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse form data', details: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 400 }
      )
    }

    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'
    const bucket = formData.get('bucket') as string || 'website-assets'

    console.log('[Admin API] 📁 Upload params:', { folder, bucket, fileName: file?.name, fileSize: file?.size })

    if (!file) {
      console.error('[Admin API] ❌ No file in form data')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[Admin API] ❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'File must be an image', details: `Received type: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[Admin API] ❌ File too large:', file.size)
      return NextResponse.json(
        { error: 'Image size must be less than 5MB', details: `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      )
    }

    // Create admin client (bypasses RLS)
    let supabase
    try {
      supabase = createSupabaseAdminClient()
    } catch (clientError) {
      console.error('[Admin API] ❌ Failed to create Supabase admin client:', clientError)
      return NextResponse.json(
        { error: 'Failed to initialize storage client', details: clientError instanceof Error ? clientError.message : String(clientError) },
        { status: 500 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()
      .substring(0, 30)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${folder}/${sanitizedName}-${timestamp}-${randomStr}.${fileExt}`
    const filePath = fileName

    console.log('[Admin API] 📝 Generated file path:', filePath)

    // Convert File to ArrayBuffer for Supabase
    let buffer: Buffer
    try {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } catch (bufferError) {
      console.error('[Admin API] ❌ Failed to convert file to buffer:', bufferError)
      return NextResponse.json(
        { error: 'Failed to process file', details: bufferError instanceof Error ? bufferError.message : String(bufferError) },
        { status: 500 }
      )
    }

    // Upload file to Supabase storage using admin client
    console.log('[Admin API] ⬆️ Uploading to Supabase storage...')
    // @ts-ignore - Supabase storage types
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('[Admin API] ❌ Supabase storage upload error:', {
        message: uploadError.message,
        name: uploadError.name,
        error: uploadError,
      })
      
      // Check for specific error types
      let errorMessage = 'Failed to upload image'
      if (uploadError.message?.includes('Bucket not found')) {
        errorMessage = `Storage bucket "${bucket}" not found. Please create it in Supabase dashboard.`
      } else if (uploadError.message?.includes('already exists')) {
        errorMessage = 'A file with this name already exists. Please try again.'
      } else if (uploadError.message?.includes('RLS') || uploadError.message?.includes('policy')) {
        errorMessage = 'Storage permission denied. Please check bucket RLS policies.'
      }
      
      return NextResponse.json(
        { error: errorMessage, details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    // @ts-ignore - Supabase storage types
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    console.log('[Admin API] ✅ Image uploaded successfully:', publicUrl)

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('[Admin API] ❌ Unexpected error in upload-image:', error)
    console.error('[Admin API] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
