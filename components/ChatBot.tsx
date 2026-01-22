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

// Multilingual bot responses
const botResponses: Record<string, Record<string, string>> = {
  en: {
    greeting: "Hello! I'm here to help you with information about our luxury yacht charters. How can I assist you today?",
    fleet: "We have two luxury yachts available:\n\n️ **Simona (2014)**\nPrices: €750 - €2,000 per day\n\n️ **Wide Dream (2019)**\nPrices: €950 - €2,400 per day\n\nWould you like more details about a specific yacht?",
    simona: "**Simona** is a beautiful yacht from 2014.\n\n💰 **Pricing:**\n• Low Season: €750/day\n• Medium Season: €1,100/day\n• High Season: €2,000/day\n\nWould you like to book or get more information?",
    wideDream: "**Wide Dream** is our premium yacht from 2019.\n\n💰 **Pricing:**\n• Low Season: €950/day\n• Medium Season: €1,300/day\n• High Season: €2,400/day\n\nWould you like to book or get more information?",
    pricing: "Our pricing varies by season:\n\n**Simona (2014):**\n• Low: €750/day\n• Medium: €1,100/day\n• High: €2,000/day\n\n**Wide Dream (2019):**\n• Low: €950/day\n• Medium: €1,300/day\n• High: €2,400/day\n\nWould you like to check availability for specific dates?",
    booking: "Great! To proceed with a booking, I'll need some information:\n\n1. Which yacht interests you?\n2. Your preferred dates\n3. Number of guests\n4. Your contact details\n\nOr you can chat directly with our manager on WhatsApp for immediate assistance!",
    contact: "You can reach us:\n\n📞 **Phone:** +34 680 957 096\n💬 **WhatsApp:** Click the button below\n🌐 **Website:** https://widedream.es\n\nWould you like to speak with our manager directly?",
    default: "I understand you're interested in our yacht charters. I can help you with:\n\n• Fleet information\n• Pricing details\n• Booking inquiries\n• Contact information\n\nWhat would you like to know?",
    goodbye: "Thank you for chatting! Feel free to reach out anytime. Have a wonderful day! 🌊",
  },
  lv: {
    greeting: "Sveiki! Esmu šeit, lai palīdzētu jums ar informāciju par mūsu luksusa jahtu noma. Kā es varu jums palīdzēt šodien?",
    fleet: "Mums ir pieejamas divas luksusa jahtas:\n\n️ **Simona (2014)**\nCenas: €750 - €2,000 dienā\n\n️ **Wide Dream (2019)**\nCenas: €950 - €2,400 dienā\n\nVai vēlaties sīkāku informāciju par konkrētu jahtu?",
    simona: "**Simona** ir skaista jahta no 2014. gada.\n\n💰 **Cenas:**\n• Zema sezona: €750/dienā\n• Vidējā sezona: €1,100/dienā\n• Augsta sezona: €2,000/dienā\n\nVai vēlaties rezervēt vai iegūt vairāk informācijas?",
    wideDream: "**Wide Dream** ir mūsu premium jahta no 2019. gada.\n\n💰 **Cenas:**\n• Zema sezona: €950/dienā\n• Vidējā sezona: €1,300/dienā\n• Augsta sezona: €2,400/dienā\n\nVai vēlaties rezervēt vai iegūt vairāk informācijas?",
    pricing: "Mūsu cenas atšķiras atkarībā no sezonas:\n\n**Simona (2014):**\n• Zema: €750/dienā\n• Vidējā: €1,100/dienā\n• Augsta: €2,000/dienā\n\n**Wide Dream (2019):**\n• Zema: €950/dienā\n• Vidējā: €1,300/dienā\n• Augsta: €2,400/dienā\n\nVai vēlaties pārbaudīt pieejamību konkrētām datumiem?",
    booking: "Lieliski! Lai turpinātu ar rezervāciju, man būs nepieciešama informācija:\n\n1. Kura jahta jūs interesē?\n2. Jūsu vēlamie datumiem\n3. Viesu skaits\n4. Jūsu kontaktinformācija\n\nVai arī varat tūlīt sazināties ar mūsu menedžeri WhatsApp!",
    contact: "Jūs varat sazināties ar mums:\n\n📞 **Tālrunis:** +34 680 957 096\n💬 **WhatsApp:** Noklikšķiniet uz pogas zemāk\n🌐 **Vietne:** https://widedream.es\n\nVai vēlaties runāt ar mūsu menedžeri tieši?",
    default: "Es saprotu, ka jūs interesē mūsu jahtu noma. Es varu palīdzēt ar:\n\n• Flotes informāciju\n• Cenu detaļām\n• Rezervāciju pieprasījumiem\n• Kontaktinformāciju\n\nKo jūs vēlētos uzzināt?",
    goodbye: "Paldies par sarunu! Jūtieties brīvi sazināties jebkurā laikā. Lielisku dienu! 🌊",
  },
  ru: {
    greeting: "Здравствуйте! Я здесь, чтобы помочь вам с информацией о наших роскошных яхтах в аренду. Чем я могу вам помочь сегодня?",
    fleet: "У нас есть две роскошные яхты:\n\n️ **Simona (2014)**\nЦены: €750 - €2,000 в день\n\n️ **Wide Dream (2019)**\nЦены: €950 - €2,400 в день\n\nХотите узнать больше о конкретной яхте?",
    simona: "**Simona** - красивая яхта 2014 года.\n\n💰 **Цены:**\n• Низкий сезон: €750/день\n• Средний сезон: €1,100/день\n• Высокий сезон: €2,000/день\n\nХотите забронировать или получить больше информации?",
    wideDream: "**Wide Dream** - наша премиальная яхта 2019 года.\n\n💰 **Цены:**\n• Низкий сезон: €950/день\n• Средний сезон: €1,300/день\n• Высокий сезон: €2,400/день\n\nХотите забронировать или получить больше информации?",
    pricing: "Наши цены варьируются в зависимости от сезона:\n\n**Simona (2014):**\n• Низкий: €750/день\n• Средний: €1,100/день\n• Высокий: €2,000/день\n\n**Wide Dream (2019):**\n• Низкий: €950/день\n• Средний: €1,300/день\n• Высокий: €2,400/день\n\nХотите проверить доступность на конкретные даты?",
    booking: "Отлично! Чтобы продолжить бронирование, мне понадобится информация:\n\n1. Какая яхта вас интересует?\n2. Предпочитаемые даты\n3. Количество гостей\n4. Ваши контактные данные\n\nИли вы можете напрямую связаться с нашим менеджером в WhatsApp для немедленной помощи!",
    contact: "Вы можете связаться с нами:\n\n📞 **Телефон:** +34 680 957 096\n💬 **WhatsApp:** Нажмите кнопку ниже\n🌐 **Сайт:** https://widedream.es\n\nХотите поговорить с нашим менеджером напрямую?",
    default: "Я понимаю, что вас интересует аренда наших яхт. Я могу помочь с:\n\n• Информацией о флоте\n• Деталями цен\n• Запросами на бронирование\n• Контактной информацией\n\nЧто бы вы хотели узнать?",
    goodbye: "Спасибо за общение! Не стесняйтесь обращаться в любое время. Хорошего дня! 🌊",
  },
}

