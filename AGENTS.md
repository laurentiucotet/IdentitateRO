# IdentitateRO - Agent Documentation

## Project Overview

**Type**: Static website / Digital registry  
**Domain**: Civic Tech / Government Digital Identity  
**Purpose**: Open-source registry for visual identities (logos, colors, brand guidelines) of Romanian public institutions

## Technology Stack

### Core Technologies
- **Framework**: Astro 5.2.0 (Static Site Generator)
- **Styling**: Tailwind CSS 3.4.0 via @astrojs/tailwind 6.0.0
- **Language**: TypeScript 5.7.0 (strict mode)
- **Search**: Fuse.js 7.0.0 (client-side fuzzy search)
- **Build Tool**: Vite (bundled with Astro)
- **Package Manager**: npm
- **CDN**: jsDelivr (primary), unpkg (fallback)
- **npm Package**: @identitate-ro/logos@1.0.0

### Development Environment
- Node.js required (version specified in package.json engines if present)
- Local dev server runs on port 4321 (default Astro port)
- Build output: Static HTML/CSS/JS files

## Project Structure

```
IdentitateRO/
├── README.md                          # Project overview
├── vercel.json                        # Deployment config for Vercel
├── AGENTS.md                          # This file
└── website/                           # Main Astro project
    ├── package.json                   # Dependencies and scripts
    ├── astro.config.mjs              # Astro configuration
    ├── tsconfig.json                  # TypeScript configuration
    ├── tailwind.config.mjs           # Tailwind CSS configuration
    ├── CONTRIBUTING.md                # Contribution guidelines
    ├── LICENSE                        # MIT License
    │
    ├── public/                        # Static assets (served as-is)
    │   ├── favicon.svg
    │   └── logos/                     # Logo files organized by institution
    │       ├── anaf/
    │       │   ├── anaf.svg
    │       │   └── simbol-anaf.svg
    │       ├── guvernul-romaniei/
    │       ├── ministerul-educatiei/
    │       ├── pnrr/
    │       └── primaria-cluj-napoca/
    │
    ├── scripts/
    │   └── generate-index.js          # Generates institutions-index.json
    │
    └── src/
        ├── env.d.ts                   # Astro environment types
        │
        ├── components/                # Reusable Astro components
        │   ├── Header.astro
        │   ├── Footer.astro
        │   └── LogoCard.astro        # Institution card component
        │
        ├── layouts/                   # Page layout templates
        │   └── BaseLayout.astro       # Main layout wrapper
        │
        ├── pages/                     # File-based routing (Astro convention)
        │   ├── index.astro           # Homepage with search & filter
        │   ├── despre.astro          # About page
        │   ├── legal.astro           # Legal/terms page
        │   ├── solicita.astro        # Request form page
        │   └── institution/
        │       └── [id].astro        # Dynamic route for institution details
        │
        ├── data/                      # JSON data files
        │   ├── institutions-index.json    # Generated aggregate index
        │   └── institutions/          # Individual institution data
        │       ├── anaf.json
        │       ├── guvernul-romaniei.json
        │       ├── ministerul-educatiei.json
        │       ├── pnrr.json
        │       └── primaria-cluj-napoca.json
        │
        ├── lib/                       # Utility functions
        │   ├── helpers.ts            # Helper functions for data manipulation
        │   └── labels.ts             # Label constants and mappings
        │
        ├── types/                     # TypeScript type definitions
        │   └── institution.ts        # **Core schema v2.0 definition**
        │
        └── styles/
            └── global.css            # Global styles and Tailwind directives
```

## Data Schema (Current: v3.0)

### Schema Philosophy
The v3.0 schema uses a **flat, simplified structure** with these key improvements:
- Flattened top-level fields (no nested `institution` object)
- Asset URLs are CDN-ready with absolute paths
- `main` shortcut for the primary logo (improved developer experience)
- `keywords` instead of `tags` for better search semantics
- Simplified location structure
- Typography as primary/secondary object (not array)

### Type Definitions

Located in: `src/types/institution-v3.ts` (v3.0) and `src/types/institution.ts` (legacy v2.0)

#### Main Types (v3.0):

