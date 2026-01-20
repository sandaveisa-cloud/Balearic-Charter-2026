# Drag and Drop Image Reordering Feature

## Overview
This feature allows users to reorder yacht gallery images by dragging and dropping them in the admin panel. The order is saved permanently to the database.

## Implementation Details

### 1. Database Schema
- **No migration needed!** Images are stored as a JSONB array (`gallery_images: string[]`) in the `fleet` table
- The array order **IS** the display order - PostgreSQL/Supabase preserves JSONB array order
- First image in the array becomes `main_image_url`, rest go to `gallery_images`

### 2. Libraries Used
- **@dnd-kit/core** - Core drag-and-drop functionality
- **@dnd-kit/sortable** - Sortable items support
- **@dnd-kit/utilities** - CSS transform utilities

### 3. Components

#### `SortableImageGallery.tsx`
- Displays existing images in a sortable grid
- Each image has a drag handle (grip icon) that appears on hover
- Shows order badge (#1, #2, etc.) on hover
- Supports keyboard navigation for accessibility

#### `DragDropImageUpload.tsx` (Updated)
- Now accepts `onReorder` prop
- Uses `SortableImageGallery` for existing images when `onReorder` is provided
- Falls back to static grid if `onReorder` is not provided

### 4. Functions

#### `handleReorderFleetImages(yachtId, newOrder)`
- Updates `main_image_url` to `newOrder[0]`
- Updates `gallery_images` to `newOrder.slice(1)`
- Optimistically updates UI for better UX
- Saves to Supabase database
- Shows success message

### 5. How It Works

1. **User drags an image** → `@dnd-kit` handles the drag
2. **User drops image** → `handleDragEnd` calculates new order
3. **Local state updates** → Immediate UI feedback
4. **Database updates** → `handleReorderFleetImages` saves to Supabase
5. **Success message** → User sees confirmation

### 6. Display Order
- Images are **always displayed in array order** (no sorting needed)
- `FleetDetail.tsx` combines `main_image_url` + `gallery_images` maintaining order
- Frontend displays images in the exact order stored in the database

## Usage

In the Admin Panel:
1. Go to Fleet Management
2. Find the yacht you want to edit
3. Scroll to "Yacht Gallery Images" section
4. **Hover over an existing image** to see the drag handle (grip icon)
5. **Click and drag** the image to a new position
6. **Release** to drop - order is saved automatically!

## Notes

- The first image in the gallery becomes the main/hero image
- Order is preserved when fetching from database (JSONB arrays maintain order)
- No database migration needed - uses existing schema
- Works with existing image upload/remove functionality
