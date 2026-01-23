'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Anchor, Users, Ruler, BedDouble, Zap, Waves, Wind } from 'lucide-react'
import Image from 'next/image'

interface YachtDetailsProps {
  yachtSlug: 'lagoon-400-s2-simona' | 'lagoon-450-fly'
}

// Yacht content data structure
const yachtContent = {
  'lagoon-400-s2-simona': {
    en: {
      name: 'Lagoon 400 S2 "Simona"',
      description: 'The Lagoon 400 S2 "Simona" offers exceptional comfort with its four-cabin configuration, making it perfect for families and groups seeking both space and luxury. This modern catamaran combines elegant design with practical functionality, featuring a spacious salon, fully equipped galley, and multiple relaxation areas. With solar panels for sustainable energy and advanced navigation systems, Simona ensures a safe and comfortable sailing experience in the Mediterranean waters.',
      features: [
        { icon: Ruler, label: 'Length', value: '12m' },
        { icon: BedDouble, label: 'Cabins', value: '4 spacious cabins' },
        { icon: Users, label: 'Capacity', value: 'Up to 8 guests' },
        { icon: Zap, label: 'Solar panels', value: 'Sustainable energy' },
        { icon: Waves, label: 'Watermaker', value: 'Full autonomy' },
        { icon: Wind, label: 'Air Conditioning', value: 'All-weather comfort' },
        { icon: Anchor, label: 'Navigation', value: 'Advanced systems' },
        { icon: Users, label: 'Crew', value: 'Professional captain' },
      ],
      keyFeatures: [
        'Spacious salon with panoramic windows',
        'Fully equipped modern galley',
        'Four comfortable double cabins',
        'Large trampoline net for sunbathing',
        'Solar panels for eco-friendly sailing',
        'Watermaker for extended journeys',
        'Air conditioning throughout',
        'Advanced navigation and safety equipment',
        'Multiple relaxation areas',
        'Stable catamaran design for smooth sailing',
      ],
    },
    es: {
      name: 'Lagoon 400 S2 "Simona"',
      description: 'El Lagoon 400 S2 "Simona" ofrece un confort excepcional con su configuración de cuatro camarotes, perfecto para familias y grupos que buscan espacio y lujo. Este catamarán moderno combina diseño elegante con funcionalidad práctica, con un salón espacioso, cocina totalmente equipada y múltiples áreas de relajación. Con paneles solares para energía sostenible y sistemas de navegación avanzados, Simona garantiza una experiencia de navegación segura y cómoda en las aguas del Mediterráneo.',
      features: [
        { icon: Ruler, label: 'Eslora', value: '12m' },
        { icon: BedDouble, label: 'Camarotes', value: '4 camarotes espaciosos' },
        { icon: Users, label: 'Capacidad', value: 'Hasta 8 huéspedes' },
        { icon: Zap, label: 'Paneles solares', value: 'Energía sostenible' },
        { icon: Waves, label: 'Desalinizadora', value: 'Autonomía completa' },
        { icon: Wind, label: 'Aire acondicionado', value: 'Confort en todo clima' },
        { icon: Anchor, label: 'Navegación', value: 'Sistemas avanzados' },
        { icon: Users, label: 'Tripulación', value: 'Capitán profesional' },
      ],
      keyFeatures: [
        'Salón espacioso con ventanas panorámicas',
        'Cocina moderna totalmente equipada',
        'Cuatro cómodos camarotes dobles',
        'Gran red de trampolín para tomar el sol',
        'Paneles solares para navegación ecológica',
        'Desalinizadora para viajes prolongados',
        'Aire acondicionado en toda la embarcación',
        'Equipamiento avanzado de navegación y seguridad',
        'Múltiples áreas de relajación',
        'Diseño de catamarán estable para navegación suave',
      ],
    },
    de: {
      name: 'Lagoon 400 S2 "Simona"',
      description: 'Die Lagoon 400 S2 "Simona" bietet außergewöhnlichen Komfort mit ihrer Vier-Kabinen-Konfiguration und ist perfekt für Familien und Gruppen, die sowohl Platz als auch Luxus suchen. Diese moderne Katamaran kombiniert elegantes Design mit praktischer Funktionalität, mit einem geräumigen Salon, voll ausgestatteter Küche und mehreren Entspannungsbereichen. Mit Solarmodulen für nachhaltige Energie und fortschrittlichen Navigationssystemen gewährleistet Simona ein sicheres und komfortables Segelerlebnis in den Gewässern des Mittelmeers.',
      features: [
        { icon: Ruler, label: 'Länge', value: '12m' },
        { icon: BedDouble, label: 'Kabinen', value: '4 geräumige Kabinen' },
        { icon: Users, label: 'Kapazität', value: 'Bis zu 8 Gäste' },
        { icon: Zap, label: 'Solarmodule', value: 'Nachhaltige Energie' },
        { icon: Waves, label: 'Wassermacher', value: 'Volle Autonomie' },
        { icon: Wind, label: 'Klimaanlage', value: 'Komfort bei jedem Wetter' },
        { icon: Anchor, label: 'Navigation', value: 'Fortschrittliche Systeme' },
        { icon: Users, label: 'Besatzung', value: 'Professioneller Kapitän' },
      ],
      keyFeatures: [
        'Geräumiger Salon mit Panoramafenstern',
        'Voll ausgestattete moderne Küche',
        'Vier komfortable Doppelkabinen',
        'Großes Trampolinnetz zum Sonnenbaden',
        'Solarmodule für umweltfreundliches Segeln',
        'Wassermacher für längere Reisen',
        'Klimaanlage im gesamten Boot',
        'Fortschrittliche Navigations- und Sicherheitsausrüstung',
        'Mehrere Entspannungsbereiche',
        'Stabiles Katamaran-Design für sanftes Segeln',
      ],
    },
  },
  'lagoon-450-fly': {
    en: {
      name: 'Lagoon 450 Fly',
      description: 'The Lagoon 450 Fly is a true benchmark in luxury catamaran design, offering unparalleled space and comfort for up to 12 guests. This premium vessel features a stunning flybridge with 360-degree panoramic views, three levels of living space, and premium amenities throughout. With its teak decking, powerful generator, and state-of-the-art climate control, the Lagoon 450 Fly represents the pinnacle of Mediterranean yacht charter luxury.',
      features: [
        { icon: Ruler, label: 'Length', value: '14m' },
        { icon: BedDouble, label: 'Cabins', value: '4-6 luxury cabins' },
        { icon: Users, label: 'Capacity', value: 'Up to 12 guests' },
        { icon: Wind, label: 'Flybridge', value: 'Panoramic views' },
        { icon: Zap, label: 'Generator', value: '24/7 power' },
        { icon: Waves, label: 'Teak Deck', value: 'Premium finish' },
        { icon: Wind, label: 'Air Conditioning', value: 'Full climate control' },
        { icon: Anchor, label: 'Navigation', value: 'Professional systems' },
      ],
      keyFeatures: [
        'Exclusive flybridge with 360° views',
        'Three levels of living space',
        'Spacious cockpit and salon areas',
        'Premium teak decking throughout',
        'Powerful generator for continuous power',
        'Dedicated climate control in every cabin',
        'High-end galley with premium appliances',
        'Multiple entertainment areas',
        'Professional crew accommodation',
        'Advanced safety and navigation equipment',
      ],
    },
    es: {
      name: 'Lagoon 450 Fly',
      description: 'El Lagoon 450 Fly es un verdadero referente en el diseño de catamaranes de lujo, ofreciendo espacio y confort inigualables para hasta 12 huéspedes. Esta embarcación premium cuenta con un impresionante flybridge con vistas panorámicas de 360 grados, tres niveles de espacio habitable y comodidades premium en toda la embarcación. Con su cubierta de teca, generador potente y control climático de última generación, el Lagoon 450 Fly representa la cúspide del lujo en el alquiler de yates en el Mediterráneo.',
      features: [
        { icon: Ruler, label: 'Eslora', value: '14m' },
        { icon: BedDouble, label: 'Camarotes', value: '4-6 camarotes de lujo' },
        { icon: Users, label: 'Capacidad', value: 'Hasta 12 huéspedes' },
        { icon: Wind, label: 'Flybridge', value: 'Vistas panorámicas' },
        { icon: Zap, label: 'Generador', value: 'Energía 24/7' },
        { icon: Waves, label: 'Cubierta de teca', value: 'Acabado premium' },
        { icon: Wind, label: 'Aire acondicionado', value: 'Control climático completo' },
        { icon: Anchor, label: 'Navegación', value: 'Sistemas profesionales' },
      ],
      keyFeatures: [
        'Flybridge exclusivo con vistas de 360°',
        'Tres niveles de espacio habitable',
        'Áreas espaciosas de cockpit y salón',
        'Cubierta de teca premium en toda la embarcación',
        'Generador potente para energía continua',
        'Control climático dedicado en cada camarote',
        'Cocina de alta gama con electrodomésticos premium',
        'Múltiples áreas de entretenimiento',
        'Alojamiento para tripulación profesional',
        'Equipamiento avanzado de seguridad y navegación',
      ],
    },
    de: {
      name: 'Lagoon 450 Fly',
      description: 'Die Lagoon 450 Fly ist ein wahrer Maßstab im Design von Luxus-Katamaranen und bietet unvergleichlichen Raum und Komfort für bis zu 12 Gäste. Dieses Premium-Schiff verfügt über eine beeindruckende Flybridge mit 360-Grad-Panoramablick, drei Ebenen von Wohnraum und Premium-Amenities im gesamten Boot. Mit seinem Teak-Deck, leistungsstarkem Generator und modernster Klimasteuerung repräsentiert die Lagoon 450 Fly den Gipfel des Mittelmeer-Yachtcharter-Luxus.',
      features: [
        { icon: Ruler, label: 'Länge', value: '14m' },
        { icon: BedDouble, label: 'Kabinen', value: '4-6 Luxuskabinen' },
        { icon: Users, label: 'Kapazität', value: 'Bis zu 12 Gäste' },
        { icon: Wind, label: 'Flybridge', value: 'Panoramablick' },
        { icon: Zap, label: 'Generator', value: '24/7 Strom' },
        { icon: Waves, label: 'Teak-Deck', value: 'Premium-Finish' },
        { icon: Wind, label: 'Klimaanlage', value: 'Vollständige Klimasteuerung' },
        { icon: Anchor, label: 'Navigation', value: 'Professionelle Systeme' },
      ],
      keyFeatures: [
        'Exklusive Flybridge mit 360°-Blick',
        'Drei Ebenen von Wohnraum',
        'Geräumige Cockpit- und Salonbereiche',
        'Premium-Teak-Deck im gesamten Boot',
        'Leistungsstarker Generator für kontinuierliche Energie',
        'Dedizierte Klimasteuerung in jeder Kabine',
        'High-End-Küche mit Premium-Geräten',
        'Mehrere Unterhaltungsbereiche',
        'Unterkunft für professionelle Besatzung',
        'Fortschrittliche Sicherheits- und Navigationsausrüstung',
      ],
    },
  },
}

