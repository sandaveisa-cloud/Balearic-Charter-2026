import { createClient } from '@supabase/supabase-js'

// Singleton pattern: Create Supabase client only once
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Check for environment variables
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

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Supabase environment variables are not set correctly')
    throw new Error('Supabase environment variables are missing')
  }

  // Create and cache the client
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Export singleton instance
export const supabase = getSupabaseClient()
