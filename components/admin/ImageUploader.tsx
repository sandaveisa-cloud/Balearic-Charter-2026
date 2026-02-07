'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface ImageUploaderProps {
  value: string // Current image URL
  onChange: (url: string) => void // Callback when image URL changes
  folder?: string // Folder name in storage (e.g., 'milestones', 'promises', 'fleet')
  bucket?: string // Storage bucket name (default: 'website-assets')
  maxSizeMB?: number // Max file size in MB (default: 0.5)
  aspectRatio?: string // Optional aspect ratio (e.g., '16/9', '4/3')
  label?: string // Label text
  className?: string // Additional CSS classes
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'general',
  bucket = 'website-assets',
  maxSizeMB = 0.5,
  aspectRatio,
  label,
  className = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)

  // Sync preview with value prop when it changes externally
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  // Compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: maxSizeMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp', // Convert to WebP for better compression
    }

    try {
      const compressedFile = await imageCompression(file, options)
      console.log('[ImageUploader] Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      console.log('[ImageUploader] Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
      return compressedFile
    } catch (error) {
      console.error('[ImageUploader] Compression error:', error)
      // If compression fails, return original file
      return file
    }
  }

  // Handle file upload
  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Compress image
      const compressedFile = await compressImage(file)

      // Create FormData
      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('folder', folder)
      formData.append('bucket', bucket)

      // Upload to API
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      // Update preview and call onChange
      setPreview(data.url)
      onChange(data.url)
    } catch (err: any) {
      console.error('[ImageUploader] Upload error:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0])
      }
    },
    [folder, bucket, maxSizeMB]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  // Remove image
  const handleRemove = () => {
    setPreview(null)
    onChange('')
    setError(null)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      {/* Preview or Upload Area */}
      {preview ? (
        <div className="relative group">
          <div 
            className="rounded-lg overflow-hidden border-2 border-gray-200"
            style={aspectRatio ? { aspectRatio } : undefined}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          {!value && (
            <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
              <p className="text-xs text-yellow-800 font-medium">Click to replace</p>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-[#C5A059] bg-[#C5A059]/5'
                : 'border-gray-300 hover:border-[#C5A059] hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            ${aspectRatio ? '' : 'min-h-[200px]'}
            flex flex-col items-center justify-center
          `}
          style={aspectRatio ? { aspectRatio } : undefined}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin mb-3" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragActive ? 'Drop image here' : 'Drag & drop image here'}
              </p>
              <p className="text-xs text-gray-500">or click to select</p>
              <p className="text-xs text-gray-400 mt-2">
                Max {maxSizeMB}MB • WebP, JPG, PNG
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Manual URL Input (Fallback) */}
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">Or paste image URL:</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value)
              setPreview(e.target.value || null)
            }}
            placeholder="https://..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
          />
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
