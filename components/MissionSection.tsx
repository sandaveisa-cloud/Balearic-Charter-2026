import { Ship, ShieldCheck, Utensils } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import ScrollToTopButton from './ScrollToTopButton'

export default async function MissionSection() {
  const t = await getTranslations('mission')

  const missionCards = [
    {
      title: 'Seamless Coordination',
      description: 'Expert planning and safe routes for every charter journey.',
      icon: Ship,
    },
    {
      title: 'Professional Crew',
      description: 'Experienced maritime experts dedicated to your safety and comfort.',
      icon: ShieldCheck,
    },
    {
      title: 'Gourmet Excellence',
      description: 'Exquisite dining experiences crafted by expert chefs on board.',
      icon: Utensils,
    },
  ]

  return (
    <section className="py-12 bg-[#F9FAFB] border-t border-b border-[#E2E8F0]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
            Our Mission
          </h2>
        </div>

        {/* Mission Cards Grid - 3 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {missionCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div
                key={index}
                className="text-center"
              >
                {/* Small Elegant Icon - Centered above heading */}
                <div className="mb-4 flex items-center justify-center">
                  <IconComponent size={32} className="text-[#C5A059]" strokeWidth={1.5} />
                </div>

                {/* Heading */}
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm md:text-base text-[#475569] leading-relaxed">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Verification Line */}
        <div className="mt-8 pt-4 border-t border-[#E2E8F0]">
          <p className="text-xs text-gray-400 text-center">
            ✓ 2026 Season | Verified & Logistically Synchronized
          </p>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
      </div>
    </section>
  )
}
