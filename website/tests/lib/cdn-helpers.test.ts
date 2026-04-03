import { describe, it, expect } from 'vitest';
import {
  getCdnUrls,
  resolveAssetPath,
  getAssetFallbackUrls,
  hasCdnUrls,
  pathToAssetUrls,
  CDN_VERSION,
} from '../../src/lib/cdn-helpers';

// ─── CDN_VERSION ─────────────────────────────────────────────────────────────

describe('CDN_VERSION', () => {
  it('este un string non-gol', () => {
    expect(typeof CDN_VERSION).toBe('string');
    expect(CDN_VERSION.length).toBeGreaterThan(0);
  });
});

// ─── getCdnUrls ──────────────────────────────────────────────────────────────

describe('getCdnUrls', () => {
  it('generează cdn_primary pe jsDelivr', () => {
    const result = getCdnUrls('/logos/anaf/anaf.svg');
    expect(result.cdn_primary).toContain('cdn.jsdelivr.net');
    expect(result.cdn_primary).toContain('/logos/anaf/anaf.svg');
  });

  it('generează cdn_fallback pe unpkg', () => {
    const result = getCdnUrls('/logos/anaf/anaf.svg');
    expect(result.cdn_fallback).toContain('unpkg.com');
    expect(result.cdn_fallback).toContain('/logos/anaf/anaf.svg');
  });

  it('păstrează path-ul local', () => {
    const result = getCdnUrls('/logos/anaf/anaf.svg');
    expect(result.local).toBe('/logos/anaf/anaf.svg');
  });

  it('include versiunea în URL', () => {
    const result = getCdnUrls('/logos/anaf/anaf.svg', '1.2.3');
    expect(result.cdn_primary).toContain('1.2.3');
    expect(result.cdn_fallback).toContain('1.2.3');
  });
});

// ─── resolveAssetPath ────────────────────────────────────────────────────────

describe('resolveAssetPath', () => {
  it('returnează null dacă asset e undefined', () => {
    expect(resolveAssetPath(undefined)).toBeNull();
  });

  it('returnează CDN URL pentru path /logos/ cu preferCdn=true', () => {
    const result = resolveAssetPath('/logos/anaf/anaf.svg', true);
    expect(result).toContain('cdn.jsdelivr.net');
    expect(result).toContain('/logos/anaf/anaf.svg');
  });

  it('returnează path local cu preferCdn=false', () => {
    const result = resolveAssetPath('/logos/anaf/anaf.svg', false);
    expect(result).toBe('/logos/anaf/anaf.svg');
  });

  it('returnează path ca atare dacă nu începe cu /logos/', () => {
    const result = resolveAssetPath('/public/other/file.svg', true);
    expect(result).toBe('/public/other/file.svg');
  });

  it('returnează cdn_primary din obiect AssetUrls cu preferCdn=true', () => {
    const asset = {
      cdn_primary: 'https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg',
      cdn_fallback: 'https://unpkg.com/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg',
      local: '/logos/anaf/anaf.svg',
    };
    expect(resolveAssetPath(asset, true)).toBe(asset.cdn_primary);
  });

  it('returnează local din obiect AssetUrls cu preferCdn=false', () => {
    const asset = {
      cdn_primary: 'https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg',
      local: '/logos/anaf/anaf.svg',
    };
    expect(resolveAssetPath(asset, false)).toBe('/logos/anaf/anaf.svg');
  });
});

// ─── getAssetFallbackUrls ────────────────────────────────────────────────────

describe('getAssetFallbackUrls', () => {
  it('returnează array gol pentru undefined', () => {
    expect(getAssetFallbackUrls(undefined)).toEqual([]);
  });

  it('generează chain jsdelivr → unpkg → local pentru path /logos/', () => {
    const result = getAssetFallbackUrls('/logos/anaf/anaf.svg');
    expect(result).toHaveLength(3);
    expect(result[0]).toContain('cdn.jsdelivr.net');
    expect(result[1]).toContain('unpkg.com');
    expect(result[2]).toBe('/logos/anaf/anaf.svg');
  });

  it('returnează doar path-ul pentru string non-logos', () => {
    const result = getAssetFallbackUrls('/other/file.svg');
    expect(result).toEqual(['/other/file.svg']);
  });

  it('construiește chain din obiect AssetUrls complet', () => {
    const asset = {
      cdn_primary: 'https://cdn.example.com/logo.svg',
      cdn_fallback: 'https://unpkg.example.com/logo.svg',
      local: '/logos/test.svg',
    };
    const result = getAssetFallbackUrls(asset);
    expect(result).toEqual([asset.cdn_primary, asset.cdn_fallback, asset.local]);
  });
});

// ─── hasCdnUrls ──────────────────────────────────────────────────────────────

describe('hasCdnUrls', () => {
  it('returnează false pentru undefined', () => {
    expect(hasCdnUrls(undefined)).toBe(false);
  });

  it('returnează false pentru string (path local simplu)', () => {
    expect(hasCdnUrls('/logos/anaf/anaf.svg')).toBe(false);
  });

  it('returnează true când obiectul are cdn_primary', () => {
    const asset = {
      cdn_primary: 'https://cdn.jsdelivr.net/...',
      local: '/logos/anaf/anaf.svg',
    };
    expect(hasCdnUrls(asset)).toBe(true);
  });

  it('returnează true când obiectul are cdn_fallback', () => {
    const asset = {
      cdn_fallback: 'https://unpkg.com/...',
      local: '/logos/anaf/anaf.svg',
    };
    expect(hasCdnUrls(asset)).toBe(true);
  });

  it('returnează false când obiectul are doar local', () => {
    const asset = { local: '/logos/anaf/anaf.svg' };
    expect(hasCdnUrls(asset)).toBe(false);
  });
});

// ─── pathToAssetUrls ─────────────────────────────────────────────────────────

describe('pathToAssetUrls', () => {
  it('returnează undefined pentru input undefined', () => {
    expect(pathToAssetUrls(undefined)).toBeUndefined();
  });

  it('convertește path local la AssetUrls complet', () => {
    const result = pathToAssetUrls('/logos/anaf/anaf.svg');
    expect(result).toBeDefined();
    expect(result?.local).toBe('/logos/anaf/anaf.svg');
    expect(result?.cdn_primary).toContain('cdn.jsdelivr.net');
  });
});
