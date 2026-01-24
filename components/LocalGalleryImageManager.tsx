'use client'

import { useState, useRef } from 'react'
import { Upload, X, Trash2, GripVertical, Loader2, Cloud, CheckCircle2 } from 'lucide-react'

interface SupabaseGalleryImageManagerProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  folder?: string
  bucket?: string
  maxImages?: number
  maxSizeMB?: number
}

/**
 * SupabaseGalleryImageManager - Component for managing multiple images in Supabase Storage
 * Supports drag & drop reordering, multiple upload, and delete
 * Works on Vercel and all serverless platforms
 */
export default function SupabaseGalleryImageManager({
  images,
  onImagesChange,
  folder = 'fleet',
  bucket = 'fleet-images',
  maxImages = 20,
  maxSizeMB = 5,
}: SupabaseGalleryImageManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    setError(null)
    setSuccess(false)

    // Filter valid image files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      setError('No valid image files selected')
      return
    }

    // Check max images limit
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = validFiles.slice(0, remainingSlots)
    
    setUploading(true)
    setUploadProgress(0)

    const uploadedUrls: string[] = []
    
    for (let i = 0; i < filesToUpload.length; i++) {
      try {
        const formData = new FormData()
        formData.append('file', filesToUpload[i])
        formData.append('folder', folder)
        formData.append('bucket', bucket)

        // Use Supabase Storage upload endpoint
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.details || 'Upload failed')
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
        
        setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100))
      } catch (err) {
        console.error('[SupabaseGalleryImageManager] Upload error:', err)
      }
    }

    if (uploadedUrls.length > 0) {
      onImagesChange([...images, ...uploadedUrls])
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }

    setUploading(false)
    setUploadProgress(0)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedItem = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)
    
    onImagesChange(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Gallery Images ({images.length}/{maxImages})
      </label>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragActive ? 'border-luxury-blue bg-luxury-blue/5' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-luxury-blue animate-spin" />
            <span className="text-sm text-gray-600">Uploading to Supabase... {uploadProgress}%</span>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div 
                className="bg-luxury-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <span className="text-sm text-green-600">Uploaded!</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {dragActive ? (
              <>
                <Upload className="w-8 h-8 text-luxury-blue" />
                <span className="text-sm text-luxury-blue font-medium">Drop images here</span>
              </>
            ) : (
              <>
                <Cloud className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Upload Gallery Images</span>
                <span className="text-xs text-gray-400">
                  Drag & drop or click to browse (Max {maxSizeMB}MB each)
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Gallery Grid with Drag & Drop */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-gallery-images>
          {images.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group bg-gray-100 rounded-lg overflow-hidden border-2 ${
                draggedIndex === index ? 'border-luxury-blue opacity-50' : 'border-transparent'
              } hover:border-luxury-gold transition-all cursor-move`}
            >
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 z-10 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Image */}
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.opacity = '0.5'
                  }}
                />
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteImage(index)
                }}
                className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                aria-label="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>

              {/* Storage Type Badge */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                {imageUrl.includes('supabase.co') ? 'Supabase' : 'URL'}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm">No gallery images yet. Upload images above.</p>
        </div>
      )}

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Cloud className="w-3 h-3" />
        Drag images to reorder. Stored in Supabase: <code className="bg-gray-100 px-1 rounded">{bucket}/{folder}/</code>
      </p>
    </div>
  )
}

// Export with original name for backward compatibility
export { SupabaseGalleryImageManager as LocalGalleryImageManager }
