'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, Edit } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import GalleryImageManager from '@/components/GalleryImageManager'
import JourneyEditModal from '@/components/admin/JourneyEditModal'
import type { Fleet } from '@/types/database'

interface FleetFormData {
  // Basic Info
  name: string
  slug: string
  boat_name: string
  year: number | null
  capacity: number | null
  cabins: number | null
  toilets: number | null
  length: number | null
  
  // Pricing
  low_season_price: number | null
  medium_season_price: number | null
  high_season_price: number | null
  currency: string
  apa_percentage: number | null
  crew_service_fee: number | null
  cleaning_fee: number | null
  tax_percentage: number | null
  
  // Technical Specs
  beam: string | number | null
  draft: string | number | null
  engines: string
  fuel_capacity: string | number | null
  water_capacity: string | number | null
  cruising_speed: string
  max_speed: string
  
  // Amenities
  amenities: {
    ac?: boolean
    watermaker?: boolean
    generator?: boolean
    flybridge?: boolean
    heating?: boolean
    teak_deck?: boolean
    full_batten?: boolean
    folding_table?: boolean
    fridge?: boolean
    dinghy?: boolean
    water_entertainment?: boolean
  }
  
  // Extras
  extras: string[]
  
  // Multi-language Descriptions
  description_en: string
  description_es: string
  description_de: string
  short_description_en: string
  short_description_es: string
  short_description_de: string
  
  // Multi-language Taglines
  tagline_en: string
  tagline_es: string
  tagline_de: string
  
  // Images
  main_image_url: string
  gallery_images: string[]
  
  // Refit
  recently_refitted: boolean
  refit_details: string
  
  // Settings
  is_featured: boolean
  is_active: boolean
}

