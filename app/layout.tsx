import React from 'react'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Balearic & Costa Blanca Charters | Luxury Yacht Charter',
  description: 'Premium yacht charters in the Balearic Islands and Costa Blanca.',
}

// Root layout - required by Next.js
// Must contain <html> and <body> tags for error boundaries and 404 pages
// The locale-specific layout in app/[locale]/layout.tsx is nested inside this
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
