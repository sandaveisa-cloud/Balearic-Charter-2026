# Interactive Destinations Map Setup

## Installation

The interactive map uses Leaflet.js and react-leaflet. Install the dependencies:

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

## Usage

Replace the existing `BalearicIslandsMap` component with the new `InteractiveDestinationsMap`:

```tsx
import InteractiveDestinationsMap from '@/components/InteractiveDestinationsMap'

// In your component:
<InteractiveDestinationsMap
  destinations={destinations}
  highlightedDestination={highlightedDestination}
  onMarkerClick={(slug) => {
    // Handle marker click
    router.push(`/${locale}/destinations/${slug}`)
  }}
/>
```

## Features

- ✅ Interactive map centered on Balearic Islands
- ✅ Custom luxury markers for each destination
- ✅ Popups with destination info and links
- ✅ Responsive design (mobile-friendly)
- ✅ No API keys required (uses OpenStreetMap)
- ✅ Smooth animations and transitions

## Debugging

If the map doesn't load:

1. **Check console for errors** - Look for Leaflet-related errors
2. **Verify CSS is loaded** - Leaflet CSS should be in `globals.css`
3. **Check container height** - Map needs explicit height (min-h-[400px])
4. **SSR issues** - Component uses dynamic imports to avoid SSR problems
5. **Missing dependencies** - Run `npm install` to ensure all packages are installed

## Customization

- **Marker icons**: Edit `createLuxuryMarker()` function
- **Map center**: Change `mapCenter` coordinates
- **Zoom level**: Adjust `mapZoom` value
- **Tile provider**: Change `TileLayer` URL (currently OpenStreetMap)
