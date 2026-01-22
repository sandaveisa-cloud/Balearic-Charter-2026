/**
 * Supabase Admin Client with Service Role Key
 * This client bypasses RLS and should ONLY be used in server-side admin operations
 * NEVER expose this client to the client-side code
 */

import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Create a Supabase admin client with service role key
 * This bypasses RLS and should only be used for admin operations
 */
export function createSupabaseAdminClient() {
  // Return existing client if already created
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[Supabase Admin] ❌ Missing environment variables:')
    console.error('[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing')
    throw new Error('Missing Supabase admin environment variables. SUPABASE_SERVICE_ROLE_KEY must be set.')
  }

  console.log('[Supabase Admin] ✅ Admin client initialized with service role key (bypasses RLS)')

  // Create admin client with service role key (bypasses RLS)
  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return adminClient
}
