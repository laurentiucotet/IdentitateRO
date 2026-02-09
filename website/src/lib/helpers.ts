/**
 * IdentitateRO — Funcții helper
 */

import type { Institution, LogoLayout, LogoColorVariant } from '../types/institution';
import { LOGO_LAYOUT_LABELS, LOGO_VARIANT_LABELS } from './labels';
import { resolveAssetPath } from './cdn-helpers';

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
 * Folosim direct assets.main (shortcut pentru DX).
 */
export function getPrimaryLogoPath(inst: Institution): string | null {
  const main = inst.assets.main;
  
  if (!main) return null;
  
  // Priority: color → dark_mode → black → white → monochrome → png
  // Rezolvă AssetUrls la string folosind CDN sau local
  if (main.color) return resolveAssetPath(main.color);
  if (main.dark_mode) return resolveAssetPath(main.dark_mode);
  if (main.black) return resolveAssetPath(main.black);
  if (main.white) return resolveAssetPath(main.white);
  if (main.monochrome) return resolveAssetPath(main.monochrome);
  if (main.png) return resolveAssetPath(main.png.path);
  
  return null;
}

/**
 * Verifică dacă instituția are cel puțin un SVG.
 */
export function hasSvg(inst: Institution): boolean {
  const { main, horizontal, vertical, symbol } = inst.assets;
  const groups = [main, horizontal, vertical, symbol].filter(Boolean);
  
  return groups.some(group => 
    group && (group.color || group.dark_mode || group.white || group.black || group.monochrome)
  );
}

/**
 * Extrage toate asset-urile descărcabile din structura de logo-uri.
 * Returnează o listă plată cu etichetă, format și cale.
 */
export function getAllDownloadableAssets(inst: Institution): DownloadableAsset[] {
  const assets: DownloadableAsset[] = [];
  const { main, horizontal, vertical, symbol } = inst.assets;
  
  // Process each layout type
  const layouts: Array<{ key: string; group: typeof main; layout: LogoLayout }> = [];
  
  if (horizontal) layouts.push({ key: 'horizontal', group: horizontal, layout: 'horizontal' });
  if (vertical) layouts.push({ key: 'vertical', group: vertical, layout: 'vertical' });
  if (symbol) layouts.push({ key: 'symbol', group: symbol, layout: 'symbol' });
  
  for (const { key, group, layout } of layouts) {
    if (!group) continue;
    
    const layoutLabel = LOGO_LAYOUT_LABELS[key] || key;
    
    // SVG variants
    const variants: Array<{ variant: LogoColorVariant; asset: typeof group.color }> = [
      { variant: 'color', asset: group.color },
      { variant: 'dark_mode', asset: group.dark_mode },
      { variant: 'white', asset: group.white },
      { variant: 'black', asset: group.black },
      { variant: 'monochrome', asset: group.monochrome },
    ];
    
    for (const { variant, asset } of variants) {
      if (!asset) continue;
      const path = resolveAssetPath(asset);
      if (!path) continue;
      const variantLabel = LOGO_VARIANT_LABELS[variant] || variant;
      assets.push({
        label: `${layoutLabel} — ${variantLabel}`,
        format: 'svg',
        path,
        layout,
        variant,
      });
    }
    
    // PNG
    if (group.png) {
      const pngPath = resolveAssetPath(group.png.path);
      if (pngPath) {
        assets.push({
          label: `${layoutLabel} — PNG`,
          format: 'png',
          path: pngPath,
          layout,
          variant: 'png',
          width: group.png.width,
          height: group.png.height,
        });
      }
    }
  }
  
  return assets;
}

/**
 * Returnează numele de afișat al instituției (scurt → complet).
 */
export function getDisplayName(inst: Institution): string {
  return inst.shortname || inst.name;
}

/**
 * Returnează numele complet pentru titluri.
 */
export function getFullName(inst: Institution): string {
  return inst.name;
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

/**
 * Verifică dacă instituția are culori definite.
 */
export function hasColors(inst: Institution): boolean {
  return !!(inst.colors && inst.colors.length > 0);
}

/**
 * Verifică dacă instituția are tipografie definită.
 */
export function hasTypography(inst: Institution): boolean {
  return !!(inst.typography && inst.typography.primary);
}

/**
 * Returnează URL-ul site-ului oficial (dacă există).
 */
export function getWebsiteUrl(inst: Institution): string | undefined {
  return inst.resources?.website;
}

/**
 * Returnează URL-ul manualului de brand (dacă există).
 */
export function getBrandManualUrl(inst: Institution): string | undefined {
  return inst.resources?.branding_manual;
}
