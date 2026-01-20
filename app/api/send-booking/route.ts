import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateBookingPDF } from '@/lib/pdfGenerator'
import { supabase } from '@/lib/supabase'
import type { PriceBreakdown } from '@/components/SeasonalPriceCalculator'

// Force Node.js runtime for PDF generation
export const runtime = 'nodejs'

// Force dynamic rendering to prevent build-time issues with missing env vars
export const dynamic = 'force-dynamic'

interface BookingRequest {
  name: string
  email: string
  phone?: string
  yachtId: string
  yachtName: string
  startDate: string
  endDate: string
  guests?: number
  message?: string
  priceBreakdown: PriceBreakdown
  currency: string
  taxPercentage: number
  apaPercentage: number
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Received booking request')
    
    let body: BookingRequest
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('[API] Failed to parse request JSON:', jsonError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request format', 
          details: 'The request body is not valid JSON. Please refresh the page and try again.' 
        },
        { status: 400 }
      )
    }
    
    console.log('[API] Request body:', {
      name: body.name,
      email: body.email,
      yachtName: body.yachtName,
      hasPriceBreakdown: !!body.priceBreakdown,
      priceBreakdownTotal: body.priceBreakdown?.totalEstimate,
    })

    // Validate required fields
    if (!body.name || !body.email || !body.yachtId || !body.startDate || !body.endDate) {
      console.error('[API] Missing required fields:', {
        name: !!body.name,
        email: !!body.email,
        yachtId: !!body.yachtId,
        startDate: !!body.startDate,
        endDate: !!body.endDate,
      })
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    if (!body.priceBreakdown) {
      console.error('[API] Missing price breakdown')
      return NextResponse.json(
        { error: 'Missing price breakdown', details: 'Please select charter dates to calculate pricing' },
        { status: 400 }
      )
    }

    // Check Resend API key and initialize client only when needed
    if (!process.env.RESEND_API_KEY) {
      console.error('[API] RESEND_API_KEY not configured')
      // Still save to database, but skip email sending
      console.warn('[API] Continuing without email service - booking will be saved to database only')
    }
    
    // Initialize Resend client only if API key is available
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

    console.log('[API] Generating PDF...')
    // Generate PDF - allow it to fail gracefully
    let pdfBuffer: Buffer | null = null
    let pdfBase64: string | null = null
    try {
      pdfBuffer = await generateBookingPDF({
        clientName: body.name,
        clientEmail: body.email,
        clientPhone: body.phone,
        yachtName: body.yachtName,
        startDate: body.startDate,
        endDate: body.endDate,
        guests: body.guests,
        priceBreakdown: body.priceBreakdown,
        currency: body.currency,
        taxPercentage: body.taxPercentage,
        apaPercentage: body.apaPercentage,
      })
      
      if (pdfBuffer && pdfBuffer.length > 0) {
        pdfBase64 = pdfBuffer.toString('base64')
        console.log('[API] PDF generated successfully, size:', pdfBuffer.length, 'bytes')
      } else {
        console.warn('[API] PDF buffer is empty')
      }
    } catch (pdfError) {
      console.error('[API] PDF generation failed:', pdfError)
      console.warn('[API] Continuing without PDF attachment...')
      // Continue without PDF - we'll still save to DB and send emails
    }

    // Save to Supabase first
    console.log('[API] Saving to Supabase...')
    const { data: inquiry, error: dbError } = await supabase
      .from('booking_inquiries')
      // @ts-expect-error - Supabase type inference limitation with dynamic table inserts
      .insert([
        {
          name: body.name,
          email: body.email,
          phone: body.phone || null,
          yacht_id: body.yachtId,
          start_date: body.startDate,
          end_date: body.endDate,
          guests: body.guests || null,
          message: body.message || null,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('[API] Database error:', dbError)
      // Continue even if DB save fails, but log it
    }

    // Prepare email content
    const emailSubject = `Charter Booking Inquiry - ${body.yachtName}`
    const charterPeriod = `${body.startDate} to ${body.endDate}`
    const totalEstimate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: body.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(body.priceBreakdown.totalEstimate)

    // Send email to client with PDF attachment (only if Resend is configured)
    // Note: For production, replace with your verified domain (e.g., noreply@yourdomain.com)
    let clientEmailResult: { error?: any } | null = null
    if (resend) {
      clientEmailResult = await resend.emails.send({
      from: 'Balearic & Costa Blanca Charters <onboarding@resend.dev>',
      to: body.email,
      subject: `Your Charter Booking Offer - ${body.yachtName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #002366 0%, #D4AF37 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; background: #002366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Balearic & Costa Blanca Charters</h1>
                <p>Premium Yacht Charter Services</p>
              </div>
              <div class="content">
                <h2>Thank you for your booking inquiry!</h2>
                <p>Dear ${body.name},</p>
                <p>Thank you for your interest in chartering <strong>${body.yachtName}</strong>.</p>
                <p>We have received your booking inquiry for the period <strong>${charterPeriod}</strong>.</p>
                <p>Please find attached your detailed charter offer with complete price breakdown.</p>
                <p><strong>Total Estimate: ${totalEstimate}</strong></p>
                <p>Our team will review your request and contact you shortly to confirm availability and finalize the details.</p>
                <p>If you have any questions, please don't hesitate to contact us:</p>
                <p><strong>Phone:</strong> +34 680 957 096</p>
                <p>Best regards,<br>Balearic & Costa Blanca Charters Team</p>
              </div>
              <div class="footer">
                <p>Balearic & Costa Blanca Charters | +34 680 957 096</p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: pdfBase64 ? [
        {
          filename: `Charter-Offer-${body.yachtName}-${body.startDate}.pdf`,
          content: pdfBase64,
        },
      ] : undefined,
      })
    } else {
      console.warn('[API] Skipping client email - RESEND_API_KEY not configured')
    }

    if (clientEmailResult?.error) {
      console.error('[API] Client email error:', clientEmailResult.error)
      // Don't fail the request if email fails, but log it
    } else if (clientEmailResult) {
      console.log('[API] Client email sent successfully')
    }

    // Send notification email to admin (only if Resend is configured)
    let notificationEmailResult: { error?: any } | null = null
    if (resend) {
      console.log('[API] Sending admin notification...')
      // Note: For production, replace with your verified domain (e.g., noreply@yourdomain.com)
      notificationEmailResult = await resend.emails.send({
      from: 'Balearic & Costa Blanca Charters <onboarding@resend.dev>',
      to: 'sanda.veisa@gmail.com',
      subject: `New Booking Inquiry: ${body.yachtName} - ${body.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #002366; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #D4AF37; }
              .label { font-weight: bold; color: #002366; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Booking Inquiry</h1>
              </div>
              <div class="content">
                <div class="info-box">
                  <p><span class="label">Client Name:</span> ${body.name}</p>
                  <p><span class="label">Email:</span> ${body.email}</p>
                  ${body.phone ? `<p><span class="label">Phone:</span> ${body.phone}</p>` : ''}
                </div>
                <div class="info-box">
                  <p><span class="label">Yacht:</span> ${body.yachtName}</p>
                  <p><span class="label">Charter Period:</span> ${charterPeriod}</p>
                  <p><span class="label">Duration:</span> ${body.priceBreakdown.days} ${body.priceBreakdown.days === 1 ? 'day' : 'days'}</p>
                  ${body.guests ? `<p><span class="label">Guests:</span> ${body.guests}</p>` : ''}
                  <p><span class="label">Season:</span> ${body.priceBreakdown.primarySeason.toUpperCase()}</p>
                </div>
                <div class="info-box">
                  <p><span class="label">Price Breakdown:</span></p>
                  <p>Base Charter Fee: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: body.currency, minimumFractionDigits: 0 }).format(body.priceBreakdown.baseCharterFee)}</p>
                  <p>IVA (${body.taxPercentage}%): ${new Intl.NumberFormat('en-US', { style: 'currency', currency: body.currency, minimumFractionDigits: 0 }).format(body.priceBreakdown.taxAmount)}</p>
                  <p>APA (${body.apaPercentage}%): ${new Intl.NumberFormat('en-US', { style: 'currency', currency: body.currency, minimumFractionDigits: 0 }).format(body.priceBreakdown.apaAmount)}</p>
                  ${body.priceBreakdown.fixedFees > 0 ? `<p>Fixed Fees: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: body.currency, minimumFractionDigits: 0 }).format(body.priceBreakdown.fixedFees)}</p>` : ''}
                  <p><strong>TOTAL ESTIMATE: ${totalEstimate}</strong></p>
                </div>
                ${body.message ? `<div class="info-box"><p><span class="label">Client Message:</span></p><p>${body.message.replace(/\n/g, '<br>')}</p></div>` : ''}
                ${inquiry ? `<p style="margin-top: 20px; color: #666; font-size: 12px;">Inquiry ID: ${(inquiry as any)?.id || 'N/A'}</p>` : ''}
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: pdfBase64 ? [
        {
          filename: `Charter-Offer-${body.yachtName}-${body.startDate}.pdf`,
          content: pdfBase64,
        },
      ] : undefined,
      })
    } else {
      console.warn('[API] Skipping admin notification - RESEND_API_KEY not configured')
    }

    if (notificationEmailResult?.error) {
      console.error('[API] Notification email error:', notificationEmailResult.error)
      // Don't fail the request if email fails, but log it
    } else if (notificationEmailResult) {
      console.log('[API] Admin notification sent successfully')
    }

    console.log('[API] Booking inquiry processed successfully, ID:', (inquiry as any)?.id)
    return NextResponse.json({
      success: true,
      message: 'Booking inquiry submitted successfully',
      inquiryId: (inquiry as any)?.id,
    })
  } catch (error) {
    console.error('[API] Error processing booking:', error)
    const errorDetails = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    console.error('[API] Error stack:', errorStack)
    
    // Try to stringify error for logging
    try {
      console.error('[API] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    } catch (stringifyError) {
      console.error('[API] Could not stringify error:', stringifyError)
    }
    
    // Return more specific error message
    let userFriendlyError = 'Failed to process booking inquiry'
    let statusCode = 500
    
    if (errorDetails.includes('PDF') || errorDetails.includes('pdf')) {
      userFriendlyError = 'Failed to generate booking PDF. The booking was saved, but PDF generation failed. Please contact support.'
      statusCode = 500
    } else if (errorDetails.includes('email') || errorDetails.includes('Resend') || errorDetails.includes('resend')) {
      userFriendlyError = 'Booking saved successfully, but email could not be sent. Please contact us directly.'
      statusCode = 207 // Partial success
    } else if (errorDetails.includes('database') || errorDetails.includes('Supabase') || errorDetails.includes('supabase')) {
      userFriendlyError = 'Failed to save booking to database. Please try again or contact support.'
      statusCode = 500
    } else if (errorDetails.includes('JSON') || errorDetails.includes('parse')) {
      userFriendlyError = 'Invalid request format. Please refresh the page and try again.'
      statusCode = 400
    } else if (errorDetails.includes('validation') || errorDetails.includes('required')) {
      userFriendlyError = 'Please fill in all required fields correctly.'
      statusCode = 400
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: userFriendlyError, 
        details: errorDetails,
        message: 'An error occurred while processing your booking. Please try again or contact support if the problem persists.'
      },
      { status: statusCode }
    )
  }
}
