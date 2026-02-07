'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import type { CulinaryExperience } from '@/types/database'

interface CulinaryEditModalProps {
  culinary: CulinaryExperience | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function CulinaryEditModal({
  culinary,
  isOpen,
  onClose,
  onSave,
}: CulinaryEditModalProps) {
  const [formData, setFormData] = useState({
    // Multi-language titles
    title_en: '',
    title_es: '',
    title_de: '',
    // Multi-language descriptions
    description_en: '',
    description_es: '',
    description_de: '',
    // Legacy fields (for backward compatibility)
    title: '',
    description: '',
    // Media gallery (array of image URLs)
    media_urls: [] as string[],
    // Legacy single image (for backward compatibility)
    image_url: '',
    order_index: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (culinary) {
      setFormData({
        title_en: (culinary as any).title_en || culinary.title || '',
        title_es: (culinary as any).title_es || '',
        title_de: (culinary as any).title_de || '',
        description_en: (culinary as any).description_en || culinary.description || '',
        description_es: (culinary as any).description_es || '',
        description_de: (culinary as any).description_de || '',
        title: culinary.title || '',
        description: culinary.description || '',
        media_urls: Array.isArray(culinary.media_urls) && culinary.media_urls.length > 0 
          ? culinary.media_urls 
          : (culinary.image_url ? [culinary.image_url] : []),
        image_url: culinary.image_url || '',
        order_index: culinary.order_index || 0,
        is_active: culinary.is_active !== false,
      })
    } else {
      // Reset form for new culinary experience
      setFormData({
        title_en: '',
        title_es: '',
        title_de: '',
        description_en: '',
        description_es: '',
        description_de: '',
        title: '',
        description: '',
        media_urls: [],
        image_url: '',
        order_index: 0,
        is_active: true,
      })
    }
    setSuccess(false)
    setError(null)
  }, [culinary, isOpen])

  const handleAddImage = (url: string) => {
    if (url && !formData.media_urls.includes(url)) {
      setFormData({ ...formData, media_urls: [...formData.media_urls, url] })
    }
  }

  const handleRemoveImage = (index: number) => {
    const newMediaUrls = formData.media_urls.filter((_, i) => i !== index)
    setFormData({ ...formData, media_urls: newMediaUrls })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Use English title as fallback for legacy title field
      const legacyTitle = formData.title_en || formData.title || ''
      const legacyDescription = formData.description_en || formData.description || ''

      // Prepare payload with all localized fields and media_urls array
      const payload = {
        ...(culinary?.id && { id: culinary.id }),
        // Multi-language fields - send empty strings, API will convert to null
        title_en: formData.title_en?.trim() || legacyTitle?.trim() || '',
        title_es: formData.title_es?.trim() || '',
        title_de: formData.title_de?.trim() || '',
        description_en: formData.description_en?.trim() || legacyDescription?.trim() || '',
        description_es: formData.description_es?.trim() || '',
        description_de: formData.description_de?.trim() || '',
        // Legacy fields (for backward compatibility)
        title: legacyTitle?.trim() || '',
        description: legacyDescription?.trim() || '',
        // Media gallery - ensure it's an array, filter out empty/null values
        media_urls: Array.isArray(formData.media_urls) 
          ? formData.media_urls.filter((url: string) => url && url.trim().length > 0)
          : [],
        // Legacy single image (use first image from gallery if available)
        image_url: Array.isArray(formData.media_urls) && formData.media_urls.length > 0 
          ? formData.media_urls[0] 
          : (formData.image_url?.trim() || null),
        order_index: parseInt(String(formData.order_index)) || 0,
        is_active: formData.is_active !== false,
      }

      console.log('[CulinaryEditModal] 📤 Sending payload:', {
        ...payload,
        media_urls_count: payload.media_urls?.length || 0,
        has_title_en: !!payload.title_en,
        has_title_es: !!payload.title_es,
        has_title_de: !!payload.title_de,
        has_description_en: !!payload.description_en,
        has_description_es: !!payload.description_es,
        has_description_de: !!payload.description_de,
      })

      // Use Admin API route with SERVICE_ROLE_KEY
      const url = '/api/admin/culinary'
      const method = culinary?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[CulinaryEditModal] ❌ API Error Response:', errorData)
        console.error('[CulinaryEditModal] ❌ Error Code:', errorData.code)
        console.error('[CulinaryEditModal] ❌ Error Details:', errorData.details)
        console.error('[CulinaryEditModal] ❌ Error Hint:', errorData.hint)
        console.error('[CulinaryEditModal] ❌ Full Error:', errorData.fullError)
        console.error('[CulinaryEditModal] ❌ Payload sent:', JSON.stringify(payload, null, 2))
        
        // Build detailed error message
        let errorMessage = errorData.error || 'Failed to save culinary experience'
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`
        }
        if (errorData.hint) {
          errorMessage += ` (Hint: ${errorData.hint})`
        }
        if (errorData.code) {
          errorMessage += ` [Code: ${errorData.code}]`
        }
        
        throw new Error(errorMessage)
      }

      setSuccess(true)
      setTimeout(() => {
        onSave()
        onClose()
      }, 1000)
    } catch (err) {
      console.error('[CulinaryEditModal] Error saving:', err)
      setError(err instanceof Error ? err.message : 'Failed to save culinary experience')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-luxury-blue to-luxury-gold p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {culinary ? 'Edit Culinary Experience' : 'Add New Culinary Experience'}
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
              <span>Culinary experience saved successfully!</span>
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

          {/* Multi-Language Titles */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800">Titles (Multi-Language)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Title *
              </label>
              <input
                type="text"
                required
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., Authentic Paella"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spanish Title (ES)
              </label>
              <input
                type="text"
                value={formData.title_es}
                onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., Paella Auténtica"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                German Title (DE)
              </label>
              <input
                type="text"
                value={formData.title_de}
                onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., Authentische Paella"
              />
            </div>
          </div>

          {/* Multi-Language Descriptions */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800">Descriptions (Multi-Language)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Description *
              </label>
              <textarea
                required
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Freshly cooked onboard using local seafood..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spanish Description (ES)
              </label>
              <textarea
                value={formData.description_es}
                onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Cocinada fresca a bordo con mariscos locales..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                German Description (DE)
              </label>
              <textarea
                value={formData.description_de}
                onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Frisch an Bord zubereitet mit lokalen Meeresfrüchten..."
              />
            </div>
          </div>

          {/* Media Gallery */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800">Media Gallery</h3>
            <p className="text-sm text-gray-600">Upload multiple images for this culinary experience</p>
            
            {/* Image Upload Component */}
            <div>
              <ImageUpload
                currentImageUrl=""
                onImageUploaded={(url) => {
                  handleAddImage(url)
                  setUploadingImage(false)
                }}
                folder="culinary"
                bucket="fleet-images"
              />
            </div>

            {/* Gallery Preview */}
            {formData.media_urls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {formData.media_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={saving}
              className="px-6 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Culinary Experience'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
