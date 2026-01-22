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

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image
      </label>

      {/* Current Image Preview */}
      {preview && (
        <div className="relative w-full max-w-md">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setError('Failed to load image preview')}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Replace Image Button */}
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-replace"
              disabled={uploading}
            />
            <label
              htmlFor="image-replace"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Replace Image
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Upload Area - Show when no preview or allow re-upload */}
      {!preview && !uploading && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-luxury-blue transition-colors">
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
                <span className="text-sm text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {/* Manual URL Input (Alternative) */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Or enter image URL manually:
        </label>
        <input
          type="url"
          value={preview || ''}
          onChange={(e) => {
            setPreview(e.target.value)
            onImageUploaded(e.target.value)
          }}
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
