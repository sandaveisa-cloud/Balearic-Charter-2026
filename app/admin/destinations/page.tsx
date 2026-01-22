'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import DestinationEditModal from '@/components/DestinationEditModal'
import type { Destination } from '@/types/database'

export default function DestinationsAdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      // Use Admin API route with SERVICE_ROLE_KEY
      const response = await fetch('/api/admin/destinations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch destinations')
      }

      const { destinations } = await response.json()
      setDestinations(destinations || [])
    } catch (error) {
      console.error('[DestinationsAdmin] Error fetching:', error)
      setErrorMessage('Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingDestination(null)
    setIsModalOpen(true)
  }

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) {
      return
    }

    try {
      setDeletingId(id)
      // Use Admin API route with SERVICE_ROLE_KEY
      const response = await fetch(`/api/admin/destinations?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete destination')
      }

      setSuccessMessage('Destination deleted successfully')
      fetchDestinations()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('[DestinationsAdmin] Error deleting:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete destination')
      setTimeout(() => setErrorMessage(null), 3000)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = () => {
    fetchDestinations()
    setSuccessMessage('Destination saved successfully')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-luxury-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-luxury-blue">Destination Management</h1>
          <p className="text-gray-600 mt-1">Manage your charter destinations</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New Destination
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Destinations Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {destinations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No destinations found. Click "Add New Destination" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Region</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Slug</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Media</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {destinations.map((destination) => {
                  // Handle both Supabase URLs and local paths
                  const imageUrl = destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0
                    ? destination.image_urls[0]
                    : null

                  // Normalize image URL - handle both full URLs and local paths
                  const normalizedImageUrl = imageUrl
                    ? imageUrl.startsWith('/')
                      ? imageUrl // Local path like /images/filename.jpg
                      : imageUrl // Full URL
                    : null

                  return (
                    <tr key={destination.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {normalizedImageUrl ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img
                              src={normalizedImageUrl}
                              alt={destination.name || destination.title || 'Destination'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{destination.name || destination.title}</div>
                        {destination.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {destination.description}
                          </div>
                        )}
                      </td>
                    <td className="px-6 py-4 text-gray-600">{destination.region || '-'}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {destination.slug || '-'}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{destination.order_index}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          destination.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {destination.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {destination.image_urls && Array.isArray(destination.image_urls) && destination.image_urls.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Image</span>
                        )}
                        {destination.youtube_video_url && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Video</span>
                        )}
                        {(!destination.image_urls || !Array.isArray(destination.image_urls) || destination.image_urls.length === 0) && !destination.youtube_video_url && (
                          <span className="text-gray-400">No media</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(destination)}
                          className="p-2 text-luxury-blue hover:bg-luxury-blue/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(destination.id)}
                          disabled={deletingId === destination.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === destination.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <DestinationEditModal
        destination={editingDestination}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDestination(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}
