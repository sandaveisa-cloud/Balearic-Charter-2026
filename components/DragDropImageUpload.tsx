'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { compressImage, compressThumbnail } from '@/lib/imageCompression'
import OptimizedImage from './OptimizedImage'
import SortableImageGallery from './SortableImageGallery'

interface ImagePreview {
  file: File
  preview: string
  compressed?: File
  uploading: boolean
  progress: number
}

interface DragDropImageUploadProps {
  onUpload: (files: File[], onProgress?: (progress: number) => void) => Promise<void>
  maxFiles?: number // undefined = unlimited
  maxSize?: number // in MB
  isThumbnail?: boolean
  existingImages?: string[]
  onRemoveExisting?: (imageUrl: string) => void
  onReorder?: (newOrder: string[]) => void // Callback when images are reordered
  className?: string
}

export default function DragDropImageUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 10,
  isThumbnail = false,
  existingImages = [],
  onRemoveExisting,
  onReorder,
  className = '',
}: DragDropImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // If maxFiles is set, limit number of files; otherwise allow unlimited
    let filesToProcess = acceptedFiles
    
    if (maxFiles !== undefined) {
      const remainingSlots = maxFiles - previews.length
      filesToProcess = acceptedFiles.slice(0, remainingSlots)
      
      if (filesToProcess.length === 0) {
        alert(`Maximum ${maxFiles} files allowed. Please remove some images first.`)
        return
      }
      
      if (acceptedFiles.length > remainingSlots) {
        alert(`${acceptedFiles.length - remainingSlots} file(s) were not added. Maximum ${maxFiles} files allowed.`)
      }
    }
    
    // Create previews
    const newPreviews: ImagePreview[] = filesToProcess.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      progress: 0,
    }))

    setPreviews((prev) => [...prev, ...newPreviews])
  }, [maxFiles, previews.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true,
  })

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev]
      const removed = newPreviews.splice(index, 1)[0]
      URL.revokeObjectURL(removed.preview)
      return newPreviews
    })
  }

  const handleUpload = async () => {
    if (previews.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Compress all images first
      const compressedFiles: File[] = []
      
      for (let i = 0; i < previews.length; i++) {
        const preview = previews[i]
        setUploadProgress((i / previews.length) * 50) // First 50% for compression

        const compressed = isThumbnail
          ? await compressThumbnail(preview.file)
          : await compressImage(preview.file, {
              maxWidth: 1920,
              maxHeight: 1920,
              maxSizeMB: 1,
            })

        compressedFiles.push(compressed)
        
        // Update preview with compressed file
        setPreviews((prev) => {
          const updated = [...prev]
          updated[i] = { ...updated[i], compressed }
          return updated
        })
      }

      // Upload compressed files with progress tracking
      setUploadProgress(50)
      await onUpload(compressedFiles, (progress) => {
        // Map upload progress (50-100%) to overall progress
        setUploadProgress(50 + (progress * 0.5))
      })

      // Clear previews after successful upload
      previews.forEach((preview) => {
        if (preview.preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview.preview)
        }
      })
      setPreviews([])
      setUploadProgress(100)

      // Reset after a moment
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      console.error('[DragDropUpload] Upload error:', error)
      setIsUploading(false)
      setUploadProgress(0)
      alert('Failed to upload images. Please try again.')
    }
  }

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-luxury-gold bg-luxury-gold/5 scale-[1.02]'
            : 'border-gray-300 hover:border-luxury-blue hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Upload Icon */}
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragActive
              ? 'bg-luxury-gold text-white'
              : 'bg-luxury-blue/10 text-luxury-blue'
            }
            transition-colors duration-200
          `}>
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {isDragActive ? 'Drop images here' : 'Drag and drop yacht images here'}
            </p>
            <p className="text-sm text-gray-500">
              or <span className="text-luxury-blue font-medium">click to select files</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPG, PNG, WebP • Max {maxSize}MB per file{maxFiles !== undefined ? ` • Up to ${maxFiles} files` : ' • Unlimited files'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading images...</span>
            <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-luxury-blue to-luxury-gold h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Image Previews */}
      {(previews.length > 0 || existingImages.length > 0) && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            {previews.length > 0 ? 'New Images' : ''}
            {previews.length > 0 && existingImages.length > 0 ? ' • ' : ''}
            {existingImages.length > 0 ? 'Existing Images' : ''}
          </h4>

          {/* New Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-luxury-blue transition-all"
                >
                  <OptimizedImage
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    objectFit="cover"
                    aspectRatio="1/1"
                    loading="lazy"
                    quality={75}
                  />
                  
                  {/* Remove Button */}
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removePreview(index)
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      aria-label="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Compression Indicator */}
                  {preview.compressed && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Compressed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Existing Images - Sortable Gallery */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">
                💡 Drag images to reorder them. The first image will be used as the main image.
              </p>
              {onReorder ? (
                <SortableImageGallery
                  images={existingImages}
                  onReorder={onReorder}
                  onRemove={onRemoveExisting}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {existingImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-luxury-gold transition-all"
                    >
                      <OptimizedImage
                        src={imageUrl}
                        alt={`Existing image ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        objectFit="cover"
                        aspectRatio="1/1"
                        loading="lazy"
                        quality={75}
                      />
                      
                      {/* Remove Button */}
                      {onRemoveExisting && (
                        <button
                          onClick={() => onRemoveExisting(imageUrl)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          aria-label="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          {previews.length > 0 && !isUploading && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                className="px-6 py-3 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-luxury-blue/90 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload {previews.length} Image{previews.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
