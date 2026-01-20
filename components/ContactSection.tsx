'use client'

import { useTranslations } from 'next-intl'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import type { ContactPerson } from '@/types/database'

interface ContactSectionProps {
  contactPersons: ContactPerson[]
}

export default function ContactSection({ contactPersons }: ContactSectionProps) {
  const t = useTranslations('contact')
  
  // Filter active contacts
  const activeContacts = contactPersons.filter(cp => cp.is_active).sort((a, b) => a.order_index - b.order_index)
  
  if (activeContacts.length === 0) {
    return null
  }

  // Format phone number for tel: link (remove spaces, keep +)
  const formatPhoneForLink = (phone: string) => {
    return phone.replace(/\s/g, '')
  }

  // Format phone for WhatsApp (remove + and spaces)
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\+/g, '').replace(/\s/g, '')
  }

  // Get WhatsApp link from settings (if available) or use phone
  const getWhatsAppLink = (phone: string) => {
    const formatted = formatPhoneForWhatsApp(phone)
    return `https://wa.me/${formatted}`
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title') || 'Contact Us'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle') || 'Get in touch with our team for your luxury charter experience'}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className={`grid gap-8 max-w-6xl mx-auto ${
          activeContacts.length === 1 
            ? 'grid-cols-1 md:grid-cols-1' 
            : activeContacts.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {activeContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-luxury-gold/30"
            >
              {/* Name & Role */}
              <div className="mb-6">
                <h3 className="font-serif text-2xl font-bold text-luxury-blue mb-2">
                  {contact.name}
                </h3>
                {contact.role && (
                  <p className="text-luxury-gold font-semibold text-sm uppercase tracking-wider">
                    {contact.role}
                  </p>
                )}
              </div>

              {/* Locations */}
              {contact.locations && contact.locations.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <MapPin className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {contact.locations.map((location, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-luxury-blue/10 text-luxury-blue border border-luxury-blue/20"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Actions */}
              <div className="space-y-3">
                {/* Phone */}
                <a
                  href={`tel:${formatPhoneForLink(contact.phone)}`}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 font-semibold group"
                >
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow text-left">{contact.phone}</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 text-luxury-blue rounded-lg hover:bg-luxury-gold hover:text-white transition-all duration-300 font-semibold group"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow text-left truncate">{contact.email}</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={getWhatsAppLink(contact.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 font-semibold group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow text-left">{t('whatsapp') || 'WhatsApp'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            {t('availability') || 'Available 24/7 for your charter inquiries'}
          </p>
        </div>
      </div>
    </section>
  )
}
