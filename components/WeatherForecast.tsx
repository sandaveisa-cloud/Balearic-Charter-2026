'use client'

import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, CloudDrizzle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface WeatherDay {
  day: string
  date: string
  icon: 'sun' | 'cloud' | 'rain' | 'drizzle'
  high: number
  low: number
  condition: string
}

interface WeatherForecastProps {
  forecast?: WeatherDay[]
  latitude?: number | null
  longitude?: number | null
}

export default function WeatherForecast({ forecast, latitude, longitude }: WeatherForecastProps) {
  const t = useTranslations('destinations')
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock data if no forecast provided
  const defaultForecast: WeatherDay[] = [
    { day: 'Mon', date: '20', icon: 'sun', high: 24, low: 18, condition: 'Sunny' },
    { day: 'Tue', date: '21', icon: 'sun', high: 25, low: 19, condition: 'Clear' },
    { day: 'Wed', date: '22', icon: 'cloud', high: 23, low: 17, condition: 'Partly Cloudy' },
    { day: 'Thu', date: '23', icon: 'sun', high: 26, low: 20, condition: 'Sunny' },
    { day: 'Fri', date: '24', icon: 'cloud', high: 24, low: 18, condition: 'Cloudy' },
    { day: 'Sat', date: '25', icon: 'drizzle', high: 22, low: 16, condition: 'Light Rain' },
    { day: 'Sun', date: '26', icon: 'sun', high: 25, low: 19, condition: 'Sunny' },
  ]

  // Fetch weather data if coordinates are provided
  useEffect(() => {
    if (forecast) {
      // Use provided forecast
      setWeatherData(forecast)
      return
    }

    if (latitude && longitude) {
      // Fetch real weather data
      setLoading(true)
      setError(null)
      
      fetch(`/api/weather?lat=${latitude}&lng=${longitude}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch weather data')
          }
          return res.json()
        })
        .then((data) => {
          if (data.success && data.forecast) {
            setWeatherData(data.forecast)
          } else {
            throw new Error(data.error || 'Invalid weather data')
          }
        })
        .catch((err) => {
          console.error('[WeatherForecast] Error fetching weather:', err)
          setError('Failed to load weather forecast')
          setWeatherData(defaultForecast) // Fallback to mock data
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      // No coordinates, use default mock data
      setWeatherData(defaultForecast)
    }
  }, [latitude, longitude, forecast])

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'sun':
        return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloud':
        return <Cloud className="w-6 h-6 text-gray-400" />
      case 'rain':
        return <CloudRain className="w-6 h-6 text-blue-500" />
      case 'drizzle':
        return <CloudDrizzle className="w-6 h-6 text-blue-400" />
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl font-bold text-luxury-blue">
          {t('weatherForecast') || '7-Day Weather Forecast'}
        </h3>
        {loading && (
          <Loader2 className="w-5 h-5 text-luxury-blue animate-spin" />
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {error}
        </div>
      )}

      {/* Weather Strip - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto -mx-6 px-6">
        {loading && weatherData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-luxury-blue animate-spin" />
            <span className="ml-3 text-gray-600">Loading weather forecast...</span>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-7">
            {weatherData.map((day, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-20 md:w-auto text-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                <div className="text-sm font-semibold text-gray-700 mb-2">{day.date}</div>
                <div className="flex justify-center mb-2">{getIcon(day.icon)}</div>
                <div className="text-xs text-gray-600 mb-1">{day.condition}</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-bold text-luxury-blue">{day.high}°</span>
                  <span className="text-xs text-gray-400">/{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        {t('weatherNote') || 'Forecast data is approximate. Actual conditions may vary.'}
      </p>
    </div>
  )
}
