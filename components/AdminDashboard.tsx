'use client'

import { useState, useEffect } from 'react'
import { Users, Ship, Image as ImageIcon, Euro, Clock, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'
import type { BookingInquiry, Fleet } from '@/types/database'

interface DashboardStats {
  totalInquiries: number
  fleetSize: number
  galleryImages: number
  revenuePotential: number
}

interface RecentInquiry extends BookingInquiry {
  yacht_name?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInquiries: 0,
    fleetSize: 0,
    galleryImages: 0,
    revenuePotential: 0,
  })
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Safety timeout: Force loading to false after 5 seconds (reduced from 10)
    // This prevents infinite spinner but still allows reasonable fetch time
    const timeoutId = setTimeout(() => {
      console.warn('[Dashboard] ⚠️ Safety timeout: Forcing loading to false after 5 seconds')
      console.warn('[Dashboard] This may indicate:')
      console.warn('[Dashboard] 1. Network issues')
      console.warn('[Dashboard] 2. RLS blocking access')
      console.warn('[Dashboard] 3. Supabase connection problems')
      setLoading(false)
    }, 5000) // Reduced from 10000 to 5000
    
    return () => clearTimeout(timeoutId)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('[Dashboard] Starting data fetch via admin API...')

      // Use admin API routes that bypass RLS using service role key
      const [statsResponse, inquiriesResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/inquiries'),
      ])

      // Check if responses are OK
      if (!statsResponse.ok) {
        const errorData = await statsResponse.json().catch(() => ({}))
        console.error('[Dashboard] ❌ Error fetching stats:', statsResponse.status, errorData)
        throw new Error(`Failed to fetch stats: ${statsResponse.status}`)
      }

      if (!inquiriesResponse.ok) {
        const errorData = await inquiriesResponse.json().catch(() => ({}))
        console.error('[Dashboard] ❌ Error fetching inquiries:', inquiriesResponse.status, errorData)
        throw new Error(`Failed to fetch inquiries: ${inquiriesResponse.status}`)
      }

      // Parse responses
      const statsData = await statsResponse.json()
      const inquiriesData = await inquiriesResponse.json()

      console.log('[Dashboard] ✅ Stats data received:', statsData)
      console.log('[Dashboard] ✅ Inquiries data received:', inquiriesData)
      console.log('[Dashboard] Total inquiries:', inquiriesData.total || 0)
      console.log('[Dashboard] Inquiries array length:', inquiriesData.inquiries?.length || 0)

      // Set stats from API response
      setStats(statsData.stats || {
        totalInquiries: 0,
        fleetSize: 0,
        galleryImages: 0,
        revenuePotential: 0,
      })

      // Get recent inquiries (already sorted and with yacht names from API)
      const recentInquiriesList = (inquiriesData.inquiries || [])
        .slice(0, 5) // Take top 5 most recent
      
      console.log('[Dashboard] Setting recentInquiries with', recentInquiriesList.length, 'items')
      console.log('[Dashboard] Recent inquiries details:', recentInquiriesList.map((i: any) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        yacht_name: i.yacht_name
      })))
      
      setRecentInquiries(recentInquiriesList)
      
      // CRITICAL: Set loading to false immediately after setting data
      // Don't wait for timeout - if we have data (even if empty), show it
      setLoading(false)
      console.log('[Dashboard] ✅ Data fetch completed, loading set to false')
      console.log('[Dashboard] Final state - totalInquiries:', statsData.stats?.totalInquiries || 0, 'recentInquiries:', recentInquiriesList.length)
    } catch (error) {
      console.error('[Dashboard] ❌ CRITICAL ERROR in fetchDashboardData:', error)
      console.error('[Dashboard] Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('[Dashboard] Error message:', error instanceof Error ? error.message : String(error))
      console.error('[Dashboard] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      // Set default values on error to prevent crashes
      setStats({
        totalInquiries: 0,
        fleetSize: 0,
        galleryImages: 0,
        revenuePotential: 0,
      })
      setRecentInquiries([])
      setLoading(false) // Always set loading to false, even on error
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Show loading state only briefly - if we have initial data, show it immediately
  // If loading takes too long or fails, show 0 values instead of spinner
  if (loading && stats.totalInquiries === 0 && recentInquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-blue"></div>
        <p className="text-sm text-gray-500">Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inquiries */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Inquiries</p>
              <p className="text-3xl font-bold text-luxury-blue">{stats.totalInquiries}</p>
            </div>
            <div className="bg-luxury-blue/10 p-3 rounded-lg">
              <Users className="w-8 h-8 text-luxury-blue" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All booking requests</p>
        </div>

        {/* Fleet Size */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Fleet Size</p>
              <p className="text-3xl font-bold text-luxury-blue">{stats.fleetSize}</p>
            </div>
            <div className="bg-luxury-gold/10 p-3 rounded-lg">
              <Ship className="w-8 h-8 text-luxury-gold" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Active yachts</p>
        </div>

        {/* Gallery Images */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Gallery Images</p>
              <p className="text-3xl font-bold text-luxury-blue">{stats.galleryImages}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ImageIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total images stored</p>
        </div>

        {/* Revenue Potential */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Revenue Potential</p>
              <p className="text-3xl font-bold text-luxury-blue">{formatCurrency(stats.revenuePotential)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Euro className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Estimated from inquiries</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-luxury-blue hover:text-luxury-gold transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No inquiries yet</p>
            {/* Debug info - remove after fixing */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400 mt-2">
                Debug: recentInquiries.length = {recentInquiries.length}, 
                stats.totalInquiries = {stats.totalInquiries}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {recentInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{inquiry.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                          inquiry.status
                        )}`}
                      >
                        {inquiry.status || 'Pending'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        <span>{inquiry.yacht_name || 'No yacht selected'}</span>
                      </div>
                      {inquiry.start_date && inquiry.end_date && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(new Date(inquiry.start_date), 'MMM d, yyyy')} -{' '}
                            {format(new Date(inquiry.end_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span className="text-xs">{inquiry.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                    <br />
                    {format(new Date(inquiry.created_at), 'HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
