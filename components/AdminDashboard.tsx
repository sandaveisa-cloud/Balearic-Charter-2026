'use client'

import { useState, useEffect } from 'react'
import { Users, Ship, Image as ImageIcon, Euro, Clock, Mail, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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
      console.log('[Dashboard] Starting data fetch...')

      // Check Supabase environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[Dashboard] ❌ CRITICAL: Supabase environment variables are missing!')
        console.error('[Dashboard] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
        console.error('[Dashboard] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
        setLoading(false)
        return
      }

      // CRITICAL: Check if user session exists before fetching data
      // This ensures RLS policies work correctly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('[Dashboard] ❌ Session error:', sessionError)
        console.error('[Dashboard] This may cause RLS to block access')
      }
      
      if (!session) {
        console.warn('[Dashboard] ⚠️ No active session found - RLS may block access')
        console.warn('[Dashboard] User may need to log in again')
      } else {
        console.log('[Dashboard] ✅ Active session found for user:', session.user.email)
      }

      // Fetch all data in parallel with timeout protection
      // Use Promise.allSettled to ensure we always get results, even if one fails
      const [inquiriesSettled, fleetSettled] = await Promise.allSettled([
        supabase.from('booking_inquiries').select('*'),
        supabase.from('fleet').select('id, gallery_images, low_season_price, medium_season_price, high_season_price'),
      ])

      // Extract results from settled promises
      const inquiriesResult = inquiriesSettled.status === 'fulfilled' 
        ? inquiriesSettled.value 
        : { data: null, error: { message: inquiriesSettled.reason?.message || 'Failed to fetch inquiries' } }
      
      const fleetResult = fleetSettled.status === 'fulfilled'
        ? fleetSettled.value
        : { data: null, error: { message: fleetSettled.reason?.message || 'Failed to fetch fleet' } }

      // CRITICAL: Detailed error logging for RLS and permission issues
      if (inquiriesResult.error) {
        console.error('[Dashboard] ❌ Error fetching inquiries:', inquiriesResult.error)
        console.error('[Dashboard] Error code:', inquiriesResult.error.code)
        console.error('[Dashboard] Error message:', inquiriesResult.error.message)
        console.error('[Dashboard] Error details:', inquiriesResult.error.details)
        console.error('[Dashboard] Error hint:', inquiriesResult.error.hint)
        
        // Check for RLS (Row Level Security) errors
        if (inquiriesResult.error.code === 'PGRST116' || inquiriesResult.error.message?.includes('permission denied') || inquiriesResult.error.message?.includes('RLS')) {
          console.error('[Dashboard] 🚨 RLS ERROR DETECTED: Row Level Security is blocking access to booking_inquiries table')
          console.error('[Dashboard] This usually means:')
          console.error('[Dashboard] 1. RLS policies are not set up correctly')
          console.error('[Dashboard] 2. User session is not authenticated properly')
          console.error('[Dashboard] 3. RLS policies do not allow SELECT for authenticated users')
        }
      }
      
      if (fleetResult.error) {
        console.error('[Dashboard] ❌ Error fetching fleet:', fleetResult.error)
        console.error('[Dashboard] Error code:', fleetResult.error.code)
        console.error('[Dashboard] Error message:', fleetResult.error.message)
        console.error('[Dashboard] Error details:', fleetResult.error.details)
        console.error('[Dashboard] Error hint:', fleetResult.error.hint)
        
        // Check for RLS errors
        if (fleetResult.error.code === 'PGRST116' || fleetResult.error.message?.includes('permission denied') || fleetResult.error.message?.includes('RLS')) {
          console.error('[Dashboard] 🚨 RLS ERROR DETECTED: Row Level Security is blocking access to fleet table')
        }
      }

      // Calculate stats - if data is null due to error, use 0 immediately
      const totalInquiries = (inquiriesResult.data && !inquiriesResult.error) ? inquiriesResult.data.length : 0
      const fleetSize = (fleetResult.data && !fleetResult.error) ? fleetResult.data.length : 0
      
      // Log success/failure
      if (inquiriesResult.error) {
        console.warn('[Dashboard] ⚠️ Using default value 0 for inquiries due to error')
      } else {
        console.log('[Dashboard] ✅ Successfully fetched', totalInquiries, 'inquiries')
      }
      
      if (fleetResult.error) {
        console.warn('[Dashboard] ⚠️ Using default value 0 for fleet due to error')
      } else {
        console.log('[Dashboard] ✅ Successfully fetched', fleetSize, 'fleet items')
      }

      // Calculate gallery images
      let galleryImages = 0
      fleetResult.data?.forEach((yacht: any) => {
        if (yacht.gallery_images && Array.isArray(yacht.gallery_images)) {
          galleryImages += yacht.gallery_images.length
        }
        // Also count main_image_url if it exists
        // (Note: main_image_url is not in gallery_images, so we count it separately if needed)
      })

      // Calculate revenue potential
      // Estimate based on average price and number of inquiries
      let revenuePotential = 0
      if (inquiriesResult.data && !inquiriesResult.error && fleetResult.data && !fleetResult.error) {
        inquiriesResult.data.forEach((inquiry: any) => {
          if (inquiry.start_date && inquiry.end_date) {
            // Find the yacht for this inquiry
            const yacht = fleetResult.data.find((y: any) => y.id === inquiry.yacht_id)
            if (yacht) {
              const yachtData = yacht as any
              // Calculate days
              const start = new Date(inquiry.start_date)
              const end = new Date(inquiry.end_date)
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

              // Determine season and use average price
              const avgPrice =
                ((yachtData.low_season_price || 0) +
                  (yachtData.medium_season_price || 0) +
                  (yachtData.high_season_price || 0)) /
                3

              // Estimate: base price + 30% APA + 21% tax
              const basePrice = avgPrice * days
              const estimatedTotal = basePrice * 1.51 // 1 + 0.30 (APA) + 0.21 (tax)
              revenuePotential += estimatedTotal
            }
          }
        })
      }

      // Fetch recent inquiries with yacht names - only if we have data
      const recentInquiriesData = (inquiriesResult.data && !inquiriesResult.error)
        ? (inquiriesResult.data as any[])
            .sort((a: any, b: any) => {
              const dateA = new Date(a.created_at).getTime()
              const dateB = new Date(b.created_at).getTime()
              return dateB - dateA
            })
            .slice(0, 5)
        : []

      // Fetch yacht names for inquiries with timeout protection
      // Use Promise.allSettled to ensure all inquiries are processed even if some fail
      const inquiriesWithYachtsSettled = await Promise.allSettled(
        recentInquiriesData.map(async (inquiry: any) => {
          if (inquiry.yacht_id) {
            try {
              const { data: yachtData, error: yachtError } = await supabase
                .from('fleet')
                .select('name, boat_name')
                .eq('id', inquiry.yacht_id)
                .single()

              if (yachtError) {
                console.error('[Dashboard] Error fetching yacht:', yachtError)
              }

              return {
                ...inquiry,
                yacht_name: (yachtData as any)?.name || (yachtData as any)?.boat_name || 'Unknown Yacht',
              }
            } catch (error) {
              console.error('[Dashboard] Error in yacht fetch:', error)
              return {
                ...inquiry,
                yacht_name: 'Unknown Yacht',
              }
            }
          }
          return {
            ...inquiry,
            yacht_name: 'No Yacht Selected',
          }
        })
      )

      // Extract successful results, use fallback for failed ones
      const inquiriesWithYachts = inquiriesWithYachtsSettled.map((settled, index) => {
        if (settled.status === 'fulfilled') {
          return settled.value
        }
        // If a promise failed, return the original inquiry with default yacht name
        return {
          ...recentInquiriesData[index],
          yacht_name: 'Unknown Yacht',
        }
      })

      setStats({
        totalInquiries,
        fleetSize,
        galleryImages,
        revenuePotential,
      })
      setRecentInquiries(inquiriesWithYachts)
      
      // CRITICAL: Set loading to false immediately after setting data
      // Don't wait for timeout - if we have data (even if empty), show it
      setLoading(false)
      console.log('[Dashboard] ✅ Data fetch completed, loading set to false')
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
