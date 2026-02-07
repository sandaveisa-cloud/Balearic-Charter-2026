'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Trash2, GripVertical, Loader2, ImagePlus, AlertCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'

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
  bucket = 'website-assets',
}: GalleryImageManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [manualUrl, setManualUrl] = useState('')

  // Compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5, // Compress to max 500KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp', // Convert to WebP for better compression
    }

    try {
      const compressedFile = await imageCompression(file, options)
      console.log('[GalleryImageManager] Compressed:', file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
      return compressedFile
    } catch (error) {
      console.error('[GalleryImageManager] Compression error:', error)
      // If compression fails, return original file
      return file
    }
  }

  // Handle multiple file upload with HEIC and Size validation
  const handleMultipleFileUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    // 1. DROŠĪBAS PĀRBAUDE PIRMS AUGŠUPIELĀDES
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Pārbaude uz iPhone HEIC formātu
      if (file.name.toLowerCase().endsWith('.heic')) {
        setError(`Fails "${file.name}" ir iPhone formātā (HEIC). Lūdzu, pirms lādēšanas pārvērt to par JPG.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // Pārbaude uz faila izmēru (5MB limits before compression)
      if (file.size > 5 * 1024 * 1024) {
        setError(`Fails "${file.name}" pārsniedz 5MB limitu. Lūdzu, izmanto mazāka izmēra attēlu.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
    }

    setUploading(true)
    setError(null)
    const uploadedUrls: string[] = []
    const totalFiles = files.length

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validējam, vai tiešām ir bilde
        if (!file.type.startsWith('image/')) {
          console.warn(`Izlaižu failu (nav attēls): ${file.name}`)
          continue
        }

        setUploadProgress(`Augšupielādēju ${i + 1} no ${totalFiles}: ${file.name}`)

        // Compress image before upload
        const compressedFile = await compressImage(file)

        const formData = new FormData()
        formData.append('file', compressedFile)
        formData.append('folder', folder)
        formData.append('bucket', bucket)

        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`Neizdevās augšupielādēt ${file.name}:`, errorData)
          continue
        }

        const data = await response.json()
        if (data.url) {
          uploadedUrls.push(data.url)
        }
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls]
        onImagesChange(newImages)
        setUploadProgress(`Veiksmīgi pievienoti ${uploadedUrls.length} attēli`)
        setTimeout(() => setUploadProgress(''), 3000)
      } else {
        setError('Neviens attēls netika augšupielādēts. Pārbaudiet failu tipus un izmērus.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Kļūda augšupielādējot attēlus. Lūdzu, mēģiniet vēlreiz.')
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

  const handleAddManualUrl = () => {
    if (manualUrl.trim() && !images.includes(manualUrl.trim())) {
      onImagesChange([...images, manualUrl.trim()])
      setManualUrl('')
    }
  }

  const handleDeleteImage = async (index: number) => {
    const imageUrl = images[index]
    const confirmDelete = window.confirm('Izdzēst šo attēlu?')
    
    if (!confirmDelete) return

    setDeleting(index)
    setError(null)

    try {
      if (imageUrl.includes('supabase') && imageUrl.includes('/storage/')) {
        const urlParts = imageUrl.split('/storage/v1/object/public/')
        if (urlParts.length === 2) {
          const pathWithBucket = urlParts[1]
          const bucketEndIndex = pathWithBucket.indexOf('/')
          const bucketName = pathWithBucket.substring(0, bucketEndIndex)
          const filePath = pathWithBucket.substring(bucketEndIndex + 1)

          await fetch('/api/admin/delete-image', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket: bucketName, path: filePath }),
          })
        }
      }
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Neizdevās izdzēst no servera, bet attēls noņemts no galerijas.')
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
    } finally {
      setDeleting(null)
    }
  }

  const handleDragStart = (index: number) => setDraggedIndex(index)

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

  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Galerijas attēli ({images.length})
        </label>
        {images.length > 0 && (
          <span className="text-xs text-gray-500">Ievelc, lai mainītu secību • Pirmais attēls = Galvenais</span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:border-luxury-blue transition-colors group"
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
          className={`cursor-pointer flex flex-col items-center gap-3 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-luxury-blue animate-spin" />
              <span className="text-sm text-gray-700 font-medium">{uploadProgress}</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-10 h-10 text-gray-400 group-hover:text-luxury-blue transition-colors" />
              <span className="text-sm text-gray-700 font-medium">Spied vai ievelc attēlus šeit</span>
              <span className="text-xs text-gray-500">PNG, JPG, GIF līdz 5MB katrs • HEIC netiek atbalstīts</span>
            </>
          )}
        </label>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddManualUrl())}
          placeholder="Vai ielīmē attēla URL..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue text-sm"
        />
        <button
          type="button"
          onClick={handleAddManualUrl}
          disabled={!manualUrl.trim()}
          className="px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors disabled:opacity-50"
        >
          Pievienot
        </button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <div className="absolute top-2 left-2 z-10 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
              </div>

              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`Galerija ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg' }}
                />
                {deleting === index && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDeleteImage(index)}
                disabled={deleting === index}
                className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index === 0 ? '★ Galvenais' : index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}