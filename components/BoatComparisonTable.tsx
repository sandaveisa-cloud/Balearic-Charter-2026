'use client'

import { Check, X } from 'lucide-react'
import type { Fleet } from '@/types/database'

interface BoatComparisonTableProps {
  boats: Fleet[]
  className?: string
}

export default function BoatComparisonTable({
  boats,
  className = '',
}: BoatComparisonTableProps) {
  if (boats.length === 0) {
    return null
  }

  // Get flybridge status from amenities
  const hasFlybridge = (boat: Fleet) => {
    return boat.amenities?.flybridge === true
  }

  // Format currency
  const formatCurrency = (amount: number | null, currency: string = 'EUR') => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get lowest price for comparison
  const getLowestPrice = (boat: Fleet) => {
    const prices = [boat.low_season_price, boat.medium_season_price, boat.high_season_price].filter(
      (p): p is number => p !== null && p !== undefined
    )
    return prices.length > 0 ? Math.min(...prices) : null
  }

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-luxury-blue to-luxury-gold p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Compare Yachts</h2>
        <p className="text-white/90 text-sm">Side-by-side comparison of key specifications</p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Specification</th>
              {boats.map((boat) => (
                <th
                  key={boat.id}
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-800 min-w-[200px]"
                >
                  <div className="font-serif text-lg">{boat.name}</div>
                  {boat.year && (
                    <div className="text-xs text-gray-600 font-normal mt-1">({boat.year})</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Year */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">Year</td>
              {boats.map((boat) => (
                <td key={boat.id} className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                  {boat.year || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Length */}
            <tr className="hover:bg-gray-50 bg-gray-50/50">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">Length</td>
              {boats.map((boat) => (
                <td key={boat.id} className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                  {boat.length ? `${boat.length}m` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Cabins */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">Cabins</td>
              {boats.map((boat) => (
                <td key={boat.id} className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                  {boat.cabins || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Max Guests */}
            <tr className="hover:bg-gray-50 bg-gray-50/50">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">Max Guests</td>
              {boats.map((boat) => (
                <td key={boat.id} className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                  {boat.capacity || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Flybridge */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">Flybridge</td>
              {boats.map((boat) => {
                const hasFly = hasFlybridge(boat)
                return (
                  <td key={boat.id} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      {hasFly ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-5 h-5" />
                          <span className="font-semibold">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <X className="w-5 h-5" />
                          <span>No</span>
                        </div>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>

            {/* Starting Price */}
            <tr className="hover:bg-gray-50 bg-gray-50/50 border-t-2 border-gray-300">
              <td className="px-6 py-4 text-sm font-semibold text-gray-800">Starting Price (Low Season)</td>
              {boats.map((boat) => {
                const lowestPrice = getLowestPrice(boat)
                return (
                  <td key={boat.id} className="px-6 py-4 text-center">
                    <div className="font-bold text-luxury-blue text-lg">
                      {lowestPrice ? formatCurrency(lowestPrice, boat.currency || 'EUR') : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">per day</div>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          * Prices may vary by season. Contact us for exact pricing based on your dates.
        </p>
      </div>
    </div>
  )
}
