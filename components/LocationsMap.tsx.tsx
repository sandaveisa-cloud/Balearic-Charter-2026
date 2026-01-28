'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

// Koordinātes un kartes URL katrai vietai
const LOCATIONS = {
  ibiza: {
    name: 'Ibiza',
    // Marina Ibiza
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3101.405529007624!2d1.4428459!3d38.9133949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129946bc77907577%3A0x6fb2d3527711700!2sMarina%20Ibiza!5e0!3m2!1sen!2ses!4v1706440000000!5m2!1sen!2ses'
  },
  formentera: {
    name: 'Formentera',
    // La Savina
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3106.6669968434546!2d1.4137255!3d38.7306263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12995a9734e565c7%3A0xe5a3c9454178550!2sPuerto%20de%20La%20Savina!5e0!3m2!1sen!2ses!4v1706440000000!5m2!1sen!2ses'
  },
  mallorca: {
    name: 'Palma de Mallorca',
    // Real Club Náutico de Palma
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.474640166649!2d2.6378673!3d39.5716247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1297924e650c822d%3A0x402af6ed7222710!2sReal%20Club%20N%C3%A1utico%20de%20Palma!5e0!3m2!1sen!2ses!4v1706440000000!5m2!1sen!2ses'
  },
  torrevieja: {
    name: 'Torrevieja',
    // Marina Salinas
    url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3132.846566789467!2d-0.6865611!3d37.9666672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6305a4b706059d%3A0x7d0224a14197930!2sMarina%20Salinas%20Torrevieja!5e0!3m2!1sen!2ses!4v1706440000000!5m2!1sen!2ses'
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