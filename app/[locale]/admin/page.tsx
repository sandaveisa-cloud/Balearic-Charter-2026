import AdminDashboard from '@/components/AdminDashboard'

// CRITICAL: Force dynamic rendering to prevent static generation
// This ensures the route is marked as Dynamic (ƒ) not Static (●) in Vercel
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * Admin Page - Server Component Wrapper
 * This server component wraps the client-side AdminDashboard to ensure
 * the route is dynamically rendered and the layout's auth check runs on every request.
 */
export default function AdminPage() {
  return <AdminDashboard />
}
