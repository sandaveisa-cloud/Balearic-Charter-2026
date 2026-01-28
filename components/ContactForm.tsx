'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Send, CheckCircle2, Ship, AlertCircle, RefreshCw, MessageCircle, Calendar, Users, Anchor } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getSiteSettingsClient } from '@/lib/data'

interface ContactFormProps {
  onSubmit?: (data: any) => Promise<void>
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const t = useTranslations('contact')
  
  // Papildināts stāvoklis ar jauniem laukiem
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '',  // Jauns
    dates: '',   // Jauns
    yacht: '',   // Jauns
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [whatsappLink, setWhatsappLink] = useState<string>('')

  useEffect(() => {
    getSiteSettingsClient().then((settings) => {
      setWhatsappLink(settings.whatsapp_link || 'https://wa.me/34680957096')
    })
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Nosūtam visus datus uz API
        const response = await fetch('/api/send-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData, // Šis nosūta gan vecos, gan jaunos laukus
            type: 'contact',
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', guests: '', dates: '', yacht: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setSubmitStatus('idle')
    setErrorMessage('')
  }

  // --- SUCCESS STATE ---
  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg border border-gray-100 h-full flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-luxury-gold/20 rounded-full animate-ping"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-luxury-gold to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h3 className="font-serif text-3xl font-bold text-luxury-blue mb-4">
          {t('successTitle') || 'Thank You!'}
        </h3>
        
        <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
          {t('successMessage') || 'Our team will prepare your personalized offer and contact you within the next 24 hours.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/fleet"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 shadow-md"
          >
            <Ship className="w-5 h-5" />
            <span>{t('returnToFleet') || 'Return to Fleet'}</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-luxury-blue font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300"
          >
            <span>{t('backToHome') || 'Back to Home'}</span>
          </Link>
        </div>
      </div>
    )
  }

  // --- ERROR STATE ---
  if (submitStatus === 'error') {
    return (
      <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg border border-red-100 h-full flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        
        <h3 className="font-serif text-2xl font-bold text-gray-800 mb-4">
          {t('errorTitle') || 'Error Submitting Request'}
        </h3>
        
        <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-md">
          {t('errorRetryMessage') || 'There was a problem sending your request. Please try again or contact us directly via WhatsApp.'}
        </p>
        
        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-6 max-w-md">
            {errorMessage}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            <span>{t('tryAgain') || 'Try Again'}</span>
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t('contactWhatsApp') || 'Contact via WhatsApp'}</span>
          </a>
        </div>
      </div>
    )
  }

  // --- FORM STATE (JAUNAIS IZKĀRTOJUMS) ---
  return (
    <form id="contact-form" onSubmit={handleSubmit} className="bg-white rounded-xl p-8 md:p-10 shadow-lg border border-gray-100 h-full flex flex-col">
      <h3 className="font-serif text-2xl font-bold text-luxury-blue mb-6">
        {t('formTitle') || 'Request a Quote'}
      </h3>

      <div className="space-y-4 flex-grow">
        
        {/* Rinda 1: Vārds un E-pasts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('formName') || 'Full Name'} *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('formEmail') || 'Email'} *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Rinda 2: Telefons un Viesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('formPhone') || 'Phone'}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all"
              placeholder="+1 234 567 890"
            />
          </div>

          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('formGuests') || 'Guests'}
            </label>
            <div className="relative">
              <select
                id="guests"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">Select...</option>
                <option value="1-4">1-4</option>
                <option value="5-8">5-8</option>
                <option value="9-12">9-12</option>
                <option value="12+">12+</option>
              </select>
              <Users className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Rinda 3: Datumi un Jahta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dates" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('formDates') || 'Preferred Dates'}
            </label>
            <div className="relative">
              <input
                type="text"
                id="dates"
                value={formData.dates}
                onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all"
                placeholder="e.g. July 15-22"
              />
              <Calendar className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="yacht" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('formYacht') || 'Preferred Yacht'}
            </label>
            <div className="relative">
              <select
                id="yacht"
                value={formData.yacht}
                onChange={(e) => setFormData({ ...formData, yacht: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">Any / Not sure</option>
                <option value="Simona (Lagoon 450F)">Simona (Lagoon 450F)</option>
                <option value="Wide Dream (Lagoon 400 S2)">Wide Dream (Lagoon 400 S2)</option>
              </select>
              <Anchor className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('formMessage') || 'Message'} *
          </label>
          <textarea
            id="message"
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all resize-none"
            placeholder="Tell us about your dream charter..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full px-6 py-4 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>{t('loading') || 'Sending...'}</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>{t('sendMessage') || 'Get My Quote'}</span>
          </>
        )}
      </button>
    </form>
  )
}