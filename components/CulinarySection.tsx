'use client'

import type { CulinaryExperience } from '@/types/database'

interface CulinarySectionProps {
  experiences: CulinaryExperience[]
}

export default function CulinarySection({ experiences }: CulinarySectionProps) {
  if (experiences.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            Culinary Experiences
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Indulge in world-class cuisine prepared by our master chefs, featuring the finest local ingredients and international flavors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
            >
              {experience.image_url ? (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={experience.image_url}
                    alt={experience.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-luxury-gold-light to-luxury-gold flex items-center justify-center">
                  <span className="text-luxury-blue text-xl font-serif text-center px-4">{experience.title}</span>
                </div>
              )}

              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-luxury-blue mb-2">
                  {experience.title}
                </h3>
                {experience.description && (
                  <p className="text-gray-600 text-sm">{experience.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
