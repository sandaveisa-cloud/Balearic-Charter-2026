import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateBookingPDF } from '@/lib/pdfGenerator'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validācija
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
    let pdfBase64: string | null = null

    // PDF ģenerēšana (tikai ja ir jahta un dati)
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
      } catch (pdfError) {
        console.error('PDF generation failed', pdfError)
      }
    }

    // Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('booking_inquiries').insert([{
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      yacht_id: body.yachtId || null,
      message: body.message || null,
      status: 'pending'
    }])

    // Resend e-pasts
    if (resend) {
      await resend.emails.send({
        from: 'Wide Dream <onboarding@resend.dev>',
        to: 'peter.sutter@gmail.com',
        subject: body.yachtName ? `New Booking: ${body.yachtName}` : `New Message from ${body.name}`,
        html: `<p><strong>Name:</strong> ${body.name}</p><p><strong>Email:</strong> ${body.email}</p><p><strong>Message:</strong> ${body.message || 'N/A'}</p>`
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Global API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}