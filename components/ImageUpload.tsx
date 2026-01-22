'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (url: string) => void
  folder?: string
  bucket?: string
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  folder = 'destinations',
  bucket = 'fleet-images',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync preview with currentImageUrl when it changes
  useEffect(() => {
    setPreview(currentImageUrl || null)
  }, [currentImageUrl])

  // Create Supabase client for storage operations
  const getSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured')
    }

    return createClient(supabaseUrl, supabaseAnonKey)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const supabase = getSupabaseClient()

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      // Upload file to Supabase storage
      // @ts-ignore - Supabase storage types
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      // @ts-ignore - Supabase storage types
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Update preview
      setPreview(publicUrl)
      onImageUploaded(publicUrl)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('[ImageUpload] Error uploading:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Normalize image URL for preview - handle both local paths and external URLs
  const getPreviewUrl = (url: string | null) => {
    if (!url) return null
    // If it's already a full URL (http/https), use as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // If it's a local path starting with /, use as-is (Next.js will serve from public)
    if (url.startsWith('/')) {
      return url
    }
    // Otherwise, assume it's a relative path and prepend /
    return url.startsWith('/') ? url : `/${url}`
  }

  const previewUrl = getPreviewUrl(preview)

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image
      </label>

      {/* Manual Path/URL Input - Always visible */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Image Path or URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={preview || ''}
            onChange={(e) => {
              const value = e.target.value.trim()
              setPreview(value)
              onImageUploaded(value)
              setError(null) // Clear error when user types
            }}
            placeholder="/images/destinations/ibiza.jpg or https://..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          />
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Clear image"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Enter a local path (e.g., <code className="bg-gray-100 px-1 rounded">/images/fleet/simona.jpg</code>) or a full URL (e.g., <code className="bg-gray-100 px-1 rounded">https://...</code>)
        </p>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* Upload New Image Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload New Image to Supabase
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-luxury-blue transition-colors bg-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer flex flex-col items-center gap-2 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-luxury-blue animate-spin" />
                <span className="text-sm text-gray-600 font-medium">Uploading to Supabase...</span>
                <span className="text-xs text-gray-500">Please wait</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-700 font-medium">
                  Click to upload new image
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB • Will be uploaded to fleet-images bucket
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Current Image Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Preview
          </label>
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  setError('Failed to load image preview. Please check the path or URL.')
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
                onLoad={() => {
                  setError(null) // Clear error if image loads successfully
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current: <code className="bg-gray-100 px-1 rounded text-xs">{preview}</code>
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
