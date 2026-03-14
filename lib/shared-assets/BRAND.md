# BDE Farm Trac — Brand Guide

## Brand Name
**BDE Farm Trac**

## Domain
bdefarmtrac.co.uk

## Tagline
Red Tractor Compliance Made Simple

## Logo Files

### Full horizontal logo (tractor + text)
- `logo/bde-farm-trac-logo.png` — Full resolution (1408x768px)
- `logo/bde-farm-trac-logo-512.png` — 512x279px (web headers, marketing)
- `logo/bde-farm-trac-logo-256.png` — 256x140px (nav bars, emails)
- `logo/bde-farm-trac-logo.svg` — Vector (scalable to any size)

### Square icon (tractor only)
- `logo/bde-farm-trac-icon.png` — Full resolution (1024x1024px)
- `logo/bde-farm-trac-icon-512.png` — 512x512px (app store icon)
- `logo/bde-farm-trac-icon-128.png` — 128x128px (thumbnails, small displays)

### Favicon
- `logo/favicon.svg` — Vector favicon (tractor on green background, scalable)
- `logo/favicon-64.png` — 64x64px raster favicon (browser tab icon)

## Colour Palette

### Primary (Agricultural Greens)
| Name    | Hex     | Usage                              |
|---------|---------|------------------------------------|
| Forest  | #2D6A2E | Primary buttons, headers, logo     |
| Sage    | #5A8F5A | Secondary elements, hover states   |
| Light   | #7CB87C | Success indicators, highlights     |
| Pale    | #E8F5E8 | Light backgrounds, subtle accents  |

### Earth Tones
| Name  | Hex     | Usage                               |
|-------|---------|---------------------------------------|
| Brown | #8B5E3C | Secondary text, headings, accents     |
| Tan   | #C49A6C | Borders, subtle elements              |
| Cream | #F5F0E8 | Page backgrounds                      |
| Sand  | #E8DCC8 | Card backgrounds, containers          |

### Neutral
| Name       | Hex     | Usage                    |
|------------|---------|--------------------------|
| White      | #FFFFFF | Backgrounds              |
| Off White  | #FAFAF8 | Alternate backgrounds    |
| Light Grey | #F0EDE8 | Borders, dividers        |
| Grey       | #6B7280 | Muted text               |
| Dark Grey  | #374151 | Body text                |
| Charcoal   | #1F2937 | Headings                 |
| Black      | #111827 | High-contrast text       |

### Accent
| Name  | Hex     | Usage                   |
|-------|---------|-------------------------|
| Red   | #DC2626 | Errors, warnings        |
| Amber | #F59E0B | Caution, attention      |
| Blue  | #2563EB | Links, information      |
| Teal  | #0D9488 | Secondary actions       |

## Typography
- **Headings**: Inter (weight 600-800)
- **Body**: Inter (weight 400-500)
- **Monospace**: JetBrains Mono

## Usage

### TypeScript tokens
```typescript
import { colors, typography, spacing, shadows } from "@workspace/shared-assets/tokens";
```

### CSS variables
```css
@import "@workspace/shared-assets/css-variables";
```
Then use variables like `var(--brand-primary-forest)`, `var(--font-heading)`, `var(--shadow-md)`, `var(--space-4)`, etc.

### Tailwind CSS preset
```typescript
import bdePreset from "@workspace/shared-assets/tailwind-preset";

export default {
  presets: [bdePreset],
  // ...
};
```
This extends the Tailwind theme with brand colours (`brand-forest`, `earth-brown`, etc.), fonts (`font-heading`, `font-body`), spacing, shadows, and border radius.
