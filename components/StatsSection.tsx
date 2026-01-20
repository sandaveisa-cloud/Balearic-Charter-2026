import { getTranslations } from 'next-intl/server'
import type { Stat } from '@/types/database'

interface StatsSectionProps {
  stats: Stat[]
}

export default async function StatsSection({ stats }: StatsSectionProps) {
  const t = await getTranslations('stats')
  
  // Always use these specific stats as requested
  const displayStats: Stat[] = [
    { id: '1', value: '3', label: 'Successful Seasons', order_index: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), icon: null, title: null, description: null, media_urls: [], category: null },
    { id: '2', value: 'Hundreds', label: 'of Happy Guests', order_index: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), icon: null, title: null, description: null, media_urls: [], category: null },
    { id: '3', value: '24/7', label: 'Charter Support', order_index: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), icon: null, title: null, description: null, media_urls: [], category: null },
    { id: '4', value: '99%', label: 'Client Satisfaction', order_index: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), icon: null, title: null, description: null, media_urls: [], category: null },
  ]

  return (
    <section className="py-12 bg-white border-t border-b border-[#E2E8F0]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">
            {t('title') || 'Our Journey in Numbers'}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayStats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-1">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-[#475569]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Verification Line */}
        <div className="mt-8 pt-4 border-t border-[#E2E8F0]">
          <p className="text-xs text-gray-400 text-center">
            ✓ 2026 Season | Verified & Logistically Synchronized
          </p>
        </div>
      </div>
    </section>
  )
}