export default function YachtDetails({ yachtSlug }: YachtDetailsProps) {
  const locale = useLocale() as 'en' | 'es' | 'de'
  const t = useTranslations('fleet')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const content = yachtContent[yachtSlug]?.[locale] || yachtContent[yachtSlug]?.en

  if (!content) {
    return <div>Yacht not found</div>
  }

  // Placeholder images - replace with actual yacht images
  const galleryImages = [
    '/images/yacht-placeholder-1.jpg',
    '/images/yacht-placeholder-2.jpg',
    '/images/yacht-placeholder-3.jpg',
    '/images/yacht-placeholder-4.jpg',
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] bg-gradient-to-br from-[#002447] via-[#003d6b] to-[#002447] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 font-serif">
            {content.name}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            {locale === 'en' && 'Premium Catamaran Charter'}
            {locale === 'es' && 'Alquiler de Catamarán Premium'}
            {locale === 'de' && 'Premium Katamaran Charter'}
          </p>
        </div>
        
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>
            {locale === 'en' && 'Back to Home'}
            {locale === 'es' && 'Volver al Inicio'}
            {locale === 'de' && 'Zurück zur Startseite'}
          </span>
        </Link>
      </section>

      {/* Image Gallery */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative max-w-6xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-gray-200">
              {/* Placeholder for gallery - replace with actual images */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                <div className="text-center text-gray-600">
                  <Image
                    src={galleryImages[currentImageIndex]}
                    alt={`${content.name} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-300/50">
                    <p className="text-lg font-semibold text-gray-700">
                      {locale === 'en' && 'Image Gallery'}
                      {locale === 'es' && 'Galería de Imágenes'}
                      {locale === 'de' && 'Bildergalerie'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#002447] p-3 rounded-full shadow-lg transition-all z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#002447] p-3 rounded-full shadow-lg transition-all z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 w-2'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#002447] mb-6 font-serif">
              {locale === 'en' && 'About This Yacht'}
              {locale === 'es' && 'Acerca de Este Yate'}
              {locale === 'de' && 'Über Diese Yacht'}
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed whitespace-pre-line">
              {content.description}
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002447] mb-12 text-center font-serif">
            {locale === 'en' && 'Key Features'}
            {locale === 'es' && 'Características Principales'}
            {locale === 'de' && 'Hauptmerkmale'}
          </h2>
          
          {/* Features Grid - 2 columns */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#002447]"
              >
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#002447] mt-2"></div>
                <p className="text-gray-700 text-lg leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002447] mb-12 text-center font-serif">
            {locale === 'en' && 'Specifications'}
            {locale === 'es' && 'Especificaciones'}
            {locale === 'de' && 'Spezifikationen'}
          </h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-[#002447]" />
                  <p className="text-sm font-semibold text-gray-600 mb-1">{feature.label}</p>
                  <p className="text-lg font-bold text-[#002447]">{feature.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#002447]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
            {locale === 'en' && 'Ready to Set Sail?'}
            {locale === 'es' && '¿Listo para Zarpar?'}
            {locale === 'de' && 'Bereit zum Segeln?'}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {locale === 'en' && 'Contact us today to book your luxury yacht charter experience.'}
            {locale === 'es' && 'Contáctenos hoy para reservar su experiencia de alquiler de yate de lujo.'}
            {locale === 'de' && 'Kontaktieren Sie uns noch heute, um Ihr Luxus-Yachtcharter-Erlebnis zu buchen.'}
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#002447] font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {locale === 'en' && 'Get a Quote'}
            {locale === 'es' && 'Solicitar Presupuesto'}
            {locale === 'de' && 'Angebot Anfordern'}
          </Link>
        </div>
      </section>
    </div>
  )
}
