'use client'

import { useState, useEffect } from 'react'
import { ImageIcon, Upload, Trash2, Search } from 'lucide-react'

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      setLoading(true)
      // Fetch all fleet to get gallery images
      const response = await fetch('/api/admin/fleet')
      if (!response.ok) throw new Error('Failed to fetch images')
      const data = await response.json()
      
      // Collect all gallery images from fleet
      const allImages: any[] = []
      if (data.fleet) {
        data.fleet.forEach((yacht: any) => {
          if (yacht.gallery_images && Array.isArray(yacht.gallery_images)) {
            yacht.gallery_images.forEach((imgUrl: string, index: number) => {
              allImages.push({
                id: `${yacht.id}-${index}`,
                url: imgUrl,
                yachtName: yacht.name || yacht.boat_name || 'Unknown Yacht',
                yachtId: yacht.id,
              })
            })
          }
        })
      }
      
      setImages(allImages)
    } catch (error) {
      console.error('Error fetching gallery images:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter((img) =>
    img.yachtName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <p className="text-gray-600 mt-1">Manage yacht gallery images</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by yacht name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            {new Set(images.map(img => img.yachtId)).size}
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No images found</p>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm ? 'Try a different search term' : 'Add images to yachts in Fleet Management'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
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
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-800 truncate">{image.yachtName}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{image.url}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> To add or remove gallery images, edit the yacht in{' '}
          <a href="/admin/fleet" className="underline font-medium">
            Fleet Management
          </a>
          . This page displays all gallery images from all yachts in your fleet.
        </p>
      </div>
    </div>
  )
}
