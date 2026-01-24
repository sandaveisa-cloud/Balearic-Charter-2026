'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Trash2, GripVertical, Loader2, ImagePlus, AlertCircle } from 'lucide-react'

interface GalleryImageManagerProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  folder?: string
  bucket?: string
}

export default function GalleryImageManager({
  images,
  onImagesChange,
  folder = 'fleet',
  bucket = 'fleet-images',
}: GalleryImageManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [manualUrl, setManualUrl] = useState('')

  // Handle multiple file upload
  const handleMultipleFileUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)
    const uploadedUrls: string[] = []
    const totalFiles = files.length

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Skipping large file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
          continue
        }

        setUploadProgress(`Uploading ${i + 1} of ${totalFiles}: ${file.name}`)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        formData.append('bucket', bucket)

        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`Failed to upload ${file.name}:`, errorData)
          continue
        }

        const data = await response.json()
        if (data.url) {
          uploadedUrls.push(data.url)
        }
      }

      if (uploadedUrls.length > 0) {
        // Add all uploaded images to the gallery
        const newImages = [...images, ...uploadedUrls]
        onImagesChange(newImages)
        setUploadProgress(`Successfully uploaded ${uploadedUrls.length} image(s)`)
        
        // Clear progress after a delay
        setTimeout(() => setUploadProgress(''), 3000)
      } else {
        setError('No images were uploaded. Please check file types and sizes.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [images, onImagesChange, folder, bucket])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleMultipleFileUpload(e.target.files)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files.length > 0) {
      handleMultipleFileUpload(e.dataTransfer.files)
    }
  }, [handleMultipleFileUpload])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Add image by URL
  const handleAddManualUrl = () => {
    if (manualUrl.trim() && !images.includes(manualUrl.trim())) {
      onImagesChange([...images, manualUrl.trim()])
      setManualUrl('')
    }
  }

  // Delete image from both array and Supabase storage
  const handleDeleteImage = async (index: number) => {
    const imageUrl = images[index]
    
    // Confirm deletion
    const confirmDelete = window.confirm(
      'Delete this image?\n\nThis will remove it from the gallery. If stored in Supabase, it will also be deleted from storage.'
    )
    
    if (!confirmDelete) return

    setDeleting(index)
    setError(null)

    try {
      // Check if this is a Supabase storage URL
      if (imageUrl.includes('supabase') && imageUrl.includes('/storage/')) {
        // Extract the file path from the URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/folder/filename
        const urlParts = imageUrl.split('/storage/v1/object/public/')
        if (urlParts.length === 2) {
          const pathWithBucket = urlParts[1]
          const bucketEndIndex = pathWithBucket.indexOf('/')
          const bucketName = pathWithBucket.substring(0, bucketEndIndex)
          const filePath = pathWithBucket.substring(bucketEndIndex + 1)

          // Call API to delete from Supabase storage
          const response = await fetch('/api/admin/delete-image', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bucket: bucketName,
              path: filePath,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.warn('Failed to delete from storage:', errorData)
            // Continue to remove from gallery even if storage deletion fails
          }
        }
      }

      // Remove from gallery array
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete image from storage. Removed from gallery.')
      // Still remove from array even if storage deletion fails
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
    } finally {
      setDeleting(null)
    }
  }

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Gallery Images ({images.length})
        </label>
        {images.length > 0 && (
          <span className="text-xs text-gray-500">
            Drag to reorder • First image = main image
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Multi-File Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:border-luxury-blue transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="gallery-multi-upload"
          disabled={uploading}
        />
        
        <label
          htmlFor="gallery-multi-upload"
          className={`cursor-pointer flex flex-col items-center gap-3 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-luxury-blue animate-spin" />
              <span className="text-sm text-gray-700 font-medium">{uploadProgress}</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-10 h-10 text-gray-400" />
              <span className="text-sm text-gray-700 font-medium">
                Click or drag images here to upload
              </span>
              <span className="text-xs text-gray-500">
                Supports multiple files • PNG, JPG, GIF up to 5MB each
              </span>
            </>
          )}
        </label>
      </div>

      {/* Manual URL Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddManualUrl()
            }
          }}
          placeholder="Or paste image URL and press Enter..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent text-sm"
        />
        <button
          type="button"
          onClick={handleAddManualUrl}
          disabled={!manualUrl.trim()}
          className="px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Gallery Grid with Drag & Drop */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-gallery-images>
          {images.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
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
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                  }}
                />
                
                {/* Deleting overlay */}
                {deleting === index && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteImage(index)}
                disabled={deleting === index}
                className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                aria-label="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index === 0 ? '★ Main' : index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <ImagePlus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No gallery images yet.</p>
          <p className="text-xs mt-1">Upload multiple images above or paste URLs.</p>
        </div>
      )}
    </div>
  )
}
