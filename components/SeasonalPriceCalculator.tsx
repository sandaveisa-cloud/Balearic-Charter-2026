'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { calculateEarlyBirdPrice, isEarlyBirdEligible, formatEarlyBirdDeadline } from '@/lib/earlyBirdDiscount'

interface SeasonalPriceCalculatorProps {
  lowSeasonPrice: number | null
  mediumSeasonPrice: number | null
  highSeasonPrice: number | null
  currency: string
  startDate: Date | null
  endDate: Date | null
  apaPercentage?: number | null
  crewServiceFee?: number | null
  cleaningFee?: number | null
  taxPercentage?: number | null
  onBreakdownChange?: (breakdown: PriceBreakdown) => void
}

export interface PriceBreakdown {
  baseCharterFee: number
  taxAmount: number
  apaAmount: number
  fixedFees: number
  totalEstimate: number
  days: number
  pricePerDay: number | null
  primarySeason: string
  breakdown: Array<{ season: string; days: number; pricePerDay: number | null; subtotal: number }>
  earlyBirdDiscount?: {
    originalBaseFee: number
    discountAmount: number
    discountedBaseFee: number
  }
}

export default function SeasonalPriceCalculator({
  lowSeasonPrice,
  mediumSeasonPrice,
  highSeasonPrice,
  currency = 'EUR',
  startDate,
  endDate,
  apaPercentage = 30,
  crewServiceFee = 0,
  cleaningFee = 0,
  taxPercentage = 21,
  onBreakdownChange,
}: SeasonalPriceCalculatorProps) {
  const [showApaTooltip, setShowApaTooltip] = useState(false)

  // Determine season based on month (1-12) and day
  // Updated seasonality:
  // Low Season: Nov 1 to May 1 (Nov=11, Dec=12, Jan=1, Feb=2, Mar=3, Apr=4, May=5 but only until May 1)
  // Medium Season: June (6) and transition months (May after May 1, Sept before Sept 1)
  // High Season: July (7) to Sept 1 (Aug=8, Sept=9 but only until Sept 1)
  const determineSeason = (month: number, day: number = 1): 'low' | 'medium' | 'high' => {
    // HIGH SEASON: July (7) to August (8), and September (9) until Sept 1
    if (month === 7 || month === 8) return 'high'
    if (month === 9 && day <= 1) return 'high'
    
    // MEDIUM SEASON: June (6), May after May 1, and September after Sept 1
    if (month === 6) return 'medium'
    if (month === 5 && day > 1) return 'medium'
    if (month === 9 && day > 1) return 'medium'
    
    // LOW SEASON: All other months (Nov, Dec, Jan, Feb, Mar, Apr, May until May 1)
    return 'low'
  }

  // Get price for a specific season
  const getSeasonPrice = (season: 'low' | 'medium' | 'high'): number | null => {
    switch (season) {
      case 'low':
        return lowSeasonPrice
      case 'medium':
        return mediumSeasonPrice
      case 'high':
        return highSeasonPrice
      default:
        return null
    }
  }

  // Calculate complete price breakdown
  const priceBreakdown = useMemo(() => {
    if (!startDate || !endDate) {
      return null
    }

    // Calculate days
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (days <= 0) {
      return null
    }

    // Group dates by season
    const seasonDays: { [key: string]: number } = {
      low: 0,
      medium: 0,
      high: 0,
    }

    const seasonPrices: { [key: string]: number | null } = {
      low: lowSeasonPrice,
      medium: mediumSeasonPrice,
      high: highSeasonPrice,
    }

    // Count days per season
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1 // getMonth() returns 0-11
      const day = currentDate.getDate() // getDate() returns 1-31
      const season = determineSeason(month, day)
      seasonDays[season]++
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calculate base charter fee
    let baseCharterFee = 0
    const breakdown: Array<{ season: string; days: number; pricePerDay: number | null; subtotal: number }> = []

    Object.entries(seasonDays).forEach(([season, days]) => {
      if (days > 0) {
        const pricePerDay = seasonPrices[season as 'low' | 'medium' | 'high']
        // Ensure pricePerDay is a valid number, default to 0 if null/undefined
        const price = (pricePerDay && !isNaN(Number(pricePerDay))) ? Number(pricePerDay) : 0
        const subtotal = price * days
        // Only add if subtotal is valid
        if (!isNaN(subtotal) && subtotal >= 0) {
          baseCharterFee += subtotal
          breakdown.push({
            season: season.charAt(0).toUpperCase() + season.slice(1),
            days,
            pricePerDay: price > 0 ? price : null,
            subtotal,
          })
        }
      }
    })

    // Determine the primary season (most days)
    const primarySeason = Object.entries(seasonDays).reduce((a, b) =>
      seasonDays[a[0]] > seasonDays[b[0]] ? a : b
    )[0] as 'low' | 'medium' | 'high'

    const pricePerDay = getSeasonPrice(primarySeason)

    // Calculate additional costs - ensure all values are valid numbers
    const taxPct = Number(taxPercentage) || 21
    const apaPct = Number(apaPercentage) || 30
    const crewFee = Number(crewServiceFee) || 0
    const cleanFee = Number(cleaningFee) || 0
    
    // Ensure baseCharterFee is valid before calculations
    const baseFee = Number(baseCharterFee) || 0
    
    // Apply Early Bird discount to base charter fee
    const earlyBirdPrice = calculateEarlyBirdPrice(baseFee)
    const discountedBaseFee = earlyBirdPrice.discountedPrice
    
    const taxAmount = discountedBaseFee * (taxPct / 100)
    const apaAmount = discountedBaseFee * (apaPct / 100)
    const fixedFees = crewFee + cleanFee
    // Ensure all values are valid numbers before calculating total
    const totalEstimate = discountedBaseFee + (Number(taxAmount) || 0) + (Number(apaAmount) || 0) + (Number(fixedFees) || 0)
    
    // Final validation - ensure no NaN values
    const finalTotal = isNaN(totalEstimate) ? 0 : totalEstimate

    const result: PriceBreakdown = {
      baseCharterFee: discountedBaseFee,
      taxAmount: Number(taxAmount) || 0,
      apaAmount: Number(apaAmount) || 0,
      fixedFees: Number(fixedFees) || 0,
      totalEstimate: finalTotal,
      days,
      pricePerDay,
      primarySeason,
      breakdown,
      // Add Early Bird discount info
      earlyBirdDiscount: earlyBirdPrice.isEligible ? {
        originalBaseFee: baseFee,
        discountAmount: earlyBirdPrice.discountAmount,
        discountedBaseFee: discountedBaseFee,
      } : undefined,
    }

    // Notify parent component of breakdown change
    if (onBreakdownChange) {
      onBreakdownChange(result)
    }

    return result
  }, [
    startDate,
    endDate,
    lowSeasonPrice,
    mediumSeasonPrice,
    highSeasonPrice,
    apaPercentage,
    crewServiceFee,
    cleaningFee,
    taxPercentage,
    onBreakdownChange,
  ])

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get season badge color
  const getSeasonBadgeColor = (season: string) => {
    switch (season.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!startDate || !endDate || !priceBreakdown) {
    return (
      <div className="bg-gradient-to-br from-luxury-blue/5 to-luxury-gold/5 rounded-xl p-6 border-2 border-luxury-blue/20 shadow-lg">
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-luxury-blue/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600 font-medium">Select your charter dates</p>
          <p className="text-sm text-gray-500 mt-1">Choose start and end dates to see pricing breakdown</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-xl overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-luxury-blue to-luxury-gold p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Charter Estimate</h3>
            <p className="text-white/90 text-sm">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </p>
          </div>
          {priceBreakdown.primarySeason && (
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30`}
            >
              {priceBreakdown.primarySeason.toUpperCase()} SEASON
            </span>
          )}
        </div>
      </div>

      {/* Price Breakdown - Invoice Style */}
      <div className="p-6">
        {/* Base Charter Fee */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-800">Base Charter Fee</p>
              <p className="text-xs text-gray-500">
                {priceBreakdown.days} {priceBreakdown.days === 1 ? 'day' : 'days'} ×{' '}
                {priceBreakdown.pricePerDay ? formatCurrency(priceBreakdown.pricePerDay) : 'N/A'} per day
              </p>
            </div>
            <p className="text-lg font-bold text-luxury-blue">
              {formatCurrency(priceBreakdown.baseCharterFee)}
            </p>
          </div>

          {/* Season Breakdown */}
          {priceBreakdown.breakdown.length > 1 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
              {priceBreakdown.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeasonBadgeColor(item.season)}`}
                    >
                      {item.season}
                    </span>
                    <span className="text-gray-600">
                      {item.days} {item.days === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {item.pricePerDay ? formatCurrency(item.subtotal) : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Costs */}
        <div className="space-y-3 mb-6">
          {/* IVA (Tax) */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">IVA ({taxPercentage || 21}%)</span>
              <span className="text-xs text-gray-500">Tax</span>
            </div>
            <span className="text-gray-800 font-semibold">{formatCurrency(priceBreakdown.taxAmount)}</span>
          </div>

          {/* APA */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">APA ({apaPercentage || 30}%)</span>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowApaTooltip(true)}
                  onMouseLeave={() => setShowApaTooltip(false)}
                  className="text-luxury-blue hover:text-luxury-gold transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showApaTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                    <p className="font-semibold mb-1">Advance Provisioning Allowance</p>
                    <p className="text-white/90">Covers fuel, food, beverages, and other consumables during your charter.</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
            <span className="text-gray-800 font-semibold">{formatCurrency(priceBreakdown.apaAmount)}</span>
          </div>

          {/* Fixed Fees */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-gray-700 font-medium">Fixed Fees</span>
              <p className="text-xs text-gray-500">
                Crew Service Fee + Cleaning Fee
              </p>
            </div>
            <span className="text-gray-800 font-semibold">
              {priceBreakdown.fixedFees > 0 ? formatCurrency(priceBreakdown.fixedFees) : 'Included'}
            </span>
          </div>
        </div>

        {/* Total Estimate */}
        <div className="pt-6 border-t-2 border-luxury-gold">
          {priceBreakdown.earlyBirdDiscount && (
            <div className="mb-4 p-4 bg-gradient-to-r from-luxury-gold/10 to-yellow-400/10 border border-luxury-gold/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-luxury-gold to-yellow-400 text-white text-xs font-bold rounded-full">
                    Early Bird: -10%
                  </span>
                  <span className="text-xs text-gray-600">
                    until {formatEarlyBirdDeadline()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 line-through">
                    {formatCurrency(priceBreakdown.earlyBirdDiscount.originalBaseFee + priceBreakdown.taxAmount + priceBreakdown.apaAmount + priceBreakdown.fixedFees)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium">
                ✓ Best Price Guaranteed - Direct Booking Discount applied
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-800">TOTAL ESTIMATE</p>
              <p className="text-xs text-gray-500 mt-1">All fees included</p>
            </div>
            <p className="text-3xl font-bold text-luxury-blue">
              {formatCurrency(priceBreakdown.totalEstimate)}
            </p>
          </div>
          {priceBreakdown.totalEstimate === 0 && (
            <p className="text-xs text-amber-600 mt-3 italic">
              * Some prices are not set. Please contact us for a custom quote.
            </p>
          )}
        </div>

        {/* Season Guide */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">Season Guide:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded border border-green-200">
              <p className="font-semibold text-green-800">Low Season</p>
              <p className="text-green-600">Oct - May</p>
              <p className="text-green-700 font-semibold mt-1">
                {formatCurrency(lowSeasonPrice)}/day
              </p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="font-semibold text-yellow-800">Medium Season</p>
              <p className="text-yellow-600">Jun, Sep</p>
              <p className="text-yellow-700 font-semibold mt-1">
                {formatCurrency(mediumSeasonPrice)}/day
              </p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded border border-red-200">
              <p className="font-semibold text-red-800">High Season</p>
              <p className="text-red-600">Jul, Aug</p>
              <p className="text-red-700 font-semibold mt-1">
                {formatCurrency(highSeasonPrice)}/day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
