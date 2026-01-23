'use client'

import { ArrowUp } from 'lucide-react'

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={scrollToTop}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-luxury-blue text-white text-sm font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-blue transition-all duration-300 shadow-md hover:shadow-lg"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
        <span>Back to Top</span>
      </button>
    </div>
  )
}
