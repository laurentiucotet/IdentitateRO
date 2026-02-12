/**
 * CDN Helpers for IdentitateRO
 * 
 * Funcții pentru gestionarea URL-urilor CDN și fallback-uri
 */

import type { AssetUrls } from '../types/institution';

/**
 * Versiunea pachetului npm pentru CDN URLs
 */
export const CDN_VERSION = '1.3.1';

/**
 * Pattern-uri CDN
 */
export const CDN_PATTERNS = {
  jsdelivr: (version: string, path: string) => 
    `https://cdn.jsdelivr.net/npm/@identitate-ro/logos@${version}${path}`,
  unpkg: (version: string, path: string) => 
    `https://unpkg.com/@identitate-ro/logos@${version}${path}`,
};

/**
 * Generează CDN URLs din path local
 * 
 * @param localPath - Path-ul local (ex: "/logos/anaf/anaf.svg")
 * @param version - Versiunea pachetului (default: CDN_VERSION)
 * @returns Obiect AssetUrls cu CDN URLs
 */
export function getCdnUrls(localPath: string, version: string = CDN_VERSION): AssetUrls {
  return {
    cdn_primary: CDN_PATTERNS.jsdelivr(version, localPath),
    cdn_fallback: CDN_PATTERNS.unpkg(version, localPath),
    local: localPath
  };
}

/**
 * Rezolvă AssetUrls la un string URL
 * Dacă asset e string (path local), generează automat CDN URL dacă preferCdn=true
 * Dacă asset e object cu cdn_primary/cdn_fallback/local, folosește logica de fallback
 * 
 * @param asset - AssetUrls sau string
 * @param preferCdn - Dacă true, preferă CDN-ul; altfel folosește local (default: true)
 * @returns String URL
 */
export function resolveAssetPath(asset: AssetUrls | undefined, preferCdn: boolean = false): string | null {
  if (!asset) return null;
  
  // String path: generează CDN URL automat dacă e path local de logos
  if (typeof asset === 'string') {
    if (preferCdn && asset.startsWith('/logos/')) {
      return CDN_PATTERNS.jsdelivr(CDN_VERSION, asset);
    }
    return asset;
  }
  
  // Object cu CDN URLs explicite
  if (preferCdn) {
    return asset.cdn_primary || asset.cdn_fallback || asset.local;
  }
  
  return asset.local;
}

/**
 * Extrage toate URL-urile disponibile pentru fallback
 * Dacă asset e string (path local), generează automat CDN URLs + local
 * 
 * @param asset - AssetUrls sau string
 * @returns Array cu toate URL-urile disponibile în ordinea fallback-ului
 */
export function getAssetFallbackUrls(asset: AssetUrls | undefined): string[] {
  if (!asset) return [];
  
  // String path: generează CDN fallback chain automat
  if (typeof asset === 'string') {
    if (asset.startsWith('/logos/')) {
      return [
        CDN_PATTERNS.jsdelivr(CDN_VERSION, asset),
        CDN_PATTERNS.unpkg(CDN_VERSION, asset),
        asset
      ];
    }
    return [asset];
  }
  
  // Object cu CDN URLs explicite
  const urls: string[] = [];
  if (asset.cdn_primary) urls.push(asset.cdn_primary);
  if (asset.cdn_fallback) urls.push(asset.cdn_fallback);
  urls.push(asset.local);
  
  return urls;
}

/**
 * Verifică dacă un asset are CDN URLs configurate
 * 
 * @param asset - AssetUrls sau string
 * @returns true dacă are CDN URLs
 */
export function hasCdnUrls(asset: AssetUrls | undefined): boolean {
  if (!asset || typeof asset === 'string') return false;
  return !!(asset.cdn_primary || asset.cdn_fallback);
}

/**
 * Convertește un path local la AssetUrls complet cu CDN
 * 
 * @param localPath - Path-ul local
 * @param version - Versiunea pachetului
 * @returns AssetUrls complet
 */
export function pathToAssetUrls(localPath: string | undefined, version: string = CDN_VERSION): AssetUrls | undefined {
  if (!localPath) return undefined;
  
  // Dacă e deja un obiect AssetUrls, returnează direct
  if (typeof localPath !== 'string') return localPath;
  
  return getCdnUrls(localPath, version);
}
