import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateBookingPDF } from '@/lib/pdfGenerator'
import { createClient } from '@supabase/supabase-js'
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
    
    // Validate that required fields are not empty strings
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error', 
          details: 'Name is required and cannot be empty'
        },
        { status: 400 }
      )
    }
    
    if (!body.email || body.email.trim() === '') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error', 
          details: 'Email is required and cannot be empty'
        },
        { status: 400 }
      )
    }
    
    // Create Supabase client with anon key for public inserts
    // This ensures we use the correct client for public RLS policies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[API] ❌ Supabase environment variables missing!')
      return NextResponse.json(
        { 
          success: false,
          error: 'Server configuration error', 
          details: 'Database connection not configured'
        },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Prepare insert payload - ensure all fields match schema exactly
    // Schema: name (NOT NULL), email (NOT NULL), phone (nullable), yacht_id (nullable), 
    //         start_date (nullable), end_date (nullable), guests (nullable), message (nullable), status (default 'pending')
    const insertPayload: any = {
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone && body.phone.trim() !== '' ? body.phone.trim() : null,
      yacht_id: body.yachtId && body.yachtId.trim() !== '' ? body.yachtId.trim() : null,
      start_date: body.startDate && body.startDate.trim() !== '' ? body.startDate.trim() : null,
      end_date: body.endDate && body.endDate.trim() !== '' ? body.endDate.trim() : null,
      guests: body.guests ? parseInt(String(body.guests), 10) : null,
      message: body.message && body.message.trim() !== '' ? body.message.trim() : null,
      status: 'pending',
    }
    
    // Validate guests is a valid number if provided
    if (insertPayload.guests !== null && (isNaN(insertPayload.guests) || insertPayload.guests < 1)) {
      insertPayload.guests = null
    }
    
    console.log('[API] Final insert payload:', JSON.stringify(insertPayload, null, 2))
    console.log('[API] Payload validation:', {
      hasName: !!insertPayload.name,
      hasEmail: !!insertPayload.email,
      nameLength: insertPayload.name?.length,
      emailLength: insertPayload.email?.length,
      yacht_id: insertPayload.yacht_id,
      start_date: insertPayload.start_date,
      end_date: insertPayload.end_date,
      guests: insertPayload.guests,
      phone: insertPayload.phone ? 'provided' : 'null',
      message: insertPayload.message ? 'provided' : 'null',
    })
    
    console.log('[API] Supabase client info:', {
      url: supabaseUrl ? '✅ Set' : '❌ Missing',
      anonKey: supabaseAnonKey ? '✅ Set' : '❌ Missing',
      anonKeyLength: supabaseAnonKey?.length || 0,
    })
    
    // Attempt insert
    console.log('[API] Attempting to insert into booking_inquiries...')
    const { data: inquiry, error: dbError } = await supabase
      .from('booking_inquiries')
      .insert([insertPayload])
      .select()
      .single()
    
    if (inquiry) {
      console.log('[API] ✅ Successfully inserted inquiry:', {
        id: (inquiry as any)?.id,
        name: (inquiry as any)?.name,
        email: (inquiry as any)?.email,
      })
    }

    if (dbError) {
      console.error('[API] ❌ Database error:', dbError)
      console.error('[API] Error code:', (dbError as any)?.code)
      console.error('[API] Error message:', dbError.message)
      console.error('[API] Error details:', (dbError as any)?.details)
      console.error('[API] Error hint:', (dbError as any)?.hint)
      
      // Check for RLS (Row Level Security) errors
      const errorMessage = dbError.message || String(dbError)
      const errorCode = (dbError as any)?.code || ''
      
      if (errorMessage.includes('row-level security') || 
          errorMessage.includes('RLS') || 
          errorMessage.includes('permission denied') ||
          errorCode === '42501' || // PostgreSQL permission denied error code
          errorMessage.includes('new row violates row-level security policy')) {
        console.error('[API] 🚨 RLS Policy Error - booking_inquiries table may not allow public INSERT')
        console.error('[API] Please verify RLS policy exists: CREATE POLICY "booking_inquiries_public_insert" ON booking_inquiries FOR INSERT WITH CHECK (true);')
        return NextResponse.json(
          { 
            success: false,
            error: 'Permission denied', 
            details: 'Unable to save booking due to security policy. Please contact support directly.',
            message: 'We encountered a security restriction. Please contact us directly at +34 680 957 096 or email us to complete your booking.',
            debug: process.env.NODE_ENV === 'development' ? {
              errorCode,
              errorMessage,
              hint: (dbError as any)?.hint,
            } : undefined,
          },
          { status: 403 }
        )
      }
      
      // Check for NOT NULL constraint violations
      if (errorMessage.includes('null value') || 
          errorMessage.includes('violates not-null constraint') ||
          errorCode === '23502') { // PostgreSQL NOT NULL violation
        console.error('[API] 🚨 NOT NULL constraint violation')
        console.error('[API] Required fields: name, email (NOT NULL in schema)')
        console.error('[API] Payload sent:', insertPayload)
        return NextResponse.json(
          { 
            success: false,
            error: 'Validation error', 
            details: 'Missing required fields. Please ensure name and email are provided.',
            message: 'Please fill in all required fields (name and email) and try again.'
          },
          { status: 400 }
        )
      }
      
      // Check for foreign key constraint violations
      if (errorMessage.includes('foreign key') || 
          errorMessage.includes('violates foreign key constraint') ||
          errorCode === '23503') {
        console.error('[API] 🚨 Foreign key constraint violation - yacht_id may not exist in fleet table')
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid yacht selection', 
            details: 'The selected yacht does not exist in our fleet.',
            message: 'Please refresh the page and select a valid yacht.'
          },
          { status: 400 }
        )
      }
      
      // For other database errors, return error but don't fail completely
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error', 
          details: `Failed to save booking to database: ${errorMessage}`,
          message: 'We encountered an issue saving your booking. Please try again or contact us directly.',
          debug: process.env.NODE_ENV === 'development' ? {
            errorCode,
            errorMessage,
            hint: (dbError as any)?.hint,
            details: (dbError as any)?.details,
          } : undefined,
        },
        { status: 500 }
      )
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
      from: 'Peter Sutter - Wide Dream <onboarding@resend.dev>',
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
              .footer { text-align: center; margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 4px; color: #666; font-size: 12px; line-height: 1.8; }
              .footer a { color: #002366; text-decoration: none; }
              .footer a:hover { text-decoration: underline; }
              .button { display: inline-block; background: #002366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Wide Dream</h1>
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
                <p>Best regards,<br>Peter Sutter<br>Wide Dream</p>
              </div>
              <div class="footer">
                <p><strong>Manager:</strong> Peter Sutter</p>
                <p><strong>Phone:</strong> +34 680 957 096</p>
                <p><strong>Website:</strong> <a href="https://widedream.es">https://widedream.es</a></p>
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
      from: 'Peter Sutter - Wide Dream <onboarding@resend.dev>',
      to: 'peter.sutter@gmail.com',
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
              .footer { text-align: center; margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 4px; color: #666; font-size: 12px; line-height: 1.8; }
              .footer a { color: #002366; text-decoration: none; }
              .footer a:hover { text-decoration: underline; }
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
              <div class="footer">
                <p><strong>Manager:</strong> Peter Sutter</p>
                <p><strong>Phone:</strong> +34 680 957 096</p>
                <p><strong>Website:</strong> <a href="https://widedream.es">https://widedream.es</a></p>
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
