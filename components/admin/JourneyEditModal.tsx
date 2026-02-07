'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { JourneyMilestone } from '@/types/database'
import Toast from './Toast'
import ImageUploader from './ImageUploader'

interface JourneyEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  milestone: JourneyMilestone | null
}

export default function JourneyEditModal({ isOpen, onClose, onSave, milestone }: JourneyEditModalProps) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title_en: '',
    title_es: '',
    title_de: '',
    description_en: '',
    description_es: '',
    description_de: '',
    image_url: '',
    order_index: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [error, setError] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  useEffect(() => {
    if (milestone) {
      setFormData({
        year: milestone.year,
        title_en: milestone.title_en || '',
        title_es: milestone.title_es || '',
        title_de: milestone.title_de || '',
        description_en: milestone.description_en || '',
        description_es: milestone.description_es || '',
        description_de: milestone.description_de || '',
        image_url: milestone.image_url || '',
        order_index: milestone.order_index || 0,
        is_active: milestone.is_active ?? true,
      })
    } else {
      setFormData({
        year: new Date().getFullYear(),
        title_en: '',
        title_es: '',
        title_de: '',
        description_en: '',
        description_es: '',
        description_de: '',
        image_url: '',
        order_index: 0,
        is_active: true,
      })
    }
  }, [milestone, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if image is still uploading
    if (imageUploading) {
      alert('Please wait for the image upload to complete before saving.')
      return
    }
    
    setSaving(true)
    setError(null) // Clear any previous errors
    
    try {
      // CRITICAL: Ensure year is a NUMBER (integer), not a string
      const yearAsNumber = typeof formData.year === 'string' 
        ? parseInt(formData.year) 
        : parseInt(String(formData.year))
      
      if (isNaN(yearAsNumber)) {
        throw new Error('Year must be a valid number')
      }

      // Prepare payload - ensure all numeric fields are numbers
      const payload = milestone 
        ? { 
            ...formData, 
            id: milestone.id,
            year: yearAsNumber, // Ensure year is NUMBER
            order_index: parseInt(String(formData.order_index)) || 0 // Ensure order_index is NUMBER
          }
        : {
            ...formData,
            year: yearAsNumber, // Ensure year is NUMBER
            order_index: parseInt(String(formData.order_index)) || 0 // Ensure order_index is NUMBER
          }

      // Log payload for debugging - show exact structure and types
      console.log('[JourneyEditModal] 📤 Sending payload:', {
        ...payload,
        image_url: payload.image_url || '(empty)',
        hasImage: !!payload.image_url,
        year: payload.year,
        yearType: typeof payload.year,
        order_index: payload.order_index,
        order_indexType: typeof payload.order_index,
        isUpdate: !!milestone,
        milestoneId: milestone?.id
      })
      
      // Validate payload structure matches database schema
      // Use 'as const' to make TypeScript recognize these as specific string literals
      const requiredFields = ['year', 'title_en', 'title_es', 'title_de', 'description_en', 'description_es', 'description_de'] as const
      // Cast field to keyof typeof payload to satisfy TypeScript's strict type checking
      const missingFields = requiredFields.filter(field => !payload[field as keyof typeof payload])
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`
        console.error('[JourneyEditModal] ❌ Validation error:', errorMsg)
        alert(`Validation Error:\n\n${errorMsg}\n\nPlease fill in all required fields.`)
        setError(errorMsg)
        setToastMessage(errorMsg)
        setToastType('error')
        setShowToast(true)
        return
      }
      
      // Validate year is in correct range
      if (payload.year < 2000 || payload.year > 2030) {
        const errorMsg = `Year must be between 2000 and 2030. Received: ${payload.year}`
        console.error('[JourneyEditModal] ❌ Year validation error:', errorMsg)
        alert(`Validation Error:\n\n${errorMsg}`)
        setError(errorMsg)
        setToastMessage(errorMsg)
        setToastType('error')
        setShowToast(true)
        return
      }

      const method = milestone ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/journey', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      // Get response text first to handle both JSON and text errors
      const responseText = await response.text()
      console.log('[JourneyEditModal] 📥 Response status:', response.status, response.statusText)
      console.log('[JourneyEditModal] 📥 Response body:', responseText.substring(0, 500))

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('[JourneyEditModal] ❌ API Error:', errorData)
        console.error('[JourneyEditModal] ❌ Full error object:', JSON.stringify(errorData, null, 2))
        console.error('[JourneyEditModal] ❌ Response status:', response.status)
        console.error('[JourneyEditModal] ❌ Payload that failed:', payload)
        
        // Extract Supabase error message - prioritize error.message from Supabase
        const supabaseErrorMessage = errorData.fullError?.message || errorData.details || errorData.error || errorData.message
        const errorMessage = supabaseErrorMessage || `Failed to save milestone: ${response.status}`
        
        // Build detailed error message
        const fullErrorDetails = [
          `Error: ${errorMessage}`,
          errorData.details && errorData.details !== errorMessage ? `Details: ${errorData.details}` : '',
          errorData.hint ? `Hint: ${errorData.hint}` : '',
          errorData.code ? `Error Code: ${errorData.code}` : '',
          errorData.fullError?.code ? `Supabase Code: ${errorData.fullError.code}` : '',
          `HTTP Status: ${response.status}`
        ].filter(Boolean).join('\n')
        
        console.error('[JourneyEditModal] ❌ Supabase Error Message:', supabaseErrorMessage)
        console.error('[JourneyEditModal] ❌ Full Error Details:', fullErrorDetails)
        
        alert(`Error saving milestone:\n\n${fullErrorDetails}\n\nCheck browser console for full details.`)
        
        setToastMessage(errorMessage)
        setToastType('error')
        setShowToast(true)
        
        // Don't close modal on error - let user fix and retry
        return
      }

      // Parse successful response
      let result
      try {
        result = JSON.parse(responseText)
      } catch {
        result = { success: true }
      }

      console.log('[JourneyEditModal] ✅ Success! Result:', result)

      setToastMessage('Milestone saved successfully!')
      setToastType('success')
      setShowToast(true)
      
      // Call onSave immediately to refresh the list (this will fetch fresh data)
      onSave()
      
      // Close modal after short delay to show success toast
      setTimeout(() => {
        onClose()
        // Clear form data after closing
        if (!milestone) {
          setFormData({
            year: new Date().getFullYear(),
            title_en: '',
            title_es: '',
            title_de: '',
            description_en: '',
            description_es: '',
            description_de: '',
            image_url: '',
            order_index: 0,
            is_active: true,
          })
        }
      }, 1500)
    } catch (error: any) {
      console.error('[JourneyEditModal] ❌ Unexpected error:', error)
      console.error('[JourneyEditModal] Error stack:', error.stack)
      
      const errorMessage = error.message || 'Unexpected error saving milestone. Please check console and try again.'
      
      // Show alert for unexpected errors
      alert(`Unexpected error:\n\n${errorMessage}\n\nCheck browser console for details.`)
      
      setToastMessage(errorMessage)
      setToastType('error')
      setShowToast(true)
      
      // Don't close modal on error
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto">
        <div className="bg-gradient-to-r from-[#001F3F] to-[#1B263B] p-6 flex items-center justify-between text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">{milestone ? 'Edit Milestone' : 'Create New Milestone'}</h2>
          <button onClick={onClose} className="hover:text-[#C5A059] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Error:</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Year & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                type="number"
                required
                min="2000"
                max="2030"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                value={formData.year}
                onChange={(e) => {
                  const yearValue = parseInt(e.target.value) || 2000
                  // Clamp value between 2000 and 2030
                  const clampedYear = Math.max(2000, Math.min(2030, yearValue))
                  setFormData({ ...formData, year: clampedYear })
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Year must be between 2000 and 2030</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <ImageUploader
              value={formData.image_url}
              onChange={(url) => {
                console.log('[JourneyEditModal] Image URL updated:', url)
                setFormData({ ...formData, image_url: url })
              }}
              onUploadStateChange={(isUploading) => {
                console.log('[JourneyEditModal] Image upload state:', isUploading)
                setImageUploading(isUploading)
              }}
              folder="milestones"
              bucket="website-assets"
              maxSizeMB={0.5}
              aspectRatio="16/9"
              label="Milestone Image"
            />
            {imageUploading && (
              <p className="text-xs text-yellow-600 mt-1">⏳ Image is uploading... Please wait before saving.</p>
            )}
            {formData.image_url && !imageUploading && (
              <p className="text-xs text-green-600 mt-1">✓ Image URL ready: {formData.image_url.substring(0, 50)}...</p>
            )}
          </div>

          {/* English */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">English (EN)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Spanish */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spanish (ES)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.title_es}
                  onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.description_es}
                  onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* German */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">German (DE)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.title_de}
                  onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.description_de}
                  onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible on website)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#001F3F] to-[#1B263B] text-white rounded-lg flex items-center gap-2 hover:from-[#1B263B] hover:to-[#001F3F] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
