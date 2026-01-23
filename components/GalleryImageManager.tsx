'use client'

import { useState } from 'react'
import { Upload, X, Trash2, GripVertical, Loader2 } from 'lucide-react'
import ImageUpload from './ImageUpload'

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

  const handleAddImage = (url: string) => {
    if (url && !images.includes(url)) {
      const newImages = [...images, url]
      onImagesChange(newImages)
      // Force a small delay to ensure state update is visible
      setTimeout(() => {
        // Scroll to the new image if possible
        const galleryElement = document.querySelector('[data-gallery-images]')
        if (galleryElement) {
          galleryElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
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

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Gallery Images
      </label>

      {/* Upload New Image */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <ImageUpload
          currentImageUrl=""
          onImageUploaded={handleAddImage}
          folder={folder}
          bucket={bucket}
        />
      </div>

      {/* Gallery Grid with Drag & Drop */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-gallery-images>
          {images.map((imageUrl, index) => (
            <div
              key={index}
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
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                  }}
                />
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteImage(index)}
                className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                aria-label="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
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

      <p className="text-xs text-gray-500">
        Drag images to reorder. First image will be used as the main image.
      </p>
    </div>
  )
}
