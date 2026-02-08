/**
 * IdentitateRO - Tipuri de date pentru instituțiile publice
 *
 * Schema de date specifică administrației publice românești,
 * cu suport pentru ierarhie administrativă, variante de logo,
 * paleță de culori oficiale cu referințe Pantone, și resurse de brand.
 */

/** Tipuri de instituții publice din România */
export type InstitutionCategory =
  | 'guvern'           // Guvernul României, Administrația Prezidențială
  | 'minister'         // Ministere
  | 'primarie'         // Primării municipale/orășenești
  | 'consiliu-judetean' // Consilii Județene
  | 'prefectura'       // Prefecturi
  | 'agentie'          // Agenții guvernamentale (ANAF, ANM, etc.)
  | 'autoritate'       // Autorități independente
  | 'proiect-ue'       // Proiecte finanțate UE (PNRR, POCU, etc.)
  | 'institutie-cultura' // Instituții de cultură
  | 'altele';

/** Variantele disponibile ale unui logo */
export type LogoVariant =
  | 'principal'        // Logo-ul principal / complet
  | 'vertical'         // Stivuit vertical
  | 'horizontal'       // Layout orizontal
  | 'simbol'           // Doar simbolul/stema (fără text)
  | 'monocrom'         // Varianta monocromă (negru)
  | 'monocrom-alb'     // Varianta monocromă (alb, pentru fundal închis)
  | 'inversata';       // Varianta inversată (pentru dark mode)

/** O singură culoare din paleta oficială */
export interface OfficialColor {
  /** Numele culorii (ex: "Roșu Tricolor") */
  name: string;
  /** Codul HEX (ex: "#CE1126") */
  hex: string;
  /** Referință Pantone, dacă există (ex: "186 C") */
  pantone?: string;
  /** Valori CMYK, dacă sunt specificate */
  cmyk?: string;
  /** Valori RGB */
  rgb?: string;
}

/** Un fișier de logo disponibil pentru descărcare */
export interface LogoAsset {
  /** Tipul variantei */
  variant: LogoVariant;
  /** Formatul fișierului */
  format: 'svg' | 'png';
  /** Calea relativă față de /public */
  path: string;
  /** Lățimea (doar pentru PNG) */
  width?: number;
  /** Înălțimea (doar pentru PNG) */
  height?: number;
}

/** Resurse adiționale ale instituției */
export interface InstitutionResources {
  /** Link către manualul de identitate vizuală (PDF) */
  brandManual?: string;
  /** Website-ul oficial */
  website?: string;
  /** Fontul principal folosit */
  fontPrimary?: string;
  /** Fontul secundar */
  fontSecondary?: string;
  /** Note sau restricții de utilizare */
  usageNotes?: string;
}

/** Schema completă a unei instituții */
export interface Institution {
  /** Identificator unic (slug) - ex: "guvernul-romaniei" */
  id: string;
  /** Numele complet oficial */
  name: string;
  /** Numele scurt / prescurtare (ex: "Guvernul") */
  shortName?: string;
  /** Abrevierea (ex: "ANAF") */
  abbreviation?: string;
  /** Categoria instituției */
  category: InstitutionCategory;
  /** Subcategoria / Județul (pentru primării) */
  region?: string;
  /** Descriere scurtă */
  description?: string;
  /** Paleta de culori oficiale */
  colors: OfficialColor[];
  /** Fișierele de logo disponibile */
  assets: LogoAsset[];
  /** Resurse adiționale */
  resources: InstitutionResources;
  /** Data ultimei actualizări (ISO 8601) */
  updatedAt: string;
  /** Sursa datelor / cine a contribuit */
  source?: string;
  /** Etichetă de calitate */
  quality: 'verified' | 'community' | 'draft';
}

/** Indexul complet - generat automat din fișierele individuale */
export interface InstitutionIndex {
  /** Versiunea schemei de date */
  schemaVersion: string;
  /** Data generării */
  generatedAt: string;
  /** Numărul total de instituții */
  total: number;
  /** Statistici aggregate */
  stats: {
    byCategory: Record<InstitutionCategory, number>;
    withBrandManual: number;
    withSvg: number;
  };
  /** Lista instituțiilor */
  institutions: Institution[];
}
