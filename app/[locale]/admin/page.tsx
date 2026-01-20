'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { getDescriptionForLocale, getShortDescriptionForLocale, buildI18nUpdate, getLocalizedText, createI18nPatch, type Locale } from '@/lib/i18nUtils'
import { ArrowRight, Snowflake, Droplets, Zap, Ship, Flame, Waves, Table, Refrigerator, Anchor, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { compressImage, compressThumbnail } from '@/lib/imageCompression'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import DragDropImageUpload from '@/components/DragDropImageUpload'
import AdminDashboard from '@/components/AdminDashboard'
import type { BookingInquiry, Fleet, Destination, CulinaryExperience, CrewMember, Stat, Review } from '@/types/database'

export default function AdminPage() {
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([])
  const [fleet, setFleet] = useState<Fleet[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [culinary, setCulinary] = useState<CulinaryExperience[]>([])
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'fleet' | 'destinations' | 'reviews' | 'stats' | 'culinary' | 'crew' | 'inquiries'>('overview')
  
  // Fleet management states
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})
  const [savingFleet, setSavingFleet] = useState<Record<string, boolean>>({})
  const [fleetSuccess, setFleetSuccess] = useState<Record<string, string>>({})
  
  // Destinations management states
  const [uploadingDestinationImages, setUploadingDestinationImages] = useState<Record<string, boolean>>({})
  const [savingDestinations, setSavingDestinations] = useState<Record<string, boolean>>({})
  const [deletingDestinations, setDeletingDestinations] = useState<Record<string, boolean>>({})
  const [destinationsSuccess, setDestinationsSuccess] = useState<Record<string, string>>({})
  const [creatingDestination, setCreatingDestination] = useState(false)
  const [showCreateDestinationForm, setShowCreateDestinationForm] = useState(false)
  
  // Culinary management states
  const [uploadingCulinaryMedia, setUploadingCulinaryMedia] = useState<Record<string, boolean>>({})
  const [savingCulinary, setSavingCulinary] = useState<Record<string, boolean>>({})
  const [deletingCulinary, setDeletingCulinary] = useState<Record<string, boolean>>({})
  const [culinarySuccess, setCulinarySuccess] = useState<Record<string, string>>({})
  const [creatingCulinary, setCreatingCulinary] = useState(false)
  const [showCreateCulinaryForm, setShowCreateCulinaryForm] = useState(false)
  
  // Crew management states
  const [uploadingCrewImages, setUploadingCrewImages] = useState<Record<string, boolean>>({})
  const [savingCrew, setSavingCrew] = useState<Record<string, boolean>>({})
  const [deletingCrew, setDeletingCrew] = useState<Record<string, boolean>>({})
  const [crewSuccess, setCrewSuccess] = useState<Record<string, string>>({})
  const [creatingCrew, setCreatingCrew] = useState(false)
  const [showCreateCrewForm, setShowCreateCrewForm] = useState(false)
  
  // Settings management states
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState('')
  
  // Stats management states
  const [savingStats, setSavingStats] = useState<Record<string, boolean>>({})
  const [deletingStats, setDeletingStats] = useState<Record<string, boolean>>({})
  const [statsSuccess, setStatsSuccess] = useState<Record<string, string>>({})
  const [creatingStat, setCreatingStat] = useState(false)
  const [showCreateStatForm, setShowCreateStatForm] = useState(false)
  
  // Reviews management states
  const [savingReviews, setSavingReviews] = useState<Record<string, boolean>>({})
  const [deletingReviews, setDeletingReviews] = useState<Record<string, boolean>>({})
  const [reviewsSuccess, setReviewsSuccess] = useState<Record<string, string>>({})
  const [creatingReview, setCreatingReview] = useState(false)
  const [showCreateReviewForm, setShowCreateReviewForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    // Check Supabase environment variables (only log errors)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('[Admin] NEXT_PUBLIC_SUPABASE_URL is missing!')
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Admin] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
    }
    
    // Verify supabase client is initialized
    if (!supabase) {
      console.error('[Admin] Supabase client is not initialized!')
    }
    
    try {
      const [inquiriesResult, fleetResult, destinationsResult, culinaryResult, crewResult, settingsResult, statsResult, reviewsResult] = await Promise.all([
        supabase.from('booking_inquiries').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('fleet').select('*').order('name', { ascending: true }),
        supabase.from('destinations').select('*').order('order_index', { ascending: true }),
        supabase.from('culinary_experiences').select('*').order('order_index', { ascending: true }),
        supabase.from('crew').select('*').order('order_index', { ascending: true }),
        supabase.from('site_settings').select('*'),
        supabase.from('stats').select('*').order('order_index', { ascending: true }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      ])

      // Log results and errors
      if (inquiriesResult.error) {
        console.error('[Admin] Error fetching booking_inquiries:', inquiriesResult.error)
      } else {
        console.log('[Admin] Booking inquiries fetched:', inquiriesResult.data?.length || 0)
      }

      if (fleetResult.error) {
        console.error('[Admin] Error fetching fleet:', fleetResult.error)
      }

      if (destinationsResult.error) {
        console.error('[Admin] Error fetching destinations:', destinationsResult.error)
      }

      if (culinaryResult.error) {
        console.error('[Admin] Error fetching culinary_experiences:', culinaryResult.error)
      }

      if (crewResult.error) {
        console.error('[Admin] Error fetching crew:', crewResult.error)
      }

      if (settingsResult.error) {
        console.error('[Admin] Error fetching site_settings:', settingsResult.error)
      }

      setInquiries((inquiriesResult.data as BookingInquiry[]) || [])
      setFleet((fleetResult.data as Fleet[]) || [])
      setDestinations((destinationsResult.data as Destination[]) || [])
      setCulinary((culinaryResult.data as CulinaryExperience[]) || [])
      setCrew((crewResult.data as CrewMember[]) || [])
      setStats((statsResult.data as Stat[]) || [])
      setReviews((reviewsResult.data as Review[]) || [])
      
      // Transform settings into key-value object
      const settings: Record<string, string> = {}
      if (settingsResult.data && Array.isArray(settingsResult.data)) {
        (settingsResult.data as Array<{ key: string; value: string | null }>).forEach((setting) => {
          if (setting && typeof setting === 'object' && 'key' in setting) {
            settings[setting.key] = setting.value || ''
          }
        })
      }
      // Settings transformed successfully
      setSiteSettings(settings)
    } catch (error) {
      console.error('[Admin] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Validate image file
  const validateImage = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (file.size > maxSize) {
      return 'Image must be under 5MB'
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Image must be JPG, PNG, or WebP format'
    }
    
    return null
  }

  // Upload image to Supabase Storage with compression
  const uploadImage = async (file: File, entityId: string, isThumbnail: boolean = false): Promise<string | null> => {
    try {
      // Compress image before upload
      const compressedFile = isThumbnail
        ? await compressThumbnail(file)
        : await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            maxSizeMB: 1,
          })

      // Use WebP extension for better compression
      const fileExt = 'webp'
      const fileName = `${entityId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('yacht-images')
        .upload(filePath, compressedFile, {
          cacheControl: 'public, max-age=31536000', // 1 year cache
          upsert: false,
          contentType: 'image/webp',
        })

      if (uploadError) {
        console.error('[Admin] Upload error:', uploadError)
        return null
      }

      // Get public URL
      const { data } = supabase.storage
        .from('yacht-images')
        .getPublicUrl(filePath)

      // Image uploaded successfully
      return data.publicUrl
    } catch (error) {
      console.error('[Admin] Error uploading image:', error)
      return null
    }
  }

  // Handle single image upload for fleet (legacy support)
  const handleImageUpload = async (yachtId: string, file: File) => {
    await handleMultipleImageUpload(yachtId, [file])
  }

  // Handle multiple image uploads for fleet - adds to gallery_images array
  const handleMultipleImageUpload = async (yachtId: string, files: File[]) => {
    if (files.length === 0) return

    setUploadingImages(prev => ({ ...prev, [yachtId]: true }))
    
    try {
      // Upload all files
      const uploadPromises = files.map((file) => uploadImage(file, yachtId, false))
      const uploadedUrls = await Promise.all(uploadPromises)
      
      // Filter out any null values (failed uploads)
      const successfulUploads = uploadedUrls.filter((url): url is string => url !== null)
      
      if (successfulUploads.length === 0) {
        alert('Failed to upload images. Please try again.')
        return
      }

      // Get current yacht to append new images to gallery_images array
      const currentYacht = fleet.find(y => y.id === yachtId)
      const currentImages = currentYacht?.gallery_images || []
      const currentMainImage = currentYacht?.main_image_url
      
      // Combine main_image_url and gallery_images if main exists and not already in gallery
      let allImages = [...currentImages]
      if (currentMainImage && !allImages.includes(currentMainImage)) {
        allImages = [currentMainImage, ...allImages]
      }
      
      // Add new images to the array
      const updatedImages = [...allImages, ...successfulUploads]
      
      // Update fleet record - set both main_image_url (first image) and gallery_images
      const updateData = {
        main_image_url: updatedImages[0] || successfulUploads[0] || null, // First image as main
        gallery_images: updatedImages 
      }
      const { error } = await supabase
        .from('fleet')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update(updateData)
        .eq('id', yachtId)

      if (error) {
        console.error('[Admin] Error updating image URLs:', error)
        alert('Failed to save image URLs')
      } else {
        // Update local state
        setFleet(prev => prev.map(yacht => 
          yacht.id === yachtId ? { 
            ...yacht, 
            main_image_url: updatedImages[0] || successfulUploads[0],
            gallery_images: updatedImages 
          } : yacht
        ))
        setFleetSuccess(prev => ({ 
          ...prev, 
          [yachtId]: `✅ ${successfulUploads.length} image(s) uploaded successfully!` 
        }))
        setTimeout(() => {
          setFleetSuccess(prev => {
            const newState = { ...prev }
            delete newState[yachtId]
            return newState
          })
        }, 5000)
      }
    } catch (error) {
      console.error('[Admin] Error in image upload:', error)
      alert('An error occurred during upload')
    } finally {
      setUploadingImages(prev => ({ ...prev, [yachtId]: false }))
    }
  }

  // Handle reordering images in fleet gallery
  const handleReorderFleetImages = async (yachtId: string, newOrder: string[]) => {
    // Validate UUID
    if (!yachtId || yachtId.length !== 36) {
      console.error('[Admin] Invalid yacht ID when reordering images:', yachtId)
      return
    }

    // Optimistically update local state first for better UX
    setFleet(prev => prev.map(yacht => 
      yacht.id === yachtId ? { 
        ...yacht, 
        main_image_url: newOrder[0] || null,
        gallery_images: newOrder.length > 1 ? newOrder.slice(1) : []
      } : yacht
    ))

    try {
      // Update fleet record with new image order
      // First image becomes main_image_url, rest go to gallery_images
      const reorderUpdateData = {
        main_image_url: newOrder[0] || null,
        gallery_images: newOrder.length > 1 ? newOrder.slice(1) : []
      }
      const { error } = await supabase
        .from('fleet')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update(reorderUpdateData)
        .eq('id', yachtId)

      if (error) {
        console.error('[Admin] Error reordering images:', error)
        alert(`Failed to save image order: ${error.message || 'Unknown error'}`)
        // Reload data to revert UI
        loadData()
      } else {
        setFleetSuccess(prev => ({ 
          ...prev, 
          [yachtId]: 'Image order updated successfully!' 
        }))
        setTimeout(() => {
          setFleetSuccess(prev => {
            const newState = { ...prev }
            delete newState[yachtId]
            return newState
          })
        }, 3000)
      }
    } catch (error) {
      console.error('[Admin] Exception reordering images:', error)
      alert('An error occurred while reordering images')
      // Reload data to revert UI
      loadData()
    }
  }

  // Handle removing an existing image from fleet gallery
  const handleRemoveFleetImage = async (yachtId: string, imageUrl: string) => {
    // Validate UUID
    if (!yachtId || yachtId.length !== 36) {
      console.error('[Admin] Invalid yacht ID when removing image:', yachtId)
      alert('Invalid yacht ID. Please refresh the page.')
      return
    }

    const currentYacht = fleet.find(y => y.id === yachtId)
    if (!currentYacht) {
      console.error('[Admin] Yacht not found when removing image:', yachtId)
      alert('Yacht not found. Please refresh the page.')
      return
    }

    const currentImages = currentYacht.gallery_images || []
    const currentMainImage = currentYacht.main_image_url
    
    // Combine main_image_url and gallery_images
    let allImages = [...currentImages]
    if (currentMainImage && !allImages.includes(currentMainImage)) {
      allImages = [currentMainImage, ...allImages]
    }
    
    // Remove the image
    const updatedImages = allImages.filter(url => url !== imageUrl)
    
    // Prepare update payload
    const updatePayload: Partial<Fleet> = {
      main_image_url: updatedImages[0] || null,
      gallery_images: updatedImages.length > 0 ? updatedImages : []
    }
    
    // Update fleet record
    const { error } = await supabase
      .from('fleet')
      // @ts-expect-error - Supabase type inference limitation with dynamic table updates
      .update(updatePayload)
      .eq('id', yachtId)

    if (error) {
      console.error('[Admin] Error removing image:', error)
      console.error('[Admin] Update payload:', updatePayload)
      alert(`Failed to remove image: ${error.message || 'Unknown error'}`)
    } else {
      // Update local state
      setFleet(prev => prev.map(yacht => 
        yacht.id === yachtId ? { 
          ...yacht, 
          main_image_url: updatedImages[0] || null,
          gallery_images: updatedImages 
        } : yacht
      ))
      setFleetSuccess(prev => ({ 
        ...prev, 
        [yachtId]: 'Image removed successfully!' 
      }))
      setTimeout(() => {
        setFleetSuccess(prev => {
          const newState = { ...prev }
          delete newState[yachtId]
          return newState
        })
      }, 3000)
    }
  }

  // Update fleet yacht
  const handleFleetUpdate = async (yachtId: string, updates: Partial<Fleet>) => {
    setSavingFleet(prev => ({ ...prev, [yachtId]: true }))
    
    // Validate UUID before update
    if (!yachtId || yachtId.length !== 36) {
      console.error('[Admin] Invalid yacht ID:', yachtId)
      alert('Invalid yacht ID. Please refresh the page.')
      setSavingFleet(prev => ({ ...prev, [yachtId]: false }))
      return
    }
    
    // Clean up updates - remove undefined values and ensure proper types
    const cleanedUpdates: Partial<Fleet> = {}
    Object.entries(updates).forEach(([key, value]) => {
      // Skip undefined and null values (except for fields that should be nullable)
      if (value === undefined) return
      
      // Handle i18n fields - skip them initially, will be added conditionally if columns exist
      // We'll detect if columns exist on first error and handle accordingly
      if (key === 'description_i18n' || key === 'short_description_i18n') {
        // Store i18n fields separately to try them first, then fallback if needed
        // For now, skip them - we'll add them back if we detect the columns exist
        // This prevents errors on databases without i18n columns
        return // Skip i18n fields initially
      }
      
      // Skip legacy 'description' field if it doesn't exist in database
      if (key === 'description' || key === 'short_description') {
        // Don't include legacy description/short_description in update
        return
      }
      // Handle JSON fields - ensure they're properly formatted
      else if (key === 'technical_specs' || key === 'amenities') {
        if (value !== null && typeof value === 'object') {
          cleanedUpdates[key as keyof Fleet] = value as any
        } else if (value === null) {
          cleanedUpdates[key as keyof Fleet] = null as any
        }
      }
      // Handle array fields
      else if (key === 'gallery_images') {
        if (Array.isArray(value)) {
          cleanedUpdates[key as keyof Fleet] = value as any
        } else if (value === null) {
          cleanedUpdates[key as keyof Fleet] = [] as any
        }
      }
      // Handle numeric fields - convert strings to numbers
      else if (['low_season_price', 'medium_season_price', 'high_season_price', 'length', 'capacity', 'cabins', 'toilets', 'year'].includes(key)) {
        if (value === null || value === '') {
          cleanedUpdates[key as keyof Fleet] = null as any
        } else if (typeof value === 'string') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            cleanedUpdates[key as keyof Fleet] = numValue as any
          }
        } else if (typeof value === 'number') {
          cleanedUpdates[key as keyof Fleet] = value as any
        }
      }
      // Handle boolean fields
      else if (['is_featured', 'is_active'].includes(key)) {
        cleanedUpdates[key as keyof Fleet] = Boolean(value) as any
      }
      // Handle string fields
      else {
        cleanedUpdates[key as keyof Fleet] = value as any
      }
    })
    
    // Final check: Remove any legacy fields and i18n fields that might have slipped through
    delete cleanedUpdates.description
    delete cleanedUpdates.short_description
    delete cleanedUpdates.description_i18n
    delete cleanedUpdates.short_description_i18n
    
    // Store i18n fields separately - we'll try to update them after main update succeeds
    const i18nFields: Partial<Fleet> = {}
    if (updates.description_i18n && typeof updates.description_i18n === 'object') {
      i18nFields.description_i18n = updates.description_i18n
    }
    if (updates.short_description_i18n && typeof updates.short_description_i18n === 'object') {
      i18nFields.short_description_i18n = updates.short_description_i18n
    }
    
    // Updating fleet in database (without i18n fields first)
    
    try {
      const { data, error } = await supabase
        .from('fleet')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update(cleanedUpdates)
        .eq('id', yachtId)
        .select()

      if (error) {
        console.error('[Admin] Error updating fleet in database:', error)
        console.error('[Admin] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        console.error('[Admin] Update payload:', cleanedUpdates)
        console.error('[Admin] Yacht ID:', yachtId)
        
        // Handle missing i18n columns - retry without them
        if (error.code === 'PGRST204' && (error.message?.includes('description_i18n') || error.message?.includes('short_description_i18n'))) {
          console.warn('[Admin] i18n columns not found, retrying without i18n fields...')
          
          // Remove i18n fields and retry
          const fallbackUpdates = { ...cleanedUpdates }
          delete fallbackUpdates.description_i18n
          delete fallbackUpdates.short_description_i18n
          
          const { data: retryData, error: retryError } = await supabase
            .from('fleet')
            // @ts-expect-error - Supabase type inference limitation with dynamic table updates
            .update(fallbackUpdates)
            .eq('id', yachtId)
            .select()
          
          if (retryError) {
            console.error('[Admin] Retry also failed:', retryError)
            alert(`Failed to update yacht: ${retryError.message || 'Unknown error'}\n\nNote: i18n columns (description_i18n, short_description_i18n) are not available in your database.\n\nTo enable multi-language support, please run the migration:\n\nsupabase/add_i18n_to_fleet.sql\n\nSee SUPABASE_MIGRATION_INSTRUCTIONS.md for details.`)
          } else {
            // Success with fallback
            setFleet(prev => prev.map(yacht => 
              yacht.id === yachtId ? { ...yacht, ...retryData } : yacht
            ))
            setFleetSuccess(prev => ({ ...prev, [yachtId]: 'Yacht updated successfully! (Note: i18n columns not available)' }))
            setTimeout(() => {
              setFleetSuccess(prev => {
                const newState = { ...prev }
                delete newState[yachtId]
                return newState
              })
            }, 3000)
            return // Exit early on successful retry
          }
        } else {
          alert(`Failed to update yacht: ${error.message || 'Unknown error'}\n\nCheck console for details.`)
        }
      } else {
        // Fleet updated successfully! Now try to update i18n fields if they exist
        if (Object.keys(i18nFields).length > 0) {
          // Check if we've already determined that i18n columns don't exist
          const i18nColumnsExist = sessionStorage.getItem('i18n-columns-exist') !== 'false'
          
          if (i18nColumnsExist) {
            // Try to update i18n fields separately (non-blocking - won't fail main update)
            const { error: i18nError } = await supabase
              .from('fleet')
              // @ts-expect-error - Supabase type inference limitation with dynamic table updates
              .update(i18nFields)
              .eq('id', yachtId)
            
            if (i18nError) {
              if (i18nError.code === 'PGRST204') {
                // Mark that i18n columns don't exist to skip future attempts
                sessionStorage.setItem('i18n-columns-exist', 'false')
                
                // Only log once per session to avoid console spam
                if (!sessionStorage.getItem('i18n-warning-shown')) {
                  console.warn('[Admin] i18n columns (description_i18n, short_description_i18n) not available in database.')
                  console.warn('[Admin] To enable multi-language support, run: supabase/add_i18n_to_fleet.sql')
                  console.warn('[Admin] This is expected if you haven\'t run the migration yet. The main update succeeded.')
                  sessionStorage.setItem('i18n-warning-shown', 'true')
                }
              } else {
                console.warn('[Admin] Error updating i18n fields (non-critical):', i18nError)
              }
            } else {
              // Successfully updated i18n fields - mark that columns exist
              sessionStorage.setItem('i18n-columns-exist', 'true')
            }
          }
          // If i18n columns don't exist, silently skip the update
        }
        
        // Update local state with the returned data and i18n fields (if updated)
        setFleet(prev => prev.map(yacht => 
          yacht.id === yachtId ? { ...yacht, ...data, ...i18nFields } : yacht
        ))
        setFleetSuccess(prev => ({ ...prev, [yachtId]: 'Yacht updated successfully!' }))
        setTimeout(() => {
          setFleetSuccess(prev => {
            const newState = { ...prev }
            delete newState[yachtId]
            return newState
          })
        }, 3000)
      }
    } catch (error) {
      console.error('[Admin] Exception in fleet update:', error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSavingFleet(prev => ({ ...prev, [yachtId]: false }))
    }
  }

  // Upload image for destination
  const handleDestinationImageUpload = async (destinationId: string, file: File) => {
    const validationError = validateImage(file)
    if (validationError) {
      alert(validationError)
      return
    }

    setUploadingDestinationImages(prev => ({ ...prev, [destinationId]: true }))
    
    try {
      // Upload with compression (max 1920px)
      const imageUrl = await uploadImage(file, destinationId, false)
      
      if (imageUrl) {
        // Get current destination to append new image
        const currentDestination = destinations.find(d => d.id === destinationId)
        const currentImages = currentDestination?.image_urls || []
        const updatedImages = [...currentImages, imageUrl]

        const { error } = await supabase
          .from('destinations')
          // @ts-expect-error - Supabase type inference limitation with dynamic table updates
          .update({ image_urls: updatedImages })
          .eq('id', destinationId)

        if (error) {
          console.error('Error updating destination image URLs:', error)
          alert('Failed to save image URL')
        } else {
          // Update local state
          const updatedDestination = { ...currentDestination, image_urls: updatedImages } as Destination
          setDestinations(prev => prev.map(dest => 
            dest.id === destinationId ? updatedDestination : dest
          ))
          setDestinationsSuccess(prev => ({ ...prev, [destinationId]: 'Image uploaded successfully!' }))
          setTimeout(() => {
            setDestinationsSuccess(prev => {
              const newState = { ...prev }
              delete newState[destinationId]
              return newState
            })
          }, 3000)
        }
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error in destination image upload:', error)
      alert('An error occurred during upload')
    } finally {
      setUploadingDestinationImages(prev => ({ ...prev, [destinationId]: false }))
    }
  }

  // Create new destination
  const handleDestinationCreate = async (destinationData: Omit<Destination, 'id' | 'created_at' | 'updated_at'>) => {
    setCreatingDestination(true)
    
    try {
      const { data, error } = await supabase
        .from('destinations')
        // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
        .insert([{
          ...destinationData,
          image_urls: destinationData.image_urls || [],
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating destination:', error)
        alert('Failed to create destination')
      } else {
        // Add to local state
        setDestinations(prev => [...prev, data as Destination])
        setShowCreateDestinationForm(false)
        alert('Destination created successfully!')
      }
    } catch (error) {
      console.error('Error in destination create:', error)
      alert('An error occurred')
    } finally {
      setCreatingDestination(false)
    }
  }

  // Update destination
  const handleDestinationUpdate = async (destinationId: string, updates: Partial<Destination>) => {
    setSavingDestinations(prev => ({ ...prev, [destinationId]: true }))
    
    try {
      const { error } = await supabase
        .from('destinations')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update(updates)
        .eq('id', destinationId)

      if (error) {
        console.error('Error updating destination:', error)
        alert('Failed to update destination')
      } else {
        // Update local state
        setDestinations(prev => prev.map(dest => 
          dest.id === destinationId ? { ...dest, ...updates } : dest
        ))
        setDestinationsSuccess(prev => ({ ...prev, [destinationId]: 'Destination updated successfully!' }))
        setTimeout(() => {
          setDestinationsSuccess(prev => {
            const newState = { ...prev }
            delete newState[destinationId]
            return newState
          })
        }, 3000)
      }
    } catch (error) {
      console.error('Error in destination update:', error)
      alert('An error occurred')
    } finally {
      setSavingDestinations(prev => ({ ...prev, [destinationId]: false }))
    }
  }

  // Delete destination
  const handleDestinationDelete = async (destinationId: string) => {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return
    }

    setDeletingDestinations(prev => ({ ...prev, [destinationId]: true }))
    
    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destinationId)

      if (error) {
        console.error('Error deleting destination:', error)
        alert('Failed to delete destination')
      } else {
        // Remove from local state
        setDestinations(prev => prev.filter(dest => dest.id !== destinationId))
        alert('Destination deleted successfully!')
      }
    } catch (error) {
      console.error('Error in destination delete:', error)
      alert('An error occurred')
    } finally {
      setDeletingDestinations(prev => ({ ...prev, [destinationId]: false }))
    }
  }

  // ============ CULINARY EXPERIENCES CRUD ============
  
  // Upload media (image/video) for culinary
  const handleCulinaryMediaUpload = async (culinaryId: string, file: File) => {
    const validationError = validateImage(file)
    if (validationError) {
      alert(validationError)
      return
    }

    setUploadingCulinaryMedia(prev => ({ ...prev, [culinaryId]: true }))
    
    try {
      // Upload with compression (max 1920px)
      const imageUrl = await uploadImage(file, culinaryId, false)
      
      if (imageUrl) {
        const currentCulinary = culinary.find(c => c.id === culinaryId)
        const currentMedia = currentCulinary?.media_urls || []
        const updatedMedia = [...currentMedia, imageUrl]

        // Try to update with media_urls first (new column)
        let { error } = await supabase
          .from('culinary_experiences')
          // @ts-expect-error - Supabase type inference limitation with dynamic table updates
          .update({ 
            media_urls: updatedMedia
          })
          .eq('id', culinaryId)

        // If media_urls column doesn't exist, fallback to image_url
        if (error && (error.code === 'PGRST204' || error.message?.includes('media_urls'))) {
          console.warn('[Admin] media_urls column not found, using image_url as fallback')
          
          // Fallback: use image_url (single image) until migration is run
          const { error: fallbackError } = await supabase
            .from('culinary_experiences')
            // @ts-expect-error - Supabase type inference limitation with dynamic table updates
            .update({ 
              image_url: imageUrl // Use the new image as the main image
            })
            .eq('id', culinaryId)

          if (fallbackError) {
            console.error('[Admin] Error updating culinary image_url:', fallbackError)
            alert(`Failed to save image. Please run the database migration to enable multiple images.\n\nSee: SUPABASE_MIGRATION_INSTRUCTIONS.md\n\nError: ${fallbackError.message}`)
          } else {
            // Successfully saved to image_url (fallback mode)
            // Update local state with image_url
            setCulinary(prev => prev.map(c => 
              c.id === culinaryId ? { ...c, image_url: imageUrl, media_urls: [imageUrl] } : c
            ))
            setCulinarySuccess(prev => ({ ...prev, [culinaryId]: 'Image uploaded! (Using single image mode - run migration for multiple images)' }))
            setTimeout(() => {
              setCulinarySuccess(prev => {
                const newState = { ...prev }
                delete newState[culinaryId]
                return newState
              })
            }, 5000) // Show message longer so user sees the migration notice
          }
        } else if (error) {
          console.error('[Admin] Error updating culinary media:', error)
          console.error('[Admin] Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          alert(`Failed to save media URL: ${error.message || 'Unknown error'}`)
        } else {
          // Success with media_urls
          // Successfully saved to media_urls (multiple images mode)
          setCulinary(prev => prev.map(c => 
            c.id === culinaryId ? { ...c, media_urls: updatedMedia } : c
          ))
          setCulinarySuccess(prev => ({ ...prev, [culinaryId]: 'Media uploaded successfully!' }))
          setTimeout(() => {
            setCulinarySuccess(prev => {
              const newState = { ...prev }
              delete newState[culinaryId]
              return newState
            })
          }, 3000)
        }
      } else {
        alert('Failed to upload media')
      }
    } catch (error) {
      console.error('[Admin] Exception in culinary media upload:', error)
      alert(`An error occurred during upload: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploadingCulinaryMedia(prev => ({ ...prev, [culinaryId]: false }))
    }
  }

  // Create culinary experience
  const handleCulinaryCreate = async (data: Omit<CulinaryExperience, 'id' | 'created_at' | 'updated_at'>) => {
    setCreatingCulinary(true)
    
    try {
      const { data: result, error } = await supabase
        .from('culinary_experiences')
        // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
        .insert([{
          ...data,
          media_urls: data.media_urls || [],
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating culinary:', error)
        alert('Failed to create culinary experience')
      } else {
        setCulinary(prev => [...prev, result as CulinaryExperience])
        setShowCreateCulinaryForm(false)
        alert('Culinary experience created successfully!')
      }
    } catch (error) {
      console.error('Error in culinary create:', error)
      alert('An error occurred')
    } finally {
      setCreatingCulinary(false)
    }
  }

  // Update culinary experience
  const handleCulinaryUpdate = async (culinaryId: string, updates: Partial<CulinaryExperience>) => {
    setSavingCulinary(prev => ({ ...prev, [culinaryId]: true }))
    
    try {
      const { error } = await supabase
        .from('culinary_experiences')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update(updates)
        .eq('id', culinaryId)

      if (error) {
        console.error('Error updating culinary:', error)
        alert('Failed to update culinary experience')
      } else {
        setCulinary(prev => prev.map(c => 
          c.id === culinaryId ? { ...c, ...updates } : c
        ))
        setCulinarySuccess(prev => ({ ...prev, [culinaryId]: 'Culinary experience updated successfully!' }))
        setTimeout(() => {
          setCulinarySuccess(prev => {
            const newState = { ...prev }
            delete newState[culinaryId]
            return newState
          })
        }, 3000)
      }
    } catch (error) {
      console.error('Error in culinary update:', error)
      alert('An error occurred')
    } finally {
      setSavingCulinary(prev => ({ ...prev, [culinaryId]: false }))
    }
  }

  // Delete culinary experience
  const handleCulinaryDelete = async (culinaryId: string) => {
    if (!confirm('Are you sure you want to delete this culinary experience?')) {
      return
    }

    setDeletingCulinary(prev => ({ ...prev, [culinaryId]: true }))
    
    try {
      const { error } = await supabase
        .from('culinary_experiences')
        .delete()
        .eq('id', culinaryId)

      if (error) {
        console.error('Error deleting culinary:', error)
        alert('Failed to delete culinary experience')
      } else {
        setCulinary(prev => prev.filter(c => c.id !== culinaryId))
        alert('Culinary experience deleted successfully!')
      }
    } catch (error) {
      console.error('Error in culinary delete:', error)
      alert('An error occurred')
    } finally {
      setDeletingCulinary(prev => ({ ...prev, [culinaryId]: false }))
    }
  }

  // ============ CREW MEMBERS CRUD ============
  
  // Upload profile image for crew member
  const handleCrewImageUpload = async (crewId: string, file: File) => {
    const validationError = validateImage(file)
    if (validationError) {
      alert(validationError)
      return
    }

    setUploadingCrewImages(prev => ({ ...prev, [crewId]: true }))
    
    try {
      // Upload with compression (800px for profile images - thumbnails)
      const imageUrl = await uploadImage(file, crewId, true)
      
      if (imageUrl) {
        const { error } = await supabase
          .from('crew')
          // @ts-expect-error - Supabase type inference limitation with dynamic table updates
          .update({ image_url: imageUrl })
          .eq('id', crewId)

        if (error) {
          console.error('Error updating crew image:', error)
          alert('Failed to save image URL')
        } else {
          setCrew(prev => prev.map(m => 
            m.id === crewId ? { ...m, image_url: imageUrl } : m
          ))
          setCrewSuccess(prev => ({ ...prev, [crewId]: 'Image uploaded successfully!' }))
          setTimeout(() => {
            setCrewSuccess(prev => {
              const newState = { ...prev }
              delete newState[crewId]
              return newState
            })
          }, 3000)
        }
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error in crew image upload:', error)
      alert('An error occurred during upload')
    } finally {
      setUploadingCrewImages(prev => ({ ...prev, [crewId]: false }))
    }
  }

  // Create crew member
  const handleCrewCreate = async (data: Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>) => {
    setCreatingCrew(true)
    
    // Clean and validate data
    const cleanedData = {
      ...data,
      name: data.name?.trim() || '',
      role: data.role?.trim() || '',
      bio: data.bio?.trim() || null,
      order_index: data.order_index || 0,
      is_active: data.is_active ?? true,
    }
    
    // Validate required fields
    if (!cleanedData.name) {
      alert('Name is required')
      setCreatingCrew(false)
      return
    }
    if (!cleanedData.role) {
      alert('Role is required')
      setCreatingCrew(false)
      return
    }
    
    console.log('[Admin] Creating crew member:', cleanedData)
    
    try {
      const { data: result, error } = await supabase
        .from('crew')
        // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
        .insert([cleanedData])
        .select()
        .single()

      if (error) {
        console.error('[Admin] Error creating crew:', error)
        console.error('[Admin] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Failed to create crew member: ${error.message || 'Unknown error'}`)
      } else {
        setCrew(prev => [...prev, result as CrewMember])
        setShowCreateCrewForm(false)
        // Show success message
        const tempId = (result as any)?.id
        setCrewSuccess(prev => ({ ...prev, [tempId]: '✅ Crew member created successfully! You can now upload an image.' }))
        setTimeout(() => {
          setCrewSuccess(prev => {
            const newState = { ...prev }
            delete newState[tempId]
            return newState
          })
        }, 5000)
      }
    } catch (error) {
      console.error('[Admin] Exception in crew create:', error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCreatingCrew(false)
    }
  }

  // Update crew member
  const handleCrewUpdate = async (crewId: string, updates: Partial<CrewMember>) => {
    setSavingCrew(prev => ({ ...prev, [crewId]: true }))
    setCrewSuccess(prev => ({ ...prev, [crewId]: '' })) // Clear previous success message
    
    // Validate UUID before update
    if (!crewId || crewId.length !== 36) {
      console.error('[Admin] Invalid crew ID:', crewId)
      alert('Invalid crew member ID. Please refresh the page.')
      setSavingCrew(prev => ({ ...prev, [crewId]: false }))
      return
    }
    
    // Clean up updates - remove undefined values and ensure proper types
    const cleanedUpdates: Partial<CrewMember> = {}
    
    Object.keys(updates).forEach(key => {
      const value = updates[key as keyof CrewMember]
      // Skip undefined values
      if (value !== undefined) {
        // Skip role_description if it doesn't exist in database (column not in schema)
        if (key === 'role_description') {
          // Don't include role_description in update - column doesn't exist in database
          return
        }
        // Ensure order_index is a number
        if (key === 'order_index') {
          cleanedUpdates.order_index = typeof value === 'string' ? parseInt(value as string) || 0 : (value as number) || 0
        }
        // Ensure is_active is a boolean
        else if (key === 'is_active') {
          if (typeof value === 'boolean') {
            cleanedUpdates.is_active = value
          } else if (typeof value === 'string') {
            cleanedUpdates.is_active = value === 'true'
          } else {
            cleanedUpdates.is_active = Boolean(value)
          }
        }
        // Handle string fields - trim whitespace
        else if (key === 'name' || key === 'role' || key === 'bio') {
          const stringValue = typeof value === 'string' ? value.trim() : (value ? String(value) : null)
          cleanedUpdates[key] = (stringValue || null) as any
        }
        // Keep other values as-is (image_url)
        else {
          cleanedUpdates[key as keyof CrewMember] = value as any
        }
      }
    })
    
    console.log('[Admin] Updating crew member:', crewId, cleanedUpdates)
    
    try {
      const { data, error } = await supabase
        .from('crew')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update(cleanedUpdates)
        .eq('id', crewId)
        .select()
        .single()

      if (error) {
        console.error('[Admin] Error updating crew:', error)
        console.error('[Admin] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        console.error('[Admin] Crew ID:', crewId)
        console.error('[Admin] Update payload:', cleanedUpdates)
        setCrewSuccess(prev => ({ ...prev, [crewId]: `❌ Failed to update: ${error.message || 'Unknown error'}` }))
        setTimeout(() => {
          setCrewSuccess(prev => {
            const newState = { ...prev }
            delete newState[crewId]
            return newState
          })
        }, 5000)
      } else {
        // Update local state with the returned data
        setCrew(prev => prev.map(m => 
          m.id === crewId ? { ...m, ...(data as any) } : m
        ))
        setCrewSuccess(prev => ({ ...prev, [crewId]: '✅ Crew member updated successfully! Changes will appear on the public site.' }))
        setTimeout(() => {
          setCrewSuccess(prev => {
            const newState = { ...prev }
            delete newState[crewId]
            return newState
          })
        }, 5000)
      }
    } catch (error) {
      console.error('[Admin] Exception in crew update:', error)
      setCrewSuccess(prev => ({ ...prev, [crewId]: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }))
      setTimeout(() => {
        setCrewSuccess(prev => {
          const newState = { ...prev }
          delete newState[crewId]
          return newState
        })
      }, 5000)
    } finally {
      setSavingCrew(prev => ({ ...prev, [crewId]: false }))
    }
  }

  // Delete crew member
  const handleCrewDelete = async (crewId: string) => {
    if (!confirm('Are you sure you want to delete this crew member?')) {
      return
    }

    setDeletingCrew(prev => ({ ...prev, [crewId]: true }))
    
    try {
      const { error } = await supabase
        .from('crew')
        .delete()
        .eq('id', crewId)

      if (error) {
        console.error('Error deleting crew:', error)
        alert('Failed to delete crew member')
      } else {
        setCrew(prev => prev.filter(m => m.id !== crewId))
        alert('Crew member deleted successfully!')
      }
    } catch (error) {
      console.error('Error in crew delete:', error)
      alert('An error occurred')
    } finally {
      setDeletingCrew(prev => ({ ...prev, [crewId]: false }))
    }
  }

  // ==================== STATS MANAGEMENT ====================
  
  // Create stat
  const handleStatCreate = async (stat: Omit<Stat, 'id' | 'created_at' | 'updated_at'>) => {
    setCreatingStat(true)
    try {
      const { data, error } = await supabase
        .from('stats')
        // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
        .insert({
          ...stat,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating stat:', error)
        alert('Failed to create stat')
      } else {
        setStats(prev => [...prev, data as Stat])
        setShowCreateStatForm(false)
        alert('Stat created successfully!')
      }
    } catch (error) {
      console.error('Error in stat create:', error)
      alert('An error occurred')
    } finally {
      setCreatingStat(false)
    }
  }

  // Update stat
  const handleStatUpdate = async (statId: string, updates: Partial<Stat>) => {
    setSavingStats(prev => ({ ...prev, [statId]: true }))
    try {
      // Clean updates - remove undefined values and validate
      const cleanedUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedUpdates[key] = value
        }
      })

      // Validate UUID format
      if (!statId || typeof statId !== 'string' || statId.length !== 36) {
        console.error('[Admin] Invalid stat ID format:', statId)
        alert('Invalid stat ID. Please refresh the page.')
        return
      }

      const { data, error } = await supabase
        .from('stats')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update(cleanedUpdates)
        .eq('id', statId)
        .select()
        .single()

      if (error) {
        console.error('[Admin] Error updating stat:', {
          statId,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        
        let errorMessage = 'Failed to update stat'
        if (error.code === 'PGRST204') {
          errorMessage = 'Stat not found. Please refresh the page.'
        } else if (error.message) {
          errorMessage = `Failed to update stat: ${error.message}`
        }
        
        alert(errorMessage)
      } else {
        setStats(prev => prev.map(stat => stat.id === statId ? { ...stat, ...updates, ...(data as any) } : stat))
        setStatsSuccess(prev => ({ ...prev, [statId]: 'Stat updated successfully!' }))
        setTimeout(() => {
          setStatsSuccess(prev => {
            const newState = { ...prev }
            delete newState[statId]
            return newState
          })
        }, 3000)
      }
    } catch (error) {
      console.error('[Admin] Exception in stat update:', error)
      alert('An unexpected error occurred while updating the stat')
    } finally {
      setSavingStats(prev => ({ ...prev, [statId]: false }))
    }
  }

  // Delete stat
  const handleStatDelete = async (statId: string) => {
    if (!confirm('Are you sure you want to delete this stat?')) {
      return
    }

    setDeletingStats(prev => ({ ...prev, [statId]: true }))
    try {
      const { error } = await supabase
        .from('stats')
        .delete()
        .eq('id', statId)

      if (error) {
        console.error('Error deleting stat:', error)
        alert('Failed to delete stat')
      } else {
        setStats(prev => prev.filter(stat => stat.id !== statId))
        alert('Stat deleted successfully!')
      }
    } catch (error) {
      console.error('Error in stat delete:', error)
      alert('An error occurred')
    } finally {
      setDeletingStats(prev => ({ ...prev, [statId]: false }))
    }
  }

  // ==================== REVIEWS MANAGEMENT ====================
  
  // Create review
  const handleReviewCreate = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
    setCreatingReview(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
        .insert({
          ...review,
          review_date: review.review_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating review:', error)
        alert('Failed to create review')
      } else {
        setReviews(prev => [...prev, data as Review])
        setShowCreateReviewForm(false)
        alert('Review created successfully!')
      }
    } catch (error) {
      console.error('Error in review create:', error)
      alert('An error occurred')
    } finally {
      setCreatingReview(false)
    }
  }

  // Update review
  const handleReviewUpdate = async (reviewId: string, updates: Partial<Review>) => {
    setSavingReviews(prev => ({ ...prev, [reviewId]: true }))
    try {
      const { error } = await supabase
        .from('reviews')
        // @ts-expect-error - Supabase type inference limitation with dynamic table updates
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', reviewId)

      if (error) {
        console.error('Error updating review:', error)
        alert('Failed to update review')
      } else {
        setReviews(prev => prev.map(review => review.id === reviewId ? { ...review, ...updates } : review))
        setReviewsSuccess(prev => ({ ...prev, [reviewId]: 'Review updated successfully!' }))
        setTimeout(() => {
          setReviewsSuccess(prev => {
            const newState = { ...prev }
            delete newState[reviewId]
            return newState
          })
        }, 3000)
      }
    } catch (error) {
      console.error('Error in review update:', error)
      alert('An error occurred')
    } finally {
      setSavingReviews(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  // Delete review
  const handleReviewDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    setDeletingReviews(prev => ({ ...prev, [reviewId]: true }))
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        console.error('Error deleting review:', error)
        alert('Failed to delete review')
      } else {
        setReviews(prev => prev.filter(review => review.id !== reviewId))
        alert('Review deleted successfully!')
      }
    } catch (error) {
      console.error('Error in review delete:', error)
      alert('An error occurred')
    } finally {
      setDeletingReviews(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  // Update site settings
  const handleSettingsUpdate = async (updates: Record<string, string>) => {
    setSavingSettings(true)
    setSettingsSuccess('') // Clear previous success message
    
    // Updating site_settings in database
    
    try {
      // Update or insert each setting
      // First check if key exists, then update or insert accordingly
      const promises = Object.entries(updates).map(async ([key, value]) => {
        try {
          const settingValue = value || '' // Ensure value is never null
          
          // Processing setting
          
          // Try upsert directly - this will insert if not exists, update if exists
          const result = await supabase
            .from('site_settings')
            // @ts-expect-error - Supabase type inference limitation with dynamic table upserts
            .upsert(
              {
                key: key,
                value: settingValue,
                updated_at: new Date().toISOString()
              },
              {
                onConflict: 'key',
                ignoreDuplicates: false
              }
            )
            .select()
          
          if (result.error) {
            console.error(`[Admin] Error upserting setting ${key}:`, result.error)
            console.error(`[Admin] Error details:`, JSON.stringify(result.error, null, 2))
            
            // If upsert fails, try insert
            const insertResult = await supabase
              .from('site_settings')
              // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
              .insert({
                key: key,
                value: settingValue,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
            
            if (insertResult.error) {
              console.error(`[Admin] Error inserting setting ${key}:`, insertResult.error)
              return { key, success: false, error: insertResult.error }
            }
            
            // Successfully inserted setting
            return { key, success: true, data: insertResult.data }
          }
          
          // Successfully upserted setting
          return { key, success: true, data: result.data }
        } catch (error: any) {
          console.error(`[Admin] Exception handling setting ${key}:`, error)
          return { key, success: false, error: error }
        }
      })

      const results = await Promise.all(promises)
      
      // Check for errors
      const failed = results.filter(r => !r.success)
      const succeeded = results.filter(r => r.success)
      
      if (failed.length > 0) {
        console.error('[Admin] Some settings failed to update:', failed)
        // Log detailed error information
        failed.forEach(({ key, error }) => {
          console.error(`[Admin] Setting ${key} error:`, error)
        })
        setSettingsSuccess(`⚠️ ${failed.length} setting(s) failed to update. ${succeeded.length} setting(s) saved successfully. Check console for details.`)
        setTimeout(() => setSettingsSuccess(''), 5000)
      } else {
        // All site settings updated successfully
        // Update local state
        setSiteSettings(prev => ({ ...prev, ...updates }))
        setSettingsSuccess('✅ Settings saved successfully!')
        setTimeout(() => setSettingsSuccess(''), 3000)
      }
    } catch (error) {
      console.error('[Admin] Error updating settings:', error)
      setSettingsSuccess('❌ Failed to update settings. Please try again.')
      setTimeout(() => setSettingsSuccess(''), 5000)
    } finally {
      setSavingSettings(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-luxury-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl font-bold">Admin Panel</h1>
            <Link href="/" className="text-white hover:text-luxury-gold transition-colors">
              ← Back to Site
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'settings', label: 'Site Settings' },
              { id: 'fleet', label: 'Fleet' },
              { id: 'destinations', label: 'Destinations' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'stats', label: 'Stats' },
              { id: 'culinary', label: 'Culinary' },
              { id: 'crew', label: 'Crew' },
              { id: 'inquiries', label: 'Booking Inquiries' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-luxury-blue border-b-2 border-luxury-blue'
                    : 'text-gray-600 hover:text-luxury-blue'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && (
            <AdminDashboard />
          )}

          {activeTab === 'inquiries' && (
            <div>
              <h2 className="text-2xl font-bold text-luxury-blue mb-6">Booking Inquiries</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Dates</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">{inquiry.name}</td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${inquiry.email}`} className="text-luxury-blue hover:underline">
                            {inquiry.email}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          {inquiry.start_date && inquiry.end_date
                            ? `${new Date(inquiry.start_date).toLocaleDateString()} - ${new Date(inquiry.end_date).toLocaleDateString()}`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            inquiry.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-luxury-blue mb-6">Site Settings</h2>
              
              {settingsSuccess && (
                <div className={`mb-4 p-4 border rounded-lg ${
                  settingsSuccess.includes('✅') 
                    ? 'bg-green-50 border-green-200' 
                    : settingsSuccess.includes('⚠️')
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={
                    settingsSuccess.includes('✅')
                      ? 'text-green-800'
                      : settingsSuccess.includes('⚠️')
                      ? 'text-yellow-800'
                      : 'text-red-800'
                  }>{settingsSuccess}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Section Visibility Controls */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Section Visibility</h3>
                  <p className="text-sm text-gray-600 mb-4">Control which sections are visible on the public website.</p>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'section_journey_visible', label: 'Our Journey in Numbers', description: 'Statistics section' },
                      { key: 'section_mission_visible', label: 'Our Mission', description: 'Mission statement section' },
                      { key: 'section_crew_visible', label: 'Expert Crew', description: 'Crew members section' },
                      { key: 'section_culinary_visible', label: 'Culinary Excellence', description: 'Culinary experiences section' },
                      { key: 'section_contact_visible', label: 'Contact Section', description: 'Contact information section' },
                    ].map((section) => {
                      const isVisible = siteSettings[section.key] === 'true'
                      return (
                        <div key={section.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={isVisible}
                                  onChange={async (e) => {
                                    const newValue = e.target.checked ? 'true' : 'false'
                                    await handleSettingsUpdate({ [section.key]: newValue })
                                  }}
                                  className="w-5 h-5 text-luxury-blue border-gray-300 rounded focus:ring-2 focus:ring-luxury-blue focus:ring-offset-2 cursor-pointer"
                                />
                                <div className="flex flex-col">
                                  <span className={`text-sm font-semibold ${isVisible ? 'text-green-600' : 'text-gray-600'}`}>
                                    {isVisible ? '✓ Published' : '✗ Hidden'} - {section.label}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-0.5">
                                    {section.description}
                                  </span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Hero Section Content */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Hero Section Content</h3>
                  <HeroSettingsForm
                    settings={siteSettings}
                    onUpdate={handleSettingsUpdate}
                    saving={savingSettings}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div>
              <h2 className="text-2xl font-bold text-luxury-blue mb-6">Fleet Management</h2>
              
              {fleet.length === 0 ? (
                <p className="text-gray-600">No yachts in the fleet yet.</p>
              ) : (
                <div className="space-y-8">
                  {fleet.map((yacht) => (
                    <FleetEditForm
                      key={yacht.id}
                      yacht={yacht}
                      onImageUpload={handleImageUpload}
                      onMultipleImageUpload={handleMultipleImageUpload}
                      onRemoveImage={handleRemoveFleetImage}
                      onReorderImages={handleReorderFleetImages}
                      onUpdate={handleFleetUpdate}
                      uploadingImage={uploadingImages[yacht.id] || false}
                      saving={savingFleet[yacht.id] || false}
                      successMessage={fleetSuccess[yacht.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'destinations' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-luxury-blue mb-2">Destination Management</h2>
                <p className="text-gray-600 mb-4">Manage your charter destinations with full CRUD operations, YouTube videos, and localized content.</p>
                <Link
                  href="/admin/destinations"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors shadow-lg"
                >
                  <span>Open Destination Management</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'culinary' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-luxury-blue">Culinary Experiences Management</h2>
                <button
                  onClick={() => setShowCreateCulinaryForm(!showCreateCulinaryForm)}
                  className="px-4 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showCreateCulinaryForm ? 'Cancel' : 'Create New Experience'}
                </button>
              </div>

              {showCreateCulinaryForm && (
                <div className="mb-6">
                  <CulinaryEditForm
                    experience={null}
                    onSave={handleCulinaryCreate}
                    onCancel={() => setShowCreateCulinaryForm(false)}
                    saving={creatingCulinary}
                    onMediaUpload={handleCulinaryMediaUpload}
                    uploadingMedia={false}
                  />
                </div>
              )}

              {culinary.length === 0 ? (
                <p className="text-gray-600">No culinary experiences yet. Click "Create New Experience" to add one.</p>
              ) : (
                <div className="space-y-8">
                  {culinary.map((experience) => (
                    <CulinaryEditForm
                      key={experience.id}
                      experience={experience}
                      onSave={(updates) => handleCulinaryUpdate(experience.id, updates)}
                      onDelete={() => handleCulinaryDelete(experience.id)}
                      saving={savingCulinary[experience.id] || false}
                      deleting={deletingCulinary[experience.id] || false}
                      successMessage={culinarySuccess[experience.id]}
                      onMediaUpload={handleCulinaryMediaUpload}
                      uploadingMedia={uploadingCulinaryMedia[experience.id] || false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'crew' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-luxury-blue">Crew Members Management</h2>
                <button
                  onClick={() => setShowCreateCrewForm(!showCreateCrewForm)}
                  className="px-4 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showCreateCrewForm ? 'Cancel' : 'Create New Member'}
                </button>
              </div>

              {showCreateCrewForm && (
                <div className="mb-6">
                  <CrewEditForm
                    member={null}
                    onSave={handleCrewCreate}
                    onCancel={() => setShowCreateCrewForm(false)}
                    saving={creatingCrew}
                    onImageUpload={handleCrewImageUpload}
                    uploadingImage={false}
                  />
                </div>
              )}

              {crew.length === 0 ? (
                <p className="text-gray-600">No crew members yet. Click "Create New Member" to add one.</p>
              ) : (
                <div className="space-y-8">
                  {crew.map((member) => (
                    <CrewEditForm
                      key={member.id}
                      member={member}
                      onSave={(updates) => handleCrewUpdate(member.id, updates)}
                      onDelete={() => handleCrewDelete(member.id)}
                      saving={savingCrew[member.id] || false}
                      deleting={deletingCrew[member.id] || false}
                      successMessage={crewSuccess[member.id]}
                      onImageUpload={handleCrewImageUpload}
                      uploadingImage={uploadingCrewImages[member.id] || false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-luxury-blue">Stats Management</h2>
                <button
                  onClick={() => setShowCreateStatForm(!showCreateStatForm)}
                  className="px-4 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showCreateStatForm ? 'Cancel' : 'Create New Stat'}
                </button>
              </div>
              
              {/* Bulk Translation Section */}
              <div className="mb-12 border-t border-gray-200 pt-8">
                <h3 className="text-xl font-bold text-luxury-blue mb-4">Bulk Translation (AI-Powered)</h3>
                <BulkTranslationPanel />
              </div>


              {showCreateStatForm && (
                <div className="mb-6">
                  <StatEditForm
                    stat={null}
                    onSave={handleStatCreate}
                    onCancel={() => setShowCreateStatForm(false)}
                    saving={creatingStat}
                  />
                </div>
              )}

              {stats.length === 0 ? (
                <p className="text-gray-600">No stats yet. Click "Create New Stat" to add one.</p>
              ) : (
                <div className="space-y-8">
                  {stats.map((stat) => (
                    <StatEditForm
                      key={stat.id}
                      stat={stat}
                      onSave={(updates) => handleStatUpdate(stat.id, updates)}
                      onDelete={() => handleStatDelete(stat.id)}
                      saving={savingStats[stat.id] || false}
                      deleting={deletingStats[stat.id] || false}
                      successMessage={statsSuccess[stat.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-luxury-blue">Reviews Management</h2>
                <button
                  onClick={() => setShowCreateReviewForm(!showCreateReviewForm)}
                  className="px-4 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showCreateReviewForm ? 'Cancel' : 'Create New Review'}
                </button>
              </div>

              {showCreateReviewForm && (
                <div className="mb-6">
                  <ReviewEditForm
                    review={null}
                    onSave={handleReviewCreate}
                    onCancel={() => setShowCreateReviewForm(false)}
                    saving={creatingReview}
                  />
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Click "Create New Review" to add one.</p>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <ReviewEditForm
                      key={review.id}
                      review={review}
                      onSave={(updates) => handleReviewUpdate(review.id, updates)}
                      onDelete={() => handleReviewDelete(review.id)}
                      saving={savingReviews[review.id] || false}
                      deleting={deletingReviews[review.id] || false}
                      successMessage={reviewsSuccess[review.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Video Preview Component
function VideoPreview({ url }: { url: string }) {
  const youtubeId = extractYouTubeId(url)
  const isYouTube = !!youtubeId

  if (isYouTube) {
    return (
      <div className="relative max-w-xl aspect-video bg-black rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <iframe
          src={buildYouTubeEmbedUrl(youtubeId, {
            autoplay: false,
            mute: true,
            loop: true,
            controls: true,
          })}
          title="Hero Video Preview"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  // Direct video URL
  return (
    <div className="relative max-w-xl aspect-video bg-black rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <video
        src={url}
        controls
        muted
        loop
        playsInline
        className="w-full h-full object-contain"
        onError={(e) => {
          // Handle video load errors gracefully
          const target = e.target as HTMLVideoElement
          target.style.display = 'none'
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

// Hero Settings Form Component
function HeroSettingsForm({ 
  settings, 
  onUpdate, 
  saving 
}: { 
  settings: Record<string, string>
  onUpdate: (updates: Record<string, string>) => void
  saving: boolean
}) {
  const [heroTitle, setHeroTitle] = useState(settings.hero_title || '')
  const [heroSubtitle, setHeroSubtitle] = useState(settings.hero_subtitle || '')
  const [heroVideoUrl, setHeroVideoUrl] = useState(settings.hero_video_url || '')

  useEffect(() => {
    setHeroTitle(settings.hero_title || '')
    setHeroSubtitle(settings.hero_subtitle || '')
    setHeroVideoUrl(settings.hero_video_url || '')
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_video_url: heroVideoUrl,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="hero_title" className="block text-sm font-medium text-gray-700 mb-2">
          Hero Title
        </label>
        <input
          type="text"
          id="hero_title"
          value={heroTitle}
          onChange={(e) => setHeroTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          placeholder="Experience Luxury at Sea"
        />
      </div>

      <div>
        <label htmlFor="hero_subtitle" className="block text-sm font-medium text-gray-700 mb-2">
          Hero Subtitle
        </label>
        <textarea
          id="hero_subtitle"
          value={heroSubtitle}
          onChange={(e) => setHeroSubtitle(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          placeholder="Premium Yacht Charters in the Balearic Islands & Costa Blanca"
        />
      </div>

      <div>
        <label htmlFor="hero_video_url" className="block text-sm font-medium text-gray-700 mb-2">
          Hero Video URL
        </label>
        <input
          type="url"
          id="hero_video_url"
          value={heroVideoUrl}
          onChange={(e) => setHeroVideoUrl(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          placeholder="https://example.com/video.mp4 or YouTube URL"
        />
        <p className="mt-1 text-sm text-gray-500">
          Paste a direct video URL or YouTube link for the homepage background
        </p>
        
        {/* Video Preview */}
        <div className="mt-4">
          {saving ? (
            <div className="relative max-w-xl aspect-video bg-gray-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin h-8 w-8 text-luxury-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-600">Saving...</span>
              </div>
            </div>
          ) : heroVideoUrl ? (
            <VideoPreview url={heroVideoUrl} />
          ) : (
            <div className="relative max-w-xl aspect-video bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">No video uploaded</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {saving ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </form>
  )
}

// Description Preview Modal Component
function DescriptionPreviewModal({
  description,
  onApply,
  onClose,
}: {
  description: {
    headline: string
    description: string
    highlights: string[]
    tagline: string
  }
  onApply: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-luxury-blue">Generated Description Preview</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Preview Content */}
          <div className="space-y-6 mb-6">
            {/* Headline */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Headline</h4>
              <h3 className="font-serif text-2xl font-semibold text-luxury-blue">
                {description.headline}
              </h3>
            </div>
            
            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Description</h4>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {description.description}
              </p>
            </div>
            
            {/* Highlights */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Key Highlights</h4>
              <ul className="space-y-2 list-none">
                {description.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-luxury-blue mt-2"></span>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Tagline */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Tagline</h4>
              <div className="p-4 bg-gradient-to-r from-luxury-blue/5 to-luxury-gold/5 border-l-4 border-luxury-blue rounded-lg">
                <p className="text-lg italic text-gray-800 font-serif">
                  {description.tagline}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Apply to Form
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fleet Edit Form Component
function FleetEditForm({
  yacht,
  onImageUpload,
  onMultipleImageUpload,
  onRemoveImage,
  onReorderImages,
  onUpdate,
  uploadingImage,
  saving,
  successMessage
}: {
  yacht: Fleet
  onImageUpload: (yachtId: string, file: File) => void
  onMultipleImageUpload: (yachtId: string, files: File[], onProgress?: (progress: number) => void) => Promise<void>
  onRemoveImage: (yachtId: string, imageUrl: string) => void
  onReorderImages?: (yachtId: string, newOrder: string[]) => void
  onUpdate: (yachtId: string, updates: Partial<Fleet>) => void
  uploadingImage: boolean
  saving: boolean
  successMessage?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(yacht.name || '')
  const [lowSeasonPrice, setLowSeasonPrice] = useState(yacht.low_season_price?.toString() || '')
  const [mediumSeasonPrice, setMediumSeasonPrice] = useState(yacht.medium_season_price?.toString() || '')
  const [highSeasonPrice, setHighSeasonPrice] = useState(yacht.high_season_price?.toString() || '')
  
  // Technical Specs
  const [length, setLength] = useState(yacht.length?.toString() || '')
  const [lengthUnit, setLengthUnit] = useState('m')
  const [beam, setBeam] = useState(yacht.technical_specs?.beam?.toString() || '')
  const [beamUnit, setBeamUnit] = useState('m')
  const [draft, setDraft] = useState(yacht.technical_specs?.draft?.toString() || '')
  const [draftUnit, setDraftUnit] = useState('m')
  const [engines, setEngines] = useState(yacht.technical_specs?.engines || '')
  const [capacity, setCapacity] = useState(yacht.capacity?.toString() || '')
  const [cabins, setCabins] = useState(yacht.cabins?.toString() || '')
  const [toilets, setToilets] = useState(yacht.toilets?.toString() || '')
  
  // Amenities
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    ac: yacht.amenities?.ac || false,
    watermaker: yacht.amenities?.watermaker || false,
    generator: yacht.amenities?.generator || false,
    flybridge: yacht.amenities?.flybridge || false,
    heating: yacht.amenities?.heating || false,
    teak_deck: yacht.amenities?.teak_deck || false,
    full_batten: yacht.amenities?.full_batten || false,
    folding_table: yacht.amenities?.folding_table || false,
    fridge: yacht.amenities?.fridge || false,
    dinghy: yacht.amenities?.dinghy || false,
    water_entertainment: yacht.amenities?.water_entertainment || false,
  })
  
  // Description - Load from i18n based on current locale
  const currentLocale = useLocale() as Locale
  const [description, setDescription] = useState(() => 
    getDescriptionForLocale(yacht, currentLocale)
  )
  const [shortDescription, setShortDescription] = useState(() => 
    getShortDescriptionForLocale(yacht, currentLocale)
  )
  
  // Update form when yacht data or locale changes
  useEffect(() => {
    const newDescription = getDescriptionForLocale(yacht, currentLocale)
    const newShortDescription = getShortDescriptionForLocale(yacht, currentLocale)
    setDescription(newDescription)
    setShortDescription(newShortDescription)
  }, [yacht.id, currentLocale, yacht.description_i18n, yacht.short_description_i18n, yacht.description, yacht.short_description])
  
  // Combine main_image_url and gallery_images into a single images array
  const getCombinedImages = () => {
    const gallery = yacht.gallery_images || []
    const main = yacht.main_image_url
    if (main && !gallery.includes(main)) {
      return [main, ...gallery]
    }
    return gallery.length > 0 ? gallery : (main ? [main] : [])
  }
  
  const [images, setImages] = useState<string[]>(getCombinedImages())
  
  // AI Description Generator states
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState<{
    headline: string
    description: string
    highlights: string[]
    tagline: string
  } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setName(yacht.name || '')
    setLowSeasonPrice(yacht.low_season_price?.toString() || '')
    setMediumSeasonPrice(yacht.medium_season_price?.toString() || '')
    setHighSeasonPrice(yacht.high_season_price?.toString() || '')
    setLength(yacht.length?.toString() || '')
    setBeam(yacht.technical_specs?.beam?.toString() || '')
    setDraft(yacht.technical_specs?.draft?.toString() || '')
    setEngines(yacht.technical_specs?.engines || '')
    setCapacity(yacht.capacity?.toString() || '')
    setCabins(yacht.cabins?.toString() || '')
    setToilets(yacht.toilets?.toString() || '')
    setDescription(yacht.description || '')
    setShortDescription(yacht.short_description || '')
    setAmenities({
      ac: yacht.amenities?.ac || false,
      watermaker: yacht.amenities?.watermaker || false,
      generator: yacht.amenities?.generator || false,
      flybridge: yacht.amenities?.flybridge || false,
      heating: yacht.amenities?.heating || false,
      teak_deck: yacht.amenities?.teak_deck || false,
      full_batten: yacht.amenities?.full_batten || false,
      folding_table: yacht.amenities?.folding_table || false,
      fridge: yacht.amenities?.fridge || false,
      dinghy: yacht.amenities?.dinghy || false,
      water_entertainment: yacht.amenities?.water_entertainment || false,
    })
    setImages(getCombinedImages())
  }, [yacht])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build technical_specs object - preserve existing fields
    const technicalSpecs = {
      ...(yacht.technical_specs || {}),
      ...(beam ? { beam: `${beam}${beamUnit}` } : {}),
      ...(draft ? { draft: `${draft}${draftUnit}` } : {}),
      ...(engines ? { engines } : {}),
    }
    
    // Prepare update object with locale-aware i18n updates
    const updates: Partial<Fleet> = {
      name,
      // Use JSONB i18n columns with smart patch (preserves other locales)
      ...buildI18nUpdate('description_i18n', yacht.description_i18n, currentLocale, description || null),
      ...buildI18nUpdate('short_description_i18n', yacht.short_description_i18n, currentLocale, shortDescription || null),
      low_season_price: lowSeasonPrice ? parseFloat(lowSeasonPrice) : null,
      medium_season_price: mediumSeasonPrice ? parseFloat(mediumSeasonPrice) : null,
      high_season_price: highSeasonPrice ? parseFloat(highSeasonPrice) : null,
      length: length ? parseFloat(length) : null,
      capacity: capacity ? parseInt(capacity) : null,
      cabins: cabins ? parseInt(cabins) : null,
      toilets: toilets ? parseInt(toilets) : null,
      technical_specs: technicalSpecs,
      amenities: amenities,
      main_image_url: images[0] || null, // First image as main
      gallery_images: images, // Save all images to gallery_images array
    }
    
    onUpdate(yacht.id, updates)
  }
  
  const toggleAmenity = (key: string) => {
    setAmenities(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  
  // Generate AI description
  const handleGenerateDescription = async () => {
    setIsGenerating(true)
    setGeneratedDescription(null)
    
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale: currentLocale, // Pass current locale for multi-language generation
          yachtName: name || yacht.name,
          length: length ? parseFloat(length) : yacht.length,
          capacity: capacity ? parseInt(capacity) : yacht.capacity,
          cabins: cabins ? parseInt(cabins) : yacht.cabins,
          toilets: toilets ? parseInt(toilets) : yacht.toilets,
          amenities: amenities,
          technicalSpecs: {
            beam: beam ? `${beam}${beamUnit}` : yacht.technical_specs?.beam,
            draft: draft ? `${draft}${draftUnit}` : yacht.technical_specs?.draft,
            engines: engines || yacht.technical_specs?.engines,
          },
        }),
      })
      
      const data = await response.json()
      
      // API response received
      
      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to generate description'
        console.error('[Admin] API error response:', { status: response.status, error: errorMessage, fullData: data })
        throw new Error(errorMessage)
      }
      
      if (data.success && data.description) {
        // Successfully received description
        setGeneratedDescription(data.description)
        setShowPreview(true)
      } else {
        console.error('[Admin] Invalid response structure:', data)
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('[Admin] Error generating description:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate description. Please check your Gemini API key configuration.'
      alert(`Error: ${errorMessage}\n\nPlease check:\n1. GEMINI_API_KEY is set in .env.local\n2. Your API key is valid\n3. You have available quota\n4. Check the server console for detailed error logs`)
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Apply generated description - sets the current locale's text
  const handleApplyDescription = () => {
    if (!generatedDescription) return
    
    // Build the full description text
    const fullDescription = `${generatedDescription.headline}\n\n${generatedDescription.description}\n\nKey Highlights:\n${generatedDescription.highlights.map(h => `• ${h}`).join('\n')}\n\n${generatedDescription.tagline}`
    
    // Set description for current locale (will be saved to description_i18n[currentLocale] on submit)
    setDescription(fullDescription)
    setShortDescription(generatedDescription.description.split('\n')[0] || generatedDescription.description.substring(0, 150) + '...')
    
    setShowPreview(false)
    setGeneratedDescription(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(yacht.id, file)
      // Clear the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      const newImages = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex >= 0 && newIndex < newImages.length) {
        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
      }
      return newImages
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{yacht.name}</h3>
          {images.length > 0 && (
            <div className="mt-2 w-32 h-24 relative rounded border border-gray-200 overflow-hidden">
              <Image
                src={images[0]}
                alt={yacht.name}
                fill
                sizes="128px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`name-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
            Yacht Name
          </label>
          <input
            type="text"
            id={`name-${yacht.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Yacht Gallery Images ({images.length} total)
          </label>
          
          {/* Drag & Drop Upload Component */}
          <DragDropImageUpload
            onUpload={async (files, onProgress) => {
              await onMultipleImageUpload(yacht.id, files, onProgress)
            }}
            maxSize={10}
            isThumbnail={false}
            existingImages={images}
            onRemoveExisting={(imageUrl) => onRemoveImage(yacht.id, imageUrl)}
            onReorder={onReorderImages ? (newOrder) => {
              // Update local state immediately for better UX
              setImages(newOrder)
              // Call parent handler to save to database
              onReorderImages(yacht.id, newOrder)
            } : undefined}
            className="mb-6"
          />

          {/* Legacy single file upload (hidden but kept for compatibility) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploadingImage}
            className="hidden"
          />
        </div>

        {/* Description Fields */}
        <div>
          <label htmlFor={`short-description-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
            Short Description (for cards)
          </label>
          <textarea
            id={`short-description-${yacht.id}`}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Brief description shown on fleet cards"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={`description-${yacht.id}`} className="block text-sm font-medium text-gray-700">
              Full Description (for detail page)
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-luxury-blue to-luxury-gold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Luxury Description
                </>
              )}
            </button>
          </div>
          <textarea
            id={`description-${yacht.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Detailed description for the yacht detail page"
          />
        </div>
        
        {/* Preview Modal */}
        {showPreview && generatedDescription && (
          <DescriptionPreviewModal
            description={generatedDescription}
            onApply={handleApplyDescription}
            onClose={() => {
              setShowPreview(false)
              setGeneratedDescription(null)
            }}
          />
        )}

        {/* Technical Specifications */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Technical Specifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor={`length-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Length
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id={`length-${yacht.id}`}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  step="0.01"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="11.97"
                />
                <select
                  value={lengthUnit}
                  onChange={(e) => setLengthUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                >
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={`beam-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Beam
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id={`beam-${yacht.id}`}
                  value={beam}
                  onChange={(e) => setBeam(e.target.value)}
                  step="0.01"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="6.76"
                />
                <select
                  value={beamUnit}
                  onChange={(e) => setBeamUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                >
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={`draft-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Draft
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id={`draft-${yacht.id}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  step="0.01"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  placeholder="1.20"
                />
                <select
                  value={draftUnit}
                  onChange={(e) => setDraftUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                >
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={`engines-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Engines
              </label>
              <input
                type="text"
                id={`engines-${yacht.id}`}
                value={engines}
                onChange={(e) => setEngines(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Twin 1200hp"
              />
            </div>

            <div>
              <label htmlFor={`capacity-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Capacity (Guests)
              </label>
              <input
                type="number"
                id={`capacity-${yacht.id}`}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="12"
              />
            </div>

            <div>
              <label htmlFor={`cabins-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Cabins
              </label>
              <input
                type="number"
                id={`cabins-${yacht.id}`}
                value={cabins}
                onChange={(e) => setCabins(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="4"
              />
            </div>

            <div>
              <label htmlFor={`toilets-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Toilets
              </label>
              <input
                type="number"
                id={`toilets-${yacht.id}`}
                value={toilets}
                onChange={(e) => setToilets(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="4"
              />
            </div>
          </div>
        </div>

        {/* Amenities Checklist */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Amenities</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { key: 'ac', label: 'AC', icon: Snowflake },
              { key: 'watermaker', label: 'Watermaker', icon: Droplets },
              { key: 'generator', label: 'Generator', icon: Zap },
              { key: 'flybridge', label: 'Flybridge', icon: Ship },
              { key: 'heating', label: 'Heating', icon: Flame },
              { key: 'teak_deck', label: 'Teak Deck', icon: Waves },
              { key: 'full_batten', label: 'Full Batten', icon: Ship },
              { key: 'folding_table', label: 'Folding Table', icon: Table },
              { key: 'fridge', label: 'Fridge', icon: Refrigerator },
              { key: 'dinghy', label: 'Dinghy', icon: Anchor },
              { key: 'water_entertainment', label: 'Water Entertainment', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                  amenities[key]
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={amenities[key] || false}
                  onChange={() => toggleAmenity(key)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <Icon className={`w-5 h-5 ${amenities[key] ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${amenities[key] ? 'text-blue-600' : 'text-gray-700'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor={`low-price-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Low Season Price ({yacht.currency || 'EUR'})
              </label>
              <input
                type="number"
                id={`low-price-${yacht.id}`}
                value={lowSeasonPrice}
                onChange={(e) => setLowSeasonPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor={`medium-price-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Medium Season Price ({yacht.currency || 'EUR'})
              </label>
              <input
                type="number"
                id={`medium-price-${yacht.id}`}
                value={mediumSeasonPrice}
                onChange={(e) => setMediumSeasonPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor={`high-price-${yacht.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                High Season Price ({yacht.currency || 'EUR'})
              </label>
              <input
                type="number"
                id={`high-price-${yacht.id}`}
                value={highSeasonPrice}
                onChange={(e) => setHighSeasonPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  )
}

// Destination Edit Form Component
function DestinationEditForm({
  destination,
  onSave,
  onCancel,
  onDelete,
  saving,
  deleting,
  successMessage,
  onImageUpload,
  uploadingImage
}: {
  destination: Destination | null // null for create mode
  onSave: (updates: Omit<Destination, 'id' | 'created_at' | 'updated_at'>) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  saving: boolean
  deleting?: boolean
  successMessage?: string
  onImageUpload?: (destinationId: string, file: File) => void
  uploadingImage?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentLocale = useLocale() as Locale
  const [title, setTitle] = useState(destination?.title || '')
  // Load description from i18n based on current locale
  const [description, setDescription] = useState(() => {
    if (!destination) return ''
    // Try i18n first, then fallback to legacy columns, then legacy description
    return getLocalizedText(destination.description_i18n, currentLocale) ||
           (currentLocale === 'en' ? destination.description_en :
            currentLocale === 'es' ? destination.description_es :
            currentLocale === 'de' ? destination.description_de : null) ||
           destination.description || ''
  })
  const [orderIndex, setOrderIndex] = useState(destination?.order_index?.toString() || '0')
  const [isActive, setIsActive] = useState(destination?.is_active ?? true)
  const [imageUrls, setImageUrls] = useState<string[]>(destination?.image_urls || [])

  useEffect(() => {
    if (destination) {
      setTitle(destination.title || '')
      // Update description when destination or locale changes
      const newDescription = getLocalizedText(destination.description_i18n, currentLocale) ||
                            (currentLocale === 'en' ? destination.description_en :
                             currentLocale === 'es' ? destination.description_es :
                             currentLocale === 'de' ? destination.description_de : null) ||
                            destination.description || ''
      setDescription(newDescription)
      setOrderIndex(destination.order_index?.toString() || '0')
      setIsActive(destination.is_active ?? true)
      setImageUrls(destination.image_urls || [])
    }
  }, [destination, currentLocale])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updates: Partial<Omit<Destination, 'id' | 'created_at' | 'updated_at'>> = {
      name: title, // destinations uses 'name' but form uses 'title'
      title,
      // Use JSONB i18n column with smart patch
      description_i18n: createI18nPatch(destination?.description_i18n, currentLocale, description || null),
      image_urls: imageUrls,
      order_index: parseInt(orderIndex) || 0,
      is_active: isActive,
      // Keep legacy fields for backward compatibility
      region: destination?.region || null,
      slug: destination?.slug || '',
      image_url: destination?.image_url || null,
      youtube_video_url: destination?.youtube_video_url || null,
    }
    onSave(updates as any)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && destination && onImageUpload) {
      onImageUpload(destination.id, file)
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const isCreateMode = !destination

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isCreateMode ? 'Create New Destination' : destination.title}
        </h3>
        {!isCreateMode && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`title-${destination?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id={`title-${destination?.id || 'new'}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor={`description-${destination?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id={`description-${destination?.id || 'new'}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Describe the destination..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`order-${destination?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
              Order Index
            </label>
            <input
              type="number"
              id={`order-${destination?.id || 'new'}`}
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          
          {/* Display existing images */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`${title} image ${index + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-200"
                  />
                  {!isCreateMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload button - only for existing destinations */}
          {!isCreateMode && onImageUpload && (
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploadingImage}
                className="px-4 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add Image
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500">Max 5MB, JPG/PNG/WebP</p>
            </div>
          )}

          {isCreateMode && (
            <p className="text-sm text-gray-500">Upload images after creating the destination</p>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCreateMode ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              isCreateMode ? 'Create Destination' : 'Save Changes'
            )}
          </button>
          {isCreateMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// Culinary Experience Edit Form Component
function CulinaryEditForm({
  experience,
  onSave,
  onCancel,
  onDelete,
  saving,
  deleting,
  successMessage,
  onMediaUpload,
  uploadingMedia
}: {
  experience: CulinaryExperience | null
  onSave: (updates: Omit<CulinaryExperience, 'id' | 'created_at' | 'updated_at'>) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  saving: boolean
  deleting?: boolean
  successMessage?: string
  onMediaUpload?: (experienceId: string, file: File) => void
  uploadingMedia?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(experience?.title || '')
  const [description, setDescription] = useState(experience?.description || '')
  const [orderIndex, setOrderIndex] = useState(experience?.order_index?.toString() || '0')
  const [isActive, setIsActive] = useState(experience?.is_active ?? true)
  const [mediaUrls, setMediaUrls] = useState<string[]>(experience?.media_urls || [])

  useEffect(() => {
    if (experience) {
      setTitle(experience.title || '')
      setDescription(experience.description || '')
      setOrderIndex(experience.order_index?.toString() || '0')
      setIsActive(experience.is_active ?? true)
      setMediaUrls(experience.media_urls || [])
    }
  }, [experience])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Remove duplicate URLs from media_urls array
    const uniqueMediaUrls = [...new Set(mediaUrls.filter(url => url && url.trim()))]
    
    // Log if duplicates were removed
    if (uniqueMediaUrls.length !== mediaUrls.length) {
      console.warn(`[Admin] Removed ${mediaUrls.length - uniqueMediaUrls.length} duplicate media URL(s) from "${title}"`)
    }
    
    onSave({
      title,
      description: description || null,
      image_url: null, // Always null - use media_urls instead
      media_urls: uniqueMediaUrls, // Use deduplicated array
      order_index: parseInt(orderIndex) || 0,
      is_active: isActive,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && experience && onMediaUpload) {
      onMediaUpload(experience.id, file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveMedia = (indexToRemove: number) => {
    setMediaUrls(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleAddYouTubeUrl = () => {
    const url = prompt('Enter YouTube or image URL:')
    if (url && url.trim()) {
      setMediaUrls(prev => [...prev, url.trim()])
    }
  }

  const isCreateMode = !experience

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isCreateMode ? 'Create New Culinary Experience' : experience.title}
        </h3>
        {!isCreateMode && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`culinary-title-${experience?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id={`culinary-title-${experience?.id || 'new'}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor={`culinary-description-${experience?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Description (Long Text)
          </label>
          <textarea
            id={`culinary-description-${experience?.id || 'new'}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Describe the culinary experience in detail..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`culinary-order-${experience?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
              Order Index
            </label>
            <input
              type="number"
              id={`culinary-order-${experience?.id || 'new'}`}
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images/Videos
          </label>
          
          {mediaUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">
                {mediaUrls.length} {mediaUrls.length === 1 ? 'image' : 'images'} attached to "{title || 'this experience'}"
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {mediaUrls.map((url, index) => {
                  // Create unique key using experience ID and URL hash
                  const urlKey = `${experience?.id || 'new'}-${url.substring(url.length - 20)}-${index}`
                  const isImage = !url.includes('youtube.com') && !url.includes('youtu.be')
                  
                  return (
                    <div key={urlKey} className="relative group">
                      {isImage ? (
                        <div className="relative">
                          <img
                            src={url}
                            alt={`${title || 'Experience'} - Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              console.error('[Admin] Failed to load image:', url)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {/* Image number badge */}
                          <div className="absolute top-1 left-1 bg-[#0F172A]/80 text-white text-xs px-1.5 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">YouTube</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Remove ${isImage ? 'image' : 'video'} ${index + 1}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Note: Only the first image will be displayed on the public page. Additional images can be used for a future gallery feature.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            {!isCreateMode && onMediaUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={uploadingMedia}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploadingMedia}
                  className="px-4 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingMedia ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Add Image
                    </>
                  )}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleAddYouTubeUrl}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Add YouTube URL
            </button>
            {isCreateMode && (
              <p className="text-sm text-gray-500">Add media after creating</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCreateMode ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              isCreateMode ? 'Create Experience' : 'Save Changes'
            )}
          </button>
          {isCreateMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// Crew Member Edit Form Component
function CrewEditForm({
  member,
  onSave,
  onCancel,
  onDelete,
  saving,
  deleting,
  successMessage,
  onImageUpload,
  uploadingImage
}: {
  member: CrewMember | null
  onSave: (updates: Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  saving: boolean
  deleting?: boolean
  successMessage?: string
  onImageUpload?: (memberId: string, file: File) => void
  uploadingImage?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(member?.name || '')
  const [role, setRole] = useState(member?.role || '')
  const [bio, setBio] = useState(member?.bio || '')
  const [roleDescription, setRoleDescription] = useState(member?.role_description || '')
  const [orderIndex, setOrderIndex] = useState(member?.order_index?.toString() || '0')
  const [isActive, setIsActive] = useState(member?.is_active ?? true)

  useEffect(() => {
    if (member) {
      setName(member.name || '')
      setRole(member.role || '')
      setBio(member.bio || '')
      setRoleDescription(member.role_description || '')
      setOrderIndex(member.order_index?.toString() || '0')
      setIsActive(member.is_active ?? true)
    } else {
      // Reset form for create mode
      setName('')
      setRole('')
      setBio('')
      setRoleDescription('')
      setOrderIndex('0')
      setIsActive(true)
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    if (!role.trim()) {
      alert('Role is required')
      return
    }
    
    // Prepare update payload
    const updates: Partial<Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>> = {
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim() || null,
      // role_description column doesn't exist in database, so we don't send it
      image_url: member?.image_url || null, // Image is updated separately via onImageUpload
      order_index: parseInt(orderIndex) || 0,
      is_active: isActive,
    }
    
    console.log('[CrewEditForm] Submitting updates:', updates)
    
    try {
      await onSave(updates as any)
    } catch (error) {
      console.error('[CrewEditForm] Error in onSave:', error)
      alert('Failed to save crew member. Please check the console for details.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && member && onImageUpload) {
      onImageUpload(member.id, file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const isCreateMode = !member

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {isCreateMode ? 'Create New Crew Member' : member.name}
          </h3>
          {member?.image_url && (
            <img
              src={member.image_url}
              alt={member.name}
              className="mt-2 w-32 h-32 object-cover rounded-full border border-gray-200"
            />
          )}
        </div>
        {!isCreateMode && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        )}
      </div>

      {successMessage && (
        <div className={`mb-4 p-3 border rounded-lg ${
          successMessage.includes('✅') 
            ? 'bg-green-50 border-green-200' 
            : successMessage.includes('❌')
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-sm ${
            successMessage.includes('✅') 
              ? 'text-green-800' 
              : successMessage.includes('❌')
              ? 'text-red-800'
              : 'text-blue-800'
          }`}>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`crew-name-${member?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Name/Title *
          </label>
          <input
            type="text"
            id={`crew-name-${member?.id || 'new'}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor={`crew-role-${member?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <input
            type="text"
            id={`crew-role-${member?.id || 'new'}`}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="e.g., Captain, Chef, Deckhand"
          />
        </div>

        <div>
          <label htmlFor={`crew-bio-${member?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Bio / Description *
          </label>
          <textarea
            id={`crew-bio-${member?.id || 'new'}`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Brief bio or description of the crew member..."
          />
        </div>

        <div>
          <label htmlFor={`crew-role-description-${member?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
            Role Description (Optional - for internal use)
          </label>
          <textarea
            id={`crew-role-description-${member?.id || 'new'}`}
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Detailed description of the crew member's role and responsibilities (not displayed on public site)..."
          />
          <p className="text-xs text-gray-500 mt-1">Note: This field is for internal reference only and won't be displayed on the public site.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          {!isCreateMode && onImageUpload && (
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploadingImage}
                className="px-4 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {member?.image_url ? 'Change Image' : 'Upload Image'}
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500">Max 5MB, JPG/PNG/WebP</p>
            </div>
          )}
          {isCreateMode && (
            <p className="text-sm text-gray-500">Upload image after creating the member</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`crew-order-${member?.id || 'new'}`} className="block text-sm font-medium text-gray-700 mb-2">
              Order Index
            </label>
            <input
              type="number"
              id={`crew-order-${member?.id || 'new'}`}
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-6 h-6 text-luxury-blue border-gray-300 rounded focus:ring-2 focus:ring-luxury-blue focus:ring-offset-2 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {isActive ? '✓ Published (Visible on Frontend)' : '✗ Hidden (Not Visible on Frontend)'}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  Toggle to show/hide this crew member on the public website
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCreateMode ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              isCreateMode ? 'Create Member' : 'Save Changes'
            )}
          </button>
          {isCreateMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// Bulk Translation Panel Component
function BulkTranslationPanel() {
  const [entityType, setEntityType] = useState<'destinations' | 'crew' | 'culinary' | 'fleet'>('fleet')
  const [targetLocale, setTargetLocale] = useState<'es' | 'de'>('de')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<{ success: boolean; message?: string; stats?: any } | null>(null)

  const handleBulkTranslate = async () => {
    if (!confirm(`This will translate all ${entityType} content from English to ${targetLocale === 'es' ? 'Spanish' : 'German'}. Continue?`)) {
      return
    }

    setIsTranslating(true)
    setTranslationResult(null)

    try {
      const response = await fetch('/api/bulk-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          targetLocale,
          sourceLocale: 'en',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to translate')
      }

      setTranslationResult(data)
      alert(`Translation completed! ${data.stats?.successful || 0} items translated successfully.`)
    } catch (error) {
      console.error('[BulkTranslate] Error:', error)
      setTranslationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to translate'
      })
      alert(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          >
            <option value="fleet">Fleet (Yachts)</option>
            <option value="destinations">Destinations</option>
            <option value="crew">Crew Members</option>
            <option value="culinary">Culinary Experiences</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Language
          </label>
          <select
            value={targetLocale}
            onChange={(e) => setTargetLocale(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          >
            <option value="de">German (Deutsch)</option>
            <option value="es">Spanish (Español)</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This will translate all active {entityType} content from English to {targetLocale === 'es' ? 'Spanish' : 'German'} using AI and save it to the JSONB columns (description_i18n). Existing translations in other languages will be preserved.
          </p>
        </div>

        <button
          onClick={handleBulkTranslate}
          disabled={isTranslating}
          className="w-full px-6 py-3 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isTranslating ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Translating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Start Bulk Translation
            </>
          )}
        </button>

        {translationResult && (
          <div className={`p-4 rounded-lg ${translationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm font-medium ${translationResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {translationResult.message || (translationResult.success ? 'Translation completed successfully!' : 'Translation failed')}
            </p>
            {translationResult.stats && (
              <div className="mt-2 text-xs text-gray-600">
                Total: {translationResult.stats.total} | Successful: {translationResult.stats.successful} | Failed: {translationResult.stats.failed}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Edit Form Component
function StatEditForm({
  stat,
  onSave,
  onCancel,
  onDelete,
  saving,
  deleting,
  successMessage
}: {
  stat: Stat | null
  onSave: (updates: Omit<Stat, 'id' | 'created_at' | 'updated_at'>) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  saving: boolean
  deleting?: boolean
  successMessage?: string
}) {
  const [label, setLabel] = useState(stat?.label || '')
  const [value, setValue] = useState(stat?.value || '')
  const [title, setTitle] = useState(stat?.title || '')
  const [description, setDescription] = useState(stat?.description || '')
  const [mediaUrls, setMediaUrls] = useState<string[]>(stat?.media_urls || [])
  const [category, setCategory] = useState<'general' | 'culinary' | 'crew' | null>(stat?.category || 'general')
  const [orderIndex, setOrderIndex] = useState(stat?.order_index?.toString() || '0')
  const [isActive, setIsActive] = useState(stat?.is_active ?? true)

  useEffect(() => {
    if (stat) {
      setLabel(stat.label || '')
      setValue(stat.value || '')
      setTitle(stat.title || '')
      setDescription(stat.description || '')
      setMediaUrls(stat.media_urls || [])
      setCategory(stat.category || 'general')
      setOrderIndex(stat.order_index?.toString() || '0')
      setIsActive(stat.is_active ?? true)
    }
  }, [stat])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      label,
      value,
      icon: stat?.icon || null,
      title: title || null,
      description: description || null,
      media_urls: mediaUrls,
      category,
      order_index: parseInt(orderIndex) || 0,
      is_active: isActive,
    })
  }

  const handleRemoveMedia = (indexToRemove: number) => {
    setMediaUrls(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleAddUrl = () => {
    const url = prompt('Enter image or YouTube URL:')
    if (url && url.trim()) {
      setMediaUrls(prev => [...prev, url.trim()])
    }
  }

  const isCreateMode = !stat

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isCreateMode ? 'Create New Stat' : stat.label}
        </h3>
        {!isCreateMode && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., Years Experience"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value *
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="e.g., 20+"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category || 'general'}
            onChange={(e) => setCategory(e.target.value as 'general' | 'culinary' | 'crew' | null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          >
            <option value="general">General</option>
            <option value="culinary">Culinary</option>
            <option value="crew">Crew</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title (Optional - for Culinary/Crew)
          </label>
          <input
            type="text"
            value={title || ''}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Extended title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional - for Culinary/Crew)
          </label>
          <textarea
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Long description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media URLs (Images/YouTube)
          </label>
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  {url.includes('youtube.com') || url.includes('youtu.be') ? (
                    <div className="aspect-video bg-gray-200 rounded flex items-center justify-center p-2">
                      <p className="text-xs text-gray-600 text-center">YouTube Video</p>
                    </div>
                  ) : (
                    <img src={url} alt={`Media ${index + 1}`} className="w-full h-24 object-cover rounded" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            + Add Image/Video URL
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Index
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-luxury-blue rounded focus:ring-luxury-blue"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isCreateMode ? 'Create Stat' : 'Save Changes'}
          </button>
          {isCreateMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// Review Edit Form Component
function ReviewEditForm({
  review,
  onSave,
  onCancel,
  onDelete,
  saving,
  deleting,
  successMessage
}: {
  review: Review | null
  onSave: (updates: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  saving: boolean
  deleting?: boolean
  successMessage?: string
}) {
  const [guestName, setGuestName] = useState(review?.guest_name || '')
  const [guestLocation, setGuestLocation] = useState(review?.guest_location || '')
  const [rating, setRating] = useState(review?.rating?.toString() || '5')
  const [reviewText, setReviewText] = useState(review?.review_text || '')
  const [reviewDate, setReviewDate] = useState(review?.review_date || new Date().toISOString().split('T')[0])
  const [profileImageUrl, setProfileImageUrl] = useState(review?.profile_image_url || '')
  const [isFeatured, setIsFeatured] = useState(review?.is_featured ?? false)
  const [isApproved, setIsApproved] = useState(review?.is_approved ?? true)

  useEffect(() => {
    if (review) {
      setGuestName(review.guest_name || '')
      setGuestLocation(review.guest_location || '')
      setRating(review.rating?.toString() || '5')
      setReviewText(review.review_text || '')
      setReviewDate(review.review_date || new Date().toISOString().split('T')[0])
      setProfileImageUrl(review.profile_image_url || '')
      setIsFeatured(review.is_featured ?? false)
      setIsApproved(review.is_approved ?? true)
    }
  }, [review])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      guest_name: guestName,
      guest_location: guestLocation || null,
      rating: parseInt(rating) || 5,
      review_text: reviewText,
      review_date: reviewDate || null,
      profile_image_url: profileImageUrl || null,
      yacht_id: review?.yacht_id || null,
      is_featured: isFeatured,
      is_approved: isApproved,
    })
  }

  const isCreateMode = !review

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isCreateMode ? 'Create New Review' : review.guest_name}
        </h3>
        {!isCreateMode && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              value={guestLocation}
              onChange={(e) => setGuestLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              placeholder="New York, USA"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-5 stars) *
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            >
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Date *
            </label>
            <input
              type="date"
              value={reviewDate || ''}
              onChange={(e) => setReviewDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image/Avatar URL (Optional)
          </label>
          <input
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
          {profileImageUrl && (
            <img src={profileImageUrl} alt="Profile preview" className="mt-2 w-20 h-20 rounded-full object-cover border border-gray-200" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Text *
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            placeholder="Write the review text here..."
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 text-luxury-blue rounded focus:ring-luxury-blue"
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              className="w-5 h-5 text-luxury-blue rounded focus:ring-luxury-blue"
            />
            <span className="text-sm font-medium text-gray-700">Approved</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-luxury-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isCreateMode ? 'Create Review' : 'Save Changes'}
          </button>
          {isCreateMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
