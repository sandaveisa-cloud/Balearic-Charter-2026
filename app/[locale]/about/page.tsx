import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getSiteContent } from '@/lib/data'
import Breadcrumb from '@/components/Breadcrumb'
import { Anchor, Ship, Users, Utensils, MapPin, Phone, Mail, ArrowRight } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const tContact = await getTranslations({ locale, namespace: 'contact' })
  const tMission = await getTranslations({ locale, namespace: 'mission' })
  
  // Fetch site content for dynamic data
  const siteContent = await getSiteContent()
  const settings = siteContent.settings || {}
  
  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: t('title'), href: '/about' }
        ]} 
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-luxury-blue via-[#1e3a5f] to-luxury-blue py-20">
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

      {/* Company Overview */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue mb-6">
                {t('companyTitle')}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t('companyDescription')}
              </p>
            </div>
            
            {/* Mission Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-luxury-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Anchor className="w-8 h-8 text-luxury-gold" />
                </div>
                <h3 className="font-semibold text-xl text-luxury-blue mb-3">
                  {tMission('cards.logistics.title')}
                </h3>
                <p className="text-gray-600">
                  {tMission('cards.logistics.description')}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-luxury-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-luxury-gold" />
                </div>
                <h3 className="font-semibold text-xl text-luxury-blue mb-3">
                  {tMission('cards.crew.title')}
                </h3>
                <p className="text-gray-600">
                  {tMission('cards.crew.description')}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-luxury-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-luxury-gold" />
                </div>
                <h3 className="font-semibold text-xl text-luxury-blue mb-3">
                  {tMission('cards.gourmet.title')}
                </h3>
                <p className="text-gray-600">
                  {tMission('cards.gourmet.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operating Areas */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-luxury-blue mb-6">
              {t('areasTitle')}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {t('areasDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Ibiza', 'Formentera', 'Mallorca', 'Menorca', 'Costa Blanca'].map((area) => (
                <span key={area} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-luxury-blue font-medium">
                  <MapPin className="w-4 h-4 text-luxury-gold" />
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="booking" className="py-16 md:py-24 bg-luxury-blue">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              {t('ctaTitle')}
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              {t('ctaDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-gold text-luxury-blue font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                {tContact('title')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/30"
              >
                <Ship className="w-5 h-5" />
                {t('viewFleet')}
              </Link>
            </div>
            
            {/* Quick Contact Info */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="inline-flex items-center gap-2 hover:text-luxury-gold transition-colors">
                  <Phone className="w-5 h-5" />
                  {settings.contact_phone}
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 hover:text-luxury-gold transition-colors">
                  <Mail className="w-5 h-5" />
                  {settings.contact_email}
                </a>
              )}
            </div>
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
