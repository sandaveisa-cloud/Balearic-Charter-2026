'use client'

import { useState } from 'react'
import { Sparkles, Send, Copy, Check, Bot } from 'lucide-react'

export default function AiAssistant() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    
    try {
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      if (data.result) {
        setResponse(data.result)
      } else if (data.error) {
        setResponse(`Error: ${data.error}`)
      }
    } catch (error) {
      setResponse('Error: Could not connect to AI assistant.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50 rounded-t-xl">
        <div className="p-2 bg-luxury-gold/10 rounded-lg">
          <Bot className="w-5 h-5 text-luxury-gold" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Balearic Yacht Charters AI</h3>
          <p className="text-xs text-gray-500">Your charter business assistant</p>
        </div>
      </div>

      {/* Response Area */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
        {response ? (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative group">
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {response}
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy text"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
            <Sparkles className="w-12 h-12 mb-4 text-gray-200" />
            <p className="text-sm">Ask me to translate descriptions, fix grammar, or suggest SEO keywords for Ibiza.</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
        <form onSubmit={handleAskAi} className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI helper..."
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold outline-none resize-none h-14 min-h-[56px] text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAskAi(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-2 bottom-2.5 p-2 bg-luxury-blue text-white rounded-lg hover:bg-luxury-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI can make mistakes. Review generated content.
        </p>
      </div>
    </div>
  )
}