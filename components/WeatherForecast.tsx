'use client'

import { Sun, Cloud, CloudRain, CloudDrizzle } from 'lucide-react'
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
}

export default function WeatherForecast({ forecast }: WeatherForecastProps) {
  const t = useTranslations('destinations')

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

  const weatherData = forecast || defaultForecast

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
      <h3 className="font-serif text-xl font-bold text-luxury-blue mb-4">
        {t('weatherForecast') || '7-Day Weather Forecast'}
      </h3>

      {/* Weather Strip - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto -mx-6 px-6">
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
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        {t('weatherNote') || 'Forecast data is approximate. Actual conditions may vary.'}
      </p>
    </div>
  )
}
