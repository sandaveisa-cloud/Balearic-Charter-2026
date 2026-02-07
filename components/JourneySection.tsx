'use client'

import { motion } from 'framer-motion'

interface JourneySectionProps {
  milestones?: unknown[] // Keep prop for backward compatibility but don't use it
}

// Hardcoded milestones as specified
const milestones: Array<{
  year: number | 'Today'
  title: string
  description: string
}> = [
  {
    year: 2014,
    title: 'Our Beginning',
    description: 'Started with a single yacht and a vision for luxury.',
  },
  {
    year: 2018,
    title: 'Expanding Horizons',
    description: 'Our fleet grew to 10+ premium vessels.',
  },
  {
    year: 2022,
    title: 'New Destinations',
    description: 'Launched curated routes in Mallorca and Menorca.',
  },
  {
    year: 'Today',
    title: 'Industry Leaders',
    description: 'Serving 500+ happy guests every season.',
  },
]

export default function JourneySection({ milestones: _ }: JourneySectionProps) {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Horizontal Trust Bar - 4 columns on desktop, 2x2 on tablet, 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              {/* Year - Small, elegant font */}
              <div className="mb-2">
                <span className="text-sm font-light text-gray-500 tracking-wider">
                  {milestone.year === 'Today' ? 'Today' : milestone.year}
                </span>
              </div>

              {/* Title - Bold, short */}
              <h3 className="font-bold text-lg md:text-xl text-[#001F3F] mb-2 leading-tight">
                {milestone.title}
              </h3>

              {/* Description - Max 2 lines */}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {milestone.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
