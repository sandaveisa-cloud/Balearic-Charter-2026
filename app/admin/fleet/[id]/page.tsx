'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import type { Fleet } from '@/types/database'

export default function FleetEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    year: null as number | null,
    description: '',
    description_en: '',
    description_es: '',
    description_de: '',
    main_image_url: '',
    low_season_price: null as number | null,
    medium_season_price: null as number | null,
    high_season_price: null as number | null,
    capacity: null as number | null,
    cabins: null as number | null,
    toilets: null as number | null,
    length: null as number | null,
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    if (id) {
      fetchFleet()
    }
  }, [id])

  const fetchFleet = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/fleet')
      
      if (!response.ok) {
        throw new Error('Failed to fetch fleet')
      }

      const { fleet: fleetList } = await response.json()
      const yacht = fleetList.find((y: Fleet) => y.id === id)
      
      if (!yacht) {
        throw new Error('Yacht not found')
      }

      setFleet(yacht)
      setFormData({
        name: yacht.name || '',
        slug: yacht.slug || '',
        year: yacht.year || null,
        description: yacht.description || yacht.description_en || '',
        description_en: yacht.description_en || '',
        description_es: yacht.description_es || '',
        description_de: yacht.description_de || '',
        main_image_url: yacht.main_image_url || (yacht.gallery_images && yacht.gallery_images.length > 0 ? yacht.gallery_images[0] : ''),
        low_season_price: yacht.low_season_price || null,
        medium_season_price: yacht.medium_season_price || null,
        high_season_price: yacht.high_season_price || null,
        capacity: yacht.capacity || null,
        cabins: yacht.cabins || null,
        toilets: yacht.toilets || null,
        length: yacht.length || null,
        is_active: yacht.is_active !== false,
        is_featured: yacht.is_featured || false,
      })
    } catch (error) {
      console.error('[FleetEdit] Error fetching:', error)
      setError(error instanceof Error ? error.message : 'Failed to load yacht')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        id,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        year: formData.year,
        description: formData.description || null,
        description_en: formData.description_en || null,
        description_es: formData.description_es || null,
        description_de: formData.description_de || null,
        main_image_url: formData.main_image_url || null,
        gallery_images: formData.main_image_url ? [formData.main_image_url] : [],
        low_season_price: formData.low_season_price,
        medium_season_price: formData.medium_season_price,
        high_season_price: formData.high_season_price,
        capacity: formData.capacity,
        cabins: formData.cabins,
        toilets: formData.toilets,
        length: formData.length,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      }

      const response = await fetch('/api/admin/fleet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save yacht')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/fleet')
      }, 1500)
    } catch (err) {
      console.error('[FleetEdit] Error saving:', err)
      setError(err instanceof Error ? err.message : 'Failed to save yacht')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-luxury-blue" />
      </div>
    )
  }

  if (!fleet) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/fleet')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Yacht not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/fleet')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-luxury-blue">Edit Yacht</h1>
          <p className="text-gray-600 mt-1">{fleet.name}</p>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          <span>Yacht saved successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
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
              Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              value={formData.year || ''}
              onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length (meters)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.length || ''}
              onChange={(e) => setFormData({ ...formData, length: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity (guests)
            </label>
            <input
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabins
            </label>
            <input
              type="number"
              value={formData.cabins || ''}
              onChange={(e) => setFormData({ ...formData, cabins: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Toilets
            </label>
            <input
              type="number"
              value={formData.toilets || ''}
              onChange={(e) => setFormData({ ...formData, toilets: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Prices */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Seasonal Prices (€)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Season
              </label>
              <input
                type="number"
                value={formData.low_season_price || ''}
                onChange={(e) => setFormData({ ...formData, low_season_price: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medium Season
              </label>
              <input
                type="number"
                value={formData.medium_season_price || ''}
                onChange={(e) => setFormData({ ...formData, medium_season_price: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                High Season
              </label>
              <input
                type="number"
                value={formData.high_season_price || ''}
                onChange={(e) => setFormData({ ...formData, high_season_price: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
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

        {/* Image Upload */}
        <div>
          <ImageUpload
            currentImageUrl={formData.main_image_url}
            onImageUploaded={(url) => setFormData({ ...formData, main_image_url: url })}
            folder="fleet"
            bucket="fleet-images"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
              Featured
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/admin/fleet')}
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
              <>
                <Save className="w-4 h-4" />
                Save Yacht
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