// Multilingual UI text
const uiText: Record<string, Record<string, string>> = {
  en: {
    placeholder: 'Type your message...',
    send: 'Send',
    whatsapp: 'Chat on WhatsApp',
    close: 'Close',
    minimize: 'Minimize',
  },
  lv: {
    placeholder: 'Ierakstiet savu ziņu...',
    send: 'Sūtīt',
    whatsapp: 'Tērzēt WhatsApp',
    close: 'Aizvērt',
    minimize: 'Minimizēt',
  },
  ru: {
    placeholder: 'Введите ваше сообщение...',
    send: 'Отправить',
    whatsapp: 'Чат в WhatsApp',
    close: 'Закрыть',
    minimize: 'Свернуть',
  },
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const currentLocale = locale === 'es' || locale === 'de' ? 'en' : locale // Default to English for unsupported locales

  useEffect(() => {
    getSiteSettingsClient().then((settings) => {
      setWhatsappLink(settings.whatsapp_link || 'https://wa.me/34680957096')
    })
  }, [])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add greeting message when chat opens
      const greeting: Message = {
        id: '1',
        text: botResponses[currentLocale]?.greeting || botResponses.en.greeting,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages([greeting])
    }
  }, [isOpen, currentLocale])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const processUserMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Process message and get bot response
    const response = getBotResponse(text.toLowerCase(), currentLocale)
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
    setIsTyping(false)

    // If user shows booking intent, save to inquiries
    if (isBookingIntent(text)) {
      await saveInquiry(text, userMessage.text)
    }
  }

  const getBotResponse = (text: string, lang: string): string => {
    const responses = botResponses[lang] || botResponses.en

    // Check for keywords
    if (text.includes('hello') || text.includes('hi') || text.includes('sveiki') || text.includes('здравствуйте') || text.includes('привет')) {
      return responses.greeting
    }

    if (text.includes('fleet') || text.includes('yacht') || text.includes('jaht') || text.includes('яхт') || text.includes('flote') || text.includes('флот')) {
      return responses.fleet
    }

    if (text.includes('simona')) {
      return responses.simona
    }

    if (text.includes('wide dream') || text.includes('widedream')) {
      return responses.wideDream
    }

    if (text.includes('price') || text.includes('cost') || text.includes('cen') || text.includes('цена') || text.includes('стоимость')) {
      return responses.pricing
    }

    if (text.includes('book') || text.includes('reserve') || text.includes('rezerv') || text.includes('бронир') || text.includes('забронировать')) {
      return responses.booking
    }

    if (text.includes('contact') || text.includes('phone') || text.includes('email') || text.includes('kontakt') || text.includes('контакт') || text.includes('телефон')) {
      return responses.contact
    }

    if (text.includes('bye') || text.includes('goodbye') || text.includes('atā') || text.includes('до свидания') || text.includes('пока')) {
      return responses.goodbye
    }

    return responses.default
  }

  const isBookingIntent = (text: string): boolean => {
    const bookingKeywords = ['book', 'reserve', 'booking', 'inquiry', 'quote', 'rezerv', 'бронир', 'забронировать', 'запрос']
    return bookingKeywords.some((keyword) => text.includes(keyword))
  }

  const saveInquiry = async (userMessage: string, originalText: string) => {
    try {
      const response = await fetch('/api/chatbot/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: originalText,
          source: 'chatbot',
        }),
      })

      if (!response.ok) {
        console.error('[ChatBot] Failed to save inquiry:', response.statusText)
      }
    } catch (error) {
      console.error('[ChatBot] Error saving inquiry:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      processUserMessage(inputText.trim())
    }
  }

  const ui = uiText[currentLocale] || uiText.en

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 bg-luxury-blue text-white rounded-full shadow-xl hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 hover:scale-110 group"
          aria-label="Open chat"
        >
          <span className="absolute inset-0 rounded-full bg-luxury-blue opacity-0 group-hover:opacity-75 group-hover:animate-ping transition-opacity duration-300"></span>
          <MessageCircle className="w-7 h-7 relative z-10" />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-8 right-8 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-luxury-blue to-luxury-gold text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Wide Dream Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={ui.minimize}
              >
                <span className="text-xs">−</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={ui.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-luxury-blue flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-luxury-blue text-white'
                          : 'bg-white text-gray-800 shadow-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-luxury-blue flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-2 shadow-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* WhatsApp Handoff Button */}
              {whatsappLink && (
                <div className="px-4 py-2 border-t border-gray-200">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-4 py-3 rounded-lg hover:bg-[#20BA5A] transition-all duration-300 font-semibold"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{ui.whatsapp}</span>
                  </a>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={ui.placeholder}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-blue"
                  />
                  <button
                    type="submit"
                    className="bg-luxury-blue text-white px-4 py-2 rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300"
                    aria-label={ui.send}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
