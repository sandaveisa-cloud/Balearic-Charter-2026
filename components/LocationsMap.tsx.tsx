'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

// Koordinātes un kartes URL katrai vietai
const LOCATIONS = {
  ibiza: {
    name: 'Ibiza',
    // Google Maps Embed URL priekš Ivisas ostas
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12417.876774614652!2d1.4328574!3d38.9113695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129946bc7631777d%3A0x603f9050d2c69f2e!2sPort%20d\'Eivissa!5e0!3m2!1sen!2ses!4v1706437000000!5m2!1sen!2ses'
  },
  formentera: {
    name: 'Formentera',
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12440.54877765104!2d1.4175!3d38.7333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12995b0000000001%3A0x6065561570776b97!2sPuerto%20de%20La%20Savina!5e0!3m2!1sen!2ses!4v1706437000000!5m2!1sen!2ses'
  },
  mallorca: {
    name: 'Palma de Mallorca',
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.7663246752046!2d2.6405!3d39.5696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12979259c61ac76d%3A0x86338b2d18903c73!2sMarina%20Palma%20Cuarentena!5e0!3m2!1sen!2ses!4v1706437000000!5m2!1sen!2ses'
  },
  torrevieja: {
    name: 'Torrevieja',
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3143.149176472404!2d-0.6835!3d37.9698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6305a4a4000001%3A0x402a24128912340!2sPuerto%20De%20Torrevieja!5e0!3m2!1sen!2ses!4v1706437000000!5m2!1sen!2ses'
  }
}

export default function LocationsMap() {
  // Pēc noklusējuma rādām Ibiza
  const [activeLocation, setActiveLocation] = useState<keyof typeof LOCATIONS>('ibiza')

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Location Selector Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {(Object.entries(LOCATIONS) as [keyof typeof LOCATIONS, typeof LOCATIONS['ibiza']][]).map(([key, location]) => (
          <button
            key={key}
            onClick={() => setActiveLocation(key)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105
              ${activeLocation === key 
                ? 'bg-luxury-gold text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-luxury-gold hover:text-luxury-blue'
              }
            `}
          >
            <MapPin className={`w-4 h-4 ${activeLocation === key ? 'text-white' : 'text-luxury-gold'}`} />
            {location.name}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <iframe
          src={LOCATIONS[activeLocation].url}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 transition-opacity duration-500"
        />
        
        {/* Loading Overlay (Optional, simple visual trick) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/5 rounded-2xl" />
      </div>
    </div>
  )
}