'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { MissionPromise } from '@/types/database'
import MissionEditModal from '@/components/admin/MissionEditModal'

export default function MissionAdminPage() {
  const [promises, setPromises] = useState<MissionPromise[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPromise, setSelectedPromise] = useState<MissionPromise | null>(null)

  const fetchPromises = async () => {
    try {
      const response = await fetch('/api/admin/mission')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPromises(data)
    } catch (error) {
      console.error('Error fetching promises:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromises()
  }, [])

  const handleEdit = (promise: MissionPromise) => {
    setSelectedPromise(promise)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedPromise(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promise?')) return
    
    try {
      const response = await fetch(`/api/admin/mission?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      fetchPromises()
    } catch (error) {
      console.error('Error deleting promise:', error)
      alert('Error deleting promise')
    }
  }

  const handleSave = () => {
    fetchPromises()
    setIsModalOpen(false)
    setSelectedPromise(null)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading promises...</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">The Balearic Promise</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#001F3F] text-white rounded-lg hover:bg-[#1B263B] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Promise
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promises.map((promise) => (
          <div
            key={promise.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{promise.title_en}</h3>
                <p className="text-sm text-gray-500">Order: {promise.order_index}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(promise)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(promise.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {promise.icon_url && (
              <div className="mb-4">
                <img
                  src={promise.icon_url}
                  alt={promise.title_en}
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
            {promise.icon_name && (
              <div className="mb-4 text-sm text-gray-500">
                Icon: {promise.icon_name}
              </div>
            )}
            <p className="text-sm text-gray-600 line-clamp-3">{promise.description_en}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${promise.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {promise.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {promises.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No promises yet. Click "Add Promise" to create one.
        </div>
      )}

      <MissionEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPromise(null)
        }}
        onSave={handleSave}
        promise={selectedPromise}
      />
    </div>
  )
}
