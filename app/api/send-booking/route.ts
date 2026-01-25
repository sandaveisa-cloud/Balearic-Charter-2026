import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateBookingPDF } from '@/lib/pdfGenerator'
import { createClient } from '@supabase/supabase-js'
import type { PriceBreakdown } from '@/components/SeasonalPriceCalculator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface BookingRequest {
  name: string
  email: string
  phone?: string
  yachtId?: string      // Padarīts par neobligātu (?)
  yachtName?: string    // Padarīts par neobligātu (?)
  startDate?: string    // Padarīts par neobligātu (?)
  endDate?: string      // Padarīts par neobligātu (?)
  guests?: number
  message?: string
  priceBreakdown?: PriceBreakdown // Padarīts par neobligātu (?)
  currency?: string
  taxPercentage?: number
  apaPercentage?: number
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Received request')
    
    let body: BookingRequest
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
    }

    // ✅ VALIDĀCIJA: Tikai vārds un e-pasts ir obligāti parastai saziņai
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Name and email are required' },
        { status: 400 }
      )
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

    // PDF ģenerēšana notiek tikai tad, ja ir cenu aprēķins (rezervācijām)
    let pdfBase64: string | null = null
    if (body.priceBreakdown && body.yachtName) {
      try {
        const pdfBuffer = await generateBookingPDF({
          clientName: body.name,
          clientEmail: body.email,
          clientPhone: body.phone,
          yachtName: body.yachtName,
          startDate: body.startDate || '',
          endDate: body.endDate || '',
          guests: body.guests,
          priceBreakdown: body.priceBreakdown,
          currency: body.currency || 'EUR',
          taxPercentage: body.taxPercentage || 21,
          apaPercentage: body.apaPercentage || 0,
        })
        if (pdfBuffer) pdfBase64 = pdfBuffer.toString('base64')
      } catch