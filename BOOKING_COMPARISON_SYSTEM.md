# Dynamic Booking & Comparison System

## Overview
This document describes the comprehensive booking and comparison system implemented for the boat rental website, focusing on Lagoon 400 S (2014) and Lagoon 450 F (2019) models.

## Features Implemented

### 1. Add-on System ✅
**Component**: `components/AddOnSelector.tsx`

**Features**:
- Checkboxes for:
  - **Skipper** (€200/day) - Professional captain
  - **Chef** (€250/day) - Gourmet meal preparation
  - **Hostess** (€180/day) - Service and hospitality
  - **Water Sports Package** (€150 one-time) - Complete equipment package
- Live price calculation that updates as user selects/deselects add-ons
- Days selector to adjust pricing for daily add-ons
- Visual feedback with selected add-ons displayed as badges
- Mobile-responsive design

**Integration**:
- Appears in FleetDetail sidebar after dates are selected
- Base price comes from SeasonalPriceCalculator total
- Updates total estimate in real-time

### 2. Refit Badge Logic ✅
**Database Migration**: `supabase/add_refit_fields_to_fleet.sql`

**Fields Added**:
- `recently_refitted` (BOOLEAN) - Flag for recently refitted boats
- `refit_details` (TEXT) - Description of refit work

**Display**:
- **FleetSection**: "Refit 2024" badge on thumbnail images (gold gradient)
- **FleetDetail**: Full refit details section with gold styling when `recently_refitted = true`

**Usage**:
```sql
UPDATE fleet 
SET recently_refitted = true, 
    refit_details = 'Complete interior renovation, new electronics, engine overhaul'
WHERE slug = 'lagoon-450-f';
```

### 3. Boat Comparison Component ✅
**Component**: `components/BoatComparisonTable.tsx`

**Features**:
- Side-by-side comparison table
- Compares:
  - Year
  - Length (meters)
  - Cabins
  - Max Guests (Capacity)
  - Flybridge (Yes/No with icons)
  - Starting Price (Low Season)
- Automatically loads comparison boats:
  - If viewing Lagoon 400 S → compares with 450 F
  - If viewing Lagoon 450 F → compares with 400 S
- Highlights differences (e.g., 450 F has Flybridge, 400 S doesn't)
- Mobile-responsive with horizontal scroll on small screens

**Integration**:
- Appears in FleetDetail main content area
- Automatically fetches comparison boats based on current boat
- Uses `getFleetBySlugs()` function to fetch multiple boats

### 4. Seasonal Pricing Integration ✅
**Component**: `components/SeasonalPriceCalculator.tsx` (already existed, enhanced)

**Features**:
- Accepts Low/Mid/High season rates from Supabase
- Date picker integration (BookingCalendar component)
- Automatically determines season based on selected dates:
  - **High Season**: July, August
  - **Medium Season**: June, September
  - **Low Season**: All other months
- Calculates price breakdown:
  - Base charter fee (days × price per day)
  - IVA (Tax)
  - APA (Advance Provisioning Allowance)
  - Fixed fees (Crew Service + Cleaning)
  - Total estimate
- Updates in real-time as dates change

**Database Fields Used**:
- `low_season_price`
- `medium_season_price`
- `high_season_price`
- `currency`
- `tax_percentage`
- `apa_percentage`
- `crew_service_fee`
- `cleaning_fee`

### 5. Visual Polish ✅

**Request a Quote Button**:
- **Location**: `components/BookingForm.tsx`
- **Styling**:
  - Gold to Deep Blue gradient background
  - Hover effect with reverse gradient
  - Scale animation on hover/click
  - Large, bold text with icon
  - Shadow effects for depth
  - Mobile-optimized sizing

**Mobile-Friendly Design**:
- All components use responsive Tailwind classes
- Grid layouts adapt to screen size:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3+ columns
- Touch-friendly button sizes (min 44px)
- Horizontal scroll for comparison table on mobile
- Sticky sidebar on desktop, full-width on mobile

## Database Schema Updates

### Migration: `supabase/add_refit_fields_to_fleet.sql`
```sql
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS recently_refitted BOOLEAN DEFAULT false;

ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS refit_details TEXT;

CREATE INDEX IF NOT EXISTS idx_fleet_recently_refitted 
ON fleet (recently_refitted) 
WHERE recently_refitted = true;
```

## New Functions

### `getFleetBySlugs(slugs: string[])`
**Location**: `lib/data.ts`

Fetches multiple fleet items by their slugs for comparison purposes.

## Component Structure

```
components/
├── AddOnSelector.tsx          # Add-ons selection with live pricing
├── BoatComparisonTable.tsx    # Side-by-side boat comparison
├── BookingForm.tsx            # Enhanced with gradient button
├── FleetDetail.tsx            # Main page with all integrations
├── FleetSection.tsx           # Thumbnail with refit badge
└── SeasonalPriceCalculator.tsx # Seasonal pricing (existing, enhanced)
```

## Usage Examples

### Setting Up Refit Badge
```sql
-- Mark Lagoon 450 F as recently refitted
UPDATE fleet 
SET recently_refitted = true,
    refit_details = 'Complete interior renovation in 2024, new navigation electronics, engine overhaul, fresh paint'
WHERE slug = 'lagoon-450-f';
```

### Comparison Boats
The system automatically compares:
- **Lagoon 400 S** ↔ **Lagoon 450 F**
- Based on slug or name matching

To add more comparison pairs, update the logic in `FleetDetail.tsx` `useEffect` hook.

## Mobile Optimization

All components are mobile-first:
- Touch-friendly interactions
- Responsive grids
- Readable text sizes
- Accessible button sizes
- Optimized spacing for small screens

## Next Steps

1. **Run SQL Migration**: Execute `supabase/add_refit_fields_to_fleet.sql` in Supabase Dashboard
2. **Set Refit Data**: Update boats with `recently_refitted = true` and add `refit_details`
3. **Test Comparison**: View Lagoon 400 S or 450 F to see automatic comparison
4. **Test Add-ons**: Select dates, then customize experience with add-ons
5. **Mobile Testing**: Test on various mobile devices to ensure responsive design
