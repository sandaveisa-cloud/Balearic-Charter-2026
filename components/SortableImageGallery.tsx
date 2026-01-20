'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import OptimizedImage from './OptimizedImage'
import { GripVertical } from 'lucide-react'

interface SortableImageGalleryProps {
  images: string[]
  onReorder: (newOrder: string[]) => void
  onRemove?: (imageUrl: string) => void
  className?: string
}

function SortableImageItem({
  imageUrl,
  index,
  onRemove,
}: {
  imageUrl: string
  index: number
  onRemove?: (imageUrl: string) => void
}) {
  // Use index as ID for drag-and-drop (unique per position)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `image-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-luxury-gold transition-all"
    >
      <OptimizedImage
        src={imageUrl}
        alt={`Image ${index + 1}`}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        objectFit="cover"
        aspectRatio="1/1"
        loading="lazy"
        quality={75}
      />
      
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Order Badge */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        #{index + 1}
      </div>
      
      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={() => onRemove(imageUrl)}
          className="absolute bottom-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
          aria-label="Remove image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function SortableImageGallery({
  images,
  onReorder,
  onRemove,
  className = '',
}: SortableImageGalleryProps) {
  const [items, setItems] = useState(images)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sync items with images prop when it changes
  useEffect(() => {
    setItems(images)
  }, [images])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Extract index from ID (format: "image-{index}")
      const activeIndex = parseInt((active.id as string).replace('image-', ''), 10)
      const overIndex = parseInt((over.id as string).replace('image-', ''), 10)

      if (!isNaN(activeIndex) && !isNaN(overIndex) && activeIndex !== overIndex) {
        const newOrder = arrayMove(items, activeIndex, overIndex)
        setItems(newOrder)
        onReorder(newOrder)
      }
    }
  }

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map((_, index) => `image-${index}`)} 
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((imageUrl, index) => (
              <SortableImageItem
                key={`image-${index}-${imageUrl.substring(imageUrl.length - 20)}`}
                imageUrl={imageUrl}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
