'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Save, Snowflake, Zap, Wind, BedDouble, Waves, Anchor, Droplets, Flame } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import GalleryImageManager from '@/components/GalleryImageManager'
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
    short_description_en: '',
    short_description_es: '',
    short_description_de: '',
    tagline_en: '',
    tagline_es: '',
    tagline_de: '',
    main_image_url: '',
    gallery_images: [] as string[],
    low_season_price: null as number | null,
    medium_season_price: null as number | null,
    high_season_price: null as number | null,
    capacity: null as number | null,
    cabins: null as number | null,
    toilets: null as number | null,
    length: null as number | null,
    beam: null as number | null,
    draft: null as number | null,
    is_active: true,
    is_featured: false,
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
    } as Record<string, boolean>,
    // Extras
    extras: [] as string[],
    // Technical specs
    technical_specs: {
      engines: '',
      cruising_speed: '',
      max_speed: '',
      fuel_capacity: '',
      water_capacity: '',
    } as Record<string, any>,
  })

  const isNew = id === 'new'

  useEffect(() => {
    if (id && !isNew) {
      fetchFleet()
    } else if (isNew) {
      // For new yacht, just set loading to false
      setLoading(false)
    }
  }, [id, isNew])

  const fetchFleet = async () => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      
      const response = await fetch('/api/admin/fleet')
      
      if (!response.ok) {
        // Check if it's a server error (500) - likely Supabase connection issue
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || 
            'Server error: Unable to connect to database. Please check environment variables (SUPABASE_SERVICE_ROLE_KEY).'
          )
        }
        throw new Error(`Failed to fetch fleet: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const fleetList = data?.fleet || []
      
      // Check if fleet list is empty or null (could indicate connection issue)
      if (!Array.isArray(fleetList) || fleetList.length === 0) {
        throw new Error('No fleet data available. Please check database connection and environment variables.')
      }

      const yacht = fleetList.find((y: Fleet) => y.id === id)
      
      if (!yacht) {
        // Don't throw error - just set fleet to null and show message
        setFleet(null)
        setError(`Yacht with ID "${id}" not found in the database.`)
        return
      }

      setFleet(yacht)
      
      // Extract beam and draft from technical_specs or specs
      const techSpecs = yacht.technical_specs || {}
      const specs = yacht.specs || {}
      const beam = techSpecs.beam || specs.beam || null
      const draft = techSpecs.draft || specs.draft || null
      
      setFormData({
        name: yacht.name || '',
        slug: yacht.slug || '',
        year: yacht.year || null,
        description: yacht.description || yacht.description_en || '',
        description_en: yacht.description_en || '',
        description_es: yacht.description_es || '',
        description_de: yacht.description_de || '',
        short_description_en: yacht.short_description_en || yacht.short_description_i18n?.en || yacht.short_description || '',
        short_description_es: yacht.short_description_es || yacht.short_description_i18n?.es || '',
        short_description_de: yacht.short_description_de || yacht.short_description_i18n?.de || '',
        tagline_en: yacht.tagline_en || yacht.tagline_i18n?.en || '',
        tagline_es: yacht.tagline_es || yacht.tagline_i18n?.es || '',
        tagline_de: yacht.tagline_de || yacht.tagline_i18n?.de || '',
        main_image_url: yacht.main_image_url || (yacht.gallery_images && yacht.gallery_images.length > 0 ? yacht.gallery_images[0] : ''),
        gallery_images: yacht.gallery_images || [],
        low_season_price: yacht.low_season_price || null,
        medium_season_price: yacht.medium_season_price || null,
        high_season_price: yacht.high_season_price || null,
        capacity: yacht.capacity || null,
        cabins: yacht.cabins || null,
        toilets: yacht.toilets || null,
        length: yacht.length || null,
        beam: typeof beam === 'number' ? beam : (typeof beam === 'string' ? parseFloat(beam) || null : null),
        draft: typeof draft === 'number' ? draft : (typeof draft === 'string' ? parseFloat(draft) || null : null),
        is_active: yacht.is_active !== false,
        is_featured: yacht.is_featured || false,
        amenities: yacht.amenities || {
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
        extras: yacht.extras || [],
        technical_specs: {
          engines: techSpecs.engines || '',
          cruising_speed: techSpecs.cruising_speed || '',
          max_speed: techSpecs.max_speed || '',
          fuel_capacity: techSpecs.fuel_capacity || '',
          water_capacity: techSpecs.water_capacity || '',
        },
      })
    } catch (error) {
      console.error('[FleetEdit] Error fetching:', error)
      // Set error message but don't set fleet to null - keep page accessible
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to load yacht. Please check your connection and try again.'
      )
      // Don't set fleet to null here - let user see the error message
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
      // Warn about missing images but allow save
      const hasMainImage = formData.main_image_url && formData.main_image_url.trim() !== ''
      const hasGalleryImages = formData.gallery_images && formData.gallery_images.length > 0
      
      if (!hasMainImage && !hasGalleryImages) {
        const proceed = window.confirm(
          'This yacht has no images. It will display without a photo on the website. Do you want to continue saving?'
        )
        if (!proceed) {
          setSaving(false)
          return
        }
      }

      const payload: any = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        year: formData.year,
        description: formData.description || null,
        description_en: formData.description_en || null,
        description_es: formData.description_es || null,
        description_de: formData.description_de || null,
        short_description_en: formData.short_description_en || null,
        short_description_es: formData.short_description_es || null,
        short_description_de: formData.short_description_de || null,
        tagline_en: formData.tagline_en || null,
        tagline_es: formData.tagline_es || null,
        tagline_de: formData.tagline_de || null,
        main_image_url: formData.gallery_images && formData.gallery_images.length > 0 ? formData.gallery_images[0] : formData.main_image_url || null,
        gallery_images: formData.gallery_images || [],
        low_season_price: formData.low_season_price,
        medium_season_price: formData.medium_season_price,
        high_season_price: formData.high_season_price,
        capacity: formData.capacity,
        cabins: formData.cabins,
        toilets: formData.toilets,
        length: formData.length,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        // Amenities
        amenities: formData.amenities || {},
        // Extras
        extras: formData.extras || [],
        // Technical specs
        technical_specs: {
          ...formData.technical_specs,
          length: formData.length,
          beam: formData.beam,
          draft: formData.draft,
        },
        // Required fields with defaults
        currency: 'EUR', // Default currency
      }

      // For existing yacht, add ID and use PUT
      if (!isNew) {
        payload.id = id
      }

      const response = await fetch('/api/admin/fleet', {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isNew ? 'create' : 'save'} yacht`)
      }

      setSuccess(true)
      const successMsg = isNew ? 'Yacht created successfully! Redirecting...' : 'Yacht saved successfully! Redirecting...'
      setTimeout(() => {
        router.push('/admin/fleet')
      }, 1500)
    } catch (err) {
      console.error('[FleetEdit] Error saving:', err)
      setError(err instanceof Error ? err.message : `Failed to ${isNew ? 'create' : 'save'} yacht`)
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

  // Show error state if yacht not found or connection failed (only for edit, not for new)
  // But still render the page (don't return 404)
  if (!isNew && !fleet && !loading && error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/fleet')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Yacht</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to load yacht data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p><strong>Possible causes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Yacht ID "{id}" does not exist in the database</li>
              <li>Database connection issue (check SUPABASE_SERVICE_ROLE_KEY environment variable)</li>
              <li>Network connectivity problem</li>
            </ul>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push('/admin/fleet')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Fleet List
            </button>
            <button
              onClick={fetchFleet}
              className="px-6 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors"
            >
              Retry
            </button>
          </div>
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
          <h1 className="text-3xl font-bold text-luxury-blue">
            {isNew ? 'Add New Yacht' : 'Edit Yacht'}
          </h1>
          {!isNew && fleet && (
            <p className="text-gray-600 mt-1">{fleet.name}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          <span>{isNew ? 'Yacht created successfully! Redirecting...' : 'Yacht saved successfully! Redirecting...'}</span>
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

        {/* Short Descriptions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Short Descriptions</h3>
          <p className="text-sm text-gray-600">Brief text displayed on fleet listing cards (not the full detail page)</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English Short Description
            </label>
            <textarea
              value={formData.short_description_en}
              onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., Experience the perfect blend of luxury and performance..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spanish Short Description
            </label>
            <textarea
              value={formData.short_description_es}
              onChange={(e) => setFormData({ ...formData, short_description_es: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., Experimente la combinación perfecta de lujo y rendimiento..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              German Short Description
            </label>
            <textarea
              value={formData.short_description_de}
              onChange={(e) => setFormData({ ...formData, short_description_de: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., Erleben Sie die perfekte Mischung aus Luxus und Leistung..."
            />
          </div>
        </div>

        {/* Taglines */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Taglines</h3>
          <p className="text-sm text-gray-600">Short marketing phrase displayed on the yacht detail page</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English Tagline
            </label>
            <input
              type="text"
              value={formData.tagline_en}
              onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., SIMONA is the perfect choice..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spanish Tagline
            </label>
            <input
              type="text"
              value={formData.tagline_es}
              onChange={(e) => setFormData({ ...formData, tagline_es: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., SIMONA es la elección perfecta..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              German Tagline
            </label>
            <input
              type="text"
              value={formData.tagline_de}
              onChange={(e) => setFormData({ ...formData, tagline_de: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., SIMONA ist die perfekte Wahl..."
            />
          </div>
        </div>

        {/* Main Image */}
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

        {/* Gallery Images Manager */}
        <div>
          <GalleryImageManager
            images={formData.gallery_images}
            onImagesChange={(images) => {
              setFormData({ 
                ...formData, 
                gallery_images: images,
                // Update main_image_url to first gallery image if not set
                main_image_url: formData.main_image_url || (images.length > 0 ? images[0] : '')
              })
            }}
            folder="fleet"
            bucket="fleet-images"
          />
        </div>

        {/* Technical Specifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beam (meters)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.beam || ''}
                onChange={(e) => setFormData({ ...formData, beam: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Draft (meters)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.draft || ''}
                onChange={(e) => setFormData({ ...formData, draft: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engines
              </label>
              <input
                type="text"
                value={formData.technical_specs.engines || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technical_specs: { ...formData.technical_specs, engines: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., 2x Yanmar 54HP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cruising Speed
              </label>
              <input
                type="text"
                value={formData.technical_specs.cruising_speed || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technical_specs: { ...formData.technical_specs, cruising_speed: e.target.value }
                })}
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
                value={formData.technical_specs.max_speed || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technical_specs: { ...formData.technical_specs, max_speed: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., 10 knots"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Capacity
              </label>
              <input
                type="text"
                value={formData.technical_specs.fuel_capacity || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technical_specs: { ...formData.technical_specs, fuel_capacity: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., 500L"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Capacity
              </label>
              <input
                type="text"
                value={formData.technical_specs.water_capacity || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technical_specs: { ...formData.technical_specs, water_capacity: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="e.g., 600L"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { key: 'ac', label: 'Air Conditioning', icon: Snowflake },
              { key: 'generator', label: 'Generator', icon: Zap },
              { key: 'flybridge', label: 'Flybridge', icon: Wind },
              { key: 'watermaker', label: 'Watermaker', icon: Droplets },
              { key: 'heating', label: 'Heating', icon: Flame },
              { key: 'teak_deck', label: 'Teak Deck', icon: Waves },
              { key: 'fridge', label: 'Refrigerator', icon: Anchor },
              { key: 'dinghy', label: 'Dinghy', icon: Waves },
              { key: 'water_entertainment', label: 'Water Toys', icon: Waves },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`amenity_${key}`}
                  checked={formData.amenities[key] || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    amenities: { ...formData.amenities, [key]: e.target.checked }
                  })}
                  className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
                />
                <label htmlFor={`amenity_${key}`} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Icon className="w-4 h-4 text-luxury-gold" />
                  <span>{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Extras & Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'WiFi',
              'Snorkeling Equipment',
              'Towels',
              'Linens',
              'Beach Towels',
              'Kitchen Equipment',
              'Safety Equipment',
              'Navigation Equipment',
            ].map((extra) => (
              <div key={extra} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`extra_${extra}`}
                  checked={formData.extras.includes(extra)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        extras: [...formData.extras, extra]
                      })
                    } else {
                      setFormData({
                        ...formData,
                        extras: formData.extras.filter(e => e !== extra)
                      })
                    }
                  }}
                  className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
                />
                <label htmlFor={`extra_${extra}`} className="text-sm text-gray-700 cursor-pointer">
                  {extra}
                </label>
              </div>
            ))}
          </div>
          {/* Custom Extra Input */}
          <div>
            <input
              type="text"
              placeholder="Add custom extra (press Enter)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  e.preventDefault()
                  const value = e.currentTarget.value.trim()
                  if (!formData.extras.includes(value)) {
                    setFormData({
                      ...formData,
                      extras: [...formData.extras, value]
                    })
                  }
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>
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
