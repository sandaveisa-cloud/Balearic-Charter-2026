'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Mail, 
  Phone, 
  Ship, 
  Calendar, 
  Edit, 
  Trash2, 
  XCircle,
  Search,
  Filter
} from 'lucide-react'
import type { BookingInquiry } from '@/types/database'

interface InquiryWithYacht extends BookingInquiry {
  yacht_name?: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
]

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryWithYacht[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingInquiry, setEditingInquiry] = useState<InquiryWithYacht | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/inquiries')
      if (!response.ok) throw new Error('Failed to fetch inquiries')
      const data = await response.json()
      setInquiries(data.inquiries || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      setErrorMessage('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inquiryId, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      setSuccessMessage('Status updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchInquiries()
    } catch (error) {
      console.error('Error updating status:', error)
      setErrorMessage('Failed to update status')
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    try {
      const response = await fetch(`/api/admin/inquiries?id=${inquiryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete inquiry')

      setSuccessMessage('Inquiry deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchInquiries()
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      setErrorMessage('Failed to delete inquiry')
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = 
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.yacht_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string | null) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusOption.color}`}>
        {statusOption.label}
      </span>
    )
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
          <h1 className="text-3xl font-bold text-gray-800">Booking Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage and respond to booking requests</p>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or yacht..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No inquiries found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Inquiry Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-800 text-lg">{inquiry.name}</h3>
                      {getStatusBadge(inquiry.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{inquiry.email}</span>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{inquiry.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        <span>{inquiry.yacht_name || 'No yacht selected'}</span>
                      </div>
                      {inquiry.start_date && inquiry.end_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(inquiry.start_date), 'MMM d, yyyy')} -{' '}
                            {format(new Date(inquiry.end_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {inquiry.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{inquiry.message}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Submitted: {format(new Date(inquiry.created_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                    {/* Quick Status Update */}
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusUpdate(inquiry.id, status.value)}
                          disabled={inquiry.status === status.value}
                          className={`
                            px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                            ${inquiry.status === status.value
                              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>

                    {/* Edit and Delete */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingInquiry(inquiry)}
                        className="flex items-center gap-2 px-4 py-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-blue/90 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingInquiry && (
        <InquiryEditModal
          inquiry={editingInquiry}
          onClose={() => setEditingInquiry(null)}
          onSave={() => {
            setEditingInquiry(null)
            fetchInquiries()
          }}
        />
      )}
    </div>
  )
}

function InquiryEditModal({
  inquiry,
  onClose,
  onSave,
}: {
  inquiry: InquiryWithYacht
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    status: inquiry.status || 'pending',
    notes: (inquiry as any).notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inquiry.id, ...formData }),
      })

      if (!response.ok) throw new Error('Failed to update inquiry')

      onSave()
    } catch (error) {
      console.error('Error updating inquiry:', error)
      alert('Failed to update inquiry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Inquiry</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Internal)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                placeholder="Add internal notes about this inquiry..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-luxury-blue text-white px-4 py-2 rounded-lg hover:bg-luxury-blue/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
