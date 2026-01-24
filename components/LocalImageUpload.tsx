'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon, CheckCircle2 } from 'lucide-react'

interface LocalImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  onImageRemoved?: () => void
  folder?: string
  label?: string
  accept?: string
  maxSizeMB?: number
  className?: string
}

/**
 * LocalImageUpload - Component for uploading images to local public/images folder
 * Images are stored locally and served statically by Next.js
 */
export default function LocalImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder = 'general',
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 10,
  className = '',
}: LocalImageUploadProps) {
  const [uploading, setUploading] = useState(false)
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(false)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMB}MB`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/admin/upload-local-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      onImageUploaded(data.url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error('[LocalImageUpload] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!currentImageUrl) return
    
    if (onImageRemoved) {
      onImageRemoved()
    } else {
      onImageUploaded('')
    }
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="relative group">
          <img
            src={currentImageUrl}
            alt="Current"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {currentImageUrl.startsWith('/images/') ? 'Local Storage' : 'External URL'}
          </div>
        </div>
      )}

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
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-luxury-blue animate-spin" />
            <span className="text-sm text-gray-600">Uploading...</span>
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
                <span className="text-sm text-luxury-blue font-medium">Drop image here</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-xs text-gray-400">
                  Drag & drop or click to browse
                </span>
                <span className="text-xs text-gray-400">
                  Max size: {maxSizeMB}MB
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

      {/* Folder Info */}
      <p className="text-xs text-gray-500">
        Images saved to: <code className="bg-gray-100 px-1 rounded">public/images/{folder}/</code>
      </p>
    </div>
  )
}
