'use client'

import { useState } from 'react'

interface IslandCoordinates {
  [key: string]: { x: number; y: number }
}

// Approximate coordinates for Balearic Islands on SVG (0-100%)
const islandCoordinates: IslandCoordinates = {
  'mallorca': { x: 30, y: 40 },
  'menorca': { x: 45, y: 20 },
  'ibiza': { x: 15, y: 50 },
  'formentera': { x: 10, y: 65 },
  'cabrera': { x: 35, y: 75 },
  'cala-llentrisca': { x: 25, y: 55 },
  'cala-saona': { x: 12, y: 68 },
  'cala-comte': { x: 18, y: 52 },
  'cala-bassa': { x: 16, y: 54 },
  'cala-salada': { x: 20, y: 50 },
}

interface BalearicIslandsMapProps {
  highlightedDestination: string | null
  onDestinationHover: (slug: string | null) => void
}

export default function BalearicIslandsMap({
  highlightedDestination,
  onDestinationHover,
}: BalearicIslandsMapProps) {
  const normalizeSlug = (input: string | null | undefined): string => {
    return (input || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  const findMatchingCoordinates = (slug: string | null) => {
    if (!slug) return null
    
    const normalized = normalizeSlug(slug)
    
    // Try exact match first
    if (islandCoordinates[normalized]) {
      return islandCoordinates[normalized]
    }
    
    // Try partial matches
    for (const [key, coords] of Object.entries(islandCoordinates)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return coords
      }
    }
    
    // Try matching by island name (mallorca, menorca, ibiza, formentera)
    if (normalized.includes('mallorca') || normalized.includes('palma')) {
      return islandCoordinates.mallorca
    }
    if (normalized.includes('menorca')) {
      return islandCoordinates.menorca
    }
    if (normalized.includes('ibiza')) {
      return islandCoordinates.ibiza
    }
    if (normalized.includes('formentera')) {
      return islandCoordinates.formentera
    }
    if (normalized.includes('cabrera')) {
      return islandCoordinates.cabrera
    }
    if (normalized.includes('llentrisca')) {
      return islandCoordinates['cala-llentrisca']
    }
    if (normalized.includes('saona')) {
      return islandCoordinates['cala-saona']
    }
    if (normalized.includes('comte')) {
      return islandCoordinates['cala-comte']
    }
    if (normalized.includes('bassa')) {
      return islandCoordinates['cala-bassa']
    }
    if (normalized.includes('salada')) {
      return islandCoordinates['cala-salada']
    }
    
    // Default to Mallorca center
    return { x: 30, y: 40 }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-luxury-blue/20 to-gray-900 rounded-xl border border-luxury-gold/20 p-6">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background Ocean */}
        <rect width="100" height="100" fill="url(#oceanGradient)" />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a1929" />
            <stop offset="50%" stopColor="#002366" />
            <stop offset="100%" stopColor="#0a1929" />
          </linearGradient>
          <radialGradient id="islandGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1a3a5a" />
            <stop offset="100%" stopColor="#0a1929" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Mallorca Island */}
        <ellipse
          cx="30"
          cy="40"
          rx="8"
          ry="6"
          fill="url(#islandGradient)"
          stroke="#D4AF37"
          strokeWidth="0.3"
          className="transition-all duration-300"
        />

        {/* Menorca Island */}
        <ellipse
          cx="45"
          cy="20"
          rx="6"
          ry="4"
          fill="url(#islandGradient)"
          stroke="#D4AF37"
          strokeWidth="0.3"
          className="transition-all duration-300"
        />

        {/* Ibiza Island */}
        <ellipse
          cx="15"
          cy="50"
          rx="5"
          ry="4"
          fill="url(#islandGradient)"
          stroke="#D4AF37"
          strokeWidth="0.3"
          className="transition-all duration-300"
        />

        {/* Formentera Island */}
        <ellipse
          cx="10"
          cy="65"
          rx="4"
          ry="3"
          fill="url(#islandGradient)"
          stroke="#D4AF37"
          strokeWidth="0.3"
          className="transition-all duration-300"
        />

        {/* Cabrera Island (small) */}
        <circle
          cx="35"
          cy="75"
          r="1.5"
          fill="url(#islandGradient)"
          stroke="#D4AF37"
          strokeWidth="0.2"
          className="transition-all duration-300"
        />

        {/* Decorative grid lines */}
        <g stroke="#D4AF37" strokeWidth="0.1" opacity="0.2">
          {[20, 40, 60, 80].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" />
          ))}
          {[20, 40, 60, 80].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </g>
      </svg>

      {/* Interactive Hotspots Overlay - Dynamic based on highlighted destination */}
      {highlightedDestination && (() => {
        const coords = findMatchingCoordinates(highlightedDestination)
        if (!coords) return null
        
        return (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Glowing Dot */}
            <div
              className="w-4 h-4 rounded-full bg-luxury-gold shadow-lg shadow-luxury-gold/50 transition-all duration-500"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 1))',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-luxury-gold animate-ping opacity-75" />
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/50 scale-150 animate-pulse" />
            </div>
          </div>
        )
      })()}

      {/* Map Labels */}
      <div className="absolute bottom-4 left-4 text-xs text-luxury-gold/60 font-serif">
        Balearic Islands
      </div>
    </div>
  )
}
