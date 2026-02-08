/**
 * IdentitateRO - Etichete categorii și utilități de afișare
 */

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

export const VARIANT_LABELS: Record<string, string> = {
  'principal': 'Principal',
  'vertical': 'Vertical',
  'horizontal': 'Orizontal',
  'simbol': 'Doar Simbol',
  'monocrom': 'Monocrom',
  'monocrom-alb': 'Monocrom (Alb)',
  'inversata': 'Inversată',
};

export const QUALITY_LABELS: Record<string, { label: string; class: string }> = {
  'verified': { label: 'Verificat', class: 'badge-verified' },
  'community': { label: 'Comunitate', class: 'badge-community' },
  'draft': { label: 'Draft', class: 'badge-draft' },
};
