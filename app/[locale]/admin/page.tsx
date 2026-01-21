import { unstable_noStore as noStore } from 'next/cache'
import AdminDashboard from '@/components/AdminDashboard'

// Explicitly force dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Admin Page - Server Component Wrapper
 * This server component wraps the client-side AdminDashboard to ensure
 * the route is dynamically rendered and the layout's auth check runs on every request.
 * 
 * THE KILL SWITCH: unstable_noStore() guarantees the page cannot be static.
 */
export default function AdminPage() {
  // THE KILL SWITCH: This guarantees the page cannot be static
  noStore()
  
  return <AdminDashboard />
}
