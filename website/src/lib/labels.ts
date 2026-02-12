/**
 * IdentitateRO — Etichete și utilități de afișare (v2.0)
 */

// ─── Categorii ───────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  'guvern': 'Guvern',
  'minister': 'Ministere',
  'primarie': 'Primării',
  'consiliu-judetean': 'Consilii Județene',
  'prefectura': 'Prefecturi',
  'agentie': 'Agenții',
  'autoritate': 'Autorități',
  'proiect-ue': 'Proiecte UE / PNRR',
  'institutie-cultura': 'Cultură',
  'altele': 'Altele',
};

/** Etichete cu articol singular (pentru card-uri) */
export const CATEGORY_LABELS_SINGULAR: Record<string, string> = {
  'guvern': 'Guvern',
  'minister': 'Minister',
  'primarie': 'Primărie',
  'consiliu-judetean': 'Consiliu Județean',
  'prefectura': 'Prefectură',
  'agentie': 'Agenție',
  'autoritate': 'Autoritate',
  'proiect-ue': 'Proiect UE',
  'institutie-cultura': 'Cultură',
  'altele': 'Altele',
};

export const CATEGORY_ORDER = [
  'guvern',
  'minister',
  'agentie',
  'autoritate',
  'primarie',
  'consiliu-judetean',
  'prefectura',
  'proiect-ue',
  'institutie-cultura',
  'altele',
];

// ─── Logo layout-uri ─────────────────────────────

export const LOGO_LAYOUT_LABELS: Record<string, string> = {
  'horizontal': 'Orizontal',
  'vertical': 'Vertical',
  'symbol': 'Simbol',
};

// ─── Logo variante cromatice ─────────────────────

export const LOGO_VARIANT_LABELS: Record<string, string> = {
  'color': 'Color',
  'dark_mode': 'Dark Mode',
  'white': 'Alb',
  'black': 'Negru',
  'monochrome': 'Monocrom',
};

// ─── Rolul culorii ───────────────────────────────

export const COLOR_USAGE_LABELS: Record<string, string> = {
  'primary': 'Primară',
  'secondary': 'Secundară',
  'accent': 'Accent',
  'neutral': 'Neutră',
};

// ─── Calitate date ───────────────────────────────

export const QUALITY_LABELS: Record<string, { label: string; class: string }> = {
  'verified': { label: 'Verificat', class: 'badge-verified' },
  'community': { label: 'Comunitate', class: 'badge-community' },
  'draft': { label: 'Draft', class: 'badge-draft' },
};

// ─── Tipografie roluri ───────────────────────────

export const TYPOGRAPHY_ROLE_LABELS: Record<string, string> = {
  'primary': 'Principal',
  'secondary': 'Secundar',
};
