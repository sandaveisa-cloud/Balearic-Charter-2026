import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

interface GenerateDescriptionRequest {
  category?: 'yacht' | 'logistics' // Category for different description types
  locale?: string // Language code: 'en', 'es', or 'de'
  yachtName?: string
  model?: string
  length?: number | string
  capacity?: number
  cabins?: number
  toilets?: number
  amenities?: Record<string, boolean>
  technicalSpecs?: {
    beam?: string
    draft?: string
    engines?: string
  }
  // Logistics-specific fields
  serviceName?: string
  serviceType?: string // e.g., "Delivery", "Transport"
  coverageArea?: string // e.g., "Mediterranean", "Global"
  features?: Record<string, boolean> // e.g., Insurance, Tracking
}

interface GeneratedDescription {
  headline: string
  description: string
  highlights: string[]
  tagline: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDescriptionRequest = await request.json()
    const category = body.category || 'yacht' // Default to yacht for backward compatibility
    const locale = body.locale || 'en' // Default to English if not provided
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'de': 'German'
    }
    const targetLanguage = languageNames[locale] || 'English'
    
    // Validate required fields based on category
    if (category === 'yacht' && !body.yachtName) {
      return NextResponse.json(
        { error: 'Yacht name is required' },
        { status: 400 }
      )
    }
    
    if (category === 'logistics' && !body.serviceName) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      )
    }

    // Check Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY
    
    console.log('[API] GEMINI_API_KEY check:', {
      exists: !!geminiApiKey,
      length: geminiApiKey?.length || 0,
      startsWith: geminiApiKey?.substring(0, 10) || 'N/A',
      isValidFormat: geminiApiKey?.startsWith('AIza') || false
    })
    
    if (!geminiApiKey) {
      console.error('[API] GEMINI_API_KEY is missing from environment variables')
      console.error('[API] Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')))
      return NextResponse.json(
        { error: 'API key not configured', details: 'GEMINI_API_KEY is missing from environment variables. Please check your .env.local file and restart the dev server.' },
        { status: 500 }
      )
    }

    // Validate API key format (should start with 'AIza')
    if (!geminiApiKey.startsWith('AIza')) {
      console.warn('[API] API key format may be invalid (should start with "AIza")')
    }

    // Initialize Gemini AI
    console.log('[API] Initializing GoogleGenerativeAI with API key (length:', geminiApiKey.length, ')')
    let genAI: GoogleGenerativeAI
    try {
      genAI = new GoogleGenerativeAI(geminiApiKey)
      console.log('[API] GoogleGenerativeAI instance created successfully')
    } catch (initError) {
      console.error('[API] Failed to initialize GoogleGenerativeAI:', initError)
      return NextResponse.json(
        { error: 'Failed to initialize Gemini AI', details: `Error initializing: ${initError instanceof Error ? initError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
    
    // Use gemini-pro as it's the most widely available and stable model
    // Alternative models to try if this doesn't work:
    // - gemini-1.5-pro-002
    // - gemini-1.5-flash-002
    // - gemini-2.0-flash
    // Check Google AI Studio (https://aistudio.google.com) to see which models are available for your API key
    const geminiModel = 'gemini-pro'

    let prompt: string
    let systemInstruction: string

    if (category === 'logistics') {
      // Logistics-specific prompt
      const enabledFeatures = Object.entries(body.features || {})
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => {
          const featureNames: Record<string, string> = {
            insurance: 'Full Insurance Coverage',
            tracking: 'Real-time Vessel Tracking',
            customs: 'Customs Clearance Service',
            port_handling: 'Port Handling',
            experienced_crew: 'Experienced Delivery Crew',
            documentation: 'Complete Documentation Support',
          }
          return featureNames[key] || key
        })

      const logisticsInfo: string[] = []
      if (body.serviceName) logisticsInfo.push(`Service Name: ${body.serviceName}`)
      if (body.serviceType) logisticsInfo.push(`Service Type: ${body.serviceType}`)
      if (body.coverageArea) logisticsInfo.push(`Coverage Area: ${body.coverageArea}`)
      if (enabledFeatures.length > 0) logisticsInfo.push(`Features: ${enabledFeatures.join(', ')}`)

      systemInstruction = `You are a professional maritime logistics copywriter. You must ALWAYS respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Your response must be a strictly formatted JSON object. IMPORTANT: Generate all content in ${targetLanguage} language.`

      prompt = `Generate a professional, trustworthy description for a yacht delivery and logistics service website. Write everything in ${targetLanguage} language.

${logisticsInfo.join('\n')}

You must return a JSON object with the following exact structure:
{
  "headline": "A professional, confidence-inspiring headline (one sentence, max 15 words)",
  "description": "2-3 engaging paragraphs describing the logistics service, focusing on safety, reliability, efficiency, and professionalism. Use industry terms like 'Port handling', 'Customs clearance', 'Vessel relocation', and emphasize experienced crews, insurance coverage, and timely delivery.",
  "highlights": [
    "First key selling point focusing on safety and reliability (one sentence)",
    "Second key selling point focusing on efficiency and timely delivery (one sentence)",
    "Third key selling point focusing on professionalism and expertise (one sentence)",
    "Fourth key selling point focusing on comprehensive service coverage (one sentence)"
  ],
  "tagline": "A professional closing sentence that emphasizes trust, reliability, and peace of mind (one sentence, confident)"
}

Requirements:
- Use a "Professional Maritime Logistics" tone: trustworthy, professional, focused on safety and reliability
- Emphasize: Safety and Reliability (insurance, experienced crews), Efficiency (timely delivery, optimized routes), Professionalism (industry terms, expertise)
- Use industry terminology: Port handling, Customs clearance, Vessel relocation, Delivery service
- Mention specific features naturally within the description
- Make it compelling for yacht owners and charter companies
- Keep it professional and confidence-inspiring
- Focus on the peace of mind and reliability aspects

Return ONLY the JSON object, nothing else.`
    } else {
      // Yacht description prompt
      const enabledAmenities = Object.entries(body.amenities || {})
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => {
          const amenityNames: Record<string, string> = {
            ac: 'Air Conditioning',
            watermaker: 'Watermaker',
            generator: 'Generator',
            flybridge: 'Flybridge',
            heating: 'Heating',
            teak_deck: 'Teak Deck',
            full_batten: 'Full Batten',
            folding_table: 'Folding Table',
            fridge: 'Refrigerator',
            dinghy: 'Dinghy',
            water_entertainment: 'Water Entertainment (Water Toys)',
          }
          return amenityNames[key] || key
        })

      const techSpecs: string[] = []
      if (body.length) techSpecs.push(`Length: ${body.length}m`)
      if (body.capacity) techSpecs.push(`Capacity: ${body.capacity} guests`)
      if (body.cabins) techSpecs.push(`Cabins: ${body.cabins}`)
      if (body.toilets) techSpecs.push(`Toilets: ${body.toilets}`)
      if (body.technicalSpecs?.beam) techSpecs.push(`Beam: ${body.technicalSpecs.beam}`)
      if (body.technicalSpecs?.engines) techSpecs.push(`Engines: ${body.technicalSpecs.engines}`)

      systemInstruction = `You are an expert luxury yacht charter copywriter. You must ALWAYS respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Your response must be a strictly formatted JSON object. IMPORTANT: Generate all content in ${targetLanguage} language.`

      prompt = `Generate a professional, evocative description for a yacht charter website. Write everything in ${targetLanguage} language.

Yacht Name: ${body.yachtName}
${body.model ? `Model: ${body.model}` : ''}
${techSpecs.length > 0 ? `Technical Specifications: ${techSpecs.join(', ')}` : ''}
${enabledAmenities.length > 0 ? `Amenities: ${enabledAmenities.join(', ')}` : ''}

You must return a JSON object with the following exact structure:
{
  "headline": "A catchy, elegant headline (one sentence, max 15 words)",
  "description": "2-3 engaging paragraphs describing the yacht's appeal, focusing on the experience (sunsets, comfort, freedom, reliability). Write in a luxurious, evocative tone suitable for premium yacht charters.",
  "highlights": [
    "First key selling point (one sentence)",
    "Second key selling point (one sentence)",
    "Third key selling point (one sentence)",
    "Fourth key selling point (one sentence)"
  ],
  "tagline": "An emotional closing sentence that captures the essence of the charter experience (one sentence, evocative)"
}

Requirements:
- Use a "High-end Yacht Charter" tone: evocative, professional, focused on experience
- Emphasize luxury, comfort, freedom, and reliability
- Mention specific amenities naturally within the description
- Make it compelling for potential charter clients
- Keep it professional but warm and inviting
- Focus on the Mediterranean sailing experience

Return ONLY the JSON object, nothing else.`
    }

    const entityName = category === 'logistics' ? body.serviceName : body.yachtName
    console.log(`[API] Calling Gemini (${geminiModel}) to generate description for:`, entityName)
    console.log('[API] Request body:', JSON.stringify(body, null, 2))

    // Create model with system instruction
    console.log('[API] Creating model instance with:', {
      model: geminiModel,
      hasSystemInstruction: !!systemInstruction,
      systemInstructionLength: systemInstruction?.length || 0
    })
    
    let model
    try {
      model = genAI.getGenerativeModel({ 
        model: geminiModel,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
        },
        systemInstruction: systemInstruction,
      })
      console.log('[API] Model instance created successfully')
    } catch (modelError) {
      console.error('[API] Failed to create model instance:', modelError)
      return NextResponse.json(
        { error: 'Failed to create model', details: `Error creating model: ${modelError instanceof Error ? modelError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Generate content using Gemini SDK
    let result
    let response
    let content: string
    
    try {
      result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      })

      response = await result.response
      
      // Check for blocked content or safety issues
      if (response.promptFeedback) {
        const feedback = response.promptFeedback
        if (feedback.blockReason) {
          console.error('[API] Content blocked by Gemini safety filters:', feedback.blockReason)
          return NextResponse.json(
            { 
              error: 'Content blocked by safety filters', 
              details: `Content was blocked: ${feedback.blockReason}. Please try with different input or adjust your prompt.` 
            },
            { status: 400 }
          )
        }
      }
      
      // Check if response has candidates
      if (!response.candidates || response.candidates.length === 0) {
        console.error('[API] No candidates in Gemini response')
        return NextResponse.json(
          { 
            error: 'No content generated', 
            details: 'Gemini API returned no candidates. This may be due to safety filters or API issues.' 
          },
          { status: 500 }
        )
      }
      
      // Check if candidate was blocked
      const candidate = response.candidates[0]
      if (candidate.finishReason === 'SAFETY') {
        console.error('[API] Candidate blocked by safety filters')
        return NextResponse.json(
          { 
            error: 'Content blocked by safety filters', 
            details: 'The generated content was blocked by Gemini safety filters. Please try with different input.' 
          },
          { status: 400 }
        )
      }
      
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn('[API] Unexpected finish reason:', candidate.finishReason)
      }
      
      content = response.text()
      console.log('[API] Successfully received content from Gemini, length:', content?.length || 0)
    } catch (geminiError: any) {
      console.error('[API] Gemini API error:', geminiError)
      console.error('[API] Error type:', typeof geminiError)
      console.error('[API] Error keys:', Object.keys(geminiError || {}))
      
      // Try to extract more detailed error information
      let errorMessage = geminiError?.message || 'Unknown Gemini API error'
      if (geminiError?.cause) {
        errorMessage += ` | Cause: ${JSON.stringify(geminiError.cause)}`
      }
      if (geminiError?.status) {
        errorMessage += ` | Status: ${geminiError.status}`
      }
      
      // Check for specific Gemini error codes
      if (geminiError?.status === 400) {
        errorMessage = 'Invalid request to Gemini API. Please check your input parameters.'
      } else if (geminiError?.status === 401) {
        errorMessage = 'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local'
      } else if (geminiError?.status === 403) {
        errorMessage = 'Gemini API access forbidden. Please check your API key permissions.'
      } else if (geminiError?.status === 429) {
        errorMessage = 'Gemini API rate limit exceeded. Please try again later.'
      } else if (geminiError?.status === 500) {
        errorMessage = 'Gemini API server error. Please try again later.'
      }
      
      return NextResponse.json(
        { error: 'Failed to generate description', details: errorMessage },
        { status: geminiError?.status || 500 }
      )
    }

    if (!content) {
      console.error('[API] Gemini returned empty response')
      return NextResponse.json(
        { error: 'No content generated from Gemini', details: 'Empty response from API' },
        { status: 500 }
      )
    }

    // Parse JSON response
    let generatedDescription: GeneratedDescription
    try {
      // Clean up the content in case there are any markdown code blocks
      let cleanedContent = content.trim()
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      generatedDescription = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('[API] Failed to parse JSON from Gemini:', content)
      console.error('[API] Parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid response format from AI', details: 'Failed to parse JSON response' },
        { status: 500 }
      )
    }

    // Validate structure
    if (!generatedDescription.headline || !generatedDescription.description || !Array.isArray(generatedDescription.highlights) || !generatedDescription.tagline) {
      console.error('[API] Invalid description structure:', generatedDescription)
      return NextResponse.json(
        { error: 'Invalid description structure', details: 'Missing required fields in response' },
        { status: 500 }
      )
    }

    console.log('[API] Description generated successfully for:', entityName)
    console.log('[API] Generated description structure:', {
      hasHeadline: !!generatedDescription.headline,
      hasDescription: !!generatedDescription.description,
      highlightsCount: generatedDescription.highlights?.length || 0,
      hasTagline: !!generatedDescription.tagline
    })
    
    return NextResponse.json({
      success: true,
      description: generatedDescription,
    })
  } catch (error) {
    console.error('[API] Error generating description:', error)
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[API] Error details:', JSON.stringify(error, null, 2))
    
    // Handle Gemini-specific errors
    let errorDetails = 'Unknown error'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      // Check for common Gemini API errors
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key') || error.message.includes('401')) {
        statusCode = 401
        errorDetails = 'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local'
      } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota') || error.message.includes('429')) {
        statusCode = 429
        errorDetails = 'Gemini API quota exceeded. Please check your usage limits.'
      } else if (error.message.includes('MODEL_NOT_FOUND') || error.message.includes('model') || error.message.includes('404') || error.message.includes('not found')) {
        statusCode = 404
        errorDetails = `Gemini model "${geminiModel}" not found. Available models vary by account. Try: gemini-pro, gemini-1.5-pro-002, gemini-1.5-flash-002, or gemini-2.0-flash. Check https://aistudio.google.com to see which models are available for your API key.`
      } else if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
        statusCode = 400
        errorDetails = 'Content was blocked by Gemini safety filters. Please try with different input.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        statusCode = 503
        errorDetails = 'Network error connecting to Gemini API. Please check your internet connection.'
      }
    }
    
    // Try to extract more info from error object
    if (error && typeof error === 'object') {
      const errorObj = error as any
      if (errorObj.status) statusCode = errorObj.status
      if (errorObj.statusText) errorDetails += ` (${errorObj.statusText})`
      if (errorObj.cause) {
        console.error('[API] Error cause:', errorObj.cause)
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate description', details: errorDetails },
      { status: statusCode }
    )
  }
}
