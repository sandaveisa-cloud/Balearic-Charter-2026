'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'
import type { Fleet } from '@/types/database'
import FleetEditor from '@/components/FleetEditor'
import Toast from '@/components/Toast'

export default function FleetAdminPage() {
  const [fleet, setFleet] = useState<Fleet[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedBoat, setSelectedBoat] = useState<Fleet | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [reordering, setReordering] = useState(false)

  useEffect(() => {
    fetchFleet()
  }, [])

  const fetchFleet = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/fleet')
      
      if (!response.ok) {
        throw new Error('Failed to fetch fleet')
      }

      const { fleet } = await response.json()
      setFleet(fleet || [])
    } catch (error) {
      console.error('[FleetAdmin] Error fetching:', error)
      setErrorMessage('Failed to load fleet')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this yacht?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/fleet?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete yacht')
      }

      setSuccessMessage('Yacht deleted successfully')
      setToast({ message: 'Yacht deleted successfully', type: 'success' })
      fetchFleet()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('[FleetAdmin] Error deleting:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete yacht')
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  // Move yacht up in order
  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    
    const newFleet = [...fleet]
    const temp = newFleet[index]
    newFleet[index] = newFleet[index - 1]
    newFleet[index - 1] = temp
    
    // Update local state immediately for responsiveness
    setFleet(newFleet)
    
    // Save new order to database
    await saveOrder(newFleet)
  }

  // Move yacht down in order
  const handleMoveDown = async (index: number) => {
    if (index === fleet.length - 1) return
    
    const newFleet = [...fleet]
    const temp = newFleet[index]
    newFleet[index] = newFleet[index + 1]
    newFleet[index + 1] = temp
    
    // Update local state immediately for responsiveness
    setFleet(newFleet)
    
    // Save new order to database
    await saveOrder(newFleet)
  }

  // Save order to database
  const saveOrder = async (orderedFleet: Fleet[]) => {
    try {
      setReordering(true)
      
      // Create array of {id, order_index} for the API
      const items = orderedFleet.map((yacht, index) => ({
        id: yacht.id,
        order_index: index
      }))

      const response = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'fleet',
          items
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save order')
      }

      setSuccessMessage('Order updated successfully')
      setToast({ message: 'Fleet order updated', type: 'success' })
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (error) {
      console.error('[FleetAdmin] Error saving order:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save order')
      setToast({ message: 'Failed to save order', type: 'error' })
      setTimeout(() => setErrorMessage(null), 3000)
      // Refresh from server on error
      fetchFleet()
    } finally {
      setReordering(false)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-luxury-blue">Fleet Management</h1>
          <p className="text-gray-600 mt-1">Manage your yacht fleet</p>
        </div>
        <button
          onClick={() => {
            setSelectedBoat(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New Yacht
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

      {/* Fleet Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {fleet.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No yachts found. Click "Add New Yacht" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-4 text-center text-sm font-semibold text-gray-700 w-20">Order</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Year</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Length</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Capacity</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Prices</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fleet.map((yacht, index) => (
                  <tr key={yacht.id} className="hover:bg-gray-50 transition-colors">
                    {/* Order Column with Up/Down Buttons */}
                    <td className="px-3 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || reordering}
                          className="p-1 text-gray-500 hover:text-luxury-blue hover:bg-luxury-blue/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium text-gray-500 w-6 text-center">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === fleet.length - 1 || reordering}
                          className="p-1 text-gray-500 hover:text-luxury-blue hover:bg-luxury-blue/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800">{yacht.name}</div>
                      <div className="text-sm text-gray-500">{yacht.slug}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{yacht.year || '-'}</td>
                    <td className="px-4 py-4 text-gray-600">{yacht.length ? `${yacht.length}m` : '-'}</td>
                    <td className="px-4 py-4 text-gray-600">{yacht.capacity || '-'}</td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="text-xs">
                        {yacht.low_season_price && <div>Low: €{yacht.low_season_price}</div>}
                        {yacht.medium_season_price && <div>Med: €{yacht.medium_season_price}</div>}
                        {yacht.high_season_price && <div>High: €{yacht.high_season_price}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          yacht.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {yacht.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBoat(yacht)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-luxury-blue hover:bg-luxury-blue/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(yacht.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Fleet Editor Modal */}
      <FleetEditor
        fleet={selectedBoat}
        isOpen={isModalOpen}
        onClose={() => {
          console.log('[FleetAdmin] Closing modal')
          setIsModalOpen(false)
          setSelectedBoat(null)
        }}
        onSave={() => {
          console.log('[FleetAdmin] Save callback triggered')
          fetchFleet()
          const message = selectedBoat ? 'Yacht updated successfully!' : 'Yacht created successfully!'
          setSuccessMessage(message)
          setToast({ message, type: 'success' })
          setTimeout(() => setSuccessMessage(null), 3000)
          setIsModalOpen(false)
          setSelectedBoat(null)
        }}
      />

      {/* Toast Notification */}
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        isVisible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
