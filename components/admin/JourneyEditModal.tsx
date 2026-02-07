'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { JourneyMilestone } from '@/types/database'
import Toast from './Toast'
import ImageUploader from './ImageUploader'

interface JourneyEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  milestone: JourneyMilestone | null
}

export default function JourneyEditModal({ isOpen, onClose, onSave, milestone }: JourneyEditModalProps) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title_en: '',
    title_es: '',
    title_de: '',
    description_en: '',
    description_es: '',
    description_de: '',
    image_url: '',
    order_index: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (milestone) {
      setFormData({
        year: milestone.year,
        title_en: milestone.title_en || '',
        title_es: milestone.title_es || '',
        title_de: milestone.title_de || '',
        description_en: milestone.description_en || '',
        description_es: milestone.description_es || '',
        description_de: milestone.description_de || '',
        image_url: milestone.image_url || '',
        order_index: milestone.order_index || 0,
        is_active: milestone.is_active ?? true,
      })
    } else {
      setFormData({
        year: new Date().getFullYear(),
        title_en: '',
        title_es: '',
        title_de: '',
        description_en: '',
        description_es: '',
        description_de: '',
        image_url: '',
        order_index: 0,
        is_active: true,
      })
    }
  }, [milestone, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const method = milestone ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/journey', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone ? { ...formData, id: milestone.id } : formData)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }
      setToastMessage('Milestone saved successfully!')
      setToastType('success')
      setShowToast(true)
      onSave()
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error: any) {
      console.error(error)
      setToastMessage(error.message || 'Error saving milestone. Please try again.')
      setToastType('error')
      setShowToast(true)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto">
        <div className="bg-gradient-to-r from-[#001F3F] to-[#1B263B] p-6 flex items-center justify-between text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">{milestone ? 'Edit Milestone' : 'Create New Milestone'}</h2>
          <button onClick={onClose} className="hover:text-[#C5A059] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Year & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                type="number"
                required
                min="1900"
                max="2100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <ImageUploader
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="milestones"
              bucket="website-assets"
              maxSizeMB={0.5}
              aspectRatio="16/9"
              label="Milestone Image"
            />
          </div>

          {/* English */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">English (EN)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Spanish */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spanish (ES)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.title_es}
                  onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.description_es}
                  onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* German */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">German (DE)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.title_de}
                  onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                  value={formData.description_de}
                  onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible on website)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#001F3F] to-[#1B263B] text-white rounded-lg flex items-center gap-2 hover:from-[#1B263B] hover:to-[#001F3F] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
