import { headers } from 'next/headers'
import AdminDashboard from '@/components/AdminDashboard'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Admin Page - Server Component Wrapper
 * This server component wraps the client-side AdminDashboard to ensure
 * the route is dynamically rendered and the layout's auth check runs on every request.
 * 
 * MAGIC TRICK: Calling headers() forces dynamic rendering because headers
 * are only known at request time, preventing static generation.
 */
export default function AdminPage() {
  // MAGIC TRICK: Calling headers() forces dynamic rendering
  // because headers are only known at request time.
  const headersList = headers()
  
  return <AdminDashboard />
}
