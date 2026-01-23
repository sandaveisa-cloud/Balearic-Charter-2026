'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Ship, 
  MapPin, 
  UtensilsCrossed, 
  Users, 
  Contact, 
  Settings,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Menu,
  X
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Fleet', href: '/admin/fleet', icon: Ship },
  { name: 'Inquiries', href: '/admin/inquiries', icon: Mail },
  { name: 'Destinations', href: '/admin/destinations', icon: MapPin },
  { name: 'Culinary', href: '/admin/culinary', icon: UtensilsCrossed },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Crew', href: '/admin/crew', icon: Users },
  { name: 'Contacts', href: '/admin/contacts', icon: Contact },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 pt-16 z-30
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="mt-8 px-4 pb-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-luxury-blue text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}