interface FleetEditorProps {
  fleet: Fleet | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function FleetEditor({
  fleet,
  isOpen,
  onClose,
  onSave,
}: FleetEditorProps) {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'specs' | 'amenities' | 'gallery' | 'content' | 'milestones' | 'settings'>('basic')
  const [newExtra, setNewExtra] = useState('')
  const [vesselMilestones, setVesselMilestones] = useState<any[]>([])
  const [loadingMilestones, setLoadingMilestones] = useState(false)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FleetFormData>({
    defaultValues: {
      name: '',
      slug: '',
      boat_name: '',
      year: null,
      capacity: null,
      cabins: null,
      toilets: null,
      length: null,
      low_season_price: null,
      medium_season_price: null,
      high_season_price: null,
      currency: 'EUR',
      apa_percentage: 30,
      crew_service_fee: null,
      cleaning_fee: null,
      tax_percentage: 21,
      beam: null,
      draft: null,
      engines: '',
      fuel_capacity: null,
      water_capacity: null,
      cruising_speed: '',
      max_speed: '',
      amenities: {},
      extras: [],
      description_en: '',
      description_es: '',
      description_de: '',
      short_description_en: '',
      short_description_es: '',
      short_description_de: '',
      main_image_url: '',
      gallery_images: [],
      recently_refitted: false,
      refit_details: '',
      is_featured: false,
      is_active: true,
    },
  })

  // Load vessel milestones when fleet is loaded
  useEffect(() => {
    if (fleet?.id) {
      fetchVesselMilestones(fleet.id)
    } else {
      setVesselMilestones([])
    }
  }, [fleet?.id])

  const fetchVesselMilestones = async (yachtId: string) => {
    try {
      setLoadingMilestones(true)
      const response = await fetch(`/api/admin/journey?yacht_id=${yachtId}`)
      if (response.ok) {
        const data = await response.json()
        setVesselMilestones(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('[FleetEditor] Error fetching vessel milestones:', error)
    } finally {
      setLoadingMilestones(false)
    }
  }

  const handleAddMilestone = () => {
    setEditingMilestone(null)
    setMilestoneModalOpen(true)
  }

  const handleEditMilestone = (milestone: any) => {
    setEditingMilestone(milestone)
    setMilestoneModalOpen(true)
  }

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return
    try {
      const response = await fetch(`/api/admin/journey?id=${id}`, { method: 'DELETE' })
      if (response.ok && fleet?.id) {
        fetchVesselMilestones(fleet.id)
      }
    } catch (error) {
      console.error('[FleetEditor] Error deleting milestone:', error)
    }
  }

  const handleMilestoneSave = () => {
    if (fleet?.id) {
      fetchVesselMilestones(fleet.id)
    }
    setMilestoneModalOpen(false)
    setEditingMilestone(null)
  }

  // Load fleet data
  useEffect(() => {
    if (fleet && isOpen) {
      const specs = fleet.technical_specs || {}
      const amenities = fleet.amenities || {}
      
      reset({
        name: fleet.name || '',
        slug: fleet.slug || '',
        boat_name: fleet.boat_name || '',
        year: fleet.year,
        capacity: fleet.capacity,
        cabins: fleet.cabins,
        toilets: fleet.toilets,
        length: fleet.length,
        low_season_price: fleet.low_season_price,
        medium_season_price: fleet.medium_season_price,
        high_season_price: fleet.high_season_price,
        currency: fleet.currency || 'EUR',
        apa_percentage: fleet.apa_percentage || 30,
        crew_service_fee: fleet.crew_service_fee,
        cleaning_fee: fleet.cleaning_fee,
        tax_percentage: fleet.tax_percentage || 21,
        beam: specs.beam || fleet.length ? null : null,
        draft: specs.draft || null,
        engines: specs.engines || '',
        fuel_capacity: specs.fuel_capacity || null,
        water_capacity: specs.water_capacity || null,
        cruising_speed: specs.cruising_speed || '',
        max_speed: specs.max_speed || '',
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
        extras: Array.isArray(fleet.extras) ? fleet.extras : [],
        description_en: fleet.description_en || '',
        description_es: fleet.description_es || '',
        description_de: fleet.description_de || '',
        short_description_en: fleet.short_description_en || fleet.short_description_i18n?.en || fleet.short_description || '',
        short_description_es: fleet.short_description_es || fleet.short_description_i18n?.es || '',
        short_description_de: fleet.short_description_de || fleet.short_description_i18n?.de || '',
        tagline_en: fleet.tagline_en || fleet.tagline_i18n?.en || '',
        tagline_es: fleet.tagline_es || fleet.tagline_i18n?.es || '',
        tagline_de: fleet.tagline_de || fleet.tagline_i18n?.de || '',
        main_image_url: fleet.main_image_url || '',
        gallery_images: Array.isArray(fleet.gallery_images) ? fleet.gallery_images : [],
        recently_refitted: fleet.recently_refitted || false,
        refit_details: fleet.refit_details || '',
        is_featured: fleet.is_featured || false,
        is_active: fleet.is_active !== false,
      })
    } else if (!fleet && isOpen) {
      reset({
        name: '',
        slug: '',
        boat_name: '',
        year: null,
        capacity: null,
        cabins: null,
        toilets: null,
        length: null,
        low_season_price: null,
        medium_season_price: null,
        high_season_price: null,
        currency: 'EUR',
        apa_percentage: 30,
        crew_service_fee: null,
        cleaning_fee: null,
        tax_percentage: 21,
        beam: null,
        draft: null,
        engines: '',
        fuel_capacity: null,
        water_capacity: null,
        cruising_speed: '',
        max_speed: '',
        amenities: {},
        extras: [],
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
        gallery_images: [],
        recently_refitted: false,
        refit_details: '',
        is_featured: false,
        is_active: true,
      })
    }
  }, [fleet, reset, isOpen])

  // Auto-slugify yacht name when it changes (only if slug is empty or matches old name)
  const watchedName = watch('name')
  const watchedSlug = watch('slug')
  const initialName = fleet?.name || ''
  
  useEffect(() => {
    // Only auto-generate slug if:
    // 1. Name has changed from initial value
    // 2. Slug is empty OR slug matches the old name's slugified version
    if (watchedName && watchedName.trim()) {
      const slugifiedName = watchedName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '')     // Remove special characters
        .replace(/-+/g, '-')             // Replace multiple hyphens with single
        .replace(/^-|-$/g, '')           // Remove leading/trailing hyphens
      
      const oldSlugifiedName = initialName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Auto-update slug if it's empty or matches the old name
      if (!watchedSlug || watchedSlug === oldSlugifiedName || watchedSlug === initialName.toLowerCase().replace(/\s+/g, '-')) {
        setValue('slug', slugifiedName, { shouldValidate: false })
      }
    }
  }, [watchedName, initialName, setValue]) // Removed watchedSlug from deps to avoid loops

  const onSubmit = async (data: FleetFormData) => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!data.name || !data.name.trim()) {
        throw new Error('Yacht name is required')
      }

