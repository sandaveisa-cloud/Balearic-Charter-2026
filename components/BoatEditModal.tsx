'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import GalleryImageManager from '@/components/GalleryImageManager'
import type { Fleet } from '@/types/database'

interface BoatEditModalProps {
  boat: Fleet | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function BoatEditModal({
  boat,
  isOpen,
  onClose,
  onSave,
}: BoatEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    year: null as number | null,
    length: null as number | null,
    capacity: null as number | null,
    cabins: null as number | null,
    toilets: null as number | null,
    // Technical Specs
    beam: '' as string | number | null,
    draft: '' as string | number | null,
    engines: '',
    fuel_capacity: '' as string | number | null,
    water_capacity: '' as string | number | null,
    cruising_speed: '',
    max_speed: '',
    // Amenities
    amenities: {
      ac: false,
      watermaker: false,
      generator: false,
      flybridge: false,
      heating: false,
      teak_deck: false,
      full_batten: false,
      folding_table: false,
      fridge: false,
      dinghy: false,
      water_entertainment: false,
    },
    // Extras
    extras: [] as string[],
    newExtra: '',
    // Descriptions
    description_en: '',
    description_es: '',
    description_de: '',
    // Images
    main_image_url: '',
    gallery_images: [] as string[],
    // Prices
    low_season_price: null as number | null,
    medium_season_price: null as number | null,
    high_season_price: null as number | null,
    currency: 'EUR',
    // Other
    is_featured: false,
    is_active: true,
    recently_refitted: false,
    refit_details: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (boat) {
      const specs = boat.specs || boat.technical_specs || {}
      const amenities = boat.amenities || {}
      
      setFormData({
        name: boat.name || '',
        slug: boat.slug || '',
        year: boat.year,
        length: boat.length,
        capacity: boat.capacity,
        cabins: boat.cabins,
        toilets: boat.toilets,
        beam: specs.beam || boat.technical_specs?.beam || '',
        draft: specs.draft || boat.technical_specs?.draft || '',
        engines: specs.engine || specs.engines || boat.technical_specs?.engines || '',
        fuel_capacity: specs.fuel_tank || specs.fuel_capacity || boat.technical_specs?.fuel_capacity || '',
        water_capacity: specs.water_tank || specs.water_capacity || boat.technical_specs?.water_capacity || '',
        cruising_speed: boat.technical_specs?.cruising_speed || '',
        max_speed: boat.technical_specs?.max_speed || '',
        amenities: {
          ac: amenities.ac || false,
          watermaker: amenities.watermaker || false,
          generator: amenities.generator || false,
          flybridge: amenities.flybridge || false,
          heating: amenities.heating || false,
          teak_deck: amenities.teak_deck || false,
          full_batten: amenities.full_batten || false,
          folding_table: amenities.folding_table || false,
          fridge: amenities.fridge || false,
          dinghy: amenities.dinghy || false,
          water_entertainment: amenities.water_entertainment || false,
        },
        extras: boat.extras || [],
        newExtra: '',
        description_en: boat.description_en || '',
        description_es: boat.description_es || '',
        description_de: boat.description_de || '',
        main_image_url: boat.main_image_url || '',
        gallery_images: boat.gallery_images || [],
        low_season_price: boat.low_season_price,
        medium_season_price: boat.medium_season_price,
        high_season_price: boat.high_season_price,
        currency: boat.currency || 'EUR',
        is_featured: boat.is_featured || false,
        is_active: boat.is_active !== false,
        recently_refitted: boat.recently_refitted || false,
        refit_details: boat.refit_details || '',
      })
    } else {
      // Reset form for new boat
      setFormData({
        name: '',
        slug: '',
        year: null,
        length: null,
        capacity: null,
        cabins: null,
        toilets: null,
        beam: '',
        draft: '',
        engines: '',
        fuel_capacity: '',
        water_capacity: '',
        cruising_speed: '',
        max_speed: '',
        amenities: {
          ac: false,
          watermaker: false,
          generator: false,
          flybridge: false,
          heating: false,
          teak_deck: false,
          full_batten: false,
          folding_table: false,
          fridge: false,
          dinghy: false,
          water_entertainment: false,
        },
        extras: [],
        newExtra: '',
        description_en: '',
        description_es: '',
        description_de: '',
        main_image_url: '',
        gallery_images: [],
        low_season_price: null,
        medium_season_price: null,
        high_season_price: null,
        currency: 'EUR',
        is_featured: false,
        is_active: true,
        recently_refitted: false,
        refit_details: '',
      })
    }
    setSuccess(false)
    setError(null)
  }, [boat, isOpen])

  const handleAddExtra = () => {
    if (formData.newExtra.trim() && !formData.extras.includes(formData.newExtra.trim())) {
      setFormData({
        ...formData,
        extras: [...formData.extras, formData.newExtra.trim()],
        newExtra: '',
      })
    }
  }

  const handleRemoveExtra = (index: number) => {
    setFormData({
      ...formData,
      extras: formData.extras.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('[BoatEditModal] 🚀 Starting save process...')
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        throw new Error('Boat name is required')
      }

      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      if (!slug || !slug.trim()) {
        throw new Error('Slug is required and must be valid')
      }

      // Build technical_specs object
      const technical_specs: any = {}
      if (formData.beam) technical_specs.beam = formData.beam
      if (formData.draft) technical_specs.draft = formData.draft
      if (formData.engines) technical_specs.engines = formData.engines
      if (formData.fuel_capacity) technical_specs.fuel_capacity = formData.fuel_capacity
      if (formData.water_capacity) technical_specs.water_capacity = formData.water_capacity
      if (formData.cruising_speed) technical_specs.cruising_speed = formData.cruising_speed
      if (formData.max_speed) technical_specs.max_speed = formData.max_speed
      if (formData.length) technical_specs.length = formData.length

      const payload: any = {
        ...(boat?.id && { id: boat.id }),
        name: formData.name.trim(),
        slug: slug.trim(),
        year: formData.year || null,
        length: formData.length || null,
        capacity: formData.capacity || null,
        cabins: formData.cabins || null,
        toilets: formData.toilets || null,
        technical_specs: Object.keys(technical_specs).length > 0 ? technical_specs : null,
        amenities: formData.amenities,
        extras: formData.extras.length > 0 ? formData.extras : null,
        description_en: formData.description_en?.trim() || null,
        description_es: formData.description_es?.trim() || null,
        description_de: formData.description_de?.trim() || null,
        main_image_url: formData.main_image_url?.trim() || null,
        gallery_images: formData.gallery_images || [],
        low_season_price: formData.low_season_price || null,
        medium_season_price: formData.medium_season_price || null,
        high_season_price: formData.high_season_price || null,
        currency: formData.currency || 'EUR',
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        recently_refitted: formData.recently_refitted,
        refit_details: formData.refit_details?.trim() || null,
      }

      console.log('[BoatEditModal] 📤 Sending payload:', payload)

      const url = '/api/admin/fleet'
      const method = boat?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('[BoatEditModal] 📥 Response status:', response.status)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('[BoatEditModal] ❌ API Error:', errorData)
        throw new Error(errorData.error || errorData.details || `Failed to save boat: ${response.status}`)
      }

      const result = await response.json()
      console.log('[BoatEditModal] ✅ Success! Result:', result)

      setSuccess(true)
      setTimeout(() => {
        onSave()
        onClose()
      }, 1000)
    } catch (err) {
      console.error('[BoatEditModal] ❌ Error saving:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save boat. Please check your connection and try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-luxury-blue to-luxury-gold p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">
            {boat ? 'Edit Yacht' : 'Add New Yacht'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span>Yacht saved successfully!</span>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yacht Name *
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
                  placeholder="e.g., wide-dream"
                />
                <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.length || ''}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 12.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beam (m)
                </label>
                <input
                  type="text"
                  value={formData.beam || ''}
                  onChange={(e) => setFormData({ ...formData, beam: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 4.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Draft (m)
                </label>
                <input
                  type="text"
                  value={formData.draft || ''}
                  onChange={(e) => setFormData({ ...formData, draft: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 1.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engines
                </label>
                <input
                  type="text"
                  value={formData.engines}
                  onChange={(e) => setFormData({ ...formData, engines: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 2x Yanmar 54HP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (Guests)
                </label>
                <input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 8"
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
                  placeholder="e.g., 4"
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
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Capacity (L)
                </label>
                <input
                  type="text"
                  value={formData.fuel_capacity || ''}
                  onChange={(e) => setFormData({ ...formData, fuel_capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Capacity (L)
                </label>
                <input
                  type="text"
                  value={formData.water_capacity || ''}
                  onChange={(e) => setFormData({ ...formData, water_capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cruising Speed
                </label>
                <input
                  type="text"
                  value={formData.cruising_speed}
                  onChange={(e) => setFormData({ ...formData, cruising_speed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 8 knots"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Speed
                </label>
                <input
                  type="text"
                  value={formData.max_speed}
                  onChange={(e) => setFormData({ ...formData, max_speed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 10 knots"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(formData.amenities).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`amenity-${key}`}
                    checked={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, [key]: e.target.checked }
                    })}
                    className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
                  />
                  <label htmlFor={`amenity-${key}`} className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Features & Extras */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Features & Extras</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.newExtra}
                onChange={(e) => setFormData({ ...formData, newExtra: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddExtra()
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., Paddle Surf, Snorkel Equipment, WiFi"
              />
              <button
                type="button"
                onClick={handleAddExtra}
                className="px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {formData.extras.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.extras.map((extra, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm"
                  >
                    <span>{extra}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExtra(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Descriptions</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Description
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Enter English description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spanish Description
              </label>
              <textarea
                value={formData.description_es}
                onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Enter Spanish description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                German Description
              </label>
              <textarea
                value={formData.description_de}
                onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Enter German description..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Images</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Image
              </label>
              <ImageUpload
                currentImageUrl={formData.main_image_url}
                onImageUploaded={(url) => setFormData({ ...formData, main_image_url: url })}
                folder="fleet"
                bucket="fleet-images"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images
              </label>
              <GalleryImageManager
                images={formData.gallery_images}
                onImagesChange={(images) => setFormData({ ...formData, gallery_images: images })}
                folder="fleet"
                bucket="fleet-images"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Season Price
                </label>
                <input
                  type="number"
                  value={formData.low_season_price || ''}
                  onChange={(e) => setFormData({ ...formData, low_season_price: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medium Season Price
                </label>
                <input
                  type="number"
                  value={formData.medium_season_price || ''}
                  onChange={(e) => setFormData({ ...formData, medium_season_price: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  High Season Price
                </label>
                <input
                  type="number"
                  value={formData.high_season_price || ''}
                  onChange={(e) => setFormData({ ...formData, high_season_price: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="e.g., 2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Refit Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Refit Information</h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recently_refitted"
                checked={formData.recently_refitted}
                onChange={(e) => setFormData({ ...formData, recently_refitted: e.target.checked })}
                className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
              />
              <label htmlFor="recently_refitted" className="text-sm font-medium text-gray-700">
                Recently Refitted
              </label>
            </div>
            {formData.recently_refitted && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refit Details
                </label>
                <textarea
                  value={formData.refit_details}
                  onChange={(e) => setFormData({ ...formData, refit_details: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="Describe recent refit work..."
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-6">
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
              className="px-6 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Yacht'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
