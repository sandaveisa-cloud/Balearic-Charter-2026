'use client'

import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Ship, ShieldCheck, Utensils, Anchor, Compass, Users } from 'lucide-react'
import type { MissionPromise } from '@/types/database'
import OptimizedImage from './OptimizedImage'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface MissionSectionProps {
  promises: MissionPromise[]
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Ship,
  ShieldCheck,
  Utensils,
  Anchor,
  Compass,
  Users,
}

export default function MissionSection({ promises }: MissionSectionProps) {
  const locale = useLocale()

  // Filter active promises and sort by order_index
  const activePromises = promises
    .filter((p) => p.is_active)
    .sort((a, b) => a.order_index - b.order_index)

  // Fallback to default promises if none exist
  const displayPromises = activePromises.length > 0 ? activePromises : [
    {
      id: '1',
      title_en: 'Seamless Coordination',
      title_es: 'Coordinación Perfecta',
      title_de: 'Nahtlose Koordination',
      description_en: 'Expert planning and safe routes for every charter journey.',
      description_es: 'Planificación experta y rutas seguras para cada viaje en charter.',
      description_de: 'Expertenplanung und sichere Routen für jede Charterreise.',
      icon_name: 'Ship',
      icon_url: null,
      order_index: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title_en: 'Professional Crew',
      title_es: 'Tripulación Profesional',
      title_de: 'Professionelle Crew',
      description_en: 'Experienced maritime experts dedicated to your safety and comfort.',
      description_es: 'Expertos marítimos experimentados dedicados a su seguridad y comodidad.',
      description_de: 'Erfahrene maritime Experten, die sich Ihrer Sicherheit und Ihrem Komfort widmen.',
      icon_name: 'ShieldCheck',
      icon_url: null,
      order_index: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      title_en: 'Gourmet Excellence',
      title_es: 'Excelencia Gourmet',
      title_de: 'Gourmet-Exzellenz',
      description_en: 'Exquisite dining experiences crafted by expert chefs on board.',
      description_es: 'Experiencias gastronómicas exquisitas elaboradas por chefs expertos a bordo.',
      description_de: 'Exquisite kulinarische Erlebnisse, die von erfahrenen Köchen an Bord kreiert werden.',
      icon_name: 'Utensils',
      icon_url: null,
      order_index: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as MissionPromise[]

  // Get localized text
  const getTitle = (promise: MissionPromise) => {
    return promise[`title_${locale}` as keyof MissionPromise] as string || promise.title_en
  }

  const getDescription = (promise: MissionPromise) => {
    return promise[`description_${locale}` as keyof MissionPromise] as string || promise.description_en
  }

  // Get icon component
  const getIcon = (promise: MissionPromise) => {
    if (promise.icon_url) {
      return null // Will render image instead
    }
    const IconComponent = promise.icon_name ? iconMap[promise.icon_name] : Ship
    return IconComponent || Ship
  }

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white via-[#F9FAFB] to-white relative overflow-hidden">
      {/* Subtle parallax background with sea/yacht imagery */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'1200\' height=\'800\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'sea\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23001F3F;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%231B263B;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'1200\' height=\'800\' fill=\'url(%23sea)\'/%3E%3Cpath d=\'M200,400 Q400,300 600,400 T1000,400\' stroke=\'%23C5A059\' stroke-width=\'2\' fill=\'none\' opacity=\'0.3\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 bg-gradient-to-br from-[#001F3F] to-[#1B263B] rounded-full shadow-lg">
              <Anchor className="w-8 h-8 text-[#C5A059]" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#001F3F] mb-4 tracking-wide"
          >
            The Balearic Promise
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600"
          >
            Our commitment to excellence in every detail
          </motion.p>
        </div>

        {/* Promise Cards Grid - 3 columns desktop, horizontal swipe on mobile */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
            {displayPromises.map((promise, index) => {
              const IconComponent = getIcon(promise)

              return (
                <motion.div
                  key={promise.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="bg-white rounded-2xl p-8 lg:p-10 shadow-lg border border-gray-200/50 hover:border-[#C5A059]/30 transition-all duration-300 hover:shadow-xl text-center flex flex-col items-center"
                >
                  {/* Icon */}
                  <div className="mb-6">
                    {promise.icon_url ? (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#001F3F]/10 to-[#1B263B]/10 flex items-center justify-center">
                        <OptimizedImage
                          src={getOptimizedImageUrl((promise.icon_url as string) || '', {
                            width: 64,
                            height: 64,
                            quality: 90,
                            format: 'webp',
                          })}
                          alt={getTitle(promise)}
                          width={64}
                          height={64}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                    ) : IconComponent ? (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#001F3F]/10 to-[#1B263B]/10 flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-[#C5A059]" strokeWidth={1.5} />
                      </div>
                    ) : null}
                  </div>

                  {/* Title - Elegant Serif */}
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#001F3F] mb-4 tracking-wide">
                    {getTitle(promise)}
                  </h3>

                  {/* Description - Spaced Sans-Serif */}
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg font-sans tracking-wide flex-grow">
                    {getDescription(promise)}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Mobile: Horizontal Swipe Carousel */}
          <div className="md:hidden overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {displayPromises.map((promise, index) => {
                const IconComponent = getIcon(promise)

                return (
                  <motion.div
                    key={promise.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50 min-w-[280px] flex flex-col items-center text-center"
                  >
                    {/* Icon */}
                    <div className="mb-4">
                      {promise.icon_url ? (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#001F3F]/10 to-[#1B263B]/10 flex items-center justify-center">
                          <OptimizedImage
                            src={getOptimizedImageUrl((promise.icon_url as string) || '', {
                              width: 56,
                              height: 56,
                              quality: 90,
                              format: 'webp',
                            })}
                            alt={getTitle(promise)}
                            width={56}
                            height={56}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      ) : IconComponent ? (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#001F3F]/10 to-[#1B263B]/10 flex items-center justify-center">
                          <IconComponent className="w-7 h-7 text-[#C5A059]" strokeWidth={1.5} />
                        </div>
                      ) : null}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-[#001F3F] mb-3 tracking-wide">
                      {getTitle(promise)}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-sm font-sans tracking-wide">
                      {getDescription(promise)}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
