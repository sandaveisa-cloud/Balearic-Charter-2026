import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

interface GenerateDescriptionRequest {
  category?: 'yacht' | 'logistics' // Category for different description types
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
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'API key not configured', details: 'GEMINI_API_KEY is missing from environment variables' },
        { status: 500 }
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    
    // Use gemini-1.5-pro for high quality (or gemini-1.5-flash for speed)
    const geminiModel = 'gemini-1.5-pro'

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

      systemInstruction = `You are a professional maritime logistics copywriter. You must ALWAYS respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Your response must be a strictly formatted JSON object.`

      prompt = `Generate a professional, trustworthy description for a yacht delivery and logistics service website.

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

      systemInstruction = `You are an expert luxury yacht charter copywriter. You must ALWAYS respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Your response must be a strictly formatted JSON object.`

      prompt = `Generate a professional, evocative description for a yacht charter website.

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

    // Create model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: geminiModel,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
      systemInstruction: systemInstruction,
    })

    // Generate content using Gemini SDK
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    })

    const response = await result.response
    const content = response.text()

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
    return NextResponse.json({
      success: true,
      description: generatedDescription,
    })
  } catch (error) {
    console.error('[API] Error generating description:', error)
    
    // Handle Gemini-specific errors
    let errorDetails = 'Unknown error'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      // Check for common Gemini API errors
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
        statusCode = 401
        errorDetails = 'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local'
      } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota')) {
        statusCode = 429
        errorDetails = 'Gemini API quota exceeded. Please check your usage limits.'
      } else if (error.message.includes('MODEL_NOT_FOUND') || error.message.includes('model')) {
        statusCode = 404
        errorDetails = 'Gemini model not found. Please check the model name.'
      } else if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
        statusCode = 400
        errorDetails = 'Content was blocked by Gemini safety filters. Please try with different input.'
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate description', details: errorDetails },
      { status: statusCode }
    )
  }
}
