'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Phone } from 'lucide-react'
import { useLocale } from 'next-intl'
import { getSiteSettingsClient } from '@/lib/data'

interface Message {
  id: string
  text: string
  sender: 'bot' | 'user'
  timestamp: Date
}

const botResponses: Record<string, Record<string, string>> = {
  en: {
    greeting: "Welcome to Wide Dream! 🌊 I can help you with availability, seasonal pricing, or fleet details. How can I assist you today?",
    pricing: "Our pricing depends on the season. \n\n• Simona (2014) starts from €750/day\n• Wide Dream (2019) starts from €950/day\n\nNote: Prices exclude APA (30%) and IVA (21%). Would you like a precise quote via WhatsApp?",
    availability: "Availability changes daily. To get immediate confirmation for your preferred dates, it's best to chat with our manager on WhatsApp.",
    contact: "You can reach us directly:\n📞 +34 680 957 096\n💬 Or use the WhatsApp button below.",
    default: "I can assist with fleet details, pricing, or bookings. What would you like to know?"
  },
  es: {
    greeting: "¡Bienvenido a Wide Dream! 🌊 Puedo ayudarle con la disponibilidad, los precios de temporada o los detalles de la flota.",
    pricing: "Nuestros precios varían según la temporada. \n\n• Simona desde 750€/día\n• Wide Dream desde 950€/día\n\n¿Desea un presupuesto exacto por WhatsApp?",
    availability: "La disponibilidad cambia a diario. Para una confirmación inmediata, hable con nuestro manager por WhatsApp.",
    contact: "Contacto directo:\n📞 +34 680 957 096\n💬 O el botón de WhatsApp.",
    default: "Puedo ayudarle con información de la flota, precios o reservas."
  },
  de: {
    greeting: "Willkommen bei Wide Dream! 🌊 Ich kann Ihnen bei Verfügbarkeit, saisonalen Preisen oder Flottendetails helfen.",
    pricing: "Unsere Preise variieren je nach Saison. \n\n• Simona ab 750 €/Tag\n• Wide Dream ab 950 €/Tag\n\nMöchten Sie ein genaues Angebot per WhatsApp erhalten?",
    availability: "Die Verfügbarkeit ändert sich täglich. Für eine sofortige Bestätigung chatten Sie am besten direkt mit unserem Manager über WhatsApp.",
    contact: "Direktkontakt:\n📞 +34 680 957 096\n💬 Oder nutzen Sie den WhatsApp-Button.",
    default: "Ich kann Ihnen mit Flottendetails, Preisen oder Buchungen helfen."
  }
}

const uiText: Record<string, Record<string, string>> = {
  en: { placeholder: 'Type your message...', whatsapp: 'Chat on WhatsApp' },
  es: { placeholder: 'Escribe tu mensaje...', whatsapp: 'Chat por WhatsApp' },
  de: { placeholder: 'Schreiben Sie...', whatsapp: 'Per WhatsApp chatten' }
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const locale = useLocale()
  const currentLocale = ['en', 'es', 'de'].includes(locale) ? locale : 'en'

  useEffect(() => {
    getSiteSettingsClient().then((settings) => {
      setWhatsappLink(settings.whatsapp_link || 'https://wa.me/34680957096')
    })
  }, [])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: botResponses[currentLocale].greeting,
        sender: 'bot',
        timestamp: new Date(),
      }])
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, currentLocale, messages])

  const getBotResponse = (text: string): string => {
    const t = text.toLowerCase()
    const resp = botResponses[currentLocale]
    if (t.includes('price') || t.includes('cost') || t.includes('precio') || t.includes('preis')) return resp.pricing
    if (t.includes('avail') || t.includes('date') || t.includes('fecha') || t.includes('verfügbar')) return resp.availability
    if (t.includes('contact') || t.includes('phone') || t.includes('tel')) return resp.contact
    return resp.default
  }

  const processUserMessage = async (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() }])
    setInputText('')
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 800))
    setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: getBotResponse(text), sender: 'bot', timestamp: new Date() }])
    setIsTyping(false)
  }

  const ui = uiText[currentLocale]

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 bg-luxury-blue text-white rounded-full shadow-xl hover:scale-110 transition-all">
          <MessageCircle className="w-7 h-7" />
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col h-[550px]">
          <div className="bg-gradient-to-r from-luxury-blue to-luxury-gold text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2"><Bot className="w-5 h-5" /><span className="font-bold">Wide Dream Assistant</span></div>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${m.sender === 'user' ? 'bg-luxury-blue text-white' : 'bg-white shadow-sm border'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white space-y-3">
            <a href={whatsappLink || '#'} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#20BA5A] transition-all shadow-md">
              <Phone className="w-4 h-4" /> {ui.whatsapp}
            </a>
            <form onSubmit={(e) => { e.preventDefault(); if(inputText.trim()) processUserMessage(inputText); }} className="flex gap-2">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={ui.placeholder} className="flex-1 px-3 py-2 border rounded-lg focus:ring-1 focus:ring-luxury-blue outline-none" />
              <button type="submit" className="bg-luxury-blue text-white p-2 rounded-lg hover:bg-luxury-gold transition-colors"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}