      // Warn about missing images but allow save
      const hasMainImage = data.main_image_url && data.main_image_url.trim() !== ''
      const hasGalleryImages = data.gallery_images && data.gallery_images.length > 0
      
      if (!hasMainImage && !hasGalleryImages) {
        // Show confirmation dialog
        const proceed = window.confirm(
          'This yacht has no images. It will display without a photo on the website. Do you want to continue saving?'
        )
        if (!proceed) {
          setSaving(false)
          return
        }
      }

      // Generate slug if not provided - use improved slugification
      let slug = data.slug?.trim() || ''
      if (!slug) {
        slug = data.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')           // Replace spaces with hyphens
          .replace(/[^a-z0-9-]/g, '')     // Remove special characters
          .replace(/-+/g, '-')             // Replace multiple hyphens with single
          .replace(/^-|-$/g, '')           // Remove leading/trailing hyphens
      } else {
        // Clean up provided slug
        slug = slug
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      }
      
      if (!slug || !slug.trim()) {
        throw new Error('Slug is required and must be valid')
      }

      // Build technical specs object
      const technical_specs: any = {}
      if (data.beam) technical_specs.beam = typeof data.beam === 'string' ? parseFloat(data.beam) || data.beam : data.beam
      if (data.draft) technical_specs.draft = typeof data.draft === 'string' ? parseFloat(data.draft) || data.draft : data.draft
      if (data.engines) technical_specs.engines = data.engines
      if (data.fuel_capacity) technical_specs.fuel_capacity = typeof data.fuel_capacity === 'string' ? parseFloat(data.fuel_capacity) || data.fuel_capacity : data.fuel_capacity
      if (data.water_capacity) technical_specs.water_capacity = typeof data.water_capacity === 'string' ? parseFloat(data.water_capacity) || data.water_capacity : data.water_capacity
      if (data.cruising_speed) technical_specs.cruising_speed = data.cruising_speed
      if (data.max_speed) technical_specs.max_speed = data.max_speed
      if (data.length) technical_specs.length = data.length

      // Build payload
      const payload: any = {
        ...(fleet?.id && { id: fleet.id }),
        name: data.name.trim(),
        slug: slug.trim(),
        boat_name: data.boat_name?.trim() || null,
        year: data.year || null,
        capacity: data.capacity || null,
        cabins: data.cabins || null,
        toilets: data.toilets || null,
        length: data.length || null,
        low_season_price: data.low_season_price || null,
        medium_season_price: data.medium_season_price || null,
        high_season_price: data.high_season_price || null,
        currency: data.currency || 'EUR',
        apa_percentage: data.apa_percentage || null,
        crew_service_fee: data.crew_service_fee || null,
        cleaning_fee: data.cleaning_fee || null,
        tax_percentage: data.tax_percentage || null,
        technical_specs: Object.keys(technical_specs).length > 0 ? technical_specs : null,
        amenities: data.amenities,
        extras: data.extras.length > 0 ? data.extras : null,
        description_en: data.description_en?.trim() || null,
        description_es: data.description_es?.trim() || null,
        description_de: data.description_de?.trim() || null,
        short_description_en: data.short_description_en?.trim() || null,
        short_description_es: data.short_description_es?.trim() || null,
        short_description_de: data.short_description_de?.trim() || null,
        short_description_i18n: {
          en: data.short_description_en?.trim() || null,
          es: data.short_description_es?.trim() || null,
          de: data.short_description_de?.trim() || null,
        },
        tagline_en: data.tagline_en?.trim() || null,
        tagline_es: data.tagline_es?.trim() || null,
        tagline_de: data.tagline_de?.trim() || null,
        main_image_url: data.main_image_url || null,
        gallery_images: data.gallery_images.length > 0 ? data.gallery_images : [],
        recently_refitted: data.recently_refitted || false,
        refit_details: data.refit_details?.trim() || null,
        is_featured: data.is_featured || false,
        is_active: data.is_active !== false,
      }

