import { NextRequest, NextResponse } from 'next/server'

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

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured', details: 'OPENAI_API_KEY is missing from environment variables' },
        { status: 500 }
      )
    }

    let prompt: string

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

      const logisticsInfo = []
      if (body.serviceName) logisticsInfo.push(`Service Name: ${body.serviceName}`)
      if (body.serviceType) logisticsInfo.push(`Service Type: ${body.serviceType}`)
      if (body.coverageArea) logisticsInfo.push(`Coverage Area: ${body.coverageArea}`)
      if (enabledFeatures.length > 0) logisticsInfo.push(`Features: ${enabledFeatures.join(', ')}`)

      prompt = `You are a professional maritime logistics copywriter. Generate a professional, trustworthy description for a yacht delivery and logistics service website.

${logisticsInfo.join('\n')}

Generate a high-end logistics service description in JSON format with the following structure:
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

Return ONLY valid JSON, no markdown, no code blocks, just the JSON object.`
    } else {
      // Yacht description prompt (existing logic)
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

      const techSpecs = []
      if (body.length) techSpecs.push(`Length: ${body.length}m`)
      if (body.capacity) techSpecs.push(`Capacity: ${body.capacity} guests`)
      if (body.cabins) techSpecs.push(`Cabins: ${body.cabins}`)
      if (body.toilets) techSpecs.push(`Toilets: ${body.toilets}`)
      if (body.technicalSpecs?.beam) techSpecs.push(`Beam: ${body.technicalSpecs.beam}`)
      if (body.technicalSpecs?.engines) techSpecs.push(`Engines: ${body.technicalSpecs.engines}`)

      prompt = `You are a luxury yacht charter copywriter. Generate a professional, evocative description for a yacht charter website.

Yacht Name: ${body.yachtName}
${body.model ? `Model: ${body.model}` : ''}
${techSpecs.length > 0 ? `Technical Specifications: ${techSpecs.join(', ')}` : ''}
${enabledAmenities.length > 0 ? `Amenities: ${enabledAmenities.join(', ')}` : ''}

Generate a high-end yacht charter description in JSON format with the following structure:
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

Return ONLY valid JSON, no markdown, no code blocks, just the JSON object.`
    }

    console.log('[API] Calling OpenAI to generate description for:', body.yachtName)

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cost-effective model
        messages: [
          {
            role: 'system',
            content: 'You are an expert luxury yacht charter copywriter. Always respond with valid JSON only, no markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[API] OpenAI API error:', response.status, errorData)
      return NextResponse.json(
        { error: 'Failed to generate description', details: `OpenAI API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      )
    }

    // Parse JSON response
    let generatedDescription: GeneratedDescription
    try {
      generatedDescription = JSON.parse(content)
    } catch (parseError) {
      console.error('[API] Failed to parse JSON:', content)
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      )
    }

    // Validate structure
    if (!generatedDescription.headline || !generatedDescription.description || !Array.isArray(generatedDescription.highlights) || !generatedDescription.tagline) {
      return NextResponse.json(
        { error: 'Invalid description structure' },
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
    const errorDetails = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to generate description', details: errorDetails },
      { status: 500 }
    )
  }
}
