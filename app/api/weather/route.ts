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
    // Fetch 5-day forecast from OpenWeatherMap (free tier provides 5 days with 3-hour intervals)
    // Note: For true 7-day forecast, you'd need OpenWeatherMap One Call API 3.0 (paid tier)
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
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

  // Process each day - OpenWeatherMap free tier provides 5 days, we'll use all available
  const sortedDates = Object.keys(dailyData).sort()
  const maxDays = Math.min(sortedDates.length, 7) // Get up to 7 days (or available days)

  sortedDates.slice(0, maxDays).forEach((dateKey) => {
    const dayForecasts = dailyData[dateKey]
    if (!dayForecasts || dayForecasts.length === 0) return

    // Get min/max temperatures from all forecasts for this day
    const temps = dayForecasts.map((f: any) => f.main?.temp).filter((t: any) => t != null)
    if (temps.length === 0) return
    
    const high = Math.round(Math.max(...temps))
    const low = Math.round(Math.min(...temps))

    // Get the most representative weather condition (use midday forecast if available, otherwise first)
    const middayForecast = dayForecasts.find((f: any) => {
      const hour = new Date(f.dt * 1000).getHours()
      return hour >= 11 && hour <= 15
    }) || dayForecasts[Math.floor(dayForecasts.length / 2)] || dayForecasts[0]

    const mainCondition = middayForecast.weather?.[0]?.main?.toLowerCase() || 'clear'
    const condition = middayForecast.weather?.[0]?.description || 'Clear'

    // Map weather condition to icon type
    const iconType = mapWeatherToIcon(mainCondition)

    const date = new Date(dateKey + 'T12:00:00') // Use noon to avoid timezone issues
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

  // Clear sky / sunny
  if (conditionLower === 'clear' || conditionLower === 'clear sky') {
    return 'sun'
  }

  // Rain conditions
  if (conditionLower.includes('rain') || 
      conditionLower.includes('storm') || 
      conditionLower.includes('thunderstorm')) {
    return 'rain'
  }

  // Drizzle / light rain
  if (conditionLower.includes('drizzle') || 
      conditionLower.includes('shower') ||
      conditionLower.includes('light rain')) {
    return 'drizzle'
  }

  // Cloudy conditions (clouds, mist, fog, haze, etc.)
  if (conditionLower.includes('cloud') || 
      conditionLower.includes('mist') || 
      conditionLower.includes('fog') ||
      conditionLower.includes('haze') ||
      conditionLower.includes('dust') ||
      conditionLower.includes('sand')) {
    return 'cloud'
  }

  // Snow conditions (map to cloud for now, or could add snow icon)
  if (conditionLower.includes('snow')) {
    return 'cloud'
  }

  // Default to sun for unknown conditions
  return 'sun'
}
