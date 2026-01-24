'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, Globe } from 'lucide-react'
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
    beam: '' as string | number | null,
    draft: '' as string | number | null,
    engines: '',
    fuel_capacity: '' as string | number | null,
    water_capacity: '' as string | number | null,
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
    extras: [] as string[],
    newExtra: '',
    description_en: '',
    description_es: '',
    description_de: '',
    main_image_url: '',
    gallery_images: [] as string[],
    low_season_price: null as number | null,
    medium_season_price: null as number | null,
    high_season_price: null as number | null,
    currency: 'EUR',
    is_featured: false,
    is_active: true,
    recently_refitted: false,
    refit_details: '',
    quality_details_en: { tech_title: '', tech_desc: '', linens_title: '', linens_desc: '', dining_title: '', dining_desc: '' },
    quality_details_es: { tech_title: '', tech_desc: '', linens_title: '', linens_desc: '', dining_title: '', dining_desc: '' },
    quality_details_de: { tech_title: '', tech_desc: '', linens_title: '', linens_desc: '', dining_title: '', dining_desc: '' },
    show_quality_section: true,
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
        beam: specs.beam || '',
        draft: specs.draft || '',
        engines: specs.engines || specs.engine || '',
        fuel_capacity: specs.fuel_capacity || specs.fuel_tank || '',
        water_capacity: specs.water_capacity || specs.water_tank || '',
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
        quality_details_en: (boat as any).quality_details_en || { tech_title: '', tech_desc: '', linens_title: '', linens_desc: '', dining_title: '', dining_desc: '' },
        quality_details_es: (boat as any).quality_details_es || { tech_title: '', tech_desc: '', linens_title: '', linens_desc: '', dining_title: '', dining_desc: '' },
        quality_details_de: (boat as any).quality_details_de || { tech_title: '', tech_desc: '', linens_title: '', linens_desc: '', dining_title: '', dining_desc: '' },
        show_quality_section: (boat as any).show_quality_section ?? true,
      })
    }
  }, [boat, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { newExtra, ...restData } = formData
      const payload = {
        ...(boat?.id && { id: boat.id }),
        ...restData,
        technical_specs: {
          beam: formData.beam,
          draft: formData.draft,
          engines: formData.engines,
          fuel_capacity: formData.fuel_capacity,
          water_capacity: formData.water_capacity,
          cruising_speed: formData.cruising_speed,
          max_speed: formData.max_speed
        }
      }

      const response = await fetch('/api/admin/fleet', {
        method: boat?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save yacht')

      setSuccess(true)
      setTimeout(() => {
        onSave()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1e3a5f] to-[#c9a227] p-6 flex items-center justify-between z-10 text-white shadow-md">
          <h2 className="text-2xl font-bold">{boat ? 'Edit Yacht' : 'Add New Yacht'}</h2>
          <button onClick={onClose}><X className="w-6 h-6 hover:rotate-90 transition-transform" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2"><AlertCircle /> {error}</div>}
          {success && <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center gap-2"><CheckCircle2 /> Saved successfully!</div>}

          {/* 1. Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Yacht Name" className="p-3 border rounded-lg" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input placeholder="Slug" className="p-3 border rounded-lg" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
            </div>
          </div>

          {/* 2. Media Assets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">Main Image</label>
                <ImageUpload currentImageUrl={formData.main_image_url} onImageUploaded={(url) => setFormData({ ...formData, main_image_url: url })} folder="fleet" bucket="fleet-images" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">Gallery</label>
                <GalleryImageManager images={formData.gallery_images} onImagesChange={(images) => setFormData({ ...formData, gallery_images: images })} folder="fleet" bucket="fleet-images" />
              </div>
            </div>
          </div>

          {/* 3. Premium Quality Section */}
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-[#c9a227] mb-6 flex items-center gap-2">Service & Quality Guarantee</h3>
            <div className="flex items-center gap-3 mb-8 bg-[#1e3a5f]/5 p-5 rounded-xl border border-[#1e3a5f]/10">
              <input type="checkbox" id="show_quality" checked={formData.show_quality_section} onChange={(e) => setFormData({...formData, show_quality_section: e.target.checked})} className="w-5 h-5 accent-[#1e3a5f]" />
              <label htmlFor="show_quality" className="font-bold text-[#1e3a5f] cursor-pointer">Show Quality Section on Website</label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {['en', 'es', 'de'].map((lang) => (
                <div key={lang} className="space-y-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="font-black uppercase text-xs tracking-widest text-gray-400">{lang}</span>
                    <Globe className="w-4 h-4 text-[#c9a227]" />
                  </div>
                  {/* Fields for Technical, Linens, Dining */}
                  <div className="space-y-4">
                    <input placeholder="Tech Title" className="w-full p-2 border rounded text-sm font-semibold" value={(formData as any)[`quality_details_${lang}`].tech_title} onChange={(e) => setFormData({...formData, [`quality_details_${lang}`]: {...(formData as any)[`quality_details_${lang}`], tech_title: e.target.value}})} />
                    <textarea placeholder="Tech Description" className="w-full p-2 border rounded text-sm h-16" value={(formData as any)[`quality_details_${lang}`].tech_desc} onChange={(e) => setFormData({...formData, [`quality_details_${lang}`]: {...(formData as any)[`quality_details_${lang}`], tech_desc: e.target.value}})} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Actions */}
          <div className="flex items-center justify-end gap-4 pt-10 border-t">
            <button type="button" onClick={onClose} className="px-8 py-3 border rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-10 py-3 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#c9a227] transition-all flex items-center gap-2 shadow-lg font-bold">
              {saving ? <Loader2 className="animate-spin" /> : 'Save Yacht'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}