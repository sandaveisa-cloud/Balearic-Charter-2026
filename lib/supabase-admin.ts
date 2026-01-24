/**
 * Supabase Admin Client with Service Role Key
 * This client bypasses RLS and should ONLY be used in server-side admin operations
 * NEVER expose this client to the client-side code
 */

import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null
let initializationLogged = false

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

  if (!supabaseUrl) {
    console.error('[Supabase Admin] ❌ NEXT_PUBLIC_SUPABASE_URL is not set')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
  }

  if (!serviceRoleKey) {
    console.error('[Supabase Admin] ❌ SUPABASE_SERVICE_ROLE_KEY is not set')
    console.error('[Supabase Admin] 💡 Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
    console.error('[Supabase Admin] 💡 Get it from: Supabase Dashboard > Project Settings > API > service_role key')
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. This is required for admin operations.')
  }

  // Only log initialization once to reduce noise
  if (!initializationLogged) {
    console.log('[Supabase Admin] ✅ Admin client initialized (bypasses RLS)')
    initializationLogged = true
  }

  // Create admin client with service role key (bypasses RLS)
  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return adminClient
}