**Institution Categories** (InstitutionCategoryV3):
- `guvern` - Government
- `minister` - Ministry
- `primarie` - City Hall
- `consiliu-judetean` - County Council
- `prefectura` - Prefecture
- `agentie` - Agency
- `autoritate` - Authority
- `proiect-ue` - EU Project
- `institutie-cultura` - Cultural Institution
- `altele` - Other

**Logo Layouts** (LogoLayoutV3):
- `horizontal` - Horizontal full logo
- `vertical` - Vertical full logo
- `symbol` - Symbol/icon only

**Logo Color Variants** (LogoColorVariantV3):
- `color` - Full color version
- `dark_mode` - Dark mode optimized version
- `white` - White version (for dark backgrounds)
- `black` - Black version
- `monochrome` - Monochrome version

**Quality Levels** (QualityLevel):
- `verified` - Officially verified
- `community` - Community contributed and checked
- `draft` - Work in progress

#### Full Schema Structure (v3.0):

```typescript
interface InstitutionV3 {
  // Top-level identification (flattened from v2)
  id: string;                          // Unique ID: "ro-{slug}" format (e.g., "ro-anaf")
  slug: string;                        // URL slug (e.g., "anaf")
  name: string;                        // Full official name
  shortname?: string;                  // Short name (lowercase)
  category: InstitutionCategoryV3;     // Institution type
  
  // Metadata (simplified)
  meta: {
    version: string;                   // Data version (e.g., "1.2.0")
    last_updated: string;              // ISO 8601 date (snake_case)
    keywords: string[];                // Keywords for search (was 'tags' in v2)
    quality?: 'verified' | 'community' | 'draft';
  };
  
  // Location (simplified)
  location?: {
    country_code: string;              // "RO"
    county?: string;                   // County code (e.g., "B", "CJ")
    city?: string;                     // City name
  };
  
  // Description
  description?: string;                // Brief description
  usage_notes?: string;                // Usage restrictions
  
  // Visual identity (flattened from v2)
  colors?: Array<{
    name: string;
    hex: string;
    rgb?: [number, number, number];
    cmyk?: [number, number, number, number];
    pantone?: string;
    usage?: 'primary' | 'secondary' | 'accent' | 'neutral';
  }>;
  
  typography?: {                       // Object with primary/secondary (not array)
    primary: {
      family: string;
      url?: string;
      weights?: number[];
    };
    secondary?: {
      family: string;
      url?: string;
      weights?: number[];
    };
  };
  
  // Assets (new structure with main shortcut)
  assets: {
    main: {                            // Primary logo shortcut ⭐
      type: 'horizontal' | 'vertical' | 'symbol';
      color?: string;                  // CDN-ready URLs
      dark_mode?: string;
      white?: string;
      black?: string;
      monochrome?: string;
      png?: {
        path: string;
        width: number;
        height: number;
      };
    };
    horizontal?: { /* same structure */ };
    vertical?: { /* same structure */ };
    symbol?: { /* same structure */ };
    favicon?: string;
  };
  
  // External resources
  resources?: {
    website?: string;
    branding_manual?: string;          // Was 'manualUrl' in v2
    social_media?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
}
```

### Example Institution Data (ANAF v3.0):

```json
{
  "id": "ro-anaf",
  "slug": "anaf",
  "name": "Agenția Națională de Administrare Fiscală",
  "shortname": "anaf",
  "category": "agentie",
  "meta": {
    "version": "1.0",
    "last_updated": "2026-02-08",
    "keywords": ["guvernamental", "taxe", "fiscalitate", "anaf", "fisc"]
  },
  "location": {
    "country_code": "RO",
    "county": "B",
    "city": "București"
  },
  "description": "Autoritatea responsabilă pentru administrarea fiscală",
  "colors": [
    {
      "name": "Albastru Simbol",
      "hex": "#2C2C76",
      "rgb": [44, 44, 118],
      "usage": "primary"
    }
  ],
  "assets": {
    "main": {
      "type": "horizontal",
      "color": "/logos/anaf/anaf.svg"
    },
    "horizontal": {
      "type": "horizontal",
      "color": "/logos/anaf/anaf.svg"
    },
    "symbol": {
      "type": "symbol",
      "color": "/logos/anaf/simbol-anaf.svg"
    }
  },
  "resources": {
    "website": "https://www.anaf.ro"
  }
}
```

