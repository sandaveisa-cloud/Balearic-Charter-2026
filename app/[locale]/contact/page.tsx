import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactForm from '@/components/ContactForm'
import ContactSection from '@/components/ContactSection'
import { getSiteContent } from '@/lib/data'
import { Link } from '@/i18n/navigation'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  
  return {
    title: t('title') + ' | Balearic & Costa Blanca Charters',
    description: t('subtitle'),
  }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  
  // Fetch site content for contact info
  const siteContent = await getSiteContent()
  const settings = siteContent.settings || {}
  const contactPersons = siteContent.contactPersons || []
  
  return (
    <main className="min-h-screen bg-white pt-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-luxury-blue via-[#1e3a5f] to-luxury-blue py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Info */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Phone */}
            <a 
              href={`tel:${settings.contact_phone || '+34 680 957 096'}`}
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-luxury-blue rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('phoneLabel')}</p>
                <p className="font-semibold text-luxury-blue">{settings.contact_phone || '+34 680 957 096'}</p>
              </div>
            </a>
            
            {/* Email */}
            <a 
              href={`mailto:${settings.contact_email || 'info@widedream.es'}`}
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-luxury-blue rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('emailLabel')}</p>
                <p className="font-semibold text-luxury-blue">{settings.contact_email || 'info@widedream.es'}</p>
              </div>
            </a>
            
            {/* WhatsApp */}
            {settings.whatsapp_link && (
              <a 
                href={settings.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('whatsapp')}</p>
                  <p className="font-semibold text-luxury-blue">{t('availability')}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue text-center mb-8">
              {t('formTitle')}
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue text-center mb-12">
            {t('locationLabel')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {['Ibiza', 'Formentera', 'Palma de Mallorca', 'Torrevieja'].map((location) => (
              <span key={location} className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm text-luxury-blue font-medium">
                <MapPin className="w-5 h-5 text-luxury-gold" />
                {location}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-luxury-blue hover:text-luxury-gold transition-colors font-medium"
          >
            ← {t('backToHome')}
          </Link>
        </div>
      </section>
    </main>
  )
}
