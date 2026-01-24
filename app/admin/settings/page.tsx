'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Palette, 
  Globe, 
  Phone, 
  Building,
  Eye,
  RefreshCw
} from 'lucide-react'

type TabType = 'general' | 'theme' | 'contact' | 'visibility'

const defaultThemeColors = {
  theme_primary_color: '#1B263B',
  theme_secondary_color: '#C5A059',
  theme_background_color: '#FFFFFF',
}

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const { settings: fetchedSettings } = await response.json()
      
      // Merge with defaults for theme colors
      setSettings({
        ...defaultThemeColors,
        ...fetchedSettings,
      })
    } catch (error) {
      console.error('[SettingsAdmin] Error fetching:', error)
      setErrorMessage('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      setSuccessMessage('Settings saved successfully!')
      
      // If theme colors were changed, reload to apply them
      if (activeTab === 'theme') {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (error) {
      console.error('[SettingsAdmin] Error saving:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings')
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetThemeToDefaults = () => {
    setSettings(prev => ({
      ...prev,
      ...defaultThemeColors,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-luxury-blue" />
      </div>
    )
  }

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: Building },
    { id: 'theme' as TabType, label: 'Theme', icon: Palette },
    { id: 'contact' as TabType, label: 'Contact', icon: Phone },
    { id: 'visibility' as TabType, label: 'Visibility', icon: Eye },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-luxury-blue">Site Settings</h1>
          <p className="text-gray-600 mt-1">Manage global website settings and theme</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-colors shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Settings
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-luxury-blue border-luxury-blue bg-white'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Building className="w-5 h-5 text-luxury-gold" />
                General Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.company_name || ''}
                    onChange={(e) => updateSetting('company_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="Balearic & Costa Blanca Charters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={settings.website_url || ''}
                    onChange={(e) => updateSetting('website_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={settings.hero_title || ''}
                    onChange={(e) => updateSetting('hero_title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="Luxury Yacht Charters"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    value={settings.hero_subtitle || ''}
                    onChange={(e) => updateSetting('hero_subtitle', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="Experience the Mediterranean like never before..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Video URL (YouTube)
                  </label>
                  <input
                    type="url"
                    value={settings.hero_video_url || ''}
                    onChange={(e) => updateSetting('hero_video_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">YouTube video URL for the hero background</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings.default_currency || 'EUR'}
                    onChange={(e) => updateSetting('default_currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <select
                    value={settings.default_language || 'en'}
                    onChange={(e) => updateSetting('default_language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Theme Settings Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-luxury-gold" />
                  Theme Colors
                </h3>
                <button
                  type="button"
                  onClick={resetThemeToDefaults}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </div>

              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                Customize your website&apos;s color scheme. Changes will apply site-wide after saving. 
                The page will reload automatically to apply new theme colors.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primary Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Primary Color (Navy)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme_primary_color || defaultThemeColors.theme_primary_color}
                      onChange={(e) => updateSetting('theme_primary_color', e.target.value)}
                      className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.theme_primary_color || defaultThemeColors.theme_primary_color}
                      onChange={(e) => updateSetting('theme_primary_color', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent font-mono uppercase"
                      placeholder="#1B263B"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Used for headers, buttons, and primary elements</p>
                  
                  {/* Preview */}
                  <div 
                    className="h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: settings.theme_primary_color || defaultThemeColors.theme_primary_color }}
                  >
                    Primary Color Preview
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Secondary Color (Gold)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme_secondary_color || defaultThemeColors.theme_secondary_color}
                      onChange={(e) => updateSetting('theme_secondary_color', e.target.value)}
                      className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.theme_secondary_color || defaultThemeColors.theme_secondary_color}
                      onChange={(e) => updateSetting('theme_secondary_color', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent font-mono uppercase"
                      placeholder="#C5A059"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Used for accents, stars, and highlights</p>
                  
                  {/* Preview */}
                  <div 
                    className="h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: settings.theme_secondary_color || defaultThemeColors.theme_secondary_color }}
                  >
                    Secondary Color Preview
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme_background_color || defaultThemeColors.theme_background_color}
                      onChange={(e) => updateSetting('theme_background_color', e.target.value)}
                      className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.theme_background_color || defaultThemeColors.theme_background_color}
                      onChange={(e) => updateSetting('theme_background_color', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent font-mono uppercase"
                      placeholder="#FFFFFF"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Main page background color</p>
                  
                  {/* Preview */}
                  <div 
                    className="h-12 rounded-lg flex items-center justify-center font-semibold border border-gray-300"
                    style={{ 
                      backgroundColor: settings.theme_background_color || defaultThemeColors.theme_background_color,
                      color: settings.theme_primary_color || defaultThemeColors.theme_primary_color
                    }}
                  >
                    Background Preview
                  </div>
                </div>
              </div>

              {/* Full Preview */}
              <div className="mt-8 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h4>
                <div 
                  className="p-6 rounded-xl border border-gray-200"
                  style={{ backgroundColor: settings.theme_background_color || defaultThemeColors.theme_background_color }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 
                      className="text-2xl font-bold"
                      style={{ color: settings.theme_primary_color || defaultThemeColors.theme_primary_color }}
                    >
                      Luxury Yacht Charter
                    </h5>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          style={{ color: settings.theme_secondary_color || defaultThemeColors.theme_secondary_color }}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Experience the Mediterranean aboard our premium fleet. 
                    Sail to exclusive destinations in ultimate comfort and style.
                  </p>
                  <div className="flex gap-3">
                    <button
                      className="px-6 py-2 rounded-lg font-semibold text-white transition-colors"
                      style={{ backgroundColor: settings.theme_primary_color || defaultThemeColors.theme_primary_color }}
                    >
                      Get a Quote
                    </button>
                    <button
                      className="px-6 py-2 rounded-lg font-semibold transition-colors"
                      style={{ 
                        backgroundColor: settings.theme_secondary_color || defaultThemeColors.theme_secondary_color,
                        color: settings.theme_primary_color || defaultThemeColors.theme_primary_color
                      }}
                    >
                      View Fleet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Settings Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-luxury-gold" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.contact_phone || ''}
                    onChange={(e) => updateSetting('contact_phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="+34 680 957 096"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => updateSetting('contact_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="info@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locations
                  </label>
                  <input
                    type="text"
                    value={settings.contact_locations || ''}
                    onChange={(e) => updateSetting('contact_locations', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="Ibiza, Mallorca, Costa Blanca"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate locations with commas</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Link
                  </label>
                  <input
                    type="url"
                    value={settings.whatsapp_link || ''}
                    onChange={(e) => updateSetting('whatsapp_link', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="https://wa.me/34680957096"
                  />
                  <p className="text-xs text-gray-500 mt-1">WhatsApp click-to-chat URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram Link
                  </label>
                  <input
                    type="url"
                    value={settings.telegram_link || ''}
                    onChange={(e) => updateSetting('telegram_link', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="https://t.me/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Link
                  </label>
                  <input
                    type="url"
                    value={settings.instagram_link || ''}
                    onChange={(e) => updateSetting('instagram_link', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    value={settings.business_address || ''}
                    onChange={(e) => updateSetting('business_address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
                    placeholder="Your business address..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Visibility Settings Tab */}
          {activeTab === 'visibility' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-luxury-gold" />
                Section Visibility
              </h3>

              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                Toggle sections on or off to customize which content appears on your website.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'show_journey_section', label: 'Journey Section', description: 'About us / Company story' },
                  { key: 'show_mission_section', label: 'Mission Section', description: 'Company mission statement' },
                  { key: 'show_crew_section', label: 'Crew Section', description: 'Meet the crew profiles' },
                  { key: 'show_culinary_section', label: 'Culinary Section', description: 'Food & dining experiences' },
                  { key: 'show_destinations_section', label: 'Destinations Section', description: 'Sailing destinations grid' },
                  { key: 'show_reviews_section', label: 'Reviews Section', description: 'Customer testimonials' },
                  { key: 'show_stats_section', label: 'Stats Section', description: 'Company statistics' },
                  { key: 'show_contact_section', label: 'Contact Section', description: 'Contact information' },
                ].map((section) => (
                  <div 
                    key={section.key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <label className="font-medium text-gray-800">{section.label}</label>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[section.key] !== 'false'}
                        onChange={(e) => updateSetting(section.key, e.target.checked ? 'true' : 'false')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-blue/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-blue"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
