'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Ship, 
  MapPin, 
  UtensilsCrossed, 
  Users, 
  Contact, 
  Settings,
  MessageSquare
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Fleet', href: '/admin/fleet', icon: Ship },
  { name: 'Destinations', href: '/admin/destinations', icon: MapPin },
  { name: 'Culinary', href: '/admin/culinary', icon: UtensilsCrossed },
  { name: 'Crew', href: '/admin/crew', icon: Users },
  { name: 'Contacts', href: '/admin/contacts', icon: Contact },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 pt-16">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-luxury-blue text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
