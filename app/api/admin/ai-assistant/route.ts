import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // 1. Pārbaudām atslēgu tieši funkcijas iekšpusē
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
      console.error('KĻŪDA: GEMINI_API_KEY nav atrasts vides mainīgajos');
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    const { prompt } = await req.json();
    
    // Inicializējam AI ar tavu atslēgu
    const genAI = new GoogleGenerativeAI(key);

    // 2. IZLABOTS: Izmantojam specifisku modeļa versiju, kas vislabāk strādā ar v1beta un jauno bibliotēku
    // Ja gemini-1.5-flash joprojām met 404, šis nosaukums ir visdrošākais
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    const systemInstruction = `
      You are an expert web developer and business consultant for "Wide Dream" (widedream.es).
      Your expertise:
      1. Write SEO-optimized descriptions for yacht rentals and maritime logistics in Ibiza/Mallorca.
      2. Fix grammar and improve professional tone.
      3. Precise translations between Latvian, Spanish, and English.
      Keep answers concise and business-oriented.
    `;

    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;

    // 3. AI satura ģenerēšana ar papildus drošības pārbaudi response gaidīšanai
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