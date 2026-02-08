/**
 * IdentitateRO — Funcții helper pentru schema v2.0
 */

import type { Institution, LogoLayout, LogoColorVariant } from '../types/institution';
import { LOGO_LAYOUT_LABELS, LOGO_VARIANT_LABELS } from './labels';

// ─── Tipuri helper ───────────────────────────────

export interface DownloadableAsset {
  /** Eticheta afișată (ex: "Orizontal — Color") */
  label: string;
  /** Format fișier */
  format: 'svg' | 'png';
  /** Cale relativă față de /public */
  path: string;
  /** Layout-ul logo-ului */
  layout: LogoLayout;
  /** Varianta cromatică */
  variant: LogoColorVariant | 'png';
  /** Dimensiuni (doar PNG) */
  width?: number;
  height?: number;
}

// ─── Funcții ─────────────────────────────────────

/**
 * Returnează calea către logo-ul principal (pentru preview).
 * Caută primul SVG color disponibil, altfel primul asset găsit.
 */
export function getPrimaryLogoPath(inst: Institution): string | null {
  const logos = inst.assets.logos;
  const layoutOrder: LogoLayout[] = ['fullHorizontal', 'fullVertical', 'symbolOnly'];

  for (const layout of layoutOrder) {
    const group = logos[layout];
    if (!group) continue;
    if (group.variants.color) return group.variants.color;
    if (group.variants.monochrome) return group.variants.monochrome;
    if (group.variants.white) return group.variants.white;
    if (group.png) return group.png.path;
  }

  return null;
}

/**
 * Verifică dacă instituția are cel puțin un SVG.
 */
export function hasSvg(inst: Institution): boolean {
  return Object.values(inst.assets.logos).some(group => {
    if (!group) return false;
    return !!(group.variants.color || group.variants.white || group.variants.monochrome);
  });
}

/**
 * Extrage toate asset-urile descărcabile din structura de logo-uri.
 * Returnează o listă plată cu etichetă, format și cale.
 */
export function getAllDownloadableAssets(inst: Institution): DownloadableAsset[] {
  const assets: DownloadableAsset[] = [];
  const logos = inst.assets.logos;
  const layouts: LogoLayout[] = ['fullHorizontal', 'fullVertical', 'symbolOnly'];

  for (const layout of layouts) {
    const group = logos[layout];
    if (!group) continue;

    const layoutLabel = LOGO_LAYOUT_LABELS[layout] || layout;

    // SVG variants
    for (const [variant, path] of Object.entries(group.variants)) {
      if (!path) continue;
      const variantLabel = LOGO_VARIANT_LABELS[variant] || variant;
      assets.push({
        label: `${layoutLabel} — ${variantLabel}`,
        format: 'svg',
        path,
        layout,
        variant: variant as LogoColorVariant,
      });
    }

    // PNG
    if (group.png) {
      assets.push({
        label: `${layoutLabel} — PNG`,
        format: 'png',
        path: group.png.path,
        layout,
        variant: 'png',
        width: group.png.width,
        height: group.png.height,
      });
    }
  }

  return assets;
}

/**
 * Returnează numele de afișat al instituției (scurt → acronim → complet).
 */
export function getDisplayName(inst: Institution): string {
  return inst.institution.shortName || inst.institution.acronym || inst.institution.name;
}

/**
 * Formatează valorile RGB ca string.
 */
export function formatRgb(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/**
 * Formatează valorile CMYK ca string.
 */
export function formatCmyk(cmyk: [number, number, number, number]): string {
  return `${cmyk[0]}, ${cmyk[1]}, ${cmyk[2]}, ${cmyk[3]}`;
}
