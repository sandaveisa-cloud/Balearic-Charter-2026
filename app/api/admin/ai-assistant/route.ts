import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
      console.error('KĻŪDA: GEMINI_API_KEY nav atrasts');
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(key);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    // UZLABOTA INSTRUKCIJA: Fokusējamies uz Baleāru salām un Luksusa segmentu
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

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("AI generated an empty response");
    }

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Gemini API Error Detail:', error.message);
    
    return NextResponse.json({ 
      error: 'Failed to fetch AI response',
      details: error.message 
    }, { status: 500 });
  }
}