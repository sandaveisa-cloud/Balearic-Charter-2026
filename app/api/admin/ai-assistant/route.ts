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
    const genAI = new GoogleGenerativeAI(key);

    // 2. IZMAIŅA: Izmantojam "gemini-1.5-flash" bez papildus "latest" vai versijām, 
    // jo bibliotēka pati pievieno v1beta prefiksu.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `
      You are an expert web developer and business consultant for "Wide Dream".
      Your website is widedream.es.
      Your capabilities:
      1. Write SEO-optimized descriptions for ship rental and logistics.
      2. Fix grammar and improve tone.
      3. Translate texts.
      Keep answers concise.
    `;

    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;

    // 3. Izsaukums
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Gemini API Error Detail:', error.message);
    
    // Ja kļūda joprojām ir 404, tas nozīmē, ka jāatjaunina bibliotēka terminālī
    return NextResponse.json({ 
      error: 'Failed to fetch AI response',
      details: error.message 
    }, { status: 500 });
  }
}