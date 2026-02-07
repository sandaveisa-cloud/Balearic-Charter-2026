'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { MissionPromise } from '@/types/database'

interface MissionEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  promise: MissionPromise | null
}

const AVAILABLE_ICONS = [
  { value: 'Ship', label: 'Ship' },
  { value: 'ShieldCheck', label: 'Shield Check' },
  { value: 'Utensils', label: 'Utensils' },
  { value: 'Anchor', label: 'Anchor' },
  { value: 'Compass', label: 'Compass' },
  { value: 'Users', label: 'Users' },
]

export default function MissionEditModal({ isOpen, onClose, onSave, promise }: MissionEditModalProps) {
  const [formData, setFormData] = useState({
    title_en: '',
    title_es: '',
    title_de: '',
    description_en: '',
    description_es: '',
    description_de: '',
    icon_name: 'Ship',
    icon_url: '',
    order_index: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (promise) {
      setFormData({
        title_en: promise.title_en || '',
        title_es: promise.title_es || '',
        title_de: promise.title_de || '',
        description_en: promise.description_en || '',
        description_es: promise.description_es || '',
        description_de: promise.description_de || '',
        icon_name: promise.icon_name || 'Ship',
        icon_url: promise.icon_url || '',
        order_index: promise.order_index || 0,
        is_active: promise.is_active ?? true,
      })
    } else {
      setFormData({
        title_en: '',
        title_es: '',
        title_de: '',
        description_en: '',
        description_es: '',
        description_de: '',
        icon_name: 'Ship',
        icon_url: '',
        order_index: 0,
        is_active: true,
      })
    }
  }, [promise, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const method = promise ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/mission', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promise ? { ...formData, id: promise.id } : formData)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }
      onSave()
      onClose()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Error saving promise. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto">
        <div className="bg-gradient-to-r from-[#001F3F] to-[#1B263B] p-6 flex items-center justify-between text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">{promise ? 'Edit Promise' : 'Create New Promise'}</h2>
          <button onClick={onClose} className="hover:text-[#C5A059] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Index */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Icon Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value, icon_url: '' })}
              >
                {AVAILABLE_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Icon URL (optional)</label>
              <input
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                placeholder="https://... (overrides icon name)"
              />
            </div>
          </div>
          {formData.icon_url && (
            <div className="rounded-lg overflow-hidden">
              <img src={formData.icon_url} alt="Icon preview" className="w-16 h-16 object-contain" />
            </div>
          )}

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
                  rows={3}
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
                  rows={3}
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
                  rows={3}
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
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Promise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
