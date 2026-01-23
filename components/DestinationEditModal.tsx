'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { extractYouTubeId, buildYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtubeUtils'
import ImageUpload from '@/components/ImageUpload'
import type { Destination } from '@/types/database'

interface DestinationEditModalProps {
  destination: Destination | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function DestinationEditModal({
  destination,
  isOpen,
  onClose,
  onSave,
}: DestinationEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    slug: '',
    description: '',
    description_en: '',
    description_es: '',
    description_de: '',
    image_url: '',
    youtube_video_url: '',
    order_index: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [youtubePreviewId, setYoutubePreviewId] = useState<string | null>(null)

  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || destination.title || '',
        region: destination.region || '',
        slug: destination.slug || '',
        description: destination.description || '',
        description_en: destination.description_en || '',
        description_es: destination.description_es || '',
        description_de: destination.description_de || '',
        image_url: (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0) 
          ? destination.image_urls[0] 
          : '',
        youtube_video_url: destination.youtube_video_url || '',
        order_index: destination.order_index || 0,
        is_active: destination.is_active !== false,
      })
    } else {
      // Reset form for new destination
      setFormData({
        name: '',
        region: '',
        slug: '',
        description: '',
        description_en: '',
        description_es: '',
        description_de: '',
        image_url: '',
        youtube_video_url: '',
        order_index: 0,
        is_active: true,
      })
    }
    setSuccess(false)
    setError(null)
  }, [destination, isOpen])

  // Update YouTube preview when URL changes
  useEffect(() => {
    if (formData.youtube_video_url) {
      const videoId = extractYouTubeId(formData.youtube_video_url)
      setYoutubePreviewId(videoId)
    } else {
      setYoutubePreviewId(null)
    }
  }, [formData.youtube_video_url])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('[DestinationEditModal] 🚀 Starting save process...')
    console.log('[DestinationEditModal] Form data:', formData)
    console.log('[DestinationEditModal] Destination ID:', destination?.id)
    
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        throw new Error('Name is required')
      }

      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      if (!slug || !slug.trim()) {
        throw new Error('Slug is required and must be valid')
      }

      const payload = {
        ...(destination?.id && { id: destination.id }),
        name: formData.name.trim(),
        region: formData.region?.trim() || null,
        slug: slug.trim(),
        description: formData.description?.trim() || null,
        description_en: formData.description_en?.trim() || null,
        description_es: formData.description_es?.trim() || null,
        description_de: formData.description_de?.trim() || null,
        image_urls: formData.image_url ? [formData.image_url] : [],
        youtube_video_url: formData.youtube_video_url?.trim() || null,
        order_index: formData.order_index || 0,
        is_active: formData.is_active !== false,
      }

      console.log('[DestinationEditModal] 📤 Sending payload:', payload)

      // Use Admin API route with SERVICE_ROLE_KEY
      const url = '/api/admin/destinations'
      const method = destination?.id ? 'PUT' : 'POST'

      console.log('[DestinationEditModal] 📡 Making request:', method, url)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('[DestinationEditModal] 📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('[DestinationEditModal] ❌ API Error:', errorData)
        
        const errorMessage = errorData.error || errorData.details || `Failed to save destination: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('[DestinationEditModal] ✅ Success! Result:', result)

      setSuccess(true)
      setTimeout(() => {
        onSave()
        onClose()
      }, 1000)
    } catch (err) {
      console.error('[DestinationEditModal] ❌ Error saving:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save destination. Please check your connection and try again.'
      
      // Provide helpful error messages
      if (errorMessage.includes('RLS') || errorMessage.includes('permission') || errorMessage.includes('policy')) {
        setError('Database permission error. Please ensure RLS policies are configured correctly. Contact administrator.')
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal server')) {
        setError('Server error. Please check that SUPABASE_SERVICE_ROLE_KEY is configured correctly.')
      } else if (errorMessage.includes('required')) {
        setError(errorMessage)
      } else {
        setError(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-luxury-blue to-luxury-gold p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {destination ? 'Edit Destination' : 'Add New Destination'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span>Destination saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., Balearic Islands"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., ibiza"
              />
              <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Index
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Descriptions</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Description
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spanish Description
              </label>
              <textarea
                value={formData.description_es}
                onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                German Description
              </label>
              <textarea
                value={formData.description_de}
                onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Media</h3>

            {/* Image Upload Component */}
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              folder="destinations"
              bucket="fleet-images"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Video URL (Drone Shots)
              </label>
              <input
                type="url"
                value={formData.youtube_video_url}
                onChange={(e) => setFormData({ ...formData, youtube_video_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">Paste YouTube URL for drone footage preview</p>

              {/* YouTube Preview */}
              {youtubePreviewId && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Video Preview:</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={buildYouTubeEmbedUrl(youtubePreviewId, { autoplay: false, mute: true, controls: true })}
                      title="YouTube Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Video ID: {youtubePreviewId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active (visible on website)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name?.trim()}
              onClick={(e) => {
                // Ensure form submission
                if (!formData.name?.trim()) {
                  e.preventDefault()
                  setError('Name is required')
                  return
                }
                console.log('[DestinationEditModal] 🔘 Save button clicked')
              }}
              className="px-6 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Destination'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
