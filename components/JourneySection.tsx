// @ts-nocheck
'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { Calendar, MapPin } from 'lucide-react'
import type { JourneyMilestone } from '@/types/database'
import OptimizedImage from './OptimizedImage'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

interface JourneySectionProps {
  milestones: JourneyMilestone[]
}

export default function JourneySection({ milestones }: JourneySectionProps) {
  const locale = useLocale()
  const [visibleMilestones, setVisibleMilestones] = useState<Set<string>>(new Set())
  const sectionRef = useRef<HTMLDivElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('[JourneySection] Received milestones:', milestones?.length || 0)
    if (milestones && milestones.length > 0) {
      console.log('[JourneySection] Sample milestone:', {
        id: milestones[0].id,
        year: milestones[0].year,
        order_index: milestones[0].order_index,
        title_en: milestones[0].title_en,
        is_active: milestones[0].is_active
      })
    }
  }, [milestones])

  // Filter active milestones and sort by order_index first, then by year
  // IMPORTANT: Include milestones with order_index = 0
  const activeMilestones = (milestones || [])
    .filter((m) => m.is_active !== false) // Include all where is_active is not explicitly false
    .sort((a, b) => {
      // First sort by order_index (including 0)
      const orderA = a.order_index ?? 0
      const orderB = b.order_index ?? 0
      if (orderA !== orderB) {
        return orderA - orderB
      }
      // If order_index is the same, sort by year
      return a.year - b.year
    })

  console.log('[JourneySection] Active milestones after filtering:', activeMilestones.length)

  // Always show section - don't hide even if empty
  // This ensures the section is visible for debugging

  // Get localized text
  const getTitle = (milestone: JourneyMilestone) => {
    return milestone[`title_${locale}` as keyof JourneyMilestone] as string || milestone.title_en
  }

  const getDescription = (milestone: JourneyMilestone) => {
    return milestone[`description_${locale}` as keyof JourneyMilestone] as string || milestone.description_en
  }

  // Check if there's a background video URL
  // Look for video in any milestone's image_url field (if it's a video file)
  // Or check if there's a dedicated video_url field (if added to schema)
  const findVideoUrl = () => {
    // First, check all milestones for video URLs
    for (const milestone of activeMilestones) {
      if (milestone.image_url) {
        const url = milestone.image_url.toLowerCase()
        // Check for common video file extensions and video-related keywords
        if (
          url.includes('.mp4') || 
          url.includes('.webm') || 
          url.includes('.mov') || 
          url.includes('.avi') ||
          url.includes('.m4v') ||
          url.includes('video') ||
          url.includes('mp4') ||
          url.includes('webm')
        ) {
          console.log('[JourneySection] ✅ Found video URL in milestone:', {
            id: milestone.id,
            year: milestone.year,
            url: milestone.image_url
          })
          return milestone.image_url
        }
      }
      // Check for video_url field if it exists in the schema
      if ((milestone as any).video_url) {
        console.log('[JourneySection] ✅ Found video_url field:', (milestone as any).video_url)
        return (milestone as any).video_url
      }
    }
    console.log('[JourneySection] ⚠️ No video URL found in any milestone')
    return null
  }
  
  const videoUrl = findVideoUrl()
  
  console.log('[JourneySection] Background video URL:', videoUrl || 'none')

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white via-[#F9FAFB] to-white relative overflow-hidden">
      {/* Video Background (if video URL exists) */}
      {videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
          style={{ pointerEvents: 'none' }}
          onError={(e) => {
            console.error('[JourneySection] ❌ Video load error:', e)
            console.error('[JourneySection] ❌ Video URL that failed:', videoUrl)
            console.error('[JourneySection] ❌ Video element:', e.currentTarget)
          }}
          onLoadedData={() => {
            console.log('[JourneySection] ✅ Video loaded successfully:', videoUrl)
          }}
          onCanPlay={() => {
            console.log('[JourneySection] ✅ Video can play:', videoUrl)
          }}
          onLoadStart={() => {
            console.log('[JourneySection] 🔄 Video load started:', videoUrl)
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/quicktime" />
          <source src={videoUrl} type="video/x-m4v" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Subtle parallax background (fallback if no video) */}
      {!videoUrl && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z%22 fill=%22%23C5A059%22 fill-opacity=%220.03%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E')] opacity-40 z-0" />
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={sectionRef}>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 bg-gradient-to-br from-[#001F3F] to-[#1B263B] rounded-full shadow-lg">
              <Calendar className="w-8 h-8 text-[#C5A059]" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#001F3F] mb-4 tracking-wide"
          >
            Our Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600"
          >
            A timeline of milestones that shaped Balearic Yacht Charters
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C5A059]/30 via-[#C5A059]/50 to-[#C5A059]/30" />

          {/* Milestones */}
          <div className="space-y-12 md:space-y-16">
            {activeMilestones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No milestones available yet.</p>
              </div>
            ) : (
              activeMilestones.map((milestone, index) => {
              const isEven = index % 2 === 0
              const MilestoneCard = ({ milestone, index, isEven }: { milestone: JourneyMilestone; index: number; isEven: boolean }) => {
                const ref = useRef<HTMLDivElement>(null)
                const isInView = useInView(ref, { once: true, margin: '-100px' })

                return (
                  <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative flex items-start gap-6 md:gap-8 ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#001F3F] to-[#1B263B] border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm md:text-base">{milestone.year}</span>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-left`}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200/50 hover:border-[#C5A059]/30 transition-all duration-300 hover:shadow-xl"
                      >
                        {/* Year Badge */}
                        <div className={`flex items-center gap-2 mb-4 ${isEven ? 'justify-start' : 'md:justify-end justify-start'}`}>
                          <Calendar className="w-4 h-4 text-[#C5A059]" />
                          <span className="text-sm font-semibold text-[#C5A059] tracking-wide">{milestone.year}</span>
                        </div>

                        {/* Image (only show if not a video file) */}
                        {milestone.image_url && 
                         !milestone.image_url.includes('.mp4') && 
                         !milestone.image_url.includes('.webm') && 
                         !milestone.image_url.includes('.mov') &&
                         !milestone.image_url.includes('video') && (
                          <div className="mb-4 rounded-xl overflow-hidden aspect-video">
                            <OptimizedImage
                              src={(getOptimizedImageUrl as any)(milestone.image_url || '', {
                                width: 800,
                                quality: 85,
                                format: 'webp',
                              })}
                              alt={getTitle(milestone)}
                              width={800}
                              height={450}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Video (if image_url is a video file) */}
                        {milestone.image_url && 
                         (milestone.image_url.includes('.mp4') || 
                          milestone.image_url.includes('.webm') || 
                          milestone.image_url.includes('.mov') ||
                          milestone.image_url.includes('video')) && (
                          <div className="mb-4 rounded-xl overflow-hidden aspect-video">
                            <video
                              controls
                              className="w-full h-full object-cover"
                              preload="metadata"
                            >
                              <source src={milestone.image_url} type="video/mp4" />
                              <source src={milestone.image_url} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#001F3F] mb-3 tracking-wide">
                          {getTitle(milestone)}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                          {getDescription(milestone)}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              }

              return <MilestoneCard key={milestone.id} milestone={milestone} index={index} isEven={isEven} />
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
