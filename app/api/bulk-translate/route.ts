import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

interface BulkTranslateRequest {
  entityType: 'destinations' | 'crew' | 'culinary' | 'fleet'
  targetLocale: 'es' | 'de'
  sourceLocale?: 'en'
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkTranslateRequest = await request.json()
    const { entityType, targetLocale, sourceLocale = 'en' } = body

    // Validate API key
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', // Using latest stable flash model for speed and efficiency
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
      systemInstruction: `You are a professional translator specializing in luxury maritime and hospitality content. You must ALWAYS respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Translate from ${sourceLocale} to ${targetLocale} while maintaining the tone, style, and technical accuracy.`,
    })

    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'de': 'German'
    }

    const targetLanguage = languageNames[targetLocale]
    const sourceLanguage = languageNames[sourceLocale]

    // Fetch data from Supabase
    let data: any[] = []
    let updatePromises: Promise<any>[] = []

    switch (entityType) {
      case 'destinations': {
        const { data: destinations, error } = await supabase
          .from('destinations')
          .select('id, name, title, description, description_en, description_es, description_de, description_i18n')
          .eq('is_active', true)

        if (error) throw error
        data = destinations || []

        // Translate each destination
        for (const dest of data) {
          const sourceText = dest.description_i18n?.[sourceLocale] || 
                            dest[`description_${sourceLocale}`] || 
                            dest.description || ''

          if (!sourceText.trim()) continue

          try {
            const prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}. Maintain the professional, luxurious tone suitable for a yacht charter website.

Source text:
${sourceText}

Return ONLY a JSON object with this structure:
{
  "translated_text": "the translated text in ${targetLanguage}"
}`

            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
            })

            const responseText = result.response.text()
            // Clean markdown code blocks if present
            const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            const parsed = JSON.parse(cleanedText)
            const translatedText = parsed.translated_text

            // Update description_i18n JSONB column
            const currentI18n = dest.description_i18n || {}
            const updatedI18n = {
              ...currentI18n,
              [targetLocale]: translatedText
            }

            updatePromises.push(
              (async () => {
                const result = await supabase
                  .from('destinations')
                  // @ts-expect-error - Supabase type inference limitation with dynamic table updates
                  .update({ description_i18n: updatedI18n })
                  .eq('id', dest.id)
                return result
              })()
            )
          } catch (error) {
            console.error(`[BulkTranslate] Error translating destination ${dest.id}:`, error)
          }
        }
        break
      }

      case 'crew': {
        const { data: crew, error } = await supabase
          .from('crew')
          .select('id, name, role, bio, role_description')
          .eq('is_active', true)

        if (error) throw error
        data = crew || []

        // Note: Crew doesn't have description_i18n yet, would need schema update
        // For now, translate bio/role_description if they exist
        for (const member of data) {
          const sourceText = member.bio || member.role_description || ''
          if (!sourceText.trim()) continue

          try {
            const prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}. Maintain the professional tone suitable for crew member profiles.

Source text:
${sourceText}

Return ONLY a JSON object:
{
  "translated_text": "the translated text in ${targetLanguage}"
}`

            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
            })

            const responseText = result.response.text()
            const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            const parsed = JSON.parse(cleanedText)
            const translatedText = parsed.translated_text

            // Store in bio_i18n or role_description_i18n (would need schema update)
            // For now, we'll skip crew as it needs schema changes
            console.log(`[BulkTranslate] Crew translation for ${member.id} would need schema update`)
          } catch (error) {
            console.error(`[BulkTranslate] Error translating crew ${member.id}:`, error)
          }
        }
        break
      }

      case 'culinary': {
        const { data: culinary, error } = await supabase
          .from('culinary_experiences')
          .select('id, title, description')
          .eq('is_active', true)

        if (error) throw error
        data = culinary || []

        // Note: Culinary doesn't have description_i18n yet, would need schema update
        for (const exp of data) {
          const sourceText = exp.description || ''
          if (!sourceText.trim()) continue

          try {
            const prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}. Maintain the luxurious, appetizing tone suitable for culinary experiences.

Source text:
${sourceText}

Return ONLY a JSON object:
{
  "translated_text": "the translated text in ${targetLanguage}"
}`

            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
            })

            const responseText = result.response.text()
            const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            const parsed = JSON.parse(cleanedText)
            const translatedText = parsed.translated_text

            // Store in description_i18n (would need schema update)
            console.log(`[BulkTranslate] Culinary translation for ${exp.id} would need schema update`)
          } catch (error) {
            console.error(`[BulkTranslate] Error translating culinary ${exp.id}:`, error)
          }
        }
        break
      }

      case 'fleet': {
        const { data: fleet, error } = await supabase
          .from('fleet')
          .select('id, name, description, short_description, description_i18n, short_description_i18n')
          .eq('is_active', true)

        if (error) throw error
        data = fleet || []

        // Translate fleet descriptions
        for (const yacht of data) {
          // Translate description
          const sourceDesc = yacht.description_i18n?.[sourceLocale] || yacht.description || ''
          if (sourceDesc.trim()) {
            try {
              const prompt = `Translate the following ${sourceLanguage} yacht description to ${targetLanguage}. Maintain the luxurious, professional tone suitable for a premium yacht charter website.

Source text:
${sourceDesc}

Return ONLY a JSON object:
{
  "translated_text": "the translated text in ${targetLanguage}"
}`

              const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
              })

              const responseText = result.response.text()
              const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
              const parsed = JSON.parse(cleanedText)
              const translatedDesc = parsed.translated_text

              const currentDescI18n = yacht.description_i18n || {}
              const updatedDescI18n = {
                ...currentDescI18n,
                [targetLocale]: translatedDesc
              }

              // Translate short_description
              const sourceShortDesc = yacht.short_description_i18n?.[sourceLocale] || yacht.short_description || ''
              let updatedShortDescI18n = yacht.short_description_i18n || {}

              if (sourceShortDesc.trim()) {
                const shortPrompt = `Translate the following ${sourceLanguage} short yacht description to ${targetLanguage}. Keep it concise (max 150 characters).

Source text:
${sourceShortDesc}

Return ONLY a JSON object:
{
  "translated_text": "the translated text in ${targetLanguage}"
}`

                const shortResult = await model.generateContent({
                  contents: [{ role: 'user', parts: [{ text: shortPrompt }] }]
                })

                const shortResponseText = shortResult.response.text()
                const shortCleanedText = shortResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
                const shortParsed = JSON.parse(shortCleanedText)
                const translatedShortDesc = shortParsed.translated_text

                updatedShortDescI18n = {
                  ...updatedShortDescI18n,
                  [targetLocale]: translatedShortDesc
                }
              }

              updatePromises.push(
                (async () => {
                  const result = await supabase
                    .from('fleet')
                    // @ts-expect-error - Supabase type inference limitation with dynamic table updates
                    .update({
                      description_i18n: updatedDescI18n,
                      short_description_i18n: updatedShortDescI18n
                    })
                    .eq('id', yacht.id)
                  return result
                })()
              )
            } catch (error) {
              console.error(`[BulkTranslate] Error translating fleet ${yacht.id}:`, error)
            }
          }
        }
        break
      }
    }

    // Wait for all updates
    const results = await Promise.allSettled(updatePromises)
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Translation completed: ${successful} successful, ${failed} failed`,
      stats: {
        total: data.length,
        successful,
        failed
      }
    })

  } catch (error) {
    console.error('[BulkTranslate] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
