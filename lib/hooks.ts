'use client'

import { useState, useEffect } from 'react'
import { getSiteSettingsClient } from './data'

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    getSiteSettingsClient().then(setSettings)
  }, [])

  return settings
}
