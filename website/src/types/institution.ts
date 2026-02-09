/**
 * IdentitateRO Schema
 * 
 * Key features:
 * - Flattened structure (all fields at top level)
 * - Asset URLs are CDN-ready
 * - 'main' shortcut for primary logo (developer experience)
 * - Keywords for better search
 * - Simplified location structure
 * - Typography as object with primary/secondary
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Institution categories
 */
export type InstitutionCategory =
  | 'guvern'
  | 'minister'
  | 'primarie'
  | 'consiliu-judetean'
  | 'prefectura'
  | 'agentie'
  | 'autoritate'
  | 'proiect-ue'
  | 'institutie-cultura'
  | 'altele';

/**
 * Logo color variants
 */
export type LogoColorVariant = 'color' | 'dark_mode' | 'white' | 'black' | 'monochrome';

/**
 * Logo layout types
 */
export type LogoLayout = 'horizontal' | 'vertical' | 'symbol';

/**
 * Color usage types
 */
export type ColorUsage = 'primary' | 'secondary' | 'accent' | 'neutral';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Location information
 */
export interface Location {
  country_code: string;    // "RO"
  county?: string;         // County code (e.g., "B", "CJ")
  city?: string;           // City name
}

/**
 * Color definition
 */
export interface Color {
  name: string;                                  // Color name
  hex: string;                                   // HEX code
  rgb?: [number, number, number];                // RGB values
  cmyk?: [number, number, number, number];       // CMYK values
  pantone?: string;                              // Pantone reference
  usage?: ColorUsage;                            // Color role
}

/**
 * Typography definition
 */
export interface Typography {
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
}

/**
 * Asset URLs with CDN support
 * Can be either a simple string (backwards compatible) or an object with CDN URLs
 */
export type AssetUrls = string | {
  cdn_primary?: string;      // Primary CDN (jsDelivr)
  cdn_fallback?: string;     // Fallback CDN (unpkg)
  local: string;             // Local path (always required)
};

/**
 * Logo asset group with variants
 * Each layout (horizontal, vertical, symbol) can have multiple color variants
 * Supports both simple strings and CDN URLs for backwards compatibility
 */
export interface LogoAssetGroup {
  type: LogoLayout;                              // Layout type
  color?: AssetUrls;                             // Path to color variant
  dark_mode?: AssetUrls;                         // Path to dark mode variant
  white?: AssetUrls;                             // Path to white variant
  black?: AssetUrls;                             // Path to black variant
  monochrome?: AssetUrls;                        // Path to monochrome variant
  png?: {                                        // Optional PNG version
    path: AssetUrls;
    width: number;
    height: number;
  };
}

/**
 * Assets structure (flat with main shortcut)
 */
export interface Assets {
  main: LogoAssetGroup;                          // Primary logo (shortcut for DX)
  horizontal?: LogoAssetGroup;                   // Horizontal layout
  vertical?: LogoAssetGroup;                     // Vertical layout
  symbol?: LogoAssetGroup;                       // Symbol only
  favicon?: string;                              // Favicon path
}

/**
 * External resources
 */
export interface Resources {
  website?: string;                              // Official website
  branding_manual?: string;                      // Brand manual PDF/URL
  social_media?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

/**
 * Metadata about the data
 */
export interface Meta {
  version: string;                               // Data version (e.g., "1.2.0")
  last_updated: string;                          // ISO 8601 date
  keywords: string[];                            // Keywords for search (was 'tags' in v2)
  quality?: 'verified' | 'community' | 'draft';  // Optional quality level
}

/**
 * Main Institution interface
 */
export interface Institution {
  // Top-level identification
  id: string;                                    // Unique ID: "ro-{slug}" format
  slug: string;                                  // URL slug (e.g., "anaf")
  name: string;                                  // Full official name
  shortname?: string;                            // Short name (lowercase)
  category: InstitutionCategory;                 // Institution type
  
  // Metadata
  meta: Meta;
  
  // Location
  location?: Location;
  
  // Description and notes
  description?: string;                          // Brief description
  usage_notes?: string;                          // Usage restrictions
  
  // Visual identity
  colors?: Color[];
  typography?: Typography;
  
  // Assets (with main shortcut)
  assets: Assets;
  
  // External resources
  resources?: Resources;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if an object is a valid Institution
 */
export function isInstitution(obj: any): obj is Institution {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.id.startsWith('ro-') &&
    typeof obj.slug === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string' &&
    obj.meta &&
    typeof obj.meta.version === 'string' &&
    typeof obj.meta.last_updated === 'string' &&
    Array.isArray(obj.meta.keywords) &&
    obj.assets &&
    obj.assets.main &&
    typeof obj.assets.main.type === 'string'
  );
}

/**
 * Check if data has current schema markers
 */
export function hasCurrentSchema(obj: any): boolean {
  return (
    obj &&
    typeof obj.id === 'string' &&
    obj.id.startsWith('ro-') &&
    typeof obj.slug === 'string' &&
    obj.meta &&
    Array.isArray(obj.meta.keywords) &&
    obj.assets &&
    obj.assets.main !== undefined
  );
}
