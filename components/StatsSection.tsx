'use client'

import type { Stat } from '@/types/database'

interface StatsSectionProps {
  stats: Stat[]
}

export default function StatsSection({ stats }: StatsSectionProps) {
  if (stats.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-r from-luxury-blue to-luxury-blue/90 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Our Journey in Numbers
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-luxury-gold mb-2">
                {stat.value}
              </div>
              <div className="text-lg text-gray-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
