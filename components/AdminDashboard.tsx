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
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [inquiriesResult, fleetResult] = await Promise.all([
        supabase.from('booking_inquiries').select('*'),
        supabase.from('fleet').select('id, gallery_images, low_season_price, medium_season_price, high_season_price'),
      ])

      // Check for errors
      if (inquiriesResult.error) {
        console.error('[Dashboard] Error fetching inquiries:', inquiriesResult.error)
      }
      if (fleetResult.error) {
        console.error('[Dashboard] Error fetching fleet:', fleetResult.error)
      }

      // Calculate stats
      const totalInquiries = inquiriesResult.data?.length || 0
      const fleetSize = fleetResult.data?.length || 0

      // Calculate gallery images
      let galleryImages = 0
      fleetResult.data?.forEach((yacht) => {
        if (yacht.gallery_images && Array.isArray(yacht.gallery_images)) {
          galleryImages += yacht.gallery_images.length
        }
        // Also count main_image_url if it exists
        // (Note: main_image_url is not in gallery_images, so we count it separately if needed)
      })

      // Calculate revenue potential
      // Estimate based on average price and number of inquiries
      let revenuePotential = 0
      if (inquiriesResult.data && fleetResult.data) {
        inquiriesResult.data.forEach((inquiry) => {
          if (inquiry.start_date && inquiry.end_date) {
            // Find the yacht for this inquiry
            const yacht = fleetResult.data.find((y) => y.id === inquiry.yacht_id)
            if (yacht) {
              // Calculate days
              const start = new Date(inquiry.start_date)
              const end = new Date(inquiry.end_date)
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

              // Determine season and use average price
              const avgPrice =
                ((yacht.low_season_price || 0) +
                  (yacht.medium_season_price || 0) +
                  (yacht.high_season_price || 0)) /
                3

              // Estimate: base price + 30% APA + 21% tax
              const basePrice = avgPrice * days
              const estimatedTotal = basePrice * 1.51 // 1 + 0.30 (APA) + 0.21 (tax)
              revenuePotential += estimatedTotal
            }
          }
        })
      }

      // Fetch recent inquiries with yacht names
      const recentInquiriesData = inquiriesResult.data
        ?.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateB - dateA
        })
        .slice(0, 5) || []

      // Fetch yacht names for inquiries
      const inquiriesWithYachts = await Promise.all(
        recentInquiriesData.map(async (inquiry) => {
          if (inquiry.yacht_id) {
            try {
              const { data: yachtData, error: yachtError } = await supabase
                .from('fleet')
                .select('name')
                .eq('id', inquiry.yacht_id)
                .single()

              if (yachtError) {
                console.error('[Dashboard] Error fetching yacht:', yachtError)
              }

              return {
                ...inquiry,
                yacht_name: yachtData?.name || 'Unknown Yacht',
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

      setStats({
        totalInquiries,
        fleetSize,
        galleryImages,
        revenuePotential,
      })
      setRecentInquiries(inquiriesWithYachts)
    } catch (error) {
      console.error('[Dashboard] Error fetching data:', error)
      // Set default values on error to prevent crashes
      setStats({
        totalInquiries: 0,
        fleetSize: 0,
        galleryImages: 0,
        revenuePotential: 0,
      })
      setRecentInquiries([])
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-blue"></div>
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
