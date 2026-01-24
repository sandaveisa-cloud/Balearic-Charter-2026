import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * Admin API Route for uploading images to local public/images folder
 * Images are stored locally and served statically by Next.js
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB for local storage)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Define the target directory
    const publicDir = path.join(process.cwd(), 'public', 'images', folder)

    // Create directory if it doesn't exist
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars
      .toLowerCase()
      .substring(0, 50) // Limit length
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${sanitizedName}-${timestamp}-${randomStr}.${fileExt}`
    
    const filePath = path.join(publicDir, fileName)

    // Convert File to Buffer and write to disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await writeFile(filePath, buffer)

    // Return the public URL path
    const publicUrl = `/images/${folder}/${fileName}`

    console.log('[Admin API] ✅ Local image uploaded successfully:', publicUrl)

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      fileName: fileName,
      message: 'Image uploaded successfully to local storage',
    })
  } catch (error) {
    console.error('[Admin API] Local upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove an image from local public/images folder
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      )
    }

    // Security: Ensure path is within public/images
    if (!imagePath.startsWith('/images/')) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      )
    }

    const fullPath = path.join(process.cwd(), 'public', imagePath)

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Delete the file
    const { unlink } = await import('fs/promises')
    await unlink(fullPath)

    console.log('[Admin API] ✅ Local image deleted:', imagePath)

    return NextResponse.json({
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('[Admin API] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
