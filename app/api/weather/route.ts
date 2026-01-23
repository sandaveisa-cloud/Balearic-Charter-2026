import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenWeatherMap API key is not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch 7-day forecast from OpenWeatherMap
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&cnt=56`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Weather API] OpenWeatherMap error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch weather data', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Process the forecast data to get daily forecasts
    const dailyForecasts = processForecastData(data)

    return NextResponse.json({
      success: true,
      forecast: dailyForecasts,
      location: {
        name: data.city?.name || 'Unknown',
        country: data.city?.country || '',
      },
    })
  } catch (error) {
    console.error('[Weather API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Process OpenWeatherMap forecast data into daily forecasts
function processForecastData(data: any) {
  const forecasts: any[] = []
  const dailyData: Record<string, any[]> = {}

  // Group forecasts by date
  if (data.list && Array.isArray(data.list)) {
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = []
      }
      dailyData[dateKey].push(item)
    })
  }

  // Process each day
  const sortedDates = Object.keys(dailyData).sort().slice(0, 7) // Get next 7 days

  sortedDates.forEach((dateKey, index) => {
    const dayForecasts = dailyData[dateKey]
    if (!dayForecasts || dayForecasts.length === 0) return

    // Get min/max temperatures
    const temps = dayForecasts.map((f: any) => f.main?.temp).filter((t: any) => t != null)
    const high = Math.round(Math.max(...temps))
    const low = Math.round(Math.min(...temps))

    // Get most common weather condition for the day
    const mainCondition = dayForecasts[0].weather?.[0]?.main?.toLowerCase() || 'clear'
    const condition = dayForecasts[0].weather?.[0]?.description || 'Clear'

    // Map weather condition to icon type
    const iconType = mapWeatherToIcon(mainCondition)

    const date = new Date(dateKey)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNumber = date.getDate().toString()

    forecasts.push({
      day: dayName,
      date: dayNumber,
      icon: iconType,
      high,
      low,
      condition: condition.charAt(0).toUpperCase() + condition.slice(1),
    })
  })

  return forecasts
}

// Map OpenWeatherMap weather conditions to our icon types
function mapWeatherToIcon(condition: string): 'sun' | 'cloud' | 'rain' | 'drizzle' {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    return 'sun'
  }
  if (conditionLower.includes('rain') || conditionLower.includes('storm')) {
    return 'rain'
  }
  if (conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
    return 'drizzle'
  }
  // Default to cloud for cloudy, mist, fog, etc.
  return 'cloud'
}
