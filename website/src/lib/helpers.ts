/**
 * IdentitateRO — Funcții helper
 */

import type {
  Institution,
  LogoLayout,
  LogoColorVariant,
  LogoAssetGroup,
} from '../types/institution';
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
  if (main.color) return resolveAssetPath(main.color, true);
  if (main.dark_mode) return resolveAssetPath(main.dark_mode, true);
  if (main.black) return resolveAssetPath(main.black, true);
  if (main.white) return resolveAssetPath(main.white, true);
  if (main.monochrome) return resolveAssetPath(main.monochrome, true);
  if (main.png) return resolveAssetPath(main.png.path, true);

  return null;
}

/**
 * Verifică dacă instituția are cel puțin un SVG.
 */
export function hasSvg(inst: Institution): boolean {
  const { main, horizontal, vertical, symbol } = inst.assets;
  const groups = [main, horizontal, vertical, symbol].filter(Boolean);

  return groups.some(
    (group) =>
      group && (group.color || group.dark_mode || group.white || group.black || group.monochrome),
  );
}

/**
 * Extrage toate asset-urile descărcabile din structura de logo-uri.
 * Returnează o listă plată cu etichetă, format și cale.
 */
export function getAllDownloadableAssets(inst: Institution): DownloadableAsset[] {
  const assets: DownloadableAsset[] = [];
  const { horizontal, vertical, symbol } = inst.assets;

  // Process each layout type
  const layouts: Array<{ key: string; group: LogoAssetGroup; layout: LogoLayout }> = [];

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
      const path = resolveAssetPath(asset, true);
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
      const pngPath = resolveAssetPath(group.png.path, true);
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
 * Extrage variantele disponibile dintr-un grup de asset-uri logo.
 * Returnează un array de [variantKey, resolvedPath] pentru afișare.
 */
export function getLogoVariants(group: LogoAssetGroup | undefined): Array<[string, string]> {
  if (!group) return [];

  const variantKeys: Array<{ key: string; asset: typeof group.color }> = [
    { key: 'color', asset: group.color },
    { key: 'dark_mode', asset: group.dark_mode },
    { key: 'white', asset: group.white },
    { key: 'black', asset: group.black },
    { key: 'monochrome', asset: group.monochrome },
  ];

  return variantKeys
    .filter(({ asset }) => asset)
    .map(({ key, asset }) => {
      const path = resolveAssetPath(asset, true);
      return path ? ([key, path] as [string, string]) : null;
    })
    .filter((item): item is [string, string] => item !== null);
}

/**
 * Construiește URL-ul CDN pentru un logo cu verificare.
 * Returnează null dacă varianta specificată nu există.
 */
export function getCdnLogoUrl(
  inst: Institution,
  preferredVariant: string = 'color',
): string | null {
  const cdnBase = `https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/${inst.id}`;
  const mainLayout = inst.assets.main?.type || 'horizontal';

  // Verificăm dacă varianta există în assets.main
  const main = inst.assets.main;
  if (!main) return null;

  // Găsim variantele disponibile
  const availableVariants: string[] = [];
  if (main.color) availableVariants.push('color');
  if (main.dark_mode) availableVariants.push('dark_mode');
  if (main.white) availableVariants.push('white');
  if (main.black) availableVariants.push('black');
  if (main.monochrome) availableVariants.push('monochrome');

  if (availableVariants.length === 0) return null;

  // Folosim varianta preferată sau prima disponibilă
  const variant = availableVariants.includes(preferredVariant)
    ? preferredVariant
    : availableVariants[0];

  return `${cdnBase}/${mainLayout}/${variant}.svg`;
}

/**
 * Returnează numele de afișat al instituției (numele complet).
 */
export function getDisplayName(inst: Institution): string {
  // Shortname for display (uppercase), fallback to full name
  return inst.shortname?.toUpperCase() || inst.name;
}

/**
 * Returnează numele complet pentru titluri (always full name).
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

/**
 * Returnează URL-ul site-ului curat (fără slash la final).
 * Folosește configurația din Astro sau fallback.
 */
export function getSiteUrl(siteConfig?: string): string {
  if (siteConfig) {
    return siteConfig.replace(/\/$/, '');
  }
  return 'https://identitate.eu';
}

/**
 * Returnează origin-ul (protocol + host) din URL-ul site-ului.
 */
export function getSiteOrigin(siteConfig?: string): string {
  const url = getSiteUrl(siteConfig);
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}
