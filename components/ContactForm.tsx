'use client'

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; phone: string; message: string }) => Promise<void>
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const t = useTranslations('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default: Send to API
        const response = await fetch('/api/send-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            type: 'contact',
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state - same dimensions as form
  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-xl p-8 md:p-10 shadow-lg border border-gray-100 h-full flex flex-col items-center justify-center min-h-[500px]">
        <CheckCircle2 className="w-16 h-16 text-luxury-gold mb-4" />
        <h3 className="font-serif text-2xl font-bold text-luxury-blue mb-2 text-center">
          {t('successTitle') || 'Thank You!'}
        </h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          {t('successMessage') || 'We have received your message and will get back to you shortly.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('backToHome') || 'Back to Home'}</span>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 md:p-10 shadow-lg border border-gray-100 h-full flex flex-col">
      <h3 className="font-serif text-2xl font-bold text-luxury-blue mb-6">
        {t('formTitle') || 'Send us a Message'}
      </h3>

      <div className="space-y-4 flex-grow">
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
          />
        </div>

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
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('formMessage') || 'Message'} *
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-transparent transition-all resize-none"
          />
        </div>
      </div>

      {submitStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorMessage || t('errorMessage') || 'Failed to send message. Please try again.'}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full px-6 py-4 bg-luxury-blue text-white font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>{t('sending') || 'Sending...'}</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>{t('sendMessage') || 'Send Message'}</span>
          </>
        )}
      </button>
    </form>
  )
}
