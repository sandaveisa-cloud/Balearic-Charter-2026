import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Mēs pievienojam papildus pārbaudi atslēgai jau inicializācijas brīdī
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
    }

    const { prompt } = await req.json()

    // IZLABOTS: Izmantojam 'gemini-1.5-flash-latest', kas ir stabilāks nosaukums jaunajām versijām
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const systemInstruction = `
      You are an expert web developer and business consultant for "Wide Dream".
      Your capabilities:
      1. Write SEO-optimized descriptions.
      2. Fix grammar and improve tone.
      3. Translate texts.
      Keep answers concise.
    `

    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`

    // Pievienojam drošības iestatījumus, ja nepieciešams (neobligāti, bet palīdz)
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ result: text })
  } catch (error: any) {
    // Izvadām detalizētāku kļūdu konsolē, lai redzētu tieši kas nogāja greizi
    console.error('Gemini API Error Detail:', error.message)
    return NextResponse.json({ 
      error: 'Failed to fetch AI response',
      details: error.message 
    }, { status: 500 })
  }
}