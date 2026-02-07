// Force static generation - no data fetching, no server components
export const dynamic = 'force-static'

export default function NotFound() {
  // Hardcoded strings - no translations, no data fetching, no complex components
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-bold text-[#001F3F] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <a
          href="/en"
          className="inline-block rounded-lg bg-[#001F3F] px-6 py-3 text-white font-semibold transition-colors hover:bg-[#D4AF37] hover:text-[#001F3F]"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
