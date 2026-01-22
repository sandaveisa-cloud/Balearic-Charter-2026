'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface CrewMember {
  id: string
  name: string
  role: string
  bio: string | null
  image_url: string | null
  order_index: number
  is_active: boolean
}

export default function CrewAdminPage() {
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchCrew()
  }, [])

  const fetchCrew = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/crew')
      
      if (!response.ok) {
        throw new Error('Failed to fetch crew')
      }

      const { crew } = await response.json()
      setCrew(crew || [])
    } catch (error) {
      console.error('[CrewAdmin] Error fetching:', error)
      setErrorMessage('Failed to load crew')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this crew member?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/crew?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete')
      }

      setSuccessMessage('Crew member deleted successfully')
      fetchCrew()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('[CrewAdmin] Error deleting:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete')
      setTimeout(() => setErrorMessage(null), 3000)
    }
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
          <h1 className="text-3xl font-bold text-luxury-blue">Crew Management</h1>
          <p className="text-gray-600 mt-1">Manage crew members</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors shadow-lg">
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
        {crew.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No crew members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {crew.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{member.name}</td>
                    <td className="px-6 py-4 text-gray-600">{member.role}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm line-clamp-2">{member.bio || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{member.order_index}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-luxury-blue hover:bg-luxury-blue/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
