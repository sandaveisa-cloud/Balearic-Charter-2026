/**
 * Helper utilities for multi-language JSONB operations
 */

export type Locale = 'en' | 'es' | 'de'

/**
 * Get localized text from a JSONB object with fallback
 */
export function getLocalizedText(
  i18nObject: Record<string, string> | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): string {
  if (!i18nObject) return ''
  
  // Try current locale first
  if (i18nObject[locale]) {
    return i18nObject[locale]
  }
  
  // Fallback to default locale
  if (i18nObject[fallbackLocale]) {
    return i18nObject[fallbackLocale]
  }
  
  // Fallback to any available locale
  const availableLocales = Object.keys(i18nObject)
  if (availableLocales.length > 0) {
    return i18nObject[availableLocales[0]]
  }
  
  return ''
}

/**
 * Create a JSONB patch object that updates only a specific locale key
 * This preserves existing translations in other locales
 */
export function createI18nPatch(
  currentI18nObject: Record<string, string> | null | undefined,
  locale: Locale,
  newValue: string | null
): Record<string, string> | null {
  // If new value is null or empty, remove the locale key
  if (!newValue || newValue.trim() === '') {
    if (!currentI18nObject) return null
    
    const updated = { ...currentI18nObject }
    delete updated[locale]
    
    // If no locales remain, return null
    return Object.keys(updated).length > 0 ? updated : null
  }
  
  // Merge with existing translations
  return {
    ...(currentI18nObject || {}),
    [locale]: newValue.trim()
  }
}

/**
 * Build Supabase update object for JSONB i18n columns
 * This uses Supabase's jsonb_set function via RPC or direct update
 */
export function buildI18nUpdate(
  columnName: string,
  currentValue: Record<string, string> | null | undefined,
  locale: Locale,
  newValue: string | null
): { [key: string]: Record<string, string> | null } {
  const patched = createI18nPatch(currentValue, locale, newValue)
  return {
    [columnName]: patched
  }
}

/**
 * Helper to get description for current locale with fallback
 */
export function getDescriptionForLocale(
  fleet: { description_i18n?: Record<string, string> | null, description?: string | null },
  locale: Locale
): string {
  // Try i18n first
  const i18nText = getLocalizedText(fleet.description_i18n, locale)
  if (i18nText) return i18nText
  
  // Fallback to legacy description field
  return fleet.description || ''
}

/**
 * Helper to get short description for current locale with fallback
 */
export function getShortDescriptionForLocale(
  fleet: { short_description_i18n?: Record<string, string> | null, short_description?: string | null },
  locale: Locale
): string {
  // Try i18n first
  const i18nText = getLocalizedText(fleet.short_description_i18n, locale)
  if (i18nText) return i18nText
  
  // Fallback to legacy short_description field
  return fleet.short_description || ''
}

/**
 * Helper to get description for current locale with fallback
 * Supports both JSONB (description_i18n) and TEXT columns (description_en, description_es, description_de)
 */
export function getDescriptionForLocaleWithTextColumns(
  fleet: { 
    description_i18n?: Record<string, string> | null
    description_en?: string | null
    description_es?: string | null
    description_de?: string | null
    description?: string | null
  },
  locale: Locale
): string {
  // Priority 1: Try JSONB i18n column
  const i18nText = getLocalizedText(fleet.description_i18n, locale)
  if (i18nText) return i18nText
  
  // Priority 2: Try TEXT columns based on locale
  switch (locale) {
    case 'es':
      if (fleet.description_es) return fleet.description_es
      break
    case 'de':
      if (fleet.description_de) return fleet.description_de
      break
    case 'en':
      if (fleet.description_en) return fleet.description_en
      break
  }
  
  // Priority 3: Fallback to English TEXT column
  if (fleet.description_en) return fleet.description_en
  
  // Priority 4: Fallback to legacy description field
  return fleet.description || ''
}
