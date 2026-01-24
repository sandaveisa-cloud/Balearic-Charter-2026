'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

interface ReviewEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  review: any | null
}

export default function ReviewEditModal({ isOpen, onClose, onSave, review }: ReviewEditModalProps) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_location: '',
    rating: 5,
    review_text: '',
    is_approved: true,
    is_featured: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (review) {
      setFormData({
        guest_name: review.guest_name || '',
        guest_location: review.guest_location || '',
        rating: review.rating || 5,
        review_text: review.review_text || '',
        is_approved: review.is_approved ?? true,
        is_featured: review.is_featured ?? false
      })
    } else {
      setFormData({ guest_name: '', guest_location: '', rating: 5, review_text: '', is_approved: true, is_featured: false })
    }
  }, [review, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const method = review ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/reviews', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review ? { ...formData, id: review.id } : formData)
      })
      if (!response.ok) throw new Error('Failed to save')
      onSave()
      onClose()
    } catch (error) {
      console.error(error)
      alert('Error saving review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-[#1e3a5f] p-6 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold">{review ? 'Edit Review' : 'Create New Review'}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
              <input required className="w-full p-2 border rounded-lg" value={formData.guest_name} onChange={(e) => setFormData({...formData, guest_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input className="w-full p-2 border rounded-lg" value={formData.guest_location} onChange={(e) => setFormData({...formData, guest_location: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
            <select className="w-full p-2 border rounded-lg bg-white" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars {'★'.repeat(n)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
            <textarea required rows={4} className="w-full p-2 border rounded-lg" value={formData.review_text} onChange={(e) => setFormData({...formData, review_text: e.target.value})} />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.is_approved} onChange={(e) => setFormData({...formData, is_approved: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm">Approved</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm">Featured</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button disabled={saving} type="submit" className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg flex items-center gap-2 hover:bg-[#c9a227] transition-colors">
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}