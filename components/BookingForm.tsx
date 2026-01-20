'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { submitBookingInquiry } from '@/lib/data'
import type { PriceBreakdown } from './SeasonalPriceCalculator'

interface BookingFormProps {
  yachtId: string
  yachtName: string
  startDate: Date | null
  endDate: Date | null
  priceBreakdown: PriceBreakdown | null
  currency?: string
  taxPercentage?: number | null
  apaPercentage?: number | null
}

export default function BookingForm({
  yachtId,
  yachtName,
  startDate,
  endDate,
  priceBreakdown,
  currency = 'EUR',
  taxPercentage = 21,
  apaPercentage = 30,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

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

  // Generate price breakdown text for message
  const generatePriceBreakdownText = () => {
    if (!priceBreakdown || !startDate || !endDate) return ''

    const breakdownText = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARTER PRICE BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Charter Period: ${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}
Duration: ${priceBreakdown.days} ${priceBreakdown.days === 1 ? 'day' : 'days'}
Season: ${priceBreakdown.primarySeason.toUpperCase()}

BASE CHARTER FEE:
  ${formatCurrency(priceBreakdown.baseCharterFee)}
  (${priceBreakdown.days} days × ${formatCurrency(priceBreakdown.pricePerDay)}/day)

ADDITIONAL COSTS:
  IVA (${taxPercentage || 21}%): ${formatCurrency(priceBreakdown.taxAmount)}
  APA (${apaPercentage || 30}%): ${formatCurrency(priceBreakdown.apaAmount)}
    * Advance Provisioning Allowance covers fuel, food, beverages, and consumables
  Fixed Fees: ${formatCurrency(priceBreakdown.fixedFees)}
    * Crew Service Fee + Cleaning Fee

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL ESTIMATE: ${formatCurrency(priceBreakdown.totalEstimate)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim()

    return breakdownText
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Validate dates and price breakdown
      if (!startDate || !endDate) {
        alert('Please select charter dates')
        setSubmitStatus('error')
        setIsSubmitting(false)
        return
      }

      if (!priceBreakdown) {
        alert('Please wait for price calculation')
        setSubmitStatus('error')
        setIsSubmitting(false)
        return
      }

      // Prepare request payload
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        yachtId: yachtId,
        yachtName: yachtName,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        guests: formData.guests ? parseInt(formData.guests) : undefined,
        message: formData.message?.trim() || undefined,
        priceBreakdown: priceBreakdown,
        currency: currency,
        taxPercentage: taxPercentage || 21,
        apaPercentage: apaPercentage || 30,
      }

      console.log('[BookingForm] Submitting booking:', {
        name: payload.name,
        email: payload.email,
        yachtName: payload.yachtName,
        hasPriceBreakdown: !!payload.priceBreakdown,
        priceBreakdownTotal: payload.priceBreakdown?.totalEstimate,
      })

      // Call the API route with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      let response: Response
      try {
        response = await fetch('/api/send-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout: The server took too long to respond. Please try again.')
        }
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to server'}`)
      }

      let result: any = {}
      try {
        const responseText = await response.text()
        console.log('[BookingForm] Response status:', response.status, response.statusText)
        console.log('[BookingForm] Response text (first 500 chars):', responseText.substring(0, 500))
        
        if (responseText) {
          try {
            result = JSON.parse(responseText)
          } catch (parseError) {
            console.error('[BookingForm] Failed to parse JSON:', parseError)
            console.error('[BookingForm] Full response text:', responseText)
            throw new Error(`Server returned invalid response (${response.status}). Please try again or contact support.`)
          }
        }
      } catch (readError) {
        console.error('[BookingForm] Error reading response:', readError)
        if (readError instanceof Error) {
          throw readError
        }
        throw new Error(`Failed to read server response: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorMsg = result?.error || result?.details || result?.message || `Server error: ${response.status} ${response.statusText}`
        console.error('[BookingForm] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: result?.error,
          details: result?.details,
          message: result?.message,
          success: result?.success,
          fullResult: result,
        })
        setErrorMessage(errorMsg)
        throw new Error(errorMsg)
      }

      setSubmitStatus('success')
      setErrorMessage('')
      setFormData({
        name: '',
        email: '',
        phone: '',
        guests: '',
        message: '',
      })
    } catch (error) {
      console.error('[BookingForm] Error submitting booking:', error)
      console.error('[BookingForm] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
      })
      
      let errorMsg = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMsg = error.message
        // Provide more helpful error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMsg = 'Network error: Please check your internet connection and try again.'
        } else if (error.message.includes('500')) {
          errorMsg = 'Server error: Please try again in a moment. If the problem persists, contact support.'
        } else if (error.message.includes('400')) {
          errorMsg = 'Invalid request: Please check that all fields are filled correctly.'
        } else {
          errorMsg = error.message || 'An unexpected error occurred. Please try again.'
        }
      }
      
      setErrorMessage(errorMsg)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
          Number of Guests
        </label>
        <input
          type="number"
          id="guests"
          min="1"
          value={formData.guests}
          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
        />
      </div>

      {startDate && endDate && (
        <div className="p-3 bg-luxury-blue/10 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Selected dates:</strong><br />
            {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
          placeholder="Tell us about your charter preferences..."
        />
      </div>

      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border-2 border-green-400 text-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-lg mb-1">Success!</p>
              <p className="text-sm">Your booking inquiry has been submitted successfully.</p>
              <p className="text-sm mt-2">A detailed PDF offer has been sent to your email address.</p>
              <p className="text-sm">Our team will contact you shortly to confirm availability.</p>
            </div>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border-2 border-red-400 text-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-lg mb-2">Error Submitting Request</p>
              <p className="text-sm mb-3">{errorMessage || 'There was an error submitting your request. Please try again.'}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Error: ${errorMessage || 'Unknown error'}\n\nPlease check:\n1. All required fields are filled\n2. Dates are selected\n3. Price breakdown is calculated\n4. Internet connection is stable`)
                    alert('Error details copied to clipboard!')
                  }}
                  className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 rounded border border-red-300 transition-colors"
                >
                  Copy Error Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitStatus('idle')
                    setErrorMessage('')
                  }}
                  className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 rounded border border-red-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-luxury-blue via-luxury-gold to-luxury-blue text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Request a Quote
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold via-luxury-blue to-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </form>
  )
}
