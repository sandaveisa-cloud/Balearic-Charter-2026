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
    <section className="py-8 bg-[#F9FAFB] border-t border-b border-[#E2E8F0]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-[#0F172A] mb-1 tracking-wide">
            Our Mission
          </h2>
        </div>

        {/* Mission Cards Grid - 3 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {missionCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div
                key={index}
                className="text-center"
              >
                {/* Small Elegant Icon - Centered above heading */}
                <div className="mb-2 flex items-center justify-center">
                  <IconComponent size={24} className="text-[#C5A059]" strokeWidth={1.5} />
                </div>

                {/* Heading */}
                <h3 className="text-lg md:text-xl font-bold text-[#0F172A] mb-1.5">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm text-[#475569] leading-snug">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
      </div>
    </section>
  )
}
