'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { X, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, GripVertical, MapPin } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import GalleryImageManager from '@/components/GalleryImageManager'
import type { Destination } from '@/types/database'

interface Highlight {
  id?: string
  name: string
  name_en?: string
  name_es?: string
  name_de?: string
  description: string
  description_en?: string
  description_es?: string
  description_de?: string
  image_url?: string | null
  category?: 'landmark' | 'beach' | 'marina' | 'viewpoint' | 'restaurant' | 'other'
  coordinates?: {
    lat?: number
    lng?: number
  } | null
}

interface DestinationFormData {
  // Hero Section
  name: string
  region: string
  slug: string
  latitude: string
  longitude: string
  hero_image_url: string
  
  // About Section
  ready_to_explore_title_en: string
  ready_to_explore_title_es: string
  ready_to_explore_title_de: string
  about_description_en: string
  about_description_es: string
  about_description_de: string
  
  // Highlights & Attractions
  highlights: Highlight[]
  
  // Customer Gallery
  gallery_images: string[]
  
  // Media
  youtube_video_url: string
  
  // Settings
  order_index: number
  is_active: boolean
}

interface DestinationEditorProps {
  destination: Destination | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function DestinationEditor({
  destination,
  isOpen,
  onClose,
  onSave,
}: DestinationEditorProps) {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'highlights' | 'gallery' | 'settings'>('hero')

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DestinationFormData>({
    defaultValues: {
      name: '',
      region: '',
      slug: '',
      latitude: '',
      longitude: '',
      hero_image_url: '',
      ready_to_explore_title_en: 'Ready to Explore?',
      ready_to_explore_title_es: '¿Listo para Explorar?',
      ready_to_explore_title_de: 'Bereit zu Erkunden?',
      about_description_en: '',
      about_description_es: '',
      about_description_de: '',
      highlights: [],
      gallery_images: [],
      youtube_video_url: '',
      order_index: 0,
      is_active: true,
    },
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'highlights',
  })

  // Load destination data
  useEffect(() => {
    if (destination) {
      // Extract coordinates from destination (if stored in a field, or use default lookup)
      const getCoordinates = (destName: string): { lat: number; lng: number } | null => {
        const coords: Record<string, { lat: number; lng: number }> = {
          'ibiza': { lat: 38.9067, lng: 1.4206 },
          'formentera': { lat: 38.7050, lng: 1.4500 },
          'mallorca': { lat: 39.5696, lng: 2.6502 },
          'palma': { lat: 39.5696, lng: 2.6502 },
          'menorca': { lat: 39.9375, lng: 4.0000 },
          'costa-blanca': { lat: 38.3452, lng: -0.4810 },
        }
        const key = (destName || '').toLowerCase().replace(/\s+/g, '-')
        return coords[key] || coords[destName.toLowerCase()] || null
      }

      const coords = getCoordinates(destination.name || destination.title || '')
      
      // Parse highlights from destination (if stored in a JSONB field)
      const highlights: Highlight[] = Array.isArray((destination as any).highlights_data) 
        ? (destination as any).highlights_data.map((h: any, idx: number) => ({
            ...h,
            id: h.id || `highlight-${idx}`,
            coordinates: h.coordinates && typeof h.coordinates.lat === 'number' && typeof h.coordinates.lng === 'number'
              ? {
                  lat: h.coordinates.lat,
                  lng: h.coordinates.lng,
                }
              : null,
          }))
        : []

      reset({
        name: destination.name || destination.title || '',
        region: destination.region || '',
        slug: destination.slug || '',
        latitude: coords?.lat.toString() || '',
        longitude: coords?.lng.toString() || '',
        hero_image_url: (destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0)
          ? destination.image_urls[0]
          : '',
        ready_to_explore_title_en: (destination as any).ready_to_explore_title_en || 'Ready to Explore?',
        ready_to_explore_title_es: (destination as any).ready_to_explore_title_es || '¿Listo para Explorar?',
        ready_to_explore_title_de: (destination as any).ready_to_explore_title_de || 'Bereit zu Erkunden?',
        about_description_en: destination.description_en || '',
        about_description_es: destination.description_es || '',
        about_description_de: destination.description_de || '',
        highlights: highlights.length > 0 ? highlights : [],
        gallery_images: Array.isArray((destination as any).gallery_images) 
          ? (destination as any).gallery_images 
          : [],
        youtube_video_url: destination.youtube_video_url || '',
        order_index: destination.order_index || 0,
        is_active: destination.is_active !== false,
      })
    } else {
      reset({
        name: '',
        region: '',
        slug: '',
        latitude: '',
        longitude: '',
        hero_image_url: '',
        ready_to_explore_title_en: 'Ready to Explore?',
        ready_to_explore_title_es: '¿Listo para Explorar?',
        ready_to_explore_title_de: 'Bereit zu Erkunden?',
        about_description_en: '',
        about_description_es: '',
        about_description_de: '',
        highlights: [],
        gallery_images: [],
        youtube_video_url: '',
        order_index: 0,
        is_active: true,
      })
    }
    setSuccess(false)
    setError(null)
  }, [destination, isOpen, reset])

  const onSubmit = async (data: DestinationFormData) => {
    console.log('[DestinationEditor] 🚀 Starting save process...')
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!data.name || !data.name.trim()) {
        throw new Error('Destination name is required')
      }

      const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      if (!slug || !slug.trim()) {
        throw new Error('Slug is required and must be valid')
      }

      // Build payload
      const payload: any = {
        ...(destination?.id && { id: destination.id }),
        name: data.name.trim(),
        region: data.region?.trim() || null,
        slug: slug.trim(),
        description_en: data.about_description_en?.trim() || null,
        description_es: data.about_description_es?.trim() || null,
        description_de: data.about_description_de?.trim() || null,
        image_urls: data.hero_image_url ? [data.hero_image_url] : [],
        youtube_video_url: data.youtube_video_url?.trim() || null,
        order_index: data.order_index || 0,
        is_active: data.is_active !== false,
        // Store additional fields in JSONB or separate columns
        ready_to_explore_title_en: data.ready_to_explore_title_en?.trim() || null,
        ready_to_explore_title_es: data.ready_to_explore_title_es?.trim() || null,
        ready_to_explore_title_de: data.ready_to_explore_title_de?.trim() || null,
        // Store coordinates (you may need to add a coordinates JSONB field to your schema)
        coordinates: (data.latitude && data.longitude) ? {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
        } : null,
        // Store highlights as JSONB (clean up coordinates - only include if both lat and lng are present and valid)
        highlights_data: data.highlights.length > 0 ? data.highlights.map((h: any) => {
          const hasValidCoords = h.coordinates?.lat !== undefined && 
                                  h.coordinates?.lat !== null &&
                                  h.coordinates?.lng !== undefined && 
                                  h.coordinates?.lng !== null &&
                                  !isNaN(parseFloat(h.coordinates.lat)) &&
                                  !isNaN(parseFloat(h.coordinates.lng))
          
          return {
            ...h,
            coordinates: hasValidCoords
              ? { lat: parseFloat(h.coordinates.lat), lng: parseFloat(h.coordinates.lng) }
              : null,
          }
        }) : null,
        // Store gallery images as JSONB array
        gallery_images: Array.isArray(data.gallery_images) && data.gallery_images.length > 0
          ? data.gallery_images.filter((url: string) => url && url.trim())
          : null,
      }

      console.log('[DestinationEditor] 📤 Sending payload:', payload)

      const url = '/api/admin/destinations'
      const method = destination?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('[DestinationEditor] 📥 Response status:', response.status)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('[DestinationEditor] ❌ API Error:', errorData)
        throw new Error(errorData.error || errorData.details || `Failed to save destination: ${response.status}`)
      }

