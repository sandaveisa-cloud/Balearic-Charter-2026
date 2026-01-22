'use client'

import { useTranslations } from 'next-intl'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSiteSettingsClient } from '@/lib/data'
import type { ContactPerson } from '@/types/database'

interface ContactSectionProps {
  contactPersons: ContactPerson[]
  settings?: Record<string, string>
}

export default function ContactSection({ contactPersons, settings: initialSettings }: ContactSectionProps) {
  const t = useTranslations('contact')
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {})
  
  // Fetch settings if not provided
  useEffect(() => {
    if (!initialSettings || Object.keys(initialSettings).length === 0) {
      getSiteSettingsClient().then(setSettings)
    }
  }, [initialSettings])
  
  // Filter active contacts
  const activeContacts = contactPersons.filter(cp => cp.is_active).sort((a, b) => a.order_index - b.order_index)
  
  // Get contact info from settings as fallback
  const contactPhone = settings.contact_phone || t('phone')
  const contactEmail = settings.contact_email || t('email')
  const contactLocations = settings.contact_locations || t('locations')
  
  // If no contact persons and no settings, show default contact card
  const shouldShowDefaultContact = activeContacts.length === 0 && (contactPhone || contactEmail)
  
  if (activeContacts.length === 0 && !shouldShowDefaultContact) {
    return null
  }

  // Format phone number for tel: link (remove spaces, keep +)
  const formatPhoneForLink = (phone: string | null | undefined) => {
    return (phone || '').replace(/\s/g, '')
  }

  // Format phone for WhatsApp (remove + and spaces)
  const formatPhoneForWhatsApp = (phone: string | null | undefined) => {
    return (phone || '').replace(/\+/g, '').replace(/\s/g, '')
  }

  // Get WhatsApp link from settings (if available) or use phone
  const getWhatsAppLink = (phone: string) => {
    const formatted = formatPhoneForWhatsApp(phone)
    return `https://wa.me/${formatted}`
  }

  // Render default contact card if no contact persons
  const renderDefaultContactCard = () => (
    <div className="bg-white rounded-xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-luxury-gold/30 max-w-2xl mx-auto">
      {/* Locations */}
      {contactLocations && (
        <div className="mb-6 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-luxury-blue mb-1 uppercase tracking-wider">
              {t('locationLabel')}
            </p>
            <p className="text-gray-700">{contactLocations}</p>
          </div>
        </div>
      )}

      {/* Contact Actions */}
      <div className="space-y-4">
        {/* Phone */}
        {contactPhone && (
          <a
            href={`tel:${formatPhoneForLink(contactPhone)}`}
            className="flex items-center gap-4 w-full px-6 py-4 md:py-5 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 font-semibold group text-lg md:text-xl"
          >
            <Phone className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="flex-grow text-left">{contactPhone}</span>
          </a>
        )}

        {/* Email */}
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-4 w-full px-6 py-4 md:py-5 bg-gray-100 text-luxury-blue rounded-lg hover:bg-luxury-gold hover:text-white transition-all duration-300 font-semibold group text-lg md:text-xl"
          >
            <Mail className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="flex-grow text-left truncate">{contactEmail}</span>
          </a>
        )}

        {/* WhatsApp */}
        {contactPhone && (
          <a
            href={getWhatsAppLink(contactPhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 w-full px-6 py-4 md:py-5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 font-semibold group text-lg md:text-xl"
          >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="flex-grow text-left">{t('whatsapp') || 'WhatsApp'}</span>
          </a>
        )}
      </div>
    </div>
  )

  return (
    <section id="contact" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-luxury-blue mb-4">
            {t('title') || 'Contact Us'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle') || 'Reach out directly via WhatsApp, Email, or our chat for your luxury charter inquiries'}
          </p>
        </div>

        {/* Centered Contact Card - Prominent and Elegant */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {shouldShowDefaultContact && activeContacts.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-luxury-gold/50">
                {/* Locations */}
                {contactLocations && (
                  <div className="mb-8 flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-luxury-gold flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-luxury-blue mb-2 uppercase tracking-wider">
                        {t('locationLabel')}
                      </p>
                      <p className="text-gray-700 text-lg">{contactLocations}</p>
                    </div>
                  </div>
                )}

                {/* Contact Actions - Elegant and Spacious */}
                <div className="space-y-5">
                  {/* Phone */}
                  {contactPhone && (
                    <a
                      href={`tel:${formatPhoneForLink(contactPhone)}`}
                      className="flex items-center gap-5 w-full px-8 py-5 bg-luxury-blue text-white rounded-xl hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 font-semibold group text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <Phone className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="flex-grow text-left">{contactPhone}</span>
                    </a>
                  )}

                  {/* Email */}
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center gap-5 w-full px-8 py-5 bg-gray-50 text-luxury-blue rounded-xl hover:bg-luxury-gold hover:text-white transition-all duration-300 font-semibold group text-lg shadow-md hover:shadow-lg border border-gray-200 hover:border-luxury-gold transform hover:scale-[1.02]"
                    >
                      <Mail className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="flex-grow text-left truncate">{contactEmail}</span>
                    </a>
                  )}

                  {/* WhatsApp */}
                  {contactPhone && (
                    <a
                      href={getWhatsAppLink(contactPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-5 w-full px-8 py-5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 font-semibold group text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="flex-grow text-left">{t('whatsapp') || 'WhatsApp'}</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {activeContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-white rounded-2xl p-10 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-luxury-gold/50"
                  >
                    {/* Name & Role - Prominent */}
                    <div className="mb-8 pb-6 border-b border-gray-100">
                      <h3 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue mb-2">
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
                      <div className="mb-8 flex flex-wrap items-center gap-3">
                        <MapPin className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                        <div className="flex flex-wrap gap-2">
                          {contact.locations.map((location, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-luxury-blue/10 text-luxury-blue border border-luxury-blue/20"
                            >
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Actions - Elegant and Spacious */}
                    <div className="space-y-4">
                      {/* Phone */}
                      <a
                        href={`tel:${formatPhoneForLink(contact.phone)}`}
                        className="flex items-center gap-5 w-full px-8 py-5 bg-luxury-blue text-white rounded-xl hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 font-semibold group text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <Phone className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="flex-grow text-left">{contact.phone}</span>
                      </a>

                      {/* Email */}
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-5 w-full px-8 py-5 bg-gray-50 text-luxury-blue rounded-xl hover:bg-luxury-gold hover:text-white transition-all duration-300 font-semibold group text-lg shadow-md hover:shadow-lg border border-gray-200 hover:border-luxury-gold transform hover:scale-[1.02]"
                        // Obfuscate email display to prevent spam bots
                        data-email={contact.email.split('@')[0] + '[at]' + contact.email.split('@')[1]}
                      >
                        <Mail className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="flex-grow text-left truncate">{contact.email}</span>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={getWhatsAppLink(contact.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-5 w-full px-8 py-5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 font-semibold group text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="flex-grow text-left">{t('whatsapp') || 'WhatsApp'}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm md:text-base">
            {t('availability') || 'Available 24/7 for your charter inquiries'}
          </p>
        </div>
      </div>
    </section>
  )
}
