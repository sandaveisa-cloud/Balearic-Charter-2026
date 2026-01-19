import { createClient } from '@supabase/supabase-js'

// Debug: Check for environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('[Supabase] NEXT_PUBLIC_SUPABASE_URL is missing!')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
}

const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// URL validation: Remove trailing slash if present
const supabaseUrl = supabaseUrlRaw.endsWith('/') 
  ? supabaseUrlRaw.slice(0, -1) 
  : supabaseUrlRaw

// Debug: Log URL configuration (without exposing the full key)
if (supabaseUrl) {
  console.log('[Supabase] Initializing client with URL:', supabaseUrl)
  console.log('[Supabase] Anon Key present:', supabaseAnonKey ? 'Yes' : 'No')
  
  // Warn if URL had trailing slash
  if (supabaseUrlRaw.endsWith('/')) {
    console.warn('[Supabase] Removed trailing slash from URL')
  }
} else {
  console.error('[Supabase] Supabase URL is empty! Client initialization will fail.')
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Supabase environment variables are not set correctly')
  console.error('[Supabase] URL:', supabaseUrl ? 'Present' : 'Missing')
  console.error('[Supabase] Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Debug: Verify client creation
if (supabase) {
  console.log('[Supabase] Client created successfully')
} else {
  console.error('[Supabase] Failed to create Supabase client!')
}
