'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import type { JourneyMilestone } from '@/types/database'
import JourneyEditModal from '@/components/admin/JourneyEditModal'

export default function JourneyAdminPage() {
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<JourneyMilestone | null>(null)

  const fetchMilestones = async () => {
    try {
      const response = await fetch('/api/admin/journey')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      // Sort by order_index, then by year
      const sorted = [...data].sort((a, b) => {
        if (a.order_index !== b.order_index) {
          return a.order_index - b.order_index
        }
        return a.year - b.year
      })
      setMilestones(sorted)
    } catch (error) {
      console.error('Error fetching milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMilestones()
  }, [])

  const handleEdit = (milestone: JourneyMilestone) => {
    setSelectedMilestone(milestone)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedMilestone(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return
    
    try {
      const response = await fetch(`/api/admin/journey?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      fetchMilestones()
    } catch (error) {
      console.error('Error deleting milestone:', error)
      alert('Error deleting milestone')
    }
  }

  const handleSave = async () => {
    // Refresh the milestones list immediately
    await fetchMilestones()
    // Note: Modal closing is handled by JourneyEditModal after success
    // This ensures the list is refreshed before the modal closes
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading milestones...</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Journey Milestones</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#001F3F] text-white rounded-lg hover:bg-[#1B263B] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#001F3F] to-[#1B263B] flex items-center justify-center text-white font-bold">
                  {milestone.year}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{milestone.title_en}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-500">Order:</span>
                    <span className="px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] rounded text-xs font-semibold">
                      {milestone.order_index}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">Year: {milestone.year}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(milestone)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(milestone.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {milestone.image_url && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={milestone.image_url}
                  alt={milestone.title_en}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            <p className="text-sm text-gray-600 line-clamp-3">{milestone.description_en}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${milestone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {milestone.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {milestones.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No milestones yet. Click "Add Milestone" to create one.
        </div>
      )}

      <JourneyEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMilestone(null)
        }}
        onSave={handleSave}
        milestone={selectedMilestone}
      />
    </div>
  )
}
