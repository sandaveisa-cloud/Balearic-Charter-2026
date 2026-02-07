import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

interface GenerateDestinationContentRequest {
  destinationName: string
  locale?: string // 'en', 'es', or 'de'
  region?: string
  existingDescription?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDestinationContentRequest = await request.json()
    const { destinationName, locale = 'en', region, existingDescription } = body

    if (!destinationName) {
      return NextResponse.json(
        { error: 'Destination name is required' },
        { status: 400 }
      )
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'de': 'German'
    }
    const targetLanguage = languageNames[locale] || 'English'

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
      systemInstruction: `You are an expert luxury travel writer specializing in Mediterranean yacht charter destinations. Write sophisticated, inviting, and expert content in ${targetLanguage}. Always respond with valid JSON only.`,
    })

    const prompt = `Generate comprehensive travel guide content for the destination "${destinationName}"${region ? ` in ${region}` : ''} in ${targetLanguage}.

${existingDescription ? `Existing description: ${existingDescription}\n\n` : ''}

Generate a JSON object with the following structure:
{
  "sailingTips": ["tip1", "tip2", "tip3"],
  "highlights": [
    {
      "name": "Attraction name",
      "description": "Brief description",
      "category": "landmark|beach|marina|viewpoint"
    }
  ],
  "seasonalDescription": {
    "spring": "Brief description of spring conditions",
    "summer": "Brief description of summer conditions",
    "earlyAutumn": "Brief description of early autumn conditions",
    "lateAutumn": "Brief description of late autumn conditions",
    "winter": "Brief description of winter conditions"
  },
  "localInsights": "2-3 sentences of local knowledge that only locals would know, like best anchor points, secret spots, etc."
}

Tone: Sophisticated, expert, and inviting. Focus on luxury yacht charter experience.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    let content
    try {
      content = JSON.parse(text)
    } catch (parseError) {
      console.error('[API] Failed to parse JSON response:', text)
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: text },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content,
    })
  } catch (error) {
    console.error('[API] Error generating destination content:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
