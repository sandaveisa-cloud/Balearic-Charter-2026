'use client'

import { useTranslations } from 'next-intl'

export default function MissionSection() {
  const t = useTranslations('mission')

  const missionCards = [
    {
      title: 'Precise Logistics',
      description: 'We combine luxury charter with precise logistics to ensure seamless experiences.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      title: 'Professional Crew',
      description: 'We ensure a safe, high-end environment with our experienced and dedicated professional crew.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Gourmet Excellence',
      description: 'Indulge in gourmet cuisine crafted by our expert chefs, elevating your charter experience.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-luxury-blue/95 to-gray-900 text-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-luxury-gold">
            {t('title') || 'Our Mission'}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            {t('text') || 'To combine luxury charter with precise logistics. We ensure a safe, high-end environment with professional crew and gourmet cuisine.'}
          </p>
        </div>

        {/* Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {missionCards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-800/90 to-luxury-blue/80 backdrop-blur-sm rounded-2xl p-8 border border-luxury-gold/20 hover:border-luxury-gold/50 transition-all duration-300 hover:shadow-2xl hover:shadow-luxury-gold/20 hover:-translate-y-2"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-luxury-gold/0 to-luxury-gold/0 group-hover:from-luxury-gold/10 group-hover:to-luxury-blue/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />

              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/10 border-2 border-luxury-gold/30 text-luxury-gold group-hover:scale-110 group-hover:border-luxury-gold transition-all duration-300">
                  {card.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-luxury-gold transition-colors duration-300">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed text-base group-hover:text-gray-200 transition-colors duration-300">
                  {card.description}
                </p>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-luxury-gold/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent" />
        </div>
      </div>
    </section>
  )
}
