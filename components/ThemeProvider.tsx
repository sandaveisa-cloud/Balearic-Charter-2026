'use client'

import { useEffect, useState } from 'react'
import { getSiteSettingsClient } from '@/lib/data'

export default function ThemeProvider() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    getSiteSettingsClient().then(setSettings)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !settings) return

    // Get theme colors from settings
    const primaryColor = settings.theme_primary_color || '#1B263B'
    const secondaryColor = settings.theme_secondary_color || '#C5A059'
    const backgroundColor = settings.theme_background_color || '#FFFFFF'

    // Update CSS variables
    const root = document.documentElement
    root.style.setProperty('--primary-color', primaryColor)
    root.style.setProperty('--secondary-color', secondaryColor)
    root.style.setProperty('--background-color', backgroundColor)
    
    // Also update legacy variables for backward compatibility
    root.style.setProperty('--luxury-blue', primaryColor)
    root.style.setProperty('--luxury-gold', secondaryColor)
    root.style.setProperty('--luxury-background', backgroundColor)
  }, [settings])

  return null
}
