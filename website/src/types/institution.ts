/**
 * IdentitateRO — Schema v2.0
 *
 * Tipuri de date pentru identitatea vizuală a instituțiilor publice
 * din România. Structură ierarhică: meta → instituție → identitate
 * vizuală → assets, cu logo-uri grupate pe layout + variantă cromatică.
 */

// ─── Enumerări ───────────────────────────────────

/** Tipuri de instituții publice din România */
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

/** Rolul culorii în identitatea vizuală */
export type ColorUsage = 'primary' | 'secondary' | 'accent' | 'neutral';

/** Layout-ul logo-ului */
export type LogoLayout = 'fullHorizontal' | 'fullVertical' | 'symbolOnly';

/** Varianta cromatică a logo-ului */
export type LogoColorVariant = 'color' | 'white' | 'monochrome';

/** Etichetă de calitate a datelor */
export type QualityLevel = 'verified' | 'community' | 'draft';

// ─── Meta ────────────────────────────────────────

export interface InstitutionMeta {
  /** Versiunea schemei (ex: "1.0") */
  version: string;
  /** Data ultimei actualizări (ISO 8601) */
  lastUpdated: string;
  /** Tag-uri descriptive */
  tags: string[];
  /** Identificator intern (ex: "RO-ANAF-001") */
  internalId: string;
  /** Calitatea datelor */
  quality: QualityLevel;
  /** Sursa datelor */
  source?: string;
}

// ─── Locație ─────────────────────────────────────

export interface InstitutionLocation {
  /** Localitatea (ex: "București") */
  locality: string;
  /** Județul (ex: "Municipiul București") */
  county: string;
  /** Codul județului (ex: "B", "CJ") */
  countyCode: string;
  /** Codul SIRUTA, opțional */
  sirutaCode?: string;
}

// ─── Instituție ──────────────────────────────────

export interface InstitutionInfo {
  /** Numele complet oficial */
  name: string;
  /** Numele scurt (ex: "ANAF", "Guvernul") */
  shortName?: string;
  /** Acronim (ex: "ANAF", "ME") */
  acronym?: string;
  /** Categoria instituției */
  category: InstitutionCategory;
  /** Descriere scurtă */
  description?: string;
  /** Website-ul oficial */
  website?: string;
  /** Link către manualul de identitate vizuală */
  manualUrl?: string;
  /** Regiunea / Județul (pentru primării) */
  region?: string;
  /** Locația sediului */
  location?: InstitutionLocation;
  /** Note de utilizare / restricții */
  usageNotes?: string;
}

// ─── Identitate Vizuală ─────────────────────────

export interface OfficialColor {
  /** Numele culorii (ex: "Roșu Tricolor") */
  name: string;
  /** Codul HEX (ex: "#CE1126") */
  hex: string;
  /** Valori RGB ca array [r, g, b] */
  rgb?: [number, number, number];
  /** Valori CMYK ca array [c, m, y, k] */
  cmyk?: [number, number, number, number];
  /** Referință Pantone (ex: "186 C") */
  pantone?: string;
  /** Rolul culorii */
  usage?: ColorUsage;
}

export interface Typography {
  /** Familia fontului (ex: "Roboto") */
  family: string;
  /** Rolul fontului */
  role: 'primary' | 'secondary';
  /** URL Google Fonts sau altă sursă */
  url?: string;
}

export interface VisualIdentity {
  /** Paleta de culori oficiale */
  colors: OfficialColor[];
  /** Fonturi folosite */
  typography?: Typography[];
}

// ─── Assets ──────────────────────────────────────

/** Variantele cromatice ale unui grup de logo */
export interface LogoVariants {
  /** Logo color (principal) — cale relativă față de /public */
  color?: string;
  /** Logo alb (pentru fundal închis) */
  white?: string;
  /** Logo monocrom (negru) */
  monochrome?: string;
}

/** Versiunea PNG a logo-ului */
export interface LogoPng {
  /** Cale relativă față de /public */
  path: string;
  /** Lățime pixeli */
  width: number;
  /** Înălțime pixeli */
  height: number;
}

/** Un grup de logo cu variantele sale */
export interface LogoGroup {
  /** Variante SVG (color, white, monochrome) */
  variants: LogoVariants;
  /** Versiune PNG opțională */
  png?: LogoPng;
}

/** Toate asset-urile unei instituții */
export interface InstitutionAssets {
  /** Logo-uri grupate pe layout */
  logos: Partial<Record<LogoLayout, LogoGroup>>;
  /** Favicon, opțional */
  favicon?: string;
}

// ─── Schema Principală ──────────────────────────

export interface Institution {
  /** Identificator unic (slug) — ex: "guvernul-romaniei" */
  id: string;
  /** Metadate */
  meta: InstitutionMeta;
  /** Informații despre instituție */
  institution: InstitutionInfo;
  /** Identitate vizuală (culori, fonturi) */
  visualIdentity: VisualIdentity;
  /** Asset-uri (logo-uri, favicon) */
  assets: InstitutionAssets;
}

// ─── Index ───────────────────────────────────────

export interface CategorySummary {
  id: InstitutionCategory;
  label: string;
  count: number;
}

export interface InstitutionIndex {
  /** Versiunea schemei */
  schemaVersion: string;
  /** Data generării */
  generatedAt: string;
  /** Total instituții */
  total: number;
  /** Statistici aggregate */
  stats: {
    byCategory: Partial<Record<InstitutionCategory, number>>;
    withManual: number;
    withSvg: number;
  };
  /** Rezumat categorii (sortate) */
  categories: CategorySummary[];
  /** Lista instituțiilor */
  institutions: Institution[];
}
