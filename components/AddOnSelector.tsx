'use client'

import { useState, useEffect } from 'react'
import { User, ChefHat, Users, Waves } from 'lucide-react'

interface AddOn {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  price: number
}

interface AddOnSelectorProps {
  basePrice: number
  currency?: string
  onTotalChange?: (total: number, addOns: string[]) => void
  className?: string
}

const ADD_ONS: AddOn[] = [
  {
    id: 'skipper',
    name: 'Skipper',
    description: 'Professional captain to handle navigation and sailing',
    icon: User,
    price: 200, // Daily rate
  },
  {
    id: 'chef',
    name: 'Chef',
    description: 'Professional chef to prepare gourmet meals',
    icon: ChefHat,
    price: 250, // Daily rate
  },
  {
    id: 'hostess',
    name: 'Hostess',
    description: 'Dedicated hostess for service and hospitality',
    icon: Users,
    price: 180, // Daily rate
  },
  {
    id: 'water_sports',
    name: 'Water Sports Package',
    description: 'Complete water sports equipment package',
    icon: Waves,
    price: 150, // One-time fee
  },
]

export default function AddOnSelector({
  basePrice,
  currency = 'EUR',
  onTotalChange,
  className = '',
}: AddOnSelectorProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [days, setDays] = useState(7) // Default to 7 days

  // Calculate total
  const calculateTotal = () => {
    let addOnsTotal = 0
    selectedAddOns.forEach((addOnId) => {
      const addOn = ADD_ONS.find((a) => a.id === addOnId)
      if (addOn) {
        // Water sports is one-time, others are daily
        if (addOnId === 'water_sports') {
          addOnsTotal += addOn.price
        } else {
          addOnsTotal += addOn.price * days
        }
      }
    })
    return basePrice + addOnsTotal
  }

  const total = calculateTotal()

  // Notify parent of total change
  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(total, Array.from(selectedAddOns))
    }
  }, [total, selectedAddOns, onTotalChange])

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(addOnId)) {
        newSet.delete(addOnId)
      } else {
        newSet.add(addOnId)
      }
      return newSet
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-luxury-blue to-luxury-gold p-6 text-white">
        <h3 className="text-2xl font-bold mb-1">Customize Your Experience</h3>
        <p className="text-white/90 text-sm">Add services to enhance your charter</p>
      </div>

      {/* Days Selector */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Charter Duration (days)
        </label>
        <input
          type="number"
          min="1"
          max="30"
          value={days}
          onChange={(e) => setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Select number of days for daily add-ons pricing</p>
      </div>

      {/* Add-ons List */}
      <div className="p-6 space-y-4">
        {ADD_ONS.map((addOn) => {
          const Icon = addOn.icon
          const isSelected = selectedAddOns.has(addOn.id)
          const isDaily = addOn.id !== 'water_sports'
          const addOnTotal = isDaily ? addOn.price * days : addOn.price

          return (
            <label
              key={addOn.id}
              className={`
                flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected
                  ? 'border-luxury-blue bg-luxury-blue/5 shadow-md'
                  : 'border-gray-200 hover:border-luxury-blue/50 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleAddOn(addOn.id)}
                className="mt-1 w-5 h-5 text-luxury-blue border-gray-300 rounded focus:ring-luxury-blue focus:ring-2"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-luxury-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{addOn.name}</h4>
                      <p className="text-sm text-gray-600">{addOn.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-luxury-blue">
                      {formatCurrency(addOnTotal)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isDaily ? `× ${days} days` : 'One-time'}
                    </p>
                  </div>
                </div>
              </div>
            </label>
          )
        })}
      </div>

      {/* Total Estimate */}
      <div className="p-6 bg-gradient-to-r from-luxury-blue/5 to-luxury-gold/5 border-t-2 border-luxury-gold">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Base Charter Fee</p>
            <p className="text-lg font-bold text-gray-800">Total Estimated Price</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 line-through mb-1">
              {formatCurrency(basePrice)}
            </p>
            <p className="text-3xl font-bold text-luxury-blue">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
        {selectedAddOns.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Selected Add-ons:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedAddOns).map((addOnId) => {
                const addOn = ADD_ONS.find((a) => a.id === addOnId)
                return addOn ? (
                  <span
                    key={addOnId}
                    className="px-3 py-1 bg-luxury-blue text-white text-xs rounded-full font-medium"
                  >
                    {addOn.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
