'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Ship, 
  Globe, 
  UtensilsCrossed, 
  Users, 
  Contact, 
  Settings,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Menu,
  X,
  Palette,
  Calendar,
  Anchor,
  Clock,
  Target
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Inquiries', href: '/admin/inquiries', icon: Mail, badge: 'New' },
    ]
  },
  {
    title: 'Fleet & Content',
    items: [
      { name: 'Fleet Management', href: '/admin/fleet', icon: Ship },
      { name: 'Destinations', href: '/admin/destinations', icon: Globe },
      { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
      { name: 'Journey Timeline', href: '/admin/journey', icon: Clock },
      { name: 'Signature Experience', href: '/admin/mission', icon: Target },
    ]
  },
  {
    title: 'Services',
    items: [
      { name: 'Culinary', href: '/admin/culinary', icon: UtensilsCrossed },
      { name: 'Crew', href: '/admin/crew', icon: Users },
    ]
  },
  {
    title: 'Customer',
    items: [
      { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
      { name: 'Contacts', href: '/admin/contacts', icon: Contact },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Settings & Theme', href: '/admin/settings', icon: Settings },
    ]
  }
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
        {/* Logo / Brand */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxury-gold rounded-lg flex items-center justify-center">
              <Anchor className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="font-bold text-white">Charter Admin</h2>
              <p className="text-xs text-gray-400">Management Panel</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-3 pb-8 overflow-y-auto h-[calc(100vh-8rem)]">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname?.startsWith(item.href))
                  const Icon = item.icon
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-luxury-blue text-white shadow-lg' 
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="mt-8 pt-4 border-t border-gray-800">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="px-3 space-y-2">
              <a
                href="/en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-luxury-gold transition-colors"
              >
                <Globe className="w-4 h-4" />
                View Website (EN)
              </a>
              <a
                href="/es"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-luxury-gold transition-colors"
              >
                <Globe className="w-4 h-4" />
                View Website (ES)
              </a>
              <a
                href="/en/fleet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-luxury-gold transition-colors"
              >
                <Ship className="w-4 h-4" />
                View Fleet Page
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
