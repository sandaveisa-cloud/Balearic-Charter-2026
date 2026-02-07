'use client'

import { Globe } from 'lucide-react'

export default function ViewSiteButton() {
  return (
    <a
      href="/en"
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1.5 bg-[#001F3F] hover:bg-[#1B263B] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
    >
      <Globe className="w-4 h-4" />
      View Site
    </a>
  )
}
