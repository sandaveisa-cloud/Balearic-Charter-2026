import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Check for API key
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
      console.error('[AI Assistant] GEMINI_API_KEY not found in environment variables');
      return NextResponse.json({ 
        error: 'API Key not configured',
        details: 'GEMINI_API_KEY is missing from environment variables. Please add it to your .env.local file and restart the dev server.',
        code: 'MISSING_API_KEY'
      }, { status: 500 });
    }

    // Validate API key format (should start with 'AIza')
    if (!key.startsWith('AIza')) {
      console.error('[AI Assistant] Invalid GEMINI_API_KEY format');
      return NextResponse.json({ 
        error: 'Invalid API Key format',
        details: 'GEMINI_API_KEY should start with "AIza". Please check your API key from Google AI Studio.',
        code: 'INVALID_API_KEY_FORMAT'
      }, { status: 500 });
    }

    // Parse request body
    let prompt: string;
    try {
      const body = await req.json();
      prompt = body.prompt;
      
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return NextResponse.json({ 
          error: 'Invalid request',
          details: 'Prompt is required and must be a non-empty string.',
          code: 'INVALID_PROMPT'
        }, { status: 400 });
      }
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: 'Request body must be valid JSON with a "prompt" field.',
        code: 'INVALID_REQUEST_BODY'
      }, { status: 400 });
    }

    // Initialize Gemini AI
    let genAI: GoogleGenerativeAI;
    try {
      genAI = new GoogleGenerativeAI(key);
    } catch (initError: any) {
      console.error('[AI Assistant] Failed to initialize GoogleGenerativeAI:', initError);
      return NextResponse.json({ 
        error: 'Failed to initialize Gemini AI',
        details: `Error initializing: ${initError?.message || 'Unknown error'}`,
        code: 'INIT_ERROR'
      }, { status: 500 });
    }

    // Get model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    // System instruction for luxury yacht charter content
    const systemInstruction = `
      You are the Senior Marketing Expert for "Balearic Yacht Charters" (balearicyachtcharters.com), a luxury yacht charter agency specializing in the Balearic Islands (Ibiza, Mallorca, Menorca, Formentera).

      Your writing style:
      1. LUXURY & EXCLUSIVE: Use sophisticated, inviting language (e.g., "pristine waters", "bespoke experiences", "hidden gems").
      2. SEO-DRIVEN: Naturally weave in keywords like "yacht charter Ibiza", "Mallorca boat rental", "luxury sailing Mediterranean", and "private catamaran".
      3. EXPERT KNOWLEDGE: When describing destinations, mention specific anchorages (calas), beach clubs, or sailing conditions unique to the Balearics.
      4. LOGISTICS FOCUS: For logistics prompts, emphasize reliability, safety, and Mediterranean expertise.

      Output Requirements:
      - Always provide professional tone.
      - If translating, ensure the nuance of "luxury travel" is preserved in English, Spanish, German, or Latvian.
      - Keep formatting clean (suitable for website sections).
    `;

    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;

    // Generate content
    let result: any;
    try {
      result = await model.generateContent(fullPrompt);
    } catch (apiError: any) {
      console.error('[AI Assistant] Gemini API error:', apiError);
      
      // Handle specific Gemini API errors
      let errorMessage = 'Failed to fetch AI response';
      let errorCode = 'API_ERROR';
      
      if (apiError?.status === 400) {
        errorMessage = 'Invalid request to Gemini API';
        errorCode = 'INVALID_REQUEST';
      } else if (apiError?.status === 401) {
        errorMessage = 'Invalid API Key';
        errorCode = 'INVALID_API_KEY';
      } else if (apiError?.status === 403) {
        errorMessage = 'API access forbidden. Please check your API key permissions.';
        errorCode = 'FORBIDDEN';
      } else if (apiError?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        errorCode = 'RATE_LIMIT';
      } else if (apiError?.status === 500) {
        errorMessage = 'Gemini API server error. Please try again later.';
        errorCode = 'SERVER_ERROR';
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: apiError?.message || 'Unknown error occurred',
        code: errorCode
      }, { status: apiError?.status || 500 });
    }

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      return NextResponse.json({ 
        error: 'Empty response',
        details: 'AI generated an empty response. Please try again with a different prompt.',
        code: 'EMPTY_RESPONSE'
      }, { status: 500 });
    }

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('[AI Assistant] Unexpected error:', error);
    
    return NextResponse.json({ 
      error: 'Unexpected error occurred',
      details: error?.message || 'An unknown error occurred while processing your request.',
      code: 'UNEXPECTED_ERROR'
    }, { status: 500 });
  }
}