      const result = await response.json()
      console.log('[DestinationEditor] ✅ Success! Result:', result)

      setSuccess(true)
      setTimeout(() => {
        onSave()
        onClose()
      }, 1000)
    } catch (err) {
      console.error('[DestinationEditor] ❌ Error saving:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save destination. Please check your connection and try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const addHighlight = () => {
    append({
      name: '',
      description: '',
      image_url: null,
      category: 'other',
      coordinates: null,
    })
  }

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('[DestinationEditor] ✅ Modal opened', { 
        destination: destination?.id || 'new',
        destinationName: destination?.name || destination?.title || 'New Destination',
        isOpen,
        activeTab
      })
    }
  }, [isOpen, destination, activeTab])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget && !saving) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto m-4 my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-luxury-blue to-luxury-gold p-6 flex items-center justify-between z-10">
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

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 px-6">
            {(['hero', 'about', 'highlights', 'gallery', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-luxury-blue border-b-2 border-luxury-blue bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'hero' && 'Hero Section'}
                {tab === 'about' && 'About Section'}
                {tab === 'highlights' && 'Highlights & Attractions'}
                {tab === 'gallery' && 'Customer Gallery'}
                {tab === 'settings' && 'Settings'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6" noValidate>
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

          {/* Hero Section Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Hero Section</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    {...register('region')}
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
                    {...register('slug', { required: 'Slug is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., ibiza"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
                  {errors.slug && (
                    <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hero Background Image
                  </label>
                  <ImageUpload
                    currentImageUrl={watch('hero_image_url')}
                    onImageUploaded={(url) => setValue('hero_image_url', url)}
                    folder="destinations"
                    bucket="fleet-images"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('latitude')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 38.9067"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('longitude')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 1.4206"
                  />
                </div>
              </div>
            </div>
          )}

          {/* About Section Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">About Section</h3>
              
              {/* Ready to Explore Title */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-700">"Ready to Explore" Title</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English
                    </label>
                    <input
                      type="text"
                      {...register('ready_to_explore_title_en')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Ready to Explore?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spanish
                    </label>
                    <input
                      type="text"
                      {...register('ready_to_explore_title_es')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="¿Listo para Explorar?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      German
                    </label>
                    <input
                      type="text"
                      {...register('ready_to_explore_title_de')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Bereit zu Erkunden?"
                    />
                  </div>
                </div>
              </div>

              {/* About Description */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-700">About [Destination] Description</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Description
                    </label>
                    <textarea
                      {...register('about_description_en')}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Enter English description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spanish Description
                    </label>
                    <textarea
                      {...register('about_description_es')}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Enter Spanish description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      German Description
                    </label>
                    <textarea
                      {...register('about_description_de')}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Enter German description..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Highlights & Attractions Tab */}
          {activeTab === 'highlights' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex-1">Highlights & Attractions</h3>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="flex items-center gap-2 px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Highlight
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <p>No highlights added yet. Click "Add Highlight" to get started.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Highlight #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            {...register(`highlights.${index}.category`)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                          >
                            <option value="beach">Beach</option>
                            <option value="marina">Marina</option>
                            <option value="landmark">Landmark</option>
                            <option value="viewpoint">Viewpoint</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Image */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image
                          </label>
                          <ImageUpload
                            currentImageUrl={watch(`highlights.${index}.image_url`) || ''}
                            onImageUploaded={(url) => {
                              const currentHighlights = watch('highlights')
                              const updated = [...currentHighlights]
                              updated[index] = { ...updated[index], image_url: url }
                              setValue('highlights', updated)
                            }}
                            folder="destinations/highlights"
                            bucket="fleet-images"
                          />
                        </div>

                        {/* Title - Multi-language */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title (English) *
                          </label>
                          <input
                            type="text"
                            {...register(`highlights.${index}.name`, { required: 'Title is required' })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="e.g., Es Trenc Beach"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title (Spanish)
                          </label>
                          <input
                            type="text"
                            {...register(`highlights.${index}.name_es`)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="e.g., Playa Es Trenc"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title (German)
                          </label>
                          <input
                            type="text"
                            {...register(`highlights.${index}.name_de`)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="e.g., Es Trenc Strand"
                          />
                        </div>

                        {/* Description - Multi-language */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (English) *
                          </label>
                          <textarea
                            {...register(`highlights.${index}.description`, { required: 'Description is required' })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="Enter description..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Spanish)
                          </label>
                          <textarea
                            {...register(`highlights.${index}.description_es`)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="Enter Spanish description..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (German)
                          </label>
                          <textarea
                            {...register(`highlights.${index}.description_de`)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="Enter German description..."
                          />
                        </div>

                        {/* Coordinates */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude (optional)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={watch(`highlights.${index}.coordinates`)?.lat ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              const currentHighlights = watch('highlights')
                              const updated = [...currentHighlights]
                              const currentCoords = updated[index].coordinates
                              const latValue = value === '' ? undefined : parseFloat(value)
                              const lngValue = currentCoords?.lng
                              
                              updated[index] = {
                                ...updated[index],
                                coordinates: (latValue !== undefined || lngValue !== undefined)
                                  ? { lat: latValue, lng: lngValue }
                                  : null,
                              }
                              setValue('highlights', updated)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="e.g., 38.9067"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude (optional)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={watch(`highlights.${index}.coordinates`)?.lng ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              const currentHighlights = watch('highlights')
                              const updated = [...currentHighlights]
                              const currentCoords = updated[index].coordinates
                              const latValue = currentCoords?.lat
                              const lngValue = value === '' ? undefined : parseFloat(value)
                              
                              updated[index] = {
                                ...updated[index],
                                coordinates: (latValue !== undefined || lngValue !== undefined)
                                  ? { lat: latValue, lng: lngValue }
                                  : null,
                              }
                              setValue('highlights', updated)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                            placeholder="e.g., 1.4206"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex-1">Customer Gallery</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Upload photos with customers. These images will be displayed on the public destination page, replacing placeholder images.
              </p>

              <div data-gallery-images>
                <GalleryImageManager
                  images={watch('gallery_images') || []}
                  onImagesChange={(images) => setValue('gallery_images', images)}
                  folder="destinations/gallery"
                  bucket="fleet-images"
                />
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    {...register('youtube_video_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    {...register('order_index', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active (visible on website)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
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
              disabled={saving || !watch('name')?.trim()}
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
