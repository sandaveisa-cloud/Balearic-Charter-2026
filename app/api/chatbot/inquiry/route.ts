import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, source = 'chatbot' } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Create Supabase client with anon key for public inserts
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[ChatBot API] ❌ Supabase environment variables missing!')
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

    // Extract potential contact info from message (simple extraction)
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    const phoneMatch = message.match(/(?:\+?34)?[6-9]\d{8}/)

    // Prepare insert payload
    const insertPayload: any = {
      name: 'Chatbot Inquiry', // Default name, can be updated later
      email: emailMatch ? emailMatch[0] : 'chatbot@widedream.es', // Default email if not found
      phone: phoneMatch ? phoneMatch[0] : null,
      yacht_id: null, // Can be extracted from message if needed
      start_date: null,
      end_date: null,
      guests: null,
      message: `[Chatbot Inquiry - Source: ${source}]\n\n${message}`,
      status: 'pending',
    }

    console.log('[ChatBot API] Saving inquiry:', {
      email: insertPayload.email,
      hasPhone: !!insertPayload.phone,
      messageLength: insertPayload.message.length,
    })

    // Attempt insert
    const { data: inquiry, error: dbError } = await supabase
      .from('booking_inquiries')
      .insert([insertPayload])
      .select()
      .single()

    if (dbError) {
      console.error('[ChatBot API] ❌ Database error:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save inquiry',
          details: dbError.message
        },
        { status: 500 }
      )
    }

    console.log('[ChatBot API] ✅ Inquiry saved successfully:', {
      id: (inquiry as any)?.id,
      email: (inquiry as any)?.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Inquiry saved successfully',
      inquiryId: (inquiry as any)?.id,
    })
  } catch (error) {
    console.error('[ChatBot API] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
