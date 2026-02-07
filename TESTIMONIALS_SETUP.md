# Customer Testimonials Section - Setup Guide

## Overview

This guide explains how to set up and use the new high-converting Customer Testimonials section with masonry grid layout, category filtering, and translation support.

## Components Created

1. **`ReviewCard.tsx`** - Individual review card component with:
   - Gold star ratings
   - Verified Review badge with Click&Boat icon
   - Rental Date and Published Date in footer
   - Translation toggle for non-English reviews
   - Luxury styling (serif for quotes, sans-serif for details)

2. **`ReviewGrid.tsx`** - Masonry grid layout component with:
   - CSS columns-based masonry layout
   - Category filtering (All, With Captain, Catamarans, etc.)
   - Automatic text cleaning (removes extra spaces)
   - Results count display

3. **`TestimonialsSection.tsx`** - Complete section wrapper with:
   - Header with title and subtitle
   - Average rating badge
   - Integration with ReviewGrid

## Database Setup

### Step 1: Run SQL Migration

Execute the SQL migration to add new fields to the reviews table:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/add_testimonials_fields.sql
```

This adds the following fields:
- `rental_date` (DATE) - Date when yacht was rented
- `published_date` (DATE) - Date when review was published
- `category` (TEXT) - Category like 'With Captain', 'Catamarans', etc.
- `original_language` (TEXT) - Language code ('en', 'es', 'lv', 'de')
- `translated_text` (TEXT) - Pre-translated English version

### Step 2: Import Your Reviews

You can import reviews via:

1. **Supabase Dashboard**: Go to Table Editor > reviews > Insert row
2. **CSV Import**: Use Supabase's CSV import feature
3. **API**: Use the admin API endpoint

## CSV/JSON Format

When importing reviews, use this format:

### CSV Format
```csv
guest_name,guest_location,rating,review_text,rental_date,published_date,category,profile_image_url,yacht_id,is_featured,original_language
John Doe,London UK,5,"Amazing experience! The crew was exceptional.",2024-07-15,2024-08-01,With Captain,,uuid-here,true,en
Jane Smith,Madrid Spain,5,"Increíble experiencia con el capitán profesional.",2024-08-20,2024-09-05,Catamarans,,uuid-here,false,es
```

### JSON Format
```json
[
  {
    "guest_name": "John Doe",
    "guest_location": "London UK",
    "rating": 5,
    "review_text": "Amazing experience! The crew was exceptional.",
    "rental_date": "2024-07-15",
    "published_date": "2024-08-01",
    "category": "With Captain",
    "profile_image_url": null,
    "yacht_id": null,
    "is_featured": true,
    "original_language": "en"
  },
  {
    "guest_name": "Jane Smith",
    "guest_location": "Madrid Spain",
    "rating": 5,
    "review_text": "Increíble experiencia con el capitán profesional.",
    "rental_date": "2024-08-20",
    "published_date": "2024-09-05",
    "category": "Catamarans",
    "original_language": "es"
  }
]
```

## Usage

### Option 1: Replace Existing ReviewsSection

In your page component (e.g., `app/[locale]/page.tsx`):

```tsx
import TestimonialsSection from '@/components/TestimonialsSection'

// Replace ReviewsSection with:
<TestimonialsSection reviews={reviews} />
```

### Option 2: Use Components Separately

```tsx
import ReviewGrid from '@/components/ReviewGrid'
import ReviewCard from '@/components/ReviewCard'

// Use ReviewGrid for masonry layout
<ReviewGrid reviews={reviews} />

// Or use individual cards
{reviews.map(review => (
  <ReviewCard key={review.id} review={review} />
))}
```

## Features

### 1. Masonry Grid Layout
- Uses CSS columns for dynamic, Pinterest-style layout
- Responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Cards automatically flow to fill available space

### 2. Category Filtering
- Filter by categories like:
  - All
  - With Captain
  - Catamarans
  - Bareboat
  - etc.
- Categories are automatically extracted from review data

### 3. Translation Support
- Automatically detects Latvian and Spanish reviews
- "Translate to English" button appears for non-English reviews
- Shows original text when toggled
- In production, integrate with Google Translate API or similar

### 4. Text Cleaning
- Automatically removes extra spaces
- Trims whitespace
- Handles line breaks properly

### 5. Luxury Styling
- **Serif font** (Playfair Display) for review quotes
- **Sans-serif font** (Inter) for details and metadata
- **Gold stars** (luxury-gold color) for ratings
- **Navy blue** (#1B263B) and **Gold** (#C5A059) color palette
- Soft white background with subtle gradients

## Translation Integration

For production translation, update `ReviewCard.tsx`:

```tsx
// Replace the placeholder translateText function with:
async function translateText(text: string, targetLang: string = 'en'): Promise<string> {
  // Option 1: Google Translate API
  const response = await fetch('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text, targetLang })
  })
  const data = await response.json()
  return data.translatedText
  
  // Option 2: Use a translation service library
  // import { translate } from '@google-cloud/translate'
  // return await translate(text, targetLang)
}
```

## Customization

### Change Categories
Categories are automatically extracted from the `category` field in reviews. To add predefined categories:

```tsx
// In ReviewGrid.tsx, modify extractCategories function
const predefinedCategories = ['All', 'With Captain', 'Catamarans', 'Bareboat', 'Monohulls']
```

### Change Colors
Colors use Tailwind CSS variables. Update in `tailwind.config.js`:
- `luxury-blue`: #1B263B
- `luxury-gold`: #C5A059

### Change Fonts
Fonts are configured in `tailwind.config.js`:
- Serif: Playfair Display (for quotes)
- Sans-serif: Inter (for details)

## Example: Processing CSV Data

```typescript
import { processReviewsImport } from '@/lib/reviewUtils'

// After reading CSV file
const csvData = [
  {
    guest_name: "John Doe",
    rating: 5,
    review_text: "Amazing   experience!   The   crew   was   exceptional.",
    rental_date: "2024-07-15",
    category: "With Captain"
  }
]

const cleanedReviews = processReviewsImport(csvData)
// Extra spaces are automatically cleaned
```

## Next Steps

1. ✅ Run SQL migration (`supabase/add_testimonials_fields.sql`)
2. ✅ Import your 35 reviews (CSV or JSON)
3. ✅ Replace `ReviewsSection` with `TestimonialsSection` in your pages
4. ✅ Test category filtering
5. ✅ Test translation toggle for non-English reviews
6. ⚠️ Integrate proper translation API (optional, for production)

## Support

For questions or issues:
- Check component files: `components/ReviewCard.tsx`, `components/ReviewGrid.tsx`
- Check utility functions: `lib/reviewUtils.ts`
- Check database schema: `types/database.ts`