## Key Files and Their Roles

### Configuration Files

**astro.config.mjs**:
- Sets site URL: `https://identitate.ro`
- Integrates Tailwind CSS
- Configures static output
- Custom asset file naming for cache busting

**tsconfig.json**:
- TypeScript strict mode enabled
- Astro-specific paths and types

**tailwind.config.mjs**:
- Custom Tailwind configuration (if extended)

### Data Files

**src/data/institutions-index.json**:
- Generated by `scripts/generate-index.js`
- Aggregates all institution data
- Includes statistics and category summaries
- Used for homepage rendering and filtering

**src/data/institutions/*.json**:
- Individual institution data files
- Follow the Institution schema v2.0
- Manually created and maintained

### Helper Functions (src/lib/helpers.ts)

Key functions for v3.0:
- `getPrimaryLogoPath(inst)` - Returns the main logo path (uses `assets.main` shortcut)
- `hasSvg(inst)` - Checks if institution has at least one SVG
- `getAllDownloadableAssets(inst)` - Extracts all downloadable assets
- `getDisplayName(inst)` - Gets display name (shortname → name)
- `getFullName(inst)` - Returns full name for titles
- `formatRgb(rgb)` - Formats RGB values as string
- `formatCmyk(cmyk)` - Formats CMYK values as string
- `hasColors(inst)` - Checks if colors are defined
- `hasTypography(inst)` - Checks if typography is defined
- `getWebsiteUrl(inst)` - Returns website URL if available
- `getBrandManualUrl(inst)` - Returns brand manual URL if available

### Label Constants (src/lib/labels.ts)

Defines:
- `CATEGORY_LABELS` - Romanian labels for categories
- `CATEGORY_ORDER` - Display order for categories
- `LOGO_LAYOUT_LABELS` - Labels for logo layouts
- `LOGO_VARIANT_LABELS` - Labels for color variants

### Components

**LogoCard.astro**:
- Displays institution logo card
- Props: id, name, shortName, acronym, category, logoPath, quality, hasSvg, tags
- Links to `/institution/[id]` page

**Header.astro** / **Footer.astro**:
- Site-wide navigation and footer

**BaseLayout.astro**:
- Main layout wrapper
- Includes meta tags, fonts, global styles

### Pages

**index.astro**:
- Homepage with search and filter functionality
- Uses Fuse.js for client-side search
- Category filtering with "sticky" filter bar
- Two display modes: grouped (by category) and flat (when filtering)
- Client-side interactivity via inline `<script>` tags

**institution/[id].astro**:
- Dynamic route for individual institution pages
- Displays full details, colors, typography, downloadable assets

## Development Workflow

### NPM Scripts

```bash
npm run dev           # Start dev server (port 4321)
npm run build         # Build for production
npm run preview       # Preview production build
npm run data:generate # Generate institutions-index.json
```

### Adding a New Institution

1. Create logo files in `public/logos/[slug]/`
2. Create JSON file in `src/data/institutions/[slug].json`
3. Follow schema v3.0 structure (see example above)
4. Run `npm run data:generate` to update index
5. Test locally with `npm run dev`

**Key v3.0 requirements:**
- `id` must be in format `ro-{slug}`
- Use `keywords` (array) instead of `tags`
- Use `last_updated` (snake_case) instead of `lastUpdated`
- Assets must include `main` object with primary logo
- Location uses `country_code`, `county`, `city` (simplified)
- Typography is object with `primary` and optional `secondary`

### Naming Conventions

**Slugs** (institution IDs):
- Lowercase only
- No diacritics
- Words separated by hyphens
- Examples: `primaria-timisoara`, `anaf`, `ministerul-educatiei`

**File naming**:
- Institution JSON: `[slug].json`
- Logo files: `[slug].svg`, `[slug]-mono.svg`, etc.

### Code Style

- TypeScript strict mode
- Astro components (no React/Vue)
- Tailwind CSS for styling
- Minimal custom CSS (only in global.css if necessary)
- Romanian or English
