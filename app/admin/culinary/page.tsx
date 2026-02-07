'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import CulinaryEditModal from '@/components/CulinaryEditModal'
import type { CulinaryExperience } from '@/types/database'

export default function CulinaryAdminPage() {
  const [culinary, setCulinary] = useState<CulinaryExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCulinary, setEditingCulinary] = useState<CulinaryExperience | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchCulinary()
  }, [])

  const fetchCulinary = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/culinary')
      
      if (!response.ok) {
        throw new Error('Failed to fetch culinary experiences')
      }

      const { culinary } = await response.json()
      setCulinary(culinary || [])
    } catch (error) {
      console.error('[CulinaryAdmin] Error fetching:', error)
      setErrorMessage('Failed to load culinary experiences')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingCulinary(null)
    setIsModalOpen(true)
  }

  const handleEdit = (culinaryItem: CulinaryExperience) => {
    setEditingCulinary(culinaryItem)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this culinary experience?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/culinary?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete')
      }

      setSuccessMessage('Culinary experience deleted successfully')
      fetchCulinary()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('[CulinaryAdmin] Error deleting:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete')
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  const handleSave = () => {
    fetchCulinary()
    setSuccessMessage('Culinary experience saved successfully')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-luxury-blue">Culinary Experiences</h1>
          <p className="text-gray-600 mt-1">Manage culinary offerings</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

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

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {culinary.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No culinary experiences found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {culinary.map((item) => {
                  // Handle both Supabase URLs and local paths
                  const imageUrl = item.image_url
                    ? item.image_url.startsWith('/')
                      ? item.image_url // Local path
                      : item.image_url // Full URL
                    : null

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {imageUrl ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img
                              src={imageUrl}
                              alt={item.title}
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
                      <td className="px-6 py-4 font-semibold text-gray-800">{item.title}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm line-clamp-2">{item.description || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{item.order_index}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-luxury-blue hover:bg-luxury-blue/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      <CulinaryEditModal
        culinary={editingCulinary}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCulinary(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}
