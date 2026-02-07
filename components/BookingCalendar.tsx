'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { de, es, enUS } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { getBookingAvailability } from '@/lib/data'
import type { BookingAvailability } from '@/types/database'

interface BookingCalendarProps {
  yachtId: string
  onDateSelect: (start: Date | null, end: Date | null) => void
}

export default function BookingCalendar({ yachtId, onDateSelect }: BookingCalendarProps) {
  const locale = useLocale()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)
  const [availability, setAvailability] = useState<BookingAvailability[]>([])
  const [loading, setLoading] = useState(true)

  // Get date-fns locale based on next-intl locale
  const dateLocale = locale === 'de' ? de : locale === 'es' ? es : enUS
  
  // Localized day names
  const dayNames = locale === 'de' 
    ? ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
    : locale === 'es'
    ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const nextMonthEnd = endOfMonth(addMonths(currentMonth, 1))

    loadAvailability(format(monthStart, 'yyyy-MM-dd'), format(nextMonthEnd, 'yyyy-MM-dd'))
  }, [currentMonth, yachtId])

  const loadAvailability = async (start: string, end: string) => {
    setLoading(true)
    try {
      const data = await getBookingAvailability(yachtId, start, end)
      setAvailability(data)
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const avail = availability.find(a => a.date === dateStr)
    return avail ? avail.is_available : true // Default to available if not in DB
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !selectedEnd) return false
    return date >= selectedStart && date <= selectedEnd
  }

  const handleDateClick = (date: Date) => {
    if (!isDateAvailable(date)) return

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date)
      setSelectedEnd(null)
      onDateSelect(date, null)
    } else if (selectedStart && !selectedEnd) {
      if (date < selectedStart) {
        setSelectedStart(date)
        setSelectedEnd(selectedStart)
        onDateSelect(date, selectedStart)
      } else {
        setSelectedEnd(date)
        onDateSelect(selectedStart, date)
      }
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const firstDayOfMonth = startOfMonth(currentMonth).getDay()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          ←
        </button>
        <h3 className="font-semibold text-luxury-blue">
          {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const available = isDateAvailable(day)
          const isSelected = selectedStart && isSameDay(day, selectedStart) || selectedEnd && isSameDay(day, selectedEnd)
          const inRange = isDateInRange(day)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              disabled={!available || !isSameMonth(day, currentMonth)}
              className={`
                aspect-square text-sm rounded transition-colors
                ${!available || !isSameMonth(day, currentMonth)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : available
                  ? 'hover:bg-luxury-gold-light cursor-pointer'
                  : ''}
                ${isSelected ? 'bg-luxury-blue text-white font-semibold' : ''}
                ${inRange && !isSelected ? 'bg-luxury-blue/20 text-luxury-blue' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-luxury-gold' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-500 mt-4">Loading availability...</div>
      )}
    </div>
  )
}