      console.log('[FleetEditor] 📤 Sending payload:', payload)

      const url = '/api/admin/fleet'
      const method = fleet?.id ? 'PUT' : 'POST'

      // Include old slug in PUT requests to help with revalidation
      if (method === 'PUT' && fleet?.slug) {
        payload.oldSlug = fleet.slug
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('[FleetEditor] 📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          const responseText = await response.text()
          console.error('[FleetEditor] ❌ Raw response:', responseText.substring(0, 500))
          try {
            errorData = JSON.parse(responseText)
          } catch {
            errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` }
          }
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('[FleetEditor] ❌ API Error:', errorData)
        
        // Provide helpful error messages
        let userMessage = errorData.error || errorData.details || `Failed to save yacht: ${response.status}`
        
        // Check for common database errors
        if (errorData.details?.includes('column') || errorData.hint?.includes('column') || errorData.code === 'PGRST204') {
          const skippedInfo = errorData.skippedColumns?.length 
            ? ` (Missing columns: ${errorData.skippedColumns.join(', ')})` 
            : ''
          userMessage = `Database schema mismatch${skippedInfo}. Please run the SQL migration in Supabase: supabase/migrations/004_add_missing_fleet_columns.sql`
        } else if (errorData.details?.includes('duplicate') || errorData.code === '23505') {
          userMessage = 'A yacht with this name or slug already exists. Please use a different name.'
        } else if (errorData.details?.includes('violates')) {
          userMessage = `Database constraint error: ${errorData.details}`
        } else if (errorData.suggestion) {
          userMessage = `${userMessage}. ${errorData.suggestion}`
        }
        
        throw new Error(userMessage)
      }

      const result = await response.json()
      console.log('[FleetEditor] ✅ Success! Result:', result)

      // Check if any fields were skipped due to missing columns
      if (result.warning || result.skippedColumns?.length > 0) {
        console.warn('[FleetEditor] ⚠️ Some fields were skipped:', result.skippedColumns)
        // Show warning but still count as success
        setError(`Saved with warning: ${result.warning || 'Some fields were not saved due to missing database columns.'}`)
      }

      setSuccess(true)
      // Call onSave immediately to trigger toast, then close after delay
      onSave()
      setTimeout(() => {
        onClose()
      }, result.warning ? 3000 : 1500) // Give more time to read warning
    } catch (err) {
      console.error('[FleetEditor] ❌ Error saving:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save yacht. Please check your connection and try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const addExtra = () => {
    if (newExtra.trim()) {
      const currentExtras = watch('extras') || []
      if (!currentExtras.includes(newExtra.trim())) {
        setValue('extras', [...currentExtras, newExtra.trim()])
        setNewExtra('')
      }
    }
  }

  const removeExtra = (index: number) => {
    const currentExtras = watch('extras') || []
    setValue('extras', currentExtras.filter((_, i) => i !== index))
  }

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('[FleetEditor] ✅ Modal opened', { 
        fleet: fleet?.id || 'new',
        fleetName: fleet?.name || 'New Yacht',
        isOpen,
        activeTab
      })
    }
  }, [isOpen, fleet, activeTab])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4"
      onClick={(e) => {
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
            {fleet ? 'Edit Yacht' : 'Add New Yacht'}
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
          <div className="flex gap-1 px-6 overflow-x-auto">
            {(['basic', 'pricing', 'specs', 'amenities', 'gallery', 'content', 'milestones', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-luxury-blue border-b-2 border-luxury-blue bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'basic' && 'Basic Info'}
                {tab === 'pricing' && 'Pricing'}
                {tab === 'specs' && 'Technical Specs'}
                {tab === 'amenities' && 'Amenities'}
                {tab === 'gallery' && 'Gallery'}
                {tab === 'content' && 'Content'}
                {tab === 'milestones' && 'Vessel History'}
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

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yacht Name *
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
                    Boat Name (Official)
                  </label>
                  <input
                    type="text"
                    {...register('boat_name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., Simona"
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
                    placeholder="e.g., lagoon-400-s2-simona"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
                  {errors.slug && (
                    <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    {...register('year', { valueAsNumber: true })}
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
                    {...register('length', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 12.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Capacity
                  </label>
                  <input
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
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
                    {...register('cabins', { valueAsNumber: true })}
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
                    {...register('toilets', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 4"
                  />
                </div>

                <div>
                  <ImageUploader
                    value={watch('main_image_url') || ''}
                    onChange={(url) => setValue('main_image_url', url)}
                    folder="fleet"
                    bucket="website-assets"
                    maxSizeMB={0.5}
                    aspectRatio="16/9"
                    label="Main Image"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Pricing Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Season Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('low_season_price', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 3500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medium Season Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('medium_season_price', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 4500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    High Season Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('high_season_price', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 5500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    {...register('currency')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    APA Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('apa_percentage', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Advance Provisioning Allowance</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crew Service Fee (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('crew_service_fee', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cleaning Fee (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('cleaning_fee', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('tax_percentage', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 21"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Technical Specs Tab */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Technical Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beam (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('beam', { 
                      setValueAs: (v) => v === '' ? null : (isNaN(parseFloat(v)) ? v : parseFloat(v))
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 7.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Draft (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('draft', { 
                      setValueAs: (v) => v === '' ? null : (isNaN(parseFloat(v)) ? v : parseFloat(v))
                    })}
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
                    {...register('engines')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 2x 40HP Yanmar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Capacity (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('fuel_capacity', { 
                      setValueAs: (v) => v === '' ? null : (isNaN(parseFloat(v)) ? v : parseFloat(v))
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Water Capacity (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('water_capacity', { 
                      setValueAs: (v) => v === '' ? null : (isNaN(parseFloat(v)) ? v : parseFloat(v))
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cruising Speed (knots)
                  </label>
                  <input
                    type="text"
                    {...register('cruising_speed')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 8-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Speed (knots)
                  </label>
                  <input
                    type="text"
                    {...register('max_speed')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Amenities & Extras</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amenities Checkboxes */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 mb-3">Amenities</h4>
                  {[
                    { key: 'ac', label: 'Air Conditioning' },
                    { key: 'watermaker', label: 'Watermaker' },
                    { key: 'generator', label: 'Generator' },
                    { key: 'flybridge', label: 'Flybridge' },
                    { key: 'heating', label: 'Heating' },
                    { key: 'teak_deck', label: 'Teak Deck' },
                    { key: 'full_batten', label: 'Full Batten Mainsail' },
                    { key: 'folding_table', label: 'Folding Table' },
                    { key: 'fridge', label: 'Refrigerator' },
                    { key: 'dinghy', label: 'Dinghy' },
                    { key: 'water_entertainment', label: 'Water Toys' },
                  ].map((amenity) => (
                    <div key={amenity.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register(`amenities.${amenity.key as keyof FleetFormData['amenities']}`)}
                        className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
                      />
                      <label className="text-sm text-gray-700">{amenity.label}</label>
                    </div>
                  ))}
                </div>

                {/* Extras */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Additional Extras</h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newExtra}
                      onChange={(e) => setNewExtra(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addExtra()
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="e.g., WiFi, Snorkeling Gear"
                    />
                    <button
                      type="button"
                      onClick={addExtra}
                      className="px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(watch('extras') || []).map((extra, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{extra}</span>
                        <button
                          type="button"
                          onClick={() => removeExtra(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Image Gallery</h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Upload and manage yacht gallery images. Drag to reorder.
              </p>

              <div data-gallery-images>
                <GalleryImageManager
                  images={watch('gallery_images') || []}
                  onImagesChange={(images) => setValue('gallery_images', images)}
                  folder="fleet"
                  bucket="website-assets"
                />
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Multi-Language Content</h3>
              
              {/* Short Descriptions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Short Description</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English
                    </label>
                    <textarea
                      {...register('short_description_en')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Brief description in English..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spanish
                    </label>
                    <textarea
                      {...register('short_description_es')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Descripción breve en español..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      German
                    </label>
                    <textarea
                      {...register('short_description_de')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Kurze Beschreibung auf Deutsch..."
                    />
                  </div>
                </div>
              </div>

              {/* Taglines */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Tagline</h4>
                <p className="text-sm text-gray-600 mb-2">Short marketing phrase displayed on the yacht detail page</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Tagline
                    </label>
                    <input
                      type="text"
                      {...register('tagline_en')}
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
                      {...register('tagline_es')}
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
                      {...register('tagline_de')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="e.g., SIMONA ist die perfekte Wahl..."
                    />
                  </div>
                </div>
              </div>

              {/* Full Descriptions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Full Description</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Description
                    </label>
                    <textarea
                      {...register('description_en')}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Enter detailed description in English..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spanish Description
                    </label>
                    <textarea
                      {...register('description_es')}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Ingrese descripción detallada en español..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      German Description
                    </label>
                    <textarea
                      {...register('description_de')}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                      placeholder="Geben Sie eine detaillierte Beschreibung auf Deutsch ein..."
                    />
                  </div>
                </div>
              </div>

              {/* Refit Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Refit Information</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('recently_refitted')}
                    className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Recently Refitted
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refit Details
                  </label>
                  <textarea
                    {...register('refit_details')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="Describe recent refit work..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vessel History / Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold text-gray-800">Vessel Legacy & Milestones</h3>
                {fleet?.id && (
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="flex items-center gap-2 px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Milestone
                  </button>
                )}
              </div>

              {!fleet?.id ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Please save the yacht first before adding milestones.</p>
                </div>
              ) : loadingMilestones ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-luxury-blue mx-auto" />
                </div>
              ) : vesselMilestones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No milestones yet. Click "Add Milestone" to create vessel history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vesselMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-luxury-blue text-white rounded-full text-sm font-semibold">
                            {milestone.year}
                          </span>
                          <h4 className="font-semibold text-gray-800">{milestone.title_en || 'Untitled'}</h4>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{milestone.description_en || ''}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            milestone.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {milestone.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => handleEditMilestone(milestone)}
                          className="p-2 text-luxury-blue hover:bg-luxury-blue/10 rounded-lg transition-colors"
                          title="Edit milestone"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('is_featured')}
                    className="w-4 h-4 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Featured (show prominently on homepage)
                  </label>
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
                'Save Yacht'
              )}
            </button>
          </div>
        </form>

        {/* Milestone Edit Modal */}
        {fleet?.id && (
          <JourneyEditModal
            isOpen={milestoneModalOpen}
            onClose={() => {
              setMilestoneModalOpen(false)
              setEditingMilestone(null)
            }}
            onSave={handleMilestoneSave}
            milestone={editingMilestone ? { ...editingMilestone, yacht_id: fleet.id } : { yacht_id: fleet.id } as any}
          />
        )}
      </div>
    </div>
  )
}
