'use client'

import { useState, useEffect } from 'react'
import { ImageIcon, Search, Ship, Trash2, ExternalLink, Loader2, RefreshCw, GripVertical, Save, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface GalleryImage {
  id: string
  url: string
  yachtName: string
  yachtId: string
  index: number
  isMain: boolean
}

interface YachtWithImages {
  id: string
  name: string
  slug: string
  main_image_url: string | null
  gallery_images: string[]
  imageCount: number
}

interface ImageOrder {
  url: string
  order: number
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [yachts, setYachts] = useState<YachtWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYacht, setSelectedYacht] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'by-yacht'>('grid')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<string | null>(null) // yachtId being edited
  const [imageOrders, setImageOrders] = useState<Record<string, ImageOrder[]>>({}) // yachtId -> ImageOrder[]
  const [savingOrder, setSavingOrder] = useState<string | null>(null) // yachtId being saved

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/fleet')
      if (!response.ok) throw new Error('Failed to fetch images')
      const data = await response.json()
      
      const allImages: GalleryImage[] = []
      const yachtsWithImages: YachtWithImages[] = []
      
      if (data.fleet) {
        data.fleet.forEach((yacht: any) => {
          const gallery = yacht.gallery_images || []
          const mainImage = yacht.main_image_url
          
          yachtsWithImages.push({
            id: yacht.id,
            name: yacht.name || yacht.boat_name || 'Unknown Yacht',
            slug: yacht.slug,
            main_image_url: mainImage,
            gallery_images: gallery,
            imageCount: gallery.length + (mainImage && !gallery.includes(mainImage) ? 1 : 0),
          })
          
          // Add main image if not in gallery
          if (mainImage && !gallery.includes(mainImage)) {
            allImages.push({
              id: `${yacht.id}-main`,
              url: mainImage,
              yachtName: yacht.name || yacht.boat_name || 'Unknown Yacht',
              yachtId: yacht.id,
              index: 0,
              isMain: true,
            })
          }
          
          // Add gallery images
          gallery.forEach((imgUrl: string, index: number) => {
            allImages.push({
              id: `${yacht.id}-${index}`,
              url: imgUrl,
              yachtName: yacht.name || yacht.boat_name || 'Unknown Yacht',
              yachtId: yacht.id,
              index: mainImage && !gallery.includes(mainImage) ? index + 1 : index,
              isMain: index === 0 && (!mainImage || gallery.includes(mainImage)),
            })
          })
        })
      }
      
      setImages(allImages)
      setYachts(yachtsWithImages.sort((a, b) => b.imageCount - a.imageCount))
      
      // Initialize image orders for each yacht
      // Order: main_image_url first (if exists and not in gallery), then gallery_images in order
      const initialOrders: Record<string, ImageOrder[]> = {}
      yachtsWithImages.forEach(yacht => {
        const orderedUrls: string[] = []
        
        // Add main image first if it exists and is not in gallery
        if (yacht.main_image_url && !yacht.gallery_images.includes(yacht.main_image_url)) {
          orderedUrls.push(yacht.main_image_url)
        }
        
        // Add gallery images in their current order
        orderedUrls.push(...yacht.gallery_images)
        
        // Create order array
        initialOrders[yacht.id] = orderedUrls.map((url, idx) => ({
          url,
          order: idx + 1
        }))
      })
      setImageOrders(initialOrders)
    } catch (error) {
      console.error('Error fetching gallery images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (image: GalleryImage) => {
    const confirmDelete = window.confirm(
      `Delete this image from "${image.yachtName}"?\n\nThis will remove it from the yacht's gallery.`
    )
    
    if (!confirmDelete) return

    setDeleting(image.id)

    try {
      // First, try to delete from Supabase storage if it's a Supabase URL
      if (image.url.includes('supabase') && image.url.includes('/storage/')) {
        const urlParts = image.url.split('/storage/v1/object/public/')
        if (urlParts.length === 2) {
          const pathWithBucket = urlParts[1]
          const bucketEndIndex = pathWithBucket.indexOf('/')
          const bucketName = pathWithBucket.substring(0, bucketEndIndex)
          const filePath = pathWithBucket.substring(bucketEndIndex + 1)

          await fetch('/api/admin/delete-image', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket: bucketName, path: filePath }),
          })
        }
      }

      // Then update the yacht's gallery_images array
      const yacht = yachts.find(y => y.id === image.yachtId)
      if (yacht) {
        const newGalleryImages = yacht.gallery_images.filter(url => url !== image.url)
        const newMainImage = image.isMain ? (newGalleryImages[0] || null) : yacht.main_image_url
        
        // Update via API
        const response = await fetch('/api/admin/fleet', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: yacht.id,
            gallery_images: newGalleryImages,
            main_image_url: image.url === yacht.main_image_url ? newMainImage : yacht.main_image_url,
          }),
        })

        if (response.ok) {
          // Refresh the gallery
          await fetchGalleryImages()
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.yachtName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYacht = selectedYacht === 'all' || img.yachtId === selectedYacht
    return matchesSearch && matchesYacht
  })

  const filteredYachts = yachts.filter(yacht =>
    yacht.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle order input change
  const handleOrderChange = (yachtId: string, imageUrl: string, newOrder: number) => {
    setImageOrders(prev => {
      const yachtOrders = prev[yachtId] || []
      const updated = yachtOrders.map(item => 
        item.url === imageUrl ? { ...item, order: newOrder } : item
      )
      return { ...prev, [yachtId]: updated }
    })
  }

  // Handle save order for a yacht
  const handleSaveOrder = async (yachtId: string) => {
    const yacht = yachts.find(y => y.id === yachtId)
    if (!yacht) return

    setSavingOrder(yachtId)
    try {
      const orders = imageOrders[yachtId] || []
      // Sort by order number and extract URLs
      const sortedUrls = orders
        .sort((a, b) => a.order - b.order)
        .map(item => item.url)
      
      // First image becomes main_image_url, rest go to gallery_images
      const newMainImage = sortedUrls[0] || yacht.main_image_url
      const newGalleryImages = sortedUrls.slice(1)

      const response = await fetch('/api/admin/fleet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: yachtId,
          main_image_url: newMainImage,
          gallery_images: newGalleryImages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save order')
      }

      // Refresh gallery to show updated order
      await fetchGalleryImages()
      setEditingOrder(null)
      alert(`Image order saved for ${yacht.name}!`)
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Failed to save image order. Please try again.')
    } finally {
      setSavingOrder(null)
    }
  }

  // Handle drag and drop reordering
  const handleDragOver = (e: React.DragEvent, yachtId: string, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, yachtId: string, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(draggedIndex) || draggedIndex === targetIndex) return

    const orders = imageOrders[yachtId] || []
    // Sort orders first to get current display order
    const sortedOrders = [...orders].sort((a, b) => a.order - b.order)
    const newOrders = [...sortedOrders]
    const [draggedItem] = newOrders.splice(draggedIndex, 1)
    newOrders.splice(targetIndex, 0, draggedItem)
    
    // Renumber orders sequentially
    const renumbered = newOrders.map((item, idx) => ({
      ...item,
      order: idx + 1
    }))
    
    setImageOrders(prev => ({ ...prev, [yachtId]: renumbered }))
  }

  // Move image up/down in order
  const moveImage = (yachtId: string, currentDisplayIndex: number, direction: 'up' | 'down') => {
    const orders = imageOrders[yachtId] || []
    // Sort orders to get current display order
    const sortedOrders = [...orders].sort((a, b) => a.order - b.order)
    
    if (direction === 'up' && currentDisplayIndex === 0) return
    if (direction === 'down' && currentDisplayIndex === sortedOrders.length - 1) return

    const newOrders = [...sortedOrders]
    const newIndex = direction === 'up' ? currentDisplayIndex - 1 : currentDisplayIndex + 1
    ;[newOrders[currentDisplayIndex], newOrders[newIndex]] = [newOrders[newIndex], newOrders[currentDisplayIndex]]
    
    // Renumber orders sequentially
    const renumbered = newOrders.map((item, idx) => ({
      ...item,
      order: idx + 1
    }))
    
    setImageOrders(prev => ({ ...prev, [yachtId]: renumbered }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gallery Manager</h1>
          <p className="text-gray-600 mt-1">View and manage all yacht gallery images</p>
        </div>
        <button
          onClick={fetchGalleryImages}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by yacht name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          {/* Yacht Filter */}
          <select
            value={selectedYacht}
            onChange={(e) => setSelectedYacht(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          >
            <option value="all">All Yachts</option>
            {yachts.map(yacht => (
              <option key={yacht.id} value={yacht.id}>
                {yacht.name} ({yacht.imageCount} images)
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-luxury-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('by-yacht')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'by-yacht'
                  ? 'bg-luxury-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              By Yacht
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Images</div>
          <div className="text-2xl font-bold text-luxury-blue mt-1">{images.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Filtered Results</div>
          <div className="text-2xl font-bold text-luxury-blue mt-1">{filteredImages.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Yachts with Images</div>
          <div className="text-2xl font-bold text-luxury-blue mt-1">
            {yachts.filter(y => y.imageCount > 0).length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Yachts without Images</div>
          <div className="text-2xl font-bold text-red-500 mt-1">
            {yachts.filter(y => y.imageCount === 0).length}
          </div>
        </div>
      </div>

      {/* View: By Yacht */}
      {viewMode === 'by-yacht' && (
        <div className="space-y-6">
          {filteredYachts.map(yacht => (
            <div key={yacht.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-luxury-blue to-luxury-gold p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ship className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{yacht.name}</h3>
                    <p className="text-white/80 text-sm">{yacht.imageCount} images</p>
                  </div>
                </div>
                <Link
                  href={`/admin/fleet/${yacht.id}`}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
                >
                  Edit Yacht
                </Link>
              </div>
              
              {yacht.imageCount > 0 ? (
                <div className="p-4 space-y-4">
                  {/* Edit Order Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {editingOrder === yacht.id ? (
                        <>
                          <span className="text-sm text-gray-600">Editing order for {yacht.name}</span>
                          <button
                            onClick={() => {
                              setEditingOrder(null)
                              // Reset to original order: main_image_url first, then gallery_images
                              const orderedUrls: string[] = []
                              if (yacht.main_image_url && !yacht.gallery_images.includes(yacht.main_image_url)) {
                                orderedUrls.push(yacht.main_image_url)
                              }
                              orderedUrls.push(...yacht.gallery_images)
                              
                              setImageOrders(prev => ({
                                ...prev,
                                [yacht.id]: orderedUrls.map((url, idx) => ({
                                  url,
                                  order: idx + 1
                                }))
                              }))
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingOrder(yacht.id)}
                          className="text-sm text-luxury-blue hover:text-luxury-gold font-medium"
                        >
                          Edit Order
                        </button>
                      )}
                    </div>
                    {editingOrder === yacht.id && (
                      <button
                        onClick={() => handleSaveOrder(yacht.id)}
                        disabled={savingOrder === yacht.id}
                        className="flex items-center gap-2 px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingOrder === yacht.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Order
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {images
                      .filter(img => img.yachtId === yacht.id)
                      .sort((a, b) => {
                        // Sort by current order if editing, otherwise by original index
                        if (editingOrder === yacht.id) {
                          const orders = imageOrders[yacht.id] || []
                          const orderA = orders.find(o => o.url === a.url)?.order || a.index + 1
                          const orderB = orders.find(o => o.url === b.url)?.order || b.index + 1
                          return orderA - orderB
                        }
                        return a.index - b.index
                      })
                      .map((image, displayIndex) => {
                        const orders = imageOrders[yacht.id] || []
                        const imageOrder = orders.find(o => o.url === image.url)?.order || displayIndex + 1
                        const isEditing = editingOrder === yacht.id
                        
                        return (
                          <div
                            key={image.id}
                            draggable={isEditing}
                            onDragStart={(e) => {
                              if (isEditing) {
                                e.dataTransfer.setData('text/plain', displayIndex.toString())
                              }
                            }}
                            onDragOver={(e) => isEditing && handleDragOver(e, yacht.id, displayIndex)}
                            onDrop={(e) => isEditing && handleDrop(e, yacht.id, displayIndex)}
                            className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                              isEditing ? 'border-luxury-blue cursor-move' : 'border-transparent'
                            } hover:border-luxury-gold transition-all`}
                          >
                            <img
                              src={image.url}
                              alt={`${yacht.name} image`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                              }}
                            />
                            
                            {/* Order Badge */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                              {isEditing && (
                                <GripVertical className="w-3 h-3" />
                              )}
                              {imageOrder === 1 ? '★ Main' : `#${imageOrder}`}
                            </div>

                            {/* Order Input (when editing) */}
                            {isEditing && (
                              <div className="absolute bottom-2 left-2 right-2 bg-black/80 p-2 rounded">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveImage(yacht.id, displayIndex, 'up')}
                                    disabled={displayIndex === 0}
                                    className="p-1 bg-white/20 hover:bg-white/30 rounded disabled:opacity-50"
                                    title="Move up"
                                  >
                                    <ArrowUp className="w-3 h-3 text-white" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    max={yacht.imageCount}
                                    value={imageOrder}
                                    onChange={(e) => {
                                      const newOrder = parseInt(e.target.value) || 1
                                      handleOrderChange(yacht.id, image.url, Math.max(1, Math.min(newOrder, yacht.imageCount)))
                                    }}
                                    className="w-12 px-1 py-0.5 text-xs text-center bg-white rounded border-0 focus:ring-1 focus:ring-luxury-gold"
                                  />
                                  <button
                                    onClick={() => moveImage(yacht.id, displayIndex, 'down')}
                                    disabled={displayIndex === yacht.imageCount - 1}
                                    className="p-1 bg-white/20 hover:bg-white/30 rounded disabled:opacity-50"
                                    title="Move down"
                                  >
                                    <ArrowDown className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {image.isMain && !isEditing && (
                              <div className="absolute top-2 left-2 bg-luxury-gold text-luxury-blue text-xs px-2 py-1 rounded font-medium">
                                Main
                              </div>
                            )}
                            
                            <button
                              onClick={() => handleDeleteImage(image)}
                              disabled={deleting === image.id || isEditing}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleting === image.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No images for this yacht</p>
                  <Link
                    href={`/admin/fleet/${yacht.id}`}
                    className="text-luxury-blue hover:underline text-sm"
                  >
                    Add images →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View: Grid */}
      {viewMode === 'grid' && (
        <>
          {filteredImages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No images found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm || selectedYacht !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Add images to yachts in Fleet Management'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.yachtName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                      }}
                    />
                    {image.isMain && (
                      <div className="absolute top-2 left-2 bg-luxury-gold text-luxury-blue text-xs px-2 py-1 rounded font-medium">
                        Main Image
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image)}
                      disabled={deleting === image.id}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting === image.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-gray-800 truncate">{image.yachtName}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{image.url}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> To add new images or reorder the gallery, edit the yacht directly in{' '}
          <Link href="/admin/fleet" className="underline font-medium">
            Fleet Management
          </Link>
          . Drag images to reorder them - the first image becomes the main display image.
        </p>
      </div>
    </div>
  )
}
