import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 })
    }

    const { prompt } = await req.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const systemInstruction = `
      You are an expert web developer and business consultant for "Wide Dream".
      Your capabilities:
      1. Write SEO-optimized descriptions.
      2. Fix grammar and improve tone.
      3. Translate texts.
      Keep answers concise.
    `

    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`

    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ result: text })
  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch AI response' }, { status: 500 })
  }